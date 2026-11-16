// Haalt de nieuwsfeeds op en schrijft de nieuwskaarten en de koppen voor 'Kort nieuws' naar news.json.
// Heeft alleen Node nodig, geen pakketten. Draai met: node scripts/fetch-news.mjs
// Op GitHub draait dit elke dag vanzelf (zie .github/workflows/nieuws.yml).
import { writeFile } from 'node:fs/promises'

// Volledige nieuwskaarten: 'count' berichten per feed, om de beurt. Valt een feed uit, dan vullen de andere aan.
// 'label' is de kop boven de kaart; zonder label staat er gewoon 'Nieuws'.
const RTV_DRENTHE = 'https://www.rtvdrenthe.nl/rss/index.xml'
const NEWS_FEEDS = [
  { id: 'nos', name: 'NOS', lang: 'nl', count: 2, url: 'https://feeds.nos.nl/nosnieuwsalgemeen' },
  { id: 'rtvdrenthe', name: 'RTV Drenthe', lang: 'nl', label: 'Nieuws uit Drenthe', count: 2, url: RTV_DRENTHE },
  { id: 'bbc', name: 'BBC News', lang: 'en', count: 1, url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'guardian', name: 'The Guardian', lang: 'en', count: 1, url: 'https://www.theguardian.com/world/rss' },
]

// Kaart 'Kort nieuws': alleen koppen, en alleen berichten die niet al op een volledige kaart staan.
// Hier horen Nederlandstalige feeds, want deze koppen worden niet vertaald.
const BRIEF_FEEDS = [
  { id: 'binnenland', name: 'NOS', label: 'Binnenland', count: 2, url: 'https://feeds.nos.nl/nosnieuwsbinnenland' },
  { id: 'buitenland', name: 'NOS', label: 'Buitenland', count: 2, url: 'https://feeds.nos.nl/nosnieuwsbuitenland' },
  { id: 'drenthe', name: 'RTV Drenthe', label: 'Drenthe', count: 1, url: RTV_DRENTHE },
]

// Geen nieuwsberichten maar vaste rubrieken, zoals de dagagenda van de NOS.
const SKIP_TITLE = /^(wekdienst|nos-wekdienst)\b/i

const OUT = new URL('../news.json', import.meta.url)
const TOTAL = NEWS_FEEDS.reduce((sum, feed) => sum + feed.count, 0)
const MAX_SUMMARY = 280

// Leest de <item>-blokken uit een RSS-feed. Bewust eenvoudig: we hebben alleen titel,
// link, beschrijving en datum nodig, en alles wordt daarna nog opgeschoond en gecontroleerd.
function parseItems(xml) {
  const field = (block, tag) => {
    const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`))
    if (!match) return ''
    return match[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim()
  }
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/g)].map(([, block]) => ({
    title: field(block, 'title'),
    link: field(block, 'link'),
    description: field(block, 'description'),
    pubDate: field(block, 'pubDate'),
  }))
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? match
    const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1))
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match
  })
}

// Maakt van een stukje feed-inhoud gewone tekst. Sommige feeds leveren HTML, andere
// HTML die nog eens gecodeerd is; daarom eerst decoderen, dan tags weghalen, dan nog eens decoderen.
function plainText(value) {
  return decodeEntities(
    decodeEntities(String(value ?? ''))
      .replace(/<\/p>\s*<p[^>]*>/gi, '\n') // alinea-grenzen bewaren
      .replace(/<[^>]*>/g, ''),
  ).trim()
}

// Eerste alinea, en als die te lang is: afkappen op een zinseinde.
function summarize(description) {
  const first = plainText(description).split('\n')[0].replace(/\s+/g, ' ').trim()
  if (first.length <= MAX_SUMMARY) return first
  const cut = first.slice(0, MAX_SUMMARY)
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '))
  return end > 80 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

function httpsUrl(value) {
  try {
    const url = new URL(decodeEntities(String(value)).trim())
    return url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

// Haalt een feed op (één keer per adres) en geeft de bruikbare berichten terug, nieuwste eerst.
const fetched = new Map()
function readFeed(url) {
  if (!fetched.has(url)) {
    fetched.set(
      url,
      (async () => {
        const res = await fetch(url, { headers: { 'User-Agent': 'kennis-app' }, signal: AbortSignal.timeout(20_000) })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const items = parseItems(await res.text())
          .map((item) => ({ ...item, title: plainText(item.title).replace(/\s+/g, ' '), url: httpsUrl(item.link) }))
          .filter((item) => item.title && item.url && !SKIP_TITLE.test(item.title))
        if (items.length === 0) throw new Error('geen bruikbaar bericht')
        return items
      })(),
    )
  }
  return fetched.get(url)
}

async function topItems(feed) {
  const items = (await readFeed(feed.url)).slice(0, TOTAL)
  return items.map((item, n) => {
    const published = new Date(item.pubDate)
    return {
      id: `${feed.id}-${n + 1}`,
      source: feed.name,
      lang: feed.lang,
      label: feed.label ?? null,
      title: item.title,
      summary: summarize(item.description),
      url: item.url,
      publishedAt: Number.isNaN(published.getTime()) ? null : published.toISOString(),
    }
  })
}

const results = await Promise.allSettled(NEWS_FEEDS.map(topItems))
const perFeed = []
results.forEach((result, i) => {
  if (result.status === 'fulfilled') perFeed.push({ count: NEWS_FEEDS[i].count, list: result.value })
  else console.warn(`! ${NEWS_FEEDS[i].name} overgeslagen: ${result.reason.message}`)
})

// Om de beurt één bericht per feed, tot elke feed zijn aantal heeft. Daarna, als er feeds zijn
// uitgevallen, aanvullen met extra berichten van de feeds die wel werken.
const items = []
const seen = new Set()
const take = (item) => {
  if (!item || seen.has(item.url) || items.length >= TOTAL) return
  seen.add(item.url)
  items.push(item)
}
for (let round = 0; round < TOTAL; round++) for (const feed of perFeed) if (round < feed.count) take(feed.list[round])
for (let round = 0; round < TOTAL; round++) for (const feed of perFeed) take(feed.list[round])

if (items.length === 0) {
  console.error('Geen enkele feed bereikbaar; news.json is niet aangepast.')
  process.exit(1)
}

// Kort nieuws: per rubriek de bovenste berichten die nog niet gebruikt zijn.
const brief = []
for (const feed of BRIEF_FEEDS) {
  try {
    const fresh = (await readFeed(feed.url)).filter((item) => !seen.has(item.url)).slice(0, feed.count)
    for (const item of fresh) {
      seen.add(item.url)
      brief.push({ id: `${feed.id}-${brief.length + 1}`, source: feed.name, label: feed.label, title: item.title, url: item.url })
    }
  } catch (error) {
    console.warn(`! Kort nieuws, ${feed.label} overgeslagen: ${error.message}`)
  }
}

await writeFile(OUT, `${JSON.stringify({ generatedAt: new Date().toISOString(), items, brief }, null, 2)}\n`)
for (const item of items) console.log(`✓ ${item.source} (${item.lang}): ${item.title}`)
for (const item of brief) console.log(`· ${item.label} (${item.source}): ${item.title}`)
