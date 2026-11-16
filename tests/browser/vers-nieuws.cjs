const { chromium, BASE, wait, phone, ok, failures } = require('./lib.cjs')
;(async () => {
  const b = await chromium.launch()
  const { ctx, page: p, errors, swipe, swipeTo, pos } = await phone(b)
  let version = 'gisteren', wikiCalls = 0
  ctx.on('request', (r) => r.url().includes('wikimedia') && wikiCalls++)
  await ctx.route(/news\.json/, async (r) => {
    const res = await r.fetch(); const j = await res.json()
    const d = new Date(); if (version === 'gisteren') { d.setDate(d.getDate() - 1); d.setHours(20, 0, 0, 0) }
    j.generatedAt = d.toISOString(); j.items[0].title = `NOS-kop van ${version}`
    await r.fulfill({ response: res, json: j })
  })
  const cache = () => p.evaluate(() => { const s = JSON.parse(localStorage.getItem('kennis:edition:v10')); return { complete: s.complete, early: s.newsEarly } })
  await p.goto(BASE); await p.waitForSelector('.card')
  ok('nieuws van gisteravond wordt getoond, zonder melding', await p.innerText('.card__title') === 'NOS-kop van gisteren' && await p.locator('.notice').count() === 0)
  ok('maar niet als definitief vastgelegd', JSON.stringify(await cache()) === '{"complete":false,"early":true}', JSON.stringify(await cache()))
  await swipe(); await swipe()
  const before = wikiCalls
  version = 'vandaag'
  await p.reload(); await p.waitForSelector('.card')
  ok('na de ochtendverversing: bij opnieuw openen het nieuws van vandaag, op dezelfde kaartpositie', await pos() === '3 / 17')
  await swipe('right'); await swipe('right')
  ok('eerste kaart toont de nieuwe kop', await p.innerText('.card__title') === 'NOS-kop van vandaag', await p.innerText('.card__title'))
  ok('nu wel vastgelegd; geschiedenis niet opnieuw opgehaald', JSON.stringify(await cache()) === '{"complete":true,"early":false}' && wikiCalls === before, `${wikiCalls - before} Wikipedia-verzoeken`)

  // afgeronde editie: nieuws verspringt niet meer
  const { ctx: c2, page: p2, swipe: s2, swipeTo: st2 } = await phone(b)
  let v2 = 'gisteren'
  await c2.route(/news\.json/, async (r) => { const res = await r.fetch(); const j = await res.json(); const d = new Date(); if (v2 === 'gisteren') { d.setDate(d.getDate() - 1); d.setHours(20, 0, 0, 0) } j.generatedAt = d.toISOString(); j.items[0].title = `NOS-kop van ${v2}`; await r.fulfill({ response: res, json: j }) })
  await p2.goto(BASE); await p2.waitForSelector('.card')
  await st2('.card--history'); await p2.locator('.option', { hasText: '1760' }).tap(); await wait(450); await s2()
  await p2.locator('.skip').tap(); await wait(450); await s2(); await p2.locator('.skip').tap(); await wait(450); await st2('.card--quiz')
  for (const q of await p2.locator('.question').all()) await q.locator('.option').first().tap()
  await s2(); await p2.waitForSelector('.done')
  v2 = 'vandaag'; await p2.reload(); await p2.waitForSelector('.done')
  await p2.locator('text=Editie teruglezen').tap(); await p2.waitForSelector('.card')
  ok('afgeronde editie houdt het nieuws dat je gelezen hebt', await p2.innerText('.card__title') === 'NOS-kop van gisteren', await p2.innerText('.card__title'))
  console.log('console errors:', errors, '| mislukt:', failures()); await b.close(); process.exit(failures() || errors.length ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
