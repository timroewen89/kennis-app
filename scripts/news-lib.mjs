// Hulpfuncties voor het ophalen van nieuws: RSS lezen, tekst opschonen en berichten kiezen.
// Deze functies doen zelf geen netwerkverzoeken, zodat ze los te testen zijn (tests/news-lib.test.mjs).

export const MAX_SUMMARY = 280
const FRESH_HOURS = 24

// Geen nieuwsberichten maar vaste rubrieken en promo's: de dagagenda van de NOS, live-uitzendingen,
// liveblogs en podcasts.
export const SKIP_TITLE = /^(wekdienst\b|nos-wekdienst\b|kijk en luister live|kijk live\b|liveblog\b|live:|live blog\b|podcast\b)/i

// Grenzen voor wat we uit een feed aannemen. Een kapotte of kwaadwillende feed mag het script niet
// minutenlang bezighouden of een bericht van honderdduizend tekens in de app zetten.
export const MAX_FEED_SIZE = 3_000_000
const MAX_ITEMS = 60
const MAX_FIELD = 20_000
const MAX_TITLE = 300

// Zoekt het eerste <tag ...>...</tag> vanaf een positie. Met indexOf in plaats van een reguliere
// expressie, zodat de tijd niet kwadratisch oploopt bij vreemde invoer.
function element(text, tag, from = 0) {
  const open = `<${tag}`
  for (let at = text.indexOf(open, from); at !== -1; at = text.indexOf(open, at + 1)) {
    const next = text[at + open.length]
    if (next !== '>' && !/\s/.test(next ?? '')) continue // bijvoorbeeld <items> als we <item> zoeken
    const start = text.indexOf('>', at)
    if (start === -1) return null
    const end = text.indexOf(`</${tag}>`, start)
    if (end === -1) return null
    return { content: text.slice(start + 1, end), next: end + tag.length + 3 }
  }
  return null
}

// Leest de <item>-blokken uit een RSS-feed. Bewust eenvoudig: we hebben alleen titel,
// link, beschrijving en datum nodig, en alles wordt daarna nog opgeschoond en gecontroleerd.
export function parseItems(xml) {
  const text = String(xml).slice(0, MAX_FEED_SIZE)
  const field = (block, tag) => {
    let content = element(block, tag)?.content.trim() ?? ''
    if (content.startsWith('<![CDATA[') && content.endsWith(']]>')) content = content.slice(9, -3)
    return content.slice(0, MAX_FIELD).trim()
  }
  const items = []
  for (let found = element(text, 'item'); found && items.length < MAX_ITEMS; found = element(text, 'item', found.next)) {
    items.push({
      title: field(found.content, 'title'),
      link: field(found.content, 'link'),
      description: field(found.content, 'description'),
      pubDate: field(found.content, 'pubDate'),
    })
  }
  return items
}

const ENTITIES = new Map([['amp', '&'], ['lt', '<'], ['gt', '>'], ['quot', '"'], ['apos', "'"], ['nbsp', ' ']])

export function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] !== '#') return ENTITIES.get(code.toLowerCase()) ?? match
    const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1))
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match
  })
}

// Maakt van een stukje feed-inhoud gewone tekst. Sommige feeds leveren HTML, andere
// HTML die nog eens gecodeerd is; daarom eerst decoderen, dan tags weghalen, dan nog eens decoderen.
export function plainText(value) {
  return decodeEntities(
    decodeEntities(String(value ?? ''))
      .replace(/<\/p>\s*<p[^>]*>/gi, '\n') // alinea-grenzen bewaren
      .replace(/<[^>]*>/g, ''),
  ).trim()
}

// Eerste alinea, en als die te lang is: afkappen op een zinseinde.
export function summarize(description) {
  const first = plainText(description).split('\n')[0].replace(/\s+/g, ' ').trim()
  if (first.length <= MAX_SUMMARY) return first
  const cut = first.slice(0, MAX_SUMMARY)
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '))
  return end > 80 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

// Alleen gewone https-links doorlaten.
export function httpsUrl(value) {
  try {
    const url = new URL(decodeEntities(String(value)).trim())
    // Geen adressen met een naam of wachtwoord ervoor (https://nos.nl@elders.example): die misleiden.
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}

// Van ruwe feed-berichten naar bruikbare berichten: opgeschoonde titel, geldige link, geen rubrieken.
export function usableItems(xml) {
  return parseItems(xml)
    .map((item) => {
      const published = new Date(item.pubDate)
      return {
        title: plainText(item.title).replace(/\s+/g, ' ').slice(0, MAX_TITLE),
        url: httpsUrl(item.link),
        summary: summarize(item.description),
        publishedAt: Number.isNaN(published.getTime()) ? null : published.toISOString(),
      }
    })
    .filter((item) => item.title && item.url && !SKIP_TITLE.test(item.title))
}

// Zet de berichten van één feed in de volgorde waarin we ze willen gebruiken.
// Niet elke feed staat op datum: sommige zetten de keuze van de redactie bovenaan, en daar kan
// een bericht van dagen oud tussen staan. Daarom eerst de berichten van de laatste 24 uur, in de
// volgorde van de feed; daarna de rest, nieuwste eerst.
export function rankItems(items, now = Date.now()) {
  const age = (item) => (item.publishedAt ? now - new Date(item.publishedAt).getTime() : Infinity)
  const fresh = items.filter((item) => age(item) <= FRESH_HOURS * 3_600_000)
  const older = items.filter((item) => !fresh.includes(item)).sort((a, b) => age(a) - age(b))
  return [...fresh, ...older]
}

// Kiest de volledige nieuwskaarten: om de beurt één bericht per feed, tot elke feed zijn aantal heeft.
// Zijn er feeds uitgevallen, dan vullen de andere aan. 'feeds' is een lijst { count, list }.
export function pickItems(feeds, total) {
  const items = []
  const seen = new Set()
  const take = (item) => {
    if (!item || seen.has(item.url) || items.length >= total) return
    seen.add(item.url)
    items.push(item)
  }
  for (let round = 0; round < total; round++) for (const feed of feeds) if (round < feed.count) take(feed.list[round])
  for (let round = 0; round < total; round++) for (const feed of feeds) take(feed.list[round])
  return { items, seen }
}
