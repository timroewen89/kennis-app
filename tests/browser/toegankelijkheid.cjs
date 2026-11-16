const { chromium, devices, BASE, wait, mockWiki, mockTranslate, ok, failures } = require('./lib.cjs')
const fs = require('fs')
const axeSource = fs.readFileSync(process.env.AXE || require.resolve('axe-core/axe.min.js'), 'utf8')
;(async () => {
  const b = await chromium.launch()
  let total = 0
  // bypassCSP alleen om het controlescript in de pagina te kunnen laden.
  const run = async (scheme) => {
    const ctx = await b.newContext({ ...devices['Pixel 7'], locale: 'nl-NL', bypassCSP: true, colorScheme: scheme })
    await mockWiki(ctx); await mockTranslate(ctx)
    const p = await ctx.newPage(); const errors = []
    p.on('pageerror', (e) => errors.push(String(e)))
    await p.goto(BASE); await p.waitForSelector('.card')
    await p.evaluate(axeSource)
    const check = async (label) => {
      await wait(450) // animaties laten uitlopen
      const res = await p.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } }))
      const v = res.violations
      total += v.length
      console.log(`${v.length === 0 ? 'ok  ' : 'FOUT'} [${scheme}] ${label}${v.length ? ': ' + v.map((x) => `${x.id} (${x.impact}, ${x.nodes.length}x: ${x.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' ; ')})`).join(' | ') : ''}`)
    }
    const next = async () => { await p.keyboard.press('ArrowRight'); await wait(80) }
    await check('nieuwskaart')
    for (let i = 0; i < 6; i++) await next()
    await check('kort nieuws'); await next()
    await check('geschiedenis: raden')
    await p.locator('.option').first().click(); await check('geschiedenis: omgedraaid'); await next()
    await check('tijdlijn: kiezen')
    for (let i = 0; i < 3; i++) await p.locator('.timeline__item').nth(i).click()
    await check('tijdlijn: gekozen')
    await p.locator('.timeline__actions .btn').click(); await check('tijdlijn: uitslag'); await next()
    await p.locator('.skip').click(); await check('weetje: omgedraaid'); await p.locator('.save').click(); await next()
    await check('verdieping'); await next()
    await check('quiz: leeg')
    for (const q of await p.locator('.question').all()) await q.locator('.option').first().click()
    await check('quiz: beantwoord')
    await p.locator('.btn--finish').click(); await p.waitForSelector('.done'); await check('klaar-scherm')
    await p.locator('#toggle-saved').click(); await check('bewaard')
    await p.locator('#toggle-saved').click(); await p.locator('#toggle-topics').click(); await check('instellingen')
    await p.locator('#toggle-progress').click(); await check('voortgang')
    if (errors.length) { console.log('paginafouten:', errors); total++ }
    await ctx.close()
  }
  await run('light'); await run('dark')
  // foutscherm
  const ctx = await b.newContext({ ...devices['Pixel 7'], locale: 'nl-NL', bypassCSP: true })
  await ctx.route(/content\/facts\.js/, (r) => r.fulfill({ contentType: 'text/javascript', body: 'export const facts = [' }))
  const p = await ctx.newPage(); await p.goto(BASE); await p.waitForSelector('.error'); await p.evaluate(axeSource)
  const res = await p.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } }))
  total += res.violations.length
  console.log(`${res.violations.length ? 'FOUT' : 'ok  '} foutscherm${res.violations.length ? ': ' + res.violations.map((x) => `${x.id} (${x.impact})`).join(' | ') : ''}`)
  console.log('totaal aantal meldingen:', total)
  await b.close(); process.exit(total ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
