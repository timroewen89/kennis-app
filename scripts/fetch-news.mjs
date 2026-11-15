// Haalt de bovenste berichten van de nieuwsfeeds op en schrijft 3 nieuwspunten naar public/news.json.
// Draai met: npm run news  (later dagelijks en automatisch, bij het publiceren)
import { writeFile } from 'node:fs/promises'
import { XMLParser } from 'fast-xml-parser'
import { NEWS_FEEDS } from '../src/data/sources.js'

const OUT = new URL('../public/news.json', import.meta.url)
const TOTAL = 3
const MAX_SUMMARY = 280
const parser = new XMLParser({ ignoreAttributes: true, processEntities: true })

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function plainText(value) {
  return String(value ?? '')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n') // alinea-grenzen bewaren
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
      if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? match
      const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1))
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match
    })
    .trim()
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
    const url = new URL(String(value).trim())
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
  const items = [parser.parse(await res.text())?.rss?.channel?.item ?? []].flat()
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
