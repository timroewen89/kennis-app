const { chromium, devices, BASE, wait, phone, mockWiki, mockTranslate, ok, failures } = require('./lib.cjs')
;(async () => {
  const b = await chromium.launch()
  const { ctx, page: p, errors, swipe, swipeTo, pos, state } = await phone(b)
  const base = Date.now()
  const key = (n) => { const d = new Date(base + n * 86400000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
  const open = async (offset) => { await p.clock.setFixedTime(new Date(base + offset * 86400000)); await p.goto(BASE); await p.waitForSelector('.card, .done') }
  const logIds = async () => (await state()).log.map((i) => `${i.id.slice(5)}${i.wrong ? '!' : ''}/s${i.streak}/r${i.reviews}`).join(' ')
  // Speelt de kaarten tot aan de quiz. history: jaartal om te tikken; fact: 'skip' of 'first'.
  const toQuiz = async ({ history = '1760', fact = 'skip' } = {}) => {
    await swipeTo('.card--history')
    await p.locator('.option', { hasText: history }).tap(); await wait(450); await swipe()
    await p.locator('.skip').tap(); await wait(450); await swipe() // tijdlijn
    await (fact === 'skip' ? p.locator('.skip') : p.locator('.card--guess .option').first()).tap(); await wait(450)
    await swipeTo('.card--quiz') // langs de vier stappen van de verdieping
  }
  const doQuiz = async (answerFor = () => null) => {
    const labels = []
    for (const q of await p.locator('.question').all()) {
      const label = (await q.locator('.question__tag').innerText()).toUpperCase(); labels.push(label)
      const want = await answerFor(label)
      await (want ? q.locator('.option', { hasText: want }).first() : q.locator('.option').first()).tap()
    }
    return labels
  }
  const rightAnswer = async (type, n) => { const item = (await state()).log.find((i) => i.id === `${key(n)}:${type}`); return item ? item.question.options[item.question.answer] : null }

  console.log('== Dag 1')
  await open(0)
  ok('17 kaarten', await p.locator('.steps li').count() === 17)
  await swipeTo('.card--history')
  ok('kaart 5 is raadkaart geschiedenis; jaartal en bewaarknop verborgen', await pos() === '10 / 17' && await p.locator('.card--guess.card--history').count() === 1 && await p.locator('.card__year').count() === 0 && await p.locator('.save').count() === 0)
  await swipe(); ok('vegen geblokkeerd tot gok', await pos() === '10 / 17')
  await p.locator('.option', { hasText: '1859' }).tap(); await wait(500)
  ok('uitslag fout getoond; achterkant compleet', (await p.innerText('.result')).includes('Niet geraden — het was: 1760') && await p.innerText('.card__year') === '1760' && await p.locator('.save').count() === 1)
  await swipe(); await p.locator('.skip').tap(); await wait(450); await swipe()
  ok('weetje: vraag, 3 opties en Geen idee', await pos() === '12 / 17' && await p.locator('.card--guess .option').count() === 3 && await p.locator('.skip').count() === 1)
  await p.locator('.skip').tap(); await wait(450)
  ok('Geen idee: neutrale uitslag', await p.locator('.result.is-neutral').count() === 1)
  await p.locator('.save').tap(); await swipeTo('.card--quiz')
  let labels = await doQuiz()
  ok('dag 1: quiz = 2x verdieping + 2x weet je het nog', labels.length === 4 && labels.slice(0, 2).every((l) => l.includes('VANDAAG')) && labels.slice(2).every((l) => l.includes('WEET JE HET NOG')), JSON.stringify(labels))
  await swipe(); ok('afgerond', await pos() === 'KLAAR')
  ok('geraden 0 van 3', (await p.innerText('.stats')).includes('0 van 3'), (await p.innerText('.stats')).replace(/\n+/g, ' | '))
  let st = await state()
  ok('4 vragen onthouden; weetje en geschiedenis fout; bewaarde kaart zonder raadvraag', st.log.length === 4 && st.log.filter((i) => i.wrong && ['fact', 'history'].includes(i.type)).length === 2 && st.saved.length === 1 && !('guess' in st.saved[0].card))
  await p.reload(); await p.waitForSelector('.done')
  await p.locator('text=Editie teruglezen').tap(); await p.waitForSelector('.card')
  await swipeTo('.card--history')
  ok('teruglezen: geschiedenis direct omgedraaid', await p.locator('.card--guess').count() === 0 && await p.locator('.result').count() === 1)
  await swipeTo('.card--quiz')
  ok('teruglezen: quiz al beantwoord', await p.locator('.option:disabled').count() === 12)
  await p.locator('.btn--finish').tap(); await p.waitForSelector('.done')
  ok('opnieuw afronden voegt niets dubbel toe', (await state()).log.length === 4 && (await state()).streak.count === 1)
  await p.locator('#toggle-saved').tap()
  ok('bewaard-lijst toont kaart zonder uitslag', await p.locator('.saved-list .card').count() === 1 && await p.locator('.saved-list .result').count() === 0)

  console.log('== Dag 2')
  await open(1); await toQuiz({ fact: 'first' })
  labels = await doQuiz(); await swipe()
  ok('nog geen herhaling; reeks 2', labels.every((l) => !l.includes('HERHALING')) && (await state()).streak.count === 2)

  console.log('== Dag 3')
  await open(2); await toQuiz()
  const factRight = await rightAnswer('fact', 0)
  labels = await doQuiz((l) => (l.includes('HERHALING · WEETJE') ? factRight : l.includes('HERHALING · GESCHIEDENIS') ? '1760' : null))
  ok('vijf vragen: 2x vandaag en 3 herhalingsvragen uit dag 1', labels.length === 5 && labels.filter((l) => l.includes('VANDAAG')).length === 2 && labels.filter((l) => l.includes('HERHALING')).length === 3, JSON.stringify(labels))
  const ids3 = Object.values((await state()).progress)[0].reviews.map((r) => r.id)
  await p.reload(); await p.waitForSelector('.card')
  ok('na herladen dezelfde quiz en antwoorden', JSON.stringify((await p.locator('.question__tag').allInnerTexts()).map((t) => t.toUpperCase())) === JSON.stringify(labels) && await p.locator('.option:disabled').count() === 15)
  await swipe(); st = await state()
  ok('de drie herhaalde vragen zijn bijgewerkt; goed beantwoorde telt 1x goed', st.log.filter((i) => i.reviews === 1 && i.lastReview === key(2)).length === 3 && st.log.some((i) => i.id === `${key(0)}:fact` && i.streak === 1 && !i.wrong), await logIds())

  console.log('== Dag 4')
  await open(3); await toQuiz()
  const ids4 = Object.values((await state()).progress)[0].reviews.map((r) => r.id)
  labels = await doQuiz(); await swipe()
  const d1 = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long' }).format(new Date(base)).toUpperCase()
  ok('5 dagen rust voor net herhaalde vragen', ids4.length === 3 && !ids4.some((id) => ids3.includes(id)), `dag 3: ${ids3.map((i) => i.slice(5))} | dag 4: ${ids4.map((i) => i.slice(5))}`)

  console.log('== Onthouden en vergeten')
  await open(7)
  ok('reeks verbroken na gemiste dagen', await p.innerText('#streak') === '0')
  await p.evaluate(([k0, k1, k2]) => {
    const s = JSON.parse(localStorage.getItem('kennis:v1'))
    const q = (text) => ({ q: text, options: ['goed', 'fout-a', 'fout-b'], answer: 0, explain: 'uitleg' })
    s.log = [
      { id: `${k0}:fact`, day: k0, type: 'fact', question: q('Al een keer goed?'), wrong: false, streak: 1, reviews: 1, lastReview: k2 },
      { id: `${k1}:deepdive`, day: k1, type: 'deepdive', question: q('Wordt nu fout beantwoord?'), wrong: false, streak: 1, reviews: 1, lastReview: k2 },
    ]
    s.progress = {}
    localStorage.setItem('kennis:v1', JSON.stringify(s))
  }, [key(0), key(1), key(2)])
  await p.reload(); await p.waitForSelector('.card'); await toQuiz()
  labels = await doQuiz((l) => (l.includes('HERHALING · WEETJE') ? 'goed' : l.includes('HERHALING · VERDIEPING') ? 'fout-a' : null)); await swipe()
  st = await state()
  const again = st.log.find((i) => i.question.q === 'Wordt nu fout beantwoord?')
  ok('twee keer goed verdwijnt; fout blijft en telt opnieuw', !st.log.some((i) => i.question.q === 'Al een keer goed?') && again && again.wrong && again.streak === 0 && again.reviews === 2, await logIds())

  console.log('== Dag 70')
  await open(69); await toQuiz(); labels = await doQuiz(); await swipe()
  ok('te oude vragen niet gesteld en opgeruimd', labels.every((l) => !l.includes('HERHALING')) && (await state()).log.length === 4, await logIds())

  console.log('== Offline')
  await p.evaluate(() => navigator.serviceWorker.ready); await wait(300)
  await ctx.unroute(/api\.wikimedia\.org/); await ctx.setOffline(true)
  await p.reload(); await p.waitForSelector('.done')
  await p.locator('text=Editie teruglezen').tap(); await p.waitForSelector('.card')
  // Op deze gesimuleerde dag is het nieuws 'verouderd'; ook dan moet de editie zonder verbinding compleet zijn.
  ok('offline herladen en teruglezen werkt, ook met verouderd nieuws', await pos() === '1 / 17' && (await p.locator('.notice').allInnerTexts()).join(' ').includes('niet van vandaag') && await p.locator('.notice').count() === 1 && !(await p.innerText('.card__title')).includes('kon niet'), (await p.locator('.notice').allInnerTexts()).join(' / '))
  await p.locator('#toggle-topics').tap()
  ok('onderwerpen-scherm werkt offline', await p.locator('.topic').count() === 7)
  await ctx.setOffline(false)

  console.log('== Bestaande opslag (vorige versies)')
  await mockWiki(ctx)
  await p.evaluate((k) => localStorage.setItem('kennis:v1', JSON.stringify({ streak: { count: 3, best: 5, lastCompleted: k }, progress: { [k]: { index: 7, answers: [0, 1, 2], completed: true } }, saved: [] })), key(69))
  await p.reload(); await p.waitForSelector('.card')
  ok('oudste opslag: start bij kaart 1, reeks behouden', await pos() === '1 / 17' && await p.innerText('#streak') === '3')
  await p.evaluate((k) => localStorage.setItem('kennis:v1', JSON.stringify({ streak: { count: 3, best: 5, lastCompleted: null }, progress: { [k]: { v: 2, index: 2, guesses: {}, answers: [], reviews: [], completed: false } }, saved: [], log: [] })), key(69))
  await p.reload(); await p.waitForSelector('.card')
  ok('opslag van gisteren (zonder keuze weetje): gaat verder op kaart 3 en kiest inhoud', await pos() === '3 / 17' && !!Object.values((await state()).progress)[0].picks)

  console.log('== Terugval: alle bronnen onbereikbaar')
  const { ctx: c2, page: p2, errors: e2 } = await phone(b, { wiki: false })
  await c2.route(/wikimedia|news\.json/, (r) => r.abort())
  await p2.goto(BASE); await p2.waitForSelector('.card')
  const next = async () => { await p2.keyboard.press('ArrowRight'); await wait(60) }
  ok('8 kaarten met twee meldingen', await p2.locator('.steps li').count() === 8 && await p2.locator('.notice').count() === 2)
  await next()
  ok('geschiedenis zonder vraag verschijnt direct', await p2.locator('.card--history:not(.card--guess)').count() === 1)
  await next(); await next()
  ok('pijltjestoets geblokkeerd op raadkaart', (await p2.innerText('.pager__count')).startsWith('3 / 8'))
  await p2.locator('.skip').tap(); for (let i = 0; i < 5; i++) await next() // weetje, vier stappen verdieping
  for (const q of await p2.locator('.question').all()) await q.locator('.option').first().tap()
  await p2.locator('.btn--finish').tap(); await p2.waitForSelector('.done')
  ok('quiz met 3 vragen, afronden werkt, 3 vragen onthouden', (await p2.innerText('.stats')).includes('van 3') && (await p2.evaluate(() => JSON.parse(localStorage.getItem('kennis:v1')).log.length)) === 3, (await p2.innerText('.stats')).replace(/\n+/g, ' | '))

  console.log('== Desktop')
  const d = await b.newContext({ viewport: { width: 1100, height: 800 }, locale: 'nl-NL' })
  await mockWiki(d); await mockTranslate(d)
  const dp = await d.newPage(); const e3 = []; dp.on('pageerror', (e) => e3.push(String(e)))
  await dp.goto(BASE); await dp.waitForSelector('.card')
  for (let i = 0; i < 9; i++) await dp.click('button:has-text("Volgende")')
  ok('Volgende uit op raadkaart, aan na gok', await dp.isDisabled('button:has-text("Volgende")') && (await dp.click('.option >> nth=0'), !(await dp.isDisabled('button:has-text("Volgende")'))))
  await dp.click('button:has-text("Volgende")')
  await dp.click('.timeline__item >> nth=0'); await dp.click('.timeline__item >> nth=1'); await dp.click('.timeline__item >> nth=2'); await dp.click('button:has-text("Controleer")')
  ok('tijdlijn met de muis', await dp.locator('.timeline__result li').count() === 3)

  // Mislukte netwerkverzoeken horen bij de offline- en terugvalscenario's.
  const all = [...errors, ...e2, ...e3].filter((m) => !m.startsWith('Failed to load resource'))
  console.log('console errors:', all, '| mislukt:', failures())
  await b.close(); process.exit(failures() || all.length ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
