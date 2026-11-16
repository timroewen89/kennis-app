// Service worker: eerst het netwerk proberen (zo zie je altijd de nieuwste versie),
// en zonder verbinding terugvallen op de laatst opgeslagen kopie.
// Let op: alle projecten onder hetzelfde GitHub Pages-adres delen één opslag. Daarom blijft deze
// service worker strikt binnen zijn eigen cache en ruimt hij alleen zijn eigen oude versies op.
const PREFIX = 'kennis-'
const CACHE = `${PREFIX}v4`
const SHELL = ['./', 'styles.css', 'app.js', 'content/topics.js', 'content/facts.js', 'content/deepdives.js', 'manifest.webmanifest', 'icons/icon.svg']

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

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Adressen met een ?vraagteken niet opslaan: anders groeit de opslag met elke variant.
        if (response.ok && !url.search) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
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
