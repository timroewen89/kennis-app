import { safeUrl } from './safeUrl.js'

// Nieuws-feeds mogen niet rechtstreeks vanuit de browser worden opgehaald (geen CORS).
// scripts/fetch-news.mjs zet ze daarom vooraf klaar in public/news.json.
export async function fetchNews() {
  const res = await fetch(`${import.meta.env.BASE_URL}news.json`, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`news.json gaf status ${res.status}`)
  const { items } = await res.json()
  if (!Array.isArray(items) || items.length === 0) throw new Error('news.json is leeg')

  return items.slice(0, 3).map((item) => ({
    id: `news-${item.id}`,
    type: 'news',
    lang: item.lang,
    title: String(item.title),
    body: item.summary ? [String(item.summary)] : [],
    source: { name: String(item.source), url: safeUrl(item.url) },
  }))
}
