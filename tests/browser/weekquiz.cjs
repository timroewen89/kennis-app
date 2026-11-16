const { chromium, BASE, wait, phone, ok, failures } = require('./lib.cjs')
const { SHOTS: out } = require('./lib.cjs')
;(async () => {
  const b = await chromium.launch()
  const { page: p, errors, swipe, swipeTo, pos, state } = await phone(b)
  const base = Date.now()
  const toSunday = (7 - new Date(base).getDay()) % 7 || 7 // dagen tot de eerstvolgende zondag
  const key = (n) => { const d = new Date(base + n * 86400000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
  const open = async (offset) => { await p.clock.setFixedTime(new Date(base + offset * 86400000)); await p.goto(BASE); await p.waitForSelector('.card, .done') }
  const finishDay = async (page = p, sw = swipe, swTo = swipeTo) => {
    await swTo('.card--history, .card--fact')
    if (await page.locator('.card--history.card--guess').count()) { await page.locator('.option', { hasText: '1760' }).tap(); await wait(450); await sw(); await page.locator('.skip').tap(); await wait(450); await sw() }
    else if (await page.locator('.card--history').count()) await sw()
    await page.locator('.skip').tap(); await wait(450); await sw(); await sw()
    for (const q of await page.locator('.question').all()) await q.locator('.option').first().tap()
    await sw()
  }

  console.log(`== Vrijdag en zaterdag (zondag is over ${toSunday} dagen)`)
  await open(toSunday - 2); await finishDay()
  ok('geen weekquiz op een doordeweekse dag', await pos() === 'KLAAR' && await p.locator('.done__week').count() === 0)
  await open(toSunday - 1); await finishDay()
  ok('geen weekquiz op zaterdag', await p.locator('.done__week').count() === 0)

  console.log('== Zondag')
  await open(toSunday)
  ok('het is zondag', (await p.innerText('#date')).startsWith('zondag'), await p.innerText('#date'))
  await finishDay()
  ok('klaar-scherm biedt de weekquiz aan met 10 vragen', (await p.innerText('.done__week')).includes('Weekquiz: 10 vragen over deze week'), (await p.innerText('.done__week')).replace(/\n+/g, ' | '))
  await p.screenshot({ path: out + '/95-klaar-zondag.png' })
  const logBefore = (await state()).log
  await p.locator('.done__week .btn').tap(); await p.waitForSelector('.week')
  const labels = await p.locator('.week .question__tag').allInnerTexts()
  console.log('   ' + labels.join(' | '))
  ok('10 vragen, uit drie dagen, met "vandaag"', labels.length === 10 && new Set(labels.map((l) => l.split(' VAN ')[1])).size === 3 && labels.some((l) => l.toUpperCase().includes('VAN VANDAAG')))
  ok('kop Weekquiz; afronden pas na alle antwoorden', (await p.innerText('.week .card__kicker')).toUpperCase() === 'WEEKQUIZ' && await p.locator('text=Weekquiz afronden').isDisabled())
  // eerst de helft, dan weg en terug
  const qs = await p.locator('.week .question').all()
  for (let i = 0; i < 5; i++) await qs[i].locator('.option').first().tap()
  await p.locator('text=Later verder').tap(); await p.waitForSelector('.done')
  ok('halverwege: knop "Weekquiz afmaken"', (await p.innerText('.done__week')).includes('Weekquiz afmaken'))
  await p.reload(); await p.waitForSelector('.done')
  await p.locator('.done__week .btn').tap(); await p.waitForSelector('.week')
  ok('antwoorden en vragen bewaard na herladen', await p.locator('.week .option:disabled').count() === 15 && JSON.stringify(await p.locator('.week .question__tag').allInnerTexts()) === JSON.stringify(labels))
  for (const q of (await p.locator('.week .question').all()).slice(5)) await q.locator('.option').first().tap()
  await p.screenshot({ path: out + '/96-weekquiz.png', fullPage: true })
  await p.locator('text=Weekquiz afronden').tap(); await p.waitForSelector('.week__score')
  const score = (await p.innerText('.week__score')).replace(/\n+/g, ' ')
  const correct = await p.locator('.week .question').evaluateAll((qs) => qs.filter((q) => !q.querySelector('.is-wrong')).length)
  ok('weekscore getoond en klopt met de antwoorden', score.includes(`${correct} van 10`), score)
  await p.screenshot({ path: out + '/97-weekscore.png' })
  const st = await state()
  const week = st.weeks[key(toSunday)]
  ok('week vastgelegd', week.done && week.score[0] === correct && week.score[1] === 10)
  const ids = week.items.map((i) => i.id)
  const updated = ids.filter((id) => { const before = logBefore.find((i) => i.id === id), after = st.log.find((i) => i.id === id); return after && after.reviews === before.reviews + 1 && after.lastReview === key(toSunday) })
  ok('antwoorden tellen mee voor de herhaling', updated.length === 10 && st.log.length === logBefore.length, `${updated.length} bijgewerkt`)
  await p.locator('text=Terug').tap(); await p.waitForSelector('.done')
  ok('klaar-scherm toont de uitslag', (await p.innerText('.done__week')).includes(`Weekquiz gedaan: ${correct} van 10 goed`))
  await p.locator('#toggle-progress').tap(); await p.waitForSelector('.progress')
  ok('weekscore staat op het voortgangsscherm', (await p.innerText('.weekscores')).replace(/\n+/g, ' ').includes(`${correct} van 10`), (await p.innerText('.weekscores')).replace(/\n+/g, ' '))

  console.log('== Maandag erna')
  await open(toSunday + 1); await finishDay()
  ok('geen weekquiz meer op maandag', await p.locator('.done__week').count() === 0)
  const reviews = Object.values((await state()).progress)[0].reviews.map((r) => r.id)
  ok('net in de weekquiz gestelde vragen komen niet meteen terug in de dagquiz', !reviews.some((id) => ids.includes(id)), reviews.map((i) => i.slice(5)).join(', ') || 'geen herhaling')

  console.log('== Zondag met te weinig vragen')
  const { ctx: c2, page: p2, swipe: s2, swipeTo: st2 } = await phone(b, { wiki: false })
  await c2.route(/wikimedia/, (r) => r.abort())
  await p2.clock.setFixedTime(new Date(base + toSunday * 86400000)); await p2.goto(BASE); await p2.waitForSelector('.card')
  await finishDay(p2, s2, st2)
  ok('melding in plaats van weekquiz', (await p2.innerText('.done__week')).includes('te weinig gelezen') && await p2.locator('.done__week .btn').count() === 0, (await p2.innerText('.done__week')))

  const all = errors.filter((m) => !m.startsWith('Failed to load resource'))
  console.log('console errors:', all, '| mislukt:', failures())
  await b.close(); process.exit(failures() || all.length ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
