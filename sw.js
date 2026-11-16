// Service worker: eerst het netwerk proberen (zo zie je altijd de nieuwste versie),
// en zonder verbinding terugvallen op de laatst opgeslagen kopie.
// Let op: alle projecten onder hetzelfde GitHub Pages-adres delen één opslag. Daarom blijft deze
// service worker strikt binnen zijn eigen cache en ruimt hij alleen zijn eigen oude versies op.
const PREFIX = 'kennis-'
const CACHE = `${PREFIX}v7`
const SHELL = ['./', 'styles.css', 'app.js', 'content/topics.js', 'content/facts.js', 'content/deepdives.js', 'content/series.js', 'manifest.webmanifest', 'icons/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  // Alleen eigen opslag van eerdere versies opruimen; die van andere projecten blijft staan.
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(PREFIX) && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

// Geeft het antwoord door met de opdracht 'eerst navragen'. Anders houdt de browser het bestand binnen
// een open tabblad nog in zijn werkgeheugen vast en helpt herladen niet.
function alwaysRevalidate(response) {
  const headers = new Headers(response.headers)
  headers.set('Cache-Control', 'no-cache')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  event.respondWith(
    // 'no-cache': altijd bij de server navragen of er een nieuwere versie is. Zonder dit gebruikt de
    // browser tien minuten lang zijn eigen kopie (dat geeft GitHub Pages zo op) en zie je na een
    // update nog de oude app.
    fetch(request, { cache: 'no-cache' })
      .then((response) => {
        // Adressen met een ?vraagteken niet opslaan: anders groeit de opslag met elke variant.
        if (response.ok && !url.search) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return alwaysRevalidate(response)
      })
      .catch(async () => {
        const cache = await caches.open(CACHE)
        const cached = await cache.match(request, { ignoreSearch: true })
        if (cached) return cached
        if (request.mode === 'navigate') return (await cache.match('./')) ?? Response.error()
        return Response.error()
      }),
  )
})
