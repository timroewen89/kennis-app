// Test voor het kiezen van nieuwsberichten. Draai met: node --test tests/
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { pickItems, rankItems, summarize, usableItems } from '../scripts/news-lib.mjs'

const NOW = Date.parse('2026-11-16T07:00:00Z')
const hoursAgo = (h) => new Date(NOW - h * 3_600_000).toUTCString()
const feed = (...items) =>
  `<rss><channel>${items.map(([title, hours, link = `https://example.org/${encodeURIComponent(title)}`]) => `<item><title><![CDATA[${title}]]></title><link>${link}</link><description>&lt;p&gt;Samenvatting van ${title}.&lt;/p&gt;</description><pubDate>${hoursAgo(hours)}</pubDate></item>`).join('')}</channel></rss>`

test('een oud bericht bovenaan de feed wordt niet gekozen als er vers nieuws is', () => {
  const ranked = rankItems(usableItems(feed(['Oud topbericht', 90], ['Ook oud', 140], ['Vers bericht', 2], ['Nog verser', 1])), NOW)
  assert.deepEqual(ranked.map((i) => i.title), ['Vers bericht', 'Nog verser', 'Oud topbericht', 'Ook oud'])
})

test('verse berichten houden de volgorde van de redactie', () => {
  const ranked = rankItems(usableItems(feed(['Topverhaal', 20], ['Tweede', 3], ['Derde', 10])), NOW)
  assert.deepEqual(ranked.map((i) => i.title), ['Topverhaal', 'Tweede', 'Derde'])
})

test('zonder vers nieuws komt het nieuwste bericht eerst', () => {
  const ranked = rankItems(usableItems(feed(['Vier dagen oud', 96], ['Twee dagen oud', 48])), NOW)
  assert.equal(ranked[0].title, 'Twee dagen oud')
})

test('rubrieken, promo\'s en onveilige links worden overgeslagen', () => {
  const items = usableItems(
    feed(['Wekdienst 16/11: agenda', 1], ['Kijk en luister live naar een concert', 1], ['Liveblog: verkiezingen', 1], ['Podcast De Dag', 1], ['Gewoon nieuws', 1], ['Rare link', 1, 'javascript:alert(1)'], ['Http-link', 1, 'http://example.org/x']),
  )
  assert.deepEqual(items.map((i) => i.title), ['Gewoon nieuws'])
})

test('HTML in titel en samenvatting wordt gewone tekst', () => {
  const [item] = usableItems('<rss><channel><item><title>Kop met &lt;b&gt;vet&lt;/b&gt; &amp;amp; meer</title><link>https://example.org/a</link><description><![CDATA[<p>Eerste <a href="x">alinea</a>.</p><p>Tweede.</p>]]></description></item></channel></rss>')
  assert.equal(item.title, 'Kop met vet & meer')
  assert.equal(item.summary, 'Eerste alinea.')
  assert.equal(item.publishedAt, null)
})

test('een lange samenvatting wordt afgekapt op een zinseinde', () => {
  const text = `${'Dit is een zin. '.repeat(30)}`
  assert.ok(summarize(text).length <= 280 && summarize(text).endsWith('.'))
})

test('kaarten komen om de beurt uit de feeds; uitgevallen feeds worden aangevuld; geen dubbelen', () => {
  const list = (name, n) => Array.from({ length: n }, (_, i) => ({ title: `${name}${i + 1}`, url: `https://example.org/${name}${i + 1}` }))
  const full = pickItems([{ count: 2, list: list('nos', 5) }, { count: 2, list: list('rtv', 5) }, { count: 1, list: list('bbc', 5) }, { count: 1, list: list('gua', 5) }], 6)
  assert.deepEqual(full.items.map((i) => i.title), ['nos1', 'rtv1', 'bbc1', 'gua1', 'nos2', 'rtv2'])
  const partial = pickItems([{ count: 2, list: list('nos', 5) }, { count: 2, list: list('rtv', 5) }], 6)
  assert.deepEqual(partial.items.map((i) => i.title), ['nos1', 'rtv1', 'nos2', 'rtv2', 'nos3', 'rtv3'])
  const dup = pickItems([{ count: 2, list: list('nos', 3) }, { count: 2, list: [...list('nos', 1), ...list('rtv', 2)] }], 4)
  assert.equal(new Set(dup.items.map((i) => i.url)).size, dup.items.length)
})

test('vreemde of kwaadwillende feed-invoer wordt snel en begrensd verwerkt', () => {
  const started = Date.now()
  assert.deepEqual(usableItems('<item '.repeat(80_000)), [])
  assert.deepEqual(usableItems(`<item>${'<title '.repeat(80_000)}</item>`), [])
  usableItems(`<item><title>x</title><link>https://example.org/x</link><description>${'&lt;'.repeat(400_000)}</description></item>`)
  assert.ok(Date.now() - started < 2000, `duurde ${Date.now() - started} ms`)
})

test('aantal berichten en lengte van de kop zijn begrensd', () => {
  const many = Array.from({ length: 500 }, (_, i) => [`Bericht ${i}`, 1])
  assert.equal(usableItems(feed(...many)).length, 60)
  const [long] = usableItems(feed(['x'.repeat(5000), 1, 'https://example.org/lang']))
  assert.equal(long.title.length, 300)
})

test('onbekende codes blijven tekst; adressen met een naam ervoor worden geweigerd', () => {
  const items = usableItems(feed(['Kop met &constructor; en &toString;', 1, 'https://example.org/a'], ['Misleidend adres', 1, 'https://nos.nl@elders.example/x']))
  assert.deepEqual(items.map((i) => i.title), ['Kop met &constructor; en &toString;'])
})

test('<items> en andere tags die op <item> lijken tellen niet mee', () => {
  const items = usableItems('<rss><items><title>Geen bericht</title></items><item><title>Wel een bericht</title><link>https://example.org/b</link></item></rss>')
  assert.deepEqual(items.map((i) => i.title), ['Wel een bericht'])
})
