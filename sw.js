// Service worker: eerst het netwerk proberen (zo zie je altijd de nieuwste versie),
// en zonder verbinding terugvallen op de laatst opgeslagen kopie.
const CACHE = 'kennis-v2'
const SHELL = ['./', 'content/topics.js', 'content/facts.js', 'content/deepdives.js', 'manifest.webmanifest', 'icons/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  // Oude opslag van eerdere versies opruimen.
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request, { ignoreSearch: true })
        if (cached) return cached
        if (request.mode === 'navigate') return (await caches.match('./')) ?? Response.error()
        return Response.error()
      }),
  )
})
