const { chromium, BASE, wait, phone, ok, failures } = require('./lib.cjs')
;(async () => {
  const b = await chromium.launch()
  const swipeTo2 = async (q) => { for (let i = 0; i < 12 && !(await q.locator('.card--brief').count()); i++) { await q.keyboard.press('ArrowRight'); await wait(80) } }

  console.log('== Content-Security-Policy')
  const { ctx, page: p, errors, swipe, swipeTo, pos } = await phone(b)
  await p.goto(BASE); await p.waitForSelector('.card')
  await swipeTo('.card--history'); await p.locator('.option', { hasText: '1760' }).tap(); await wait(450); await swipe()
  ok('app werkt onder de policy, inclusief Wikipedia en vertaling', await p.locator('.card--timeline').count() === 1 && (await p.locator('.timeline__item').first().innerText()).includes('[nl]'))
  ok('geen meldingen van de policy in de console', !errors.some((e) => /Content Security Policy|Refused to/i.test(e)), errors.join(' | '))
  const blocked = await p.evaluate(() => fetch('https://example.com/').then(() => 'toegestaan', () => 'geblokkeerd'))
  ok('verbinding met een onbekende site wordt geblokkeerd', blocked === 'geblokkeerd', blocked)
  const inline = await p.evaluate(() => { const s = document.createElement('script'); s.textContent = 'window.__inline = 1'; document.body.append(s); return window.__inline === 1 ? 'uitgevoerd' : 'geblokkeerd' })
  ok('ingevoegd script wordt niet uitgevoerd', inline === 'geblokkeerd', inline)
  ok('opmaak geladen uit styles.css', await p.evaluate(() => getComputedStyle(document.querySelector('.card')).borderRadius) === '16px')

  console.log('== Nieuwe dag terwijl de app open staat')
  const before = await p.innerText('#date')
  await p.clock.setFixedTime(new Date(Date.now() + 86400000))
  await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await p.waitForFunction((d) => document.querySelector('#date')?.textContent && document.querySelector('#date').textContent !== d, before, { timeout: 15000 }).catch(() => {})
  await p.waitForSelector('.card')
  ok('bij terugkomen staat de editie van de nieuwe dag er', (await p.innerText('#date')) !== before && await pos() === '1 / 14', `${before} -> ${await p.innerText('#date')}`)

  console.log('== Offline')
  await p.evaluate(() => navigator.serviceWorker.ready); await wait(400)
  await p.reload(); await p.waitForSelector('.card')
  await ctx.setOffline(true); await p.reload(); await p.waitForSelector('.card')
  ok('zonder verbinding laden opmaak, code en inhoud uit de opslag', await p.evaluate(() => getComputedStyle(document.querySelector('.card')).borderRadius) === '16px' && await pos() === '1 / 14')
  await ctx.setOffline(false)

  console.log('== Kapot inhoudsbestand')
  const broken = async (label, handler, expect) => {
    const { ctx: c, page: q } = await phone(b)
    await c.route(/content\/facts\.js/, handler)
    await q.goto(BASE); await q.waitForSelector('.error, .card', { timeout: 20000 })
    const text = (await q.locator('.error').count()) ? (await q.innerText('.error')).replace(/\n+/g, ' | ') : '(geen foutmelding)'
    ok(label, expect(text) && await q.locator('.error .btn').count() === 1, text.slice(0, 190))
    await c.close()
  }
  await broken('typfout in facts.js geeft een melding met de bestandsnaam', (r) => r.fulfill({ contentType: 'text/javascript', body: "export const facts = [ { id: 'x', title: 'kapot' " }), (t) => t.includes('De inhoud kon niet worden geladen') && t.includes('content/facts.js'))
  await broken('ontbrekend bestand geeft dezelfde melding', (r) => r.fulfill({ status: 404, body: 'niet gevonden' }), (t) => t.includes('content/facts.js'))
  await broken('lege lijst wordt herkend', (r) => r.fulfill({ contentType: 'text/javascript', body: 'export const facts = []' }), (t) => t.includes('De lijst facts ontbreekt of is leeg'))

  console.log('== Beschadigde of gemanipuleerde opslag')
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })()
  const withStorage = async (label, values, check) => {
    const { ctx: c, page: q, errors: e } = await phone(b)
    await q.goto(BASE); await q.waitForSelector('.card')
    await q.evaluate((entries) => { for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value) }, values)
    await q.reload(); await q.waitForSelector('.card, .error', { timeout: 15000 }).catch(() => {})
    const shown = (await q.locator('.card').count()) ? 'editie' : (await q.locator('.error').count()) ? 'foutscherm' : 'blijft hangen'
    ok(label, await check(q, shown), `${shown}${e.filter((m) => !m.startsWith('Failed to load')).length ? ' | fouten: ' + e.join(' | ').slice(0, 120) : ''}`)
    await c.close()
  }
  const loads = async (q, shown) => shown === 'editie'
  await withStorage('enorme dagreeks laat de app niet vastlopen', { 'kennis:v1': JSON.stringify({ streak: { count: 1e9, best: 1, lastCompleted: today } }) }, async (q, shown) => shown === 'editie' && Number(await q.innerText('#streak')) <= 36500)
  await withStorage('ongeldige bewaarde kaart wordt overgeslagen', { 'kennis:v1': JSON.stringify({ saved: [null, { key: 'x' }, 5] }) }, async (q, shown) => shown === 'editie' && (await q.innerText('#toggle-saved')) === 'Bewaard (0)')
  await withStorage('onvolledige voortgang van vandaag wordt aangevuld', { 'kennis:v1': JSON.stringify({ progress: { [today]: { v: 2 } } }) }, loads)
  await withStorage('ongeldige herhalingsvragen worden overgeslagen', { 'kennis:v1': JSON.stringify({ log: [null, { id: 1 }, { id: 'a', day: 'gisteren' }] }) }, loads)
  await withStorage('opslag met een heel ander soort waarde', { 'kennis:v1': '"tekst"', 'kennis:vertaling:v1': '[1,2,3]' }, loads)
  await withStorage('beschadigde bronnen van vandaag worden opnieuw opgehaald', { 'kennis:edition:v10': JSON.stringify({ day: today, complete: true, notes: [], news: [{ id: 'n', type: 'news', title: 'x', body: 'geen lijst' }], history: {} }) }, async (q, shown) => shown === 'editie' && (await q.innerText('.card__title')) !== 'x')
  await withStorage('weken en dagen met vreemde sleutels', { 'kennis:v1': JSON.stringify({ days: { __proto__: { vervuild: true }, 'geen-datum': {} }, weeks: { [today]: { items: [null], answers: 'x', done: true } } }) }, async (q, shown) => shown === 'editie' && (await q.evaluate(() => ({}).vervuild)) === undefined)

  console.log('== Onveilige link uit de opslag')
  {
    const { ctx: c, page: q } = await phone(b)
    await q.goto(BASE); await q.waitForSelector('.card')
    await q.locator('.save').tap()
    await q.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('kennis:v1')); state.saved[0].card.source.url = 'javascript:window.__gekaapt=1'; localStorage.setItem('kennis:v1', JSON.stringify(state))
      const sources = JSON.parse(localStorage.getItem('kennis:edition:v10')); sources.news[0].source.url = 'javascript:window.__gekaapt=1'; sources.brief[0].url = 'data:text/html,x'; localStorage.setItem('kennis:edition:v10', JSON.stringify(sources))
    })
    await q.reload(); await q.waitForSelector('.card')
    const hrefs = async () => q.locator('main a').evaluateAll((links) => links.map((a) => a.getAttribute('href')))
    ok('nieuwskaart: bron staat er als tekst, zonder link', (await hrefs()).length === 0 && (await q.innerText('.card__foot')).startsWith('Bron: NOS'), (await hrefs()).join(', '))
    await q.locator('#toggle-saved').tap(); await q.waitForSelector('.saved-list')
    ok('bewaarde kaart: idem', (await hrefs()).length === 0)
    await q.locator('#toggle-saved').tap(); await swipeTo2(q)
    ok('kort nieuws: alleen de veilige links', (await hrefs()).length === 4 && (await hrefs()).every((h) => h.startsWith('https://')), `${(await hrefs()).length} links`)
    await c.close()
  }

  console.log('== Foutscherm met wissen')
  {
    const { ctx: c, page: q } = await phone(b)
    const key = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
    await q.goto(BASE); await q.waitForSelector('.card')
    await q.evaluate((k) => localStorage.setItem('kennis:v1', JSON.stringify({ streak: { count: 4, best: 4, lastCompleted: k } })), key)
    // Een verdieping zonder vragen: de editie kan dan niet worden getoond.
    await c.route(/content\/deepdives\.js/, (r) => r.fulfill({ contentType: 'text/javascript', body: "export const deepdives = [{ id: 'x', topic: 'natuur', title: 't', body: ['b'] }]" }))
    await q.reload(); await q.waitForSelector('.error, .card')
    ok('een scherm dat niet opgebouwd kan worden geeft een foutmelding in plaats van een vastloper', await q.locator('.error').count() === 1 && await q.innerText('#streak') === '4', (await q.locator('.error').count()) ? (await q.innerText('.error h2')) : 'geen foutscherm')
    await q.locator('text=Opgeslagen gegevens wissen').tap()
    ok('wissen vraagt eerst om bevestiging en zegt wat er verdwijnt', (await q.innerText('.error__wipe')).includes('dagreeks') && await q.locator('text=Ja, wis mijn gegevens').count() === 1)
    await q.locator('text=Annuleren').tap()
    ok('annuleren laat alles staan', await q.evaluate(() => localStorage.getItem('kennis:v1') !== null) && await q.locator('text=Ja, wis mijn gegevens').count() === 0)
    await q.locator('text=Opgeslagen gegevens wissen').tap(); await q.locator('text=Ja, wis mijn gegevens').tap()
    await q.waitForFunction(() => document.querySelector('#streak')?.textContent === '0', null, { timeout: 15000 }).catch(() => {})
    ok('na bevestigen zijn de gegevens weg en herstart de app', await q.innerText('#streak') === '0' && await q.evaluate(() => JSON.parse(localStorage.getItem('kennis:v1') ?? '{}').streak?.count ?? 0) === 0)
    await c.close()
  }
  {
    const { ctx: c, page: q } = await phone(b)
    await c.route(/news\.json/, (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ generatedAt: new Date().toISOString(), items: [{ id: 'a', title: 'ok', source: 'NOS', lang: 'nl' }], brief: 'geen lijst' }) }))
    await q.goto(BASE); await q.waitForSelector('.card, .error')
    ok('vreemd news.json: de app blijft werken', await q.locator('.card').count() === 1 && (await q.innerText('.card__title')) === 'ok')
    await c.close()
  }
  {
    const { ctx: c, page: q } = await phone(b)
    await c.route(/api\.wikimedia\.org/, (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ selected: [{ year: 1900, text: 'x', pages: 'geen lijst' }] }) }))
    await q.goto(BASE); await q.waitForSelector('.card, .error')
    ok('vreemd antwoord van Wikipedia: editie met terugval, geen vastloper', await q.locator('.card').count() === 1)
    await c.close()
  }

  console.log('== Opslag van andere projecten op hetzelfde adres')
  {
    const { ctx: c, page: q } = await phone(b)
    await q.goto(BASE); await q.waitForSelector('.card')
    await q.evaluate(async () => { const cache = await caches.open('ander-project-v1'); await cache.put('/ander/bestand', new Response('blijft staan')); const old = await caches.open('kennis-v1'); await old.put('/kennis-app/oud', new Response('oud')) })
    await q.evaluate(async () => { const reg = await navigator.serviceWorker.getRegistration(); await reg.unregister() })
    await q.reload(); await q.waitForSelector('.card')
    await q.evaluate(() => navigator.serviceWorker.ready); await wait(600)
    const keys = await q.evaluate(() => caches.keys())
    ok('de service worker ruimt alleen zijn eigen oude opslag op', keys.includes('ander-project-v1') && !keys.includes('kennis-v1') && keys.some((k) => k.startsWith('kennis-v')), keys.join(', '))
    await q.goto(BASE + '?a=1'); await q.waitForSelector('.card'); await q.goto(BASE + '?a=2'); await q.waitForSelector('.card'); await wait(300)
    const stored = await q.evaluate(async () => { const key = (await caches.keys()).find((k) => k.startsWith('kennis-v')); return (await (await caches.open(key)).keys()).map((r) => r.url).filter((u) => u.includes('?')) })
    ok('adressen met een vraagteken worden niet opgeslagen', stored.length === 0, stored.join(', '))
    await c.close()
  }

  const real = errors.filter((m) => !m.startsWith('Failed to load resource') && !/example\.com|Refused to (connect|execute)|Content Security Policy/i.test(m))
  console.log('console errors:', real, '| mislukt:', failures())
  await b.close(); process.exit(failures() || real.length ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
