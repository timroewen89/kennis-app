// Na een update moet de nieuwe versie meteen zichtbaar zijn, ook al zegt de server (zoals GitHub
// Pages) dat de browser elk bestand tien minuten mag bewaren.
// Deze reeks start een eigen server met die instelling en onderschept geen verkeer: zodra verkeer
// wordt onderschept, zet de testbrowser zijn eigen bewaarde kopieën uit en valt er niets te testen.
const { chromium, devices } = require('playwright')
const crypto = require('crypto')
const fs = require('fs')
const http = require('http')
const path = require('path')
const { wait, ok, failures } = require('./lib.cjs')

const ROOT = path.resolve(__dirname, '../..')
const PORT = Number(process.env.KENNIS_PORT_VERVERSEN || 8124)
const URL_APP = `http://127.0.0.1:${PORT}/kennis-app/`
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' }

// De 'versie' van de app op de server: een kenmerk dat aan styles.css wordt toegevoegd.
let version = 'rgb(1, 1, 1)'
const server = http.createServer((req, res) => {
  let relative
  try {
    relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname.replace('/kennis-app/', '')) || 'index.html'
  } catch {
    return res.writeHead(400).end()
  }
  const file = path.resolve(ROOT, relative)
  const inside = path.relative(ROOT, file)
  if (!inside || inside.startsWith('..') || path.isAbsolute(inside) || inside.split(path.sep).some((part) => part.startsWith('.'))) return res.writeHead(403).end()
  fs.readFile(file, (error, data) => {
    if (error) return res.writeHead(404).end()
    if (relative === 'styles.css') data = Buffer.concat([data, Buffer.from(`\n.top h1 { outline-color: ${version}; }\n`)])
    const etag = `"${crypto.createHash('sha1').update(data).digest('hex').slice(0, 12)}"`
    const headers = { ETag: etag, 'Cache-Control': 'max-age=600' } // zoals GitHub Pages
    if (req.headers['if-none-match'] === etag) return res.writeHead(304, headers).end()
    res.writeHead(200, { ...headers, 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' }).end(data)
  })
})

server.listen(PORT, '127.0.0.1', async () => {
  // Wikipedia en de vertaaldienst op netwerkniveau naar een gesloten poort sturen: ze mislukken direct.
  const browser = await chromium.launch({ args: ['--host-resolver-rules=MAP api.wikimedia.org 127.0.0.1:9, MAP api.mymemory.translated.net 127.0.0.1:9'] })
  const ctx = await browser.newContext({ ...devices['Pixel 7'], locale: 'nl-NL' })
  const seen = (page) => page.evaluate(() => getComputedStyle(document.querySelector('.top h1')).outlineColor)
  const open = async () => { const page = await ctx.newPage(); await page.goto(URL_APP); await page.waitForSelector('.card'); return page }
  try {
    let page = await open()
    await page.evaluate(() => navigator.serviceWorker.ready); await wait(500)
    await page.reload(); await page.waitForSelector('.card')
    ok('uitgangssituatie: versie 1 zichtbaar, service worker actief', (await seen(page)) === 'rgb(1, 1, 1)' && (await page.evaluate(() => Boolean(navigator.serviceWorker.controller))))

    version = 'rgb(2, 2, 2)' // er staat een nieuwe versie op de server
    await page.reload(); await page.waitForSelector('.card')
    ok('herladen in hetzelfde tabblad toont de nieuwe versie', (await seen(page)) === 'rgb(2, 2, 2)', await seen(page))

    version = 'rgb(3, 3, 3)'
    await page.close(); page = await open()
    ok('de app afsluiten en opnieuw openen toont de nieuwe versie', (await seen(page)) === 'rgb(3, 3, 3)', await seen(page))

    version = 'rgb(4, 4, 4)'
    await page.goto('about:blank'); await page.goto(URL_APP); await page.waitForSelector('.card')
    ok('weggaan en terugkomen in hetzelfde tabblad toont de nieuwe versie', (await seen(page)) === 'rgb(4, 4, 4)', await seen(page))

    await ctx.setOffline(true)
    await page.reload(); await page.waitForSelector('.card')
    ok('zonder verbinding werkt de laatst opgehaalde versie nog', (await seen(page)) === 'rgb(4, 4, 4)', await seen(page))
  } catch (error) {
    console.error(error)
    ok('de reeks liep zonder fout', false, String(error).slice(0, 200))
  }
  console.log('mislukt:', failures())
  await browser.close()
  server.close()
  process.exit(failures() ? 1 : 0)
})
