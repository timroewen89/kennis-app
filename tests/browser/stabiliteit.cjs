const { chromium, BASE, wait, phone, ok, failures } = require('./lib.cjs')
;(async () => {
  const b = await chromium.launch()

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
  ok('bij terugkomen staat de editie van de nieuwe dag er', (await p.innerText('#date')) !== before && await pos() === '1 / 12', `${before} -> ${await p.innerText('#date')}`)

  console.log('== Offline')
  await p.evaluate(() => navigator.serviceWorker.ready); await wait(400)
  await p.reload(); await p.waitForSelector('.card')
  await ctx.setOffline(true); await p.reload(); await p.waitForSelector('.card')
  ok('zonder verbinding laden opmaak, code en inhoud uit de opslag', await p.evaluate(() => getComputedStyle(document.querySelector('.card')).borderRadius) === '16px' && await pos() === '1 / 12')
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

  const real = errors.filter((m) => !m.startsWith('Failed to load resource') && !/example\.com|Refused to (connect|execute)|Content Security Policy/i.test(m))
  console.log('console errors:', real, '| mislukt:', failures())
  await b.close(); process.exit(failures() || real.length ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
