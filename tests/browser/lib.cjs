// Gedeelde hulpmiddelen voor de browsertests. De tests draaien tegen een lokale kopie van de app
// en bootsen de buitenwereld na: Wikipedia, de vertaaldienst en een vers news.json.
const { chromium, devices } = require('playwright')
const fs = require('fs')
const os = require('os')
const path = require('path')

const BASE = process.env.KENNIS_URL || 'http://localhost:8000/kennis-app/'
const SHOTS = process.env.KENNIS_SHOTS || path.join(os.tmpdir(), 'kennis-shots')
fs.mkdirSync(SHOTS, { recursive: true })

// Een echt antwoord van de 'On this day'-API van Wikipedia (15 november), teruggebracht tot wat de app gebruikt.
const onThisDay = fs.readFileSync(path.join(__dirname, 'fixtures/onthisday.json'), 'utf8')
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const mockWiki = (ctx) => ctx.route(/api\.wikimedia\.org/, (route) => route.fulfill({ contentType: 'application/json', body: onThisDay }))
// De 'vertaling' zet [nl] voor de tekst, zodat te zien is wat vertaald is.
const mockTranslate = (ctx) =>
  ctx.route(/mymemory/, (route) => {
    const q = new URL(route.request().url()).searchParams.get('q')
    return route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ responseData: { translatedText: '[nl] ' + q, match: 0.85 }, responseStatus: 200, matches: [{ 'created-by': 'MT!', translation: '[nl] ' + q }] }),
    })
  })
// Het news.json uit de repo, maar met de tijd van nu: de tests mogen niet afhangen van hoe oud het bestand is.
const mockNews = (ctx) =>
  ctx.route(/news\.json/, async (route) => {
    const response = await route.fetch()
    const json = await response.json()
    json.generatedAt = new Date().toISOString()
    await route.fulfill({ response, json })
  })

// Een telefoon (Pixel 7) met nagebootste aanrakingen. Later toegevoegde routes gaan voor,
// dus een test kan elk van de nagebootste bronnen zelf overschrijven.
async function phone(browser, { wiki = true, translate = true, news = true } = {}) {
  const ctx = await browser.newContext({ ...devices['Pixel 7'], locale: 'nl-NL' })
  if (news) await mockNews(ctx)
  if (wiki) await mockWiki(ctx)
  if (translate) await mockTranslate(ctx)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  page.on('pageerror', (error) => errors.push(String(error)))
  const cdp = await ctx.newCDPSession(page)
  const swipe = async (dir = 'left', y = null) => {
    // Standaard begint de veeg net onder de bovenrand van de kaart (meldingen kunnen die omlaag duwen).
    if (y === null) {
      const box = await page.locator('.stage .card').first().boundingBox().catch(() => null)
      y = box ? Math.min(Math.max(box.y + 40, 150), 700) : 200
    }
    const x1 = dir === 'left' ? 340 : 60
    const step = dir === 'left' ? -32 : 32
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y }] })
    for (let i = 1; i <= 8; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + step * i, y }] })
      await wait(12)
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await wait(420)
  }
  // Veegt door tot de kaart met deze selector in beeld is.
  const swipeTo = async (selector) => {
    for (let i = 0; i < 16; i++) {
      if (await page.locator(selector).count()) return
      await swipe()
    }
    throw new Error('kaart niet gevonden: ' + selector)
  }
  const pos = async () => ((await page.locator('.done').count()) ? 'KLAAR' : (await page.innerText('.pager__count')).split('·')[0].trim())
  const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('kennis:v1')))
  return { ctx, page, errors, swipe, swipeTo, pos, state }
}

let fails = 0
const ok = (label, condition, extra = '') => {
  if (!condition) fails++
  console.log(condition ? 'ok  ' : 'FOUT', label, extra)
}
const failures = () => fails

module.exports = { chromium, devices, BASE, SHOTS, wait, mockWiki, mockTranslate, mockNews, phone, ok, failures }
