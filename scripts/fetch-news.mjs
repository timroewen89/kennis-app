// Haalt de bovenste berichten van de nieuwsfeeds op en schrijft 3 nieuwspunten naar news.json.
// Heeft alleen Node nodig, geen pakketten. Draai met: node scripts/fetch-news.mjs
// Op GitHub draait dit elke dag vanzelf (zie .github/workflows/nieuws.yml).
import { writeFile } from 'node:fs/promises'

// Uit elke feed komt het bovenste bericht in de editie. Valt een feed uit, dan vullen de andere aan.
const NEWS_FEEDS = [
  { id: 'nos', name: 'NOS', lang: 'nl', url: 'https://feeds.nos.nl/nosnieuwsalgemeen' },
  { id: 'bbc', name: 'BBC News', lang: 'en', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'guardian', name: 'The Guardian', lang: 'en', url: 'https://www.theguardian.com/world/rss' },
]

const OUT = new URL('../news.json', import.meta.url)
const TOTAL = 3
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

async function topItems(feed) {
  const res = await fetch(feed.url, {
    headers: { 'User-Agent': 'kennis-app' },
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`status ${res.status}`)
  const items = parseItems(await res.text())
  const usable = items.filter((i) => i?.title && httpsUrl(i.link)).slice(0, TOTAL)
  if (usable.length === 0) throw new Error('geen bruikbaar bericht')
  return usable.map((item, n) => {
    const published = new Date(item.pubDate)
    return {
      id: `${feed.id}-${n + 1}`,
      source: feed.name,
      lang: feed.lang,
      title: plainText(item.title).replace(/\s+/g, ' '),
      summary: summarize(item.description),
      url: httpsUrl(item.link),
      publishedAt: Number.isNaN(published.getTime()) ? null : published.toISOString(),
    }
  })
}

const results = await Promise.allSettled(NEWS_FEEDS.map(topItems))
const perFeed = []
results.forEach((result, i) => {
  if (result.status === 'fulfilled') perFeed.push(result.value)
  else console.warn(`! ${NEWS_FEEDS[i].name} overgeslagen: ${result.reason.message}`)
})

// Om de beurt één bericht per feed, tot er 3 zijn. Valt een feed uit, dan vullen de andere aan.
const items = []
for (let round = 0; items.length < TOTAL && perFeed.some((list) => list[round]); round++) {
  for (const list of perFeed) {
    if (list[round] && items.length < TOTAL) items.push(list[round])
  }
}

if (items.length === 0) {
  console.error('Geen enkele feed bereikbaar; news.json is niet aangepast.')
  process.exit(1)
}

await writeFile(OUT, `${JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2)}\n`)
for (const item of items) console.log(`✓ ${item.source} (${item.lang}): ${item.title}`)
