// Alle externe bronnen op één plek. Gratis en zonder API-sleutel.
// Wordt gebruikt door de app (geschiedenis) én door scripts/fetch-news.mjs (nieuws).

// Uit elke feed komt het bovenste bericht in de editie: samen 3 nieuwspunten.
export const NEWS_FEEDS = [
  { id: 'nos', name: 'NOS', lang: 'nl', url: 'https://feeds.nos.nl/nosnieuwsalgemeen' },
  { id: 'bbc', name: 'BBC News', lang: 'en', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'guardian', name: 'The Guardian', lang: 'en', url: 'https://www.theguardian.com/world/rss' },
]

// De 'On this day'-feed van Wikipedia bestaat niet in het Nederlands, wel in het Engels.
export const HISTORY = {
  lang: 'en',
  name: 'Wikipedia (EN)',
  url: (month, day) =>
    `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected/${month}/${day}`,
}
