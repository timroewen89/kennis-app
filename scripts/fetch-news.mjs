// Haalt de nieuwsfeeds op en schrijft de nieuwskaarten, de kaarten Tech en AI en de koppen voor
// 'Kort nieuws' naar news.json.
// Heeft alleen Node nodig, geen pakketten. Draai met: node scripts/fetch-news.mjs
// Op GitHub draait dit twee keer per dag vanzelf (zie .github/workflows/nieuws.yml).
import { writeFile } from 'node:fs/promises'
import { MAX_FEED_SIZE, isAboutAI, pickItems, pickTopic, rankItems, usableItems } from './news-lib.mjs'

// Volledige nieuwskaarten: 'count' berichten per feed, om de beurt. Valt een feed uit, dan vullen de andere aan.
// 'label' is de kop boven de kaart; zonder label staat er gewoon 'Nieuws'.
const RTV_DRENTHE = 'https://www.rtvdrenthe.nl/rss/index.xml'
const NEWS_FEEDS = [
  { id: 'nos', name: 'NOS', lang: 'nl', count: 2, url: 'https://feeds.nos.nl/nosnieuwsalgemeen' },
  { id: 'rtvdrenthe', name: 'RTV Drenthe', lang: 'nl', label: 'Nieuws uit Drenthe', count: 2, url: RTV_DRENTHE },
  { id: 'bbc', name: 'BBC News', lang: 'en', count: 1, url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'guardian', name: 'The Guardian', lang: 'en', count: 1, url: 'https://www.theguardian.com/world/rss' },
]

// Onderwerpkaarten: per onderwerp één volledige kaart. De eerste feed is de eerste keus; levert die
// geen bruikbaar bericht, dan volgt de reserve. Een 'filter' beperkt een algemene feed tot het onderwerp.
const TOPIC_FEEDS = [
  {
    id: 'tech',
    label: 'Tech',
    feeds: [
      { name: 'NOS', lang: 'nl', url: 'https://feeds.nos.nl/nosnieuwstech' },
      { name: 'BBC News', lang: 'en', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
    ],
  },
  {
    id: 'ai',
    label: 'AI',
    feeds: [
      { name: 'TechCrunch', lang: 'en', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
      { name: 'The Guardian', lang: 'en', url: 'https://www.theguardian.com/technology/rss', filter: isAboutAI },
    ],
  },
]

// Kaart 'Kort nieuws': alleen koppen, en alleen berichten die niet al op een volledige kaart staan.
// Hier horen Nederlandstalige feeds, want deze koppen worden niet vertaald.
const BRIEF_FEEDS = [
  { id: 'binnenland', name: 'NOS', label: 'Binnenland', count: 2, url: 'https://feeds.nos.nl/nosnieuwsbinnenland' },
  { id: 'buitenland', name: 'NOS', label: 'Buitenland', count: 2, url: 'https://feeds.nos.nl/nosnieuwsbuitenland' },
  { id: 'drenthe', name: 'RTV Drenthe', label: 'Drenthe', count: 1, url: RTV_DRENTHE },
]

const OUT = new URL('../news.json', import.meta.url)
const TOTAL = NEWS_FEEDS.reduce((sum, feed) => sum + feed.count, 0)

// Haalt een feed op (één keer per adres) en geeft de bruikbare berichten terug, verse eerst.
const fetched = new Map()
function readFeed(url) {
  if (!fetched.has(url)) {
    fetched.set(
      url,
      (async () => {
        const res = await fetch(url, { headers: { 'User-Agent': 'kennis-app' }, signal: AbortSignal.timeout(20_000) })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const items = rankItems(usableItems((await res.text()).slice(0, MAX_FEED_SIZE)))
        if (items.length === 0) throw new Error('geen bruikbaar bericht')
        return items
      })(),
    )
  }
  return fetched.get(url)
}

const results = await Promise.allSettled(NEWS_FEEDS.map((feed) => readFeed(feed.url)))
const perFeed = []
results.forEach((result, i) => {
  const feed = NEWS_FEEDS[i]
  if (result.status === 'rejected') return console.warn(`! ${feed.name} overgeslagen: ${result.reason.message}`)
  const list = result.value.slice(0, TOTAL).map((item, n) => ({
    id: `${feed.id}-${n + 1}`,
    source: feed.name,
    lang: feed.lang,
    label: feed.label ?? null,
    ...item,
  }))
  perFeed.push({ count: feed.count, list })
})

const { items, seen } = pickItems(perFeed, TOTAL)
if (items.length === 0) {
  console.error('Geen enkele feed bereikbaar; news.json is niet aangepast.')
  process.exit(1)
}

// Onderwerpkaarten (Tech en AI): na de gewone nieuwskaarten gekozen, zodat er niets dubbel staat.
const topics = []
for (const topic of TOPIC_FEEDS) {
  const lists = await Promise.all(
    topic.feeds.map(async (feed) => {
      try {
        return { items: await readFeed(feed.url), filter: feed.filter }
      } catch (error) {
        console.warn(`! ${topic.label}, ${feed.name} overgeslagen: ${error.message}`)
        return null
      }
    }),
  )
  const found = pickTopic(lists, seen)
  if (!found) {
    console.warn(`! ${topic.label}: geen bruikbaar bericht; deze kaart vervalt`)
    continue
  }
  const feed = topic.feeds[found.index]
  seen.add(found.item.url)
  topics.push({ id: topic.id, source: feed.name, lang: feed.lang, label: topic.label, ...found.item })
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

await writeFile(OUT, `${JSON.stringify({ generatedAt: new Date().toISOString(), items, topics, brief }, null, 2)}\n`)
const when = (item) => (item.publishedAt ? item.publishedAt.slice(5, 16).replace('T', ' ') : 'geen datum')
for (const item of items) console.log(`✓ ${item.source} (${item.lang}, ${when(item)}): ${item.title}`)
for (const item of topics) console.log(`✓ ${item.label}: ${item.source} (${item.lang}, ${when(item)}): ${item.title}`)
for (const item of brief) console.log(`· ${item.label} (${item.source}): ${item.title}`)
