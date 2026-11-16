// De verdieping in stappen: vier korte kaarten met elk een kernzin, los te bewaren.
const { chromium, devices, BASE, SHOTS: out, wait, phone, mockNews, mockWiki, mockTranslate, ok, failures } = require('./lib.cjs')
;(async () => {
  const { deepdives } = await import(require('url').pathToFileURL(require('path').join(__dirname, '../../content/deepdives.js')).href)
  const b = await chromium.launch()
  const { page: p, errors, swipe, swipeTo, pos, state } = await phone(b)
  const text = (selector) => p.innerText(selector)
  const today = async () => Object.keys((await state()).progress)[0]

  console.log('== Vier stappen')
  await p.goto(BASE); await p.waitForSelector('.card')
  await swipeTo('.card--history'); await p.locator('.option').first().tap(); await wait(450); await swipe()
  await p.locator('.skip').tap(); await wait(450); await swipe()
  await p.locator('.skip').tap(); await wait(450); await swipe()
  const pick = Object.values((await state()).progress)[0].picks.deepdive
  const dive = deepdives.find((d) => d.id === pick)
  console.log('   verdieping van vandaag:', dive.id)
  const seen = []
  for (let n = 1; n <= 4; n++) {
    seen.push({ pos: await pos(), kicker: (await text('.card__kicker')).toUpperCase(), context: await text('.card__context'), title: await text('.card__title'), body: await p.locator('.card__body').allInnerTexts(), source: await p.locator('.card__foot a').count() })
    if (n === 1) await p.screenshot({ path: out + '/110-stap.png' })
    if (n < 4) await swipe()
  }
  ok('posities 13 tot en met 16 van 17', seen.map((s) => s.pos).join() === '13 / 17,14 / 17,15 / 17,16 / 17', seen.map((s) => s.pos).join())
  ok('label telt de stappen', seen.every((s, i) => s.kicker === `VERDIEPING · ${i + 1} VAN 4`), seen.map((s) => s.kicker).join(' | '))
  ok('boven elke kernzin staat de titel van de verdieping', seen.every((s) => s.context === dive.title), seen[0].context)
  ok('de kop is de kernzin van die alinea', seen.every((s, i) => s.title === dive.heads[i]), seen.map((s) => s.title).join(' | '))
  ok('elke stap heeft precies één alinea, in de volgorde van de tekst', seen.every((s, i) => s.body.length === 1 && s.body[0] === dive.body[i]))
  ok('elke stap heeft de bronlink', seen.every((s) => s.source === 1))
  ok('de kop is een h2 en de titel van de verdieping niet', await p.locator('h2.card__title').count() === 1 && await p.locator('p.card__context').count() === 1)

  console.log('== Bewaren')
  await p.locator('.save').tap()
  let st = await state()
  ok('een stap los bewaard, met titel van de verdieping en label', st.saved.length === 1 && st.saved[0].card.id === `deepdive-${dive.id}-4` && st.saved[0].card.context === dive.title && st.saved[0].card.kicker === 'Verdieping · 4 van 4' && st.saved[0].card.kickerShort === 'Verdieping 4/4', JSON.stringify(st.saved[0]?.card).slice(0, 120))
  // Een verdieping die in een oudere versie als één kaart is bewaard, en een kaart met een ongeldig veld.
  await p.evaluate(({ k, title, body }) => {
    const s = JSON.parse(localStorage.getItem('kennis:v1'))
    s.saved.push({ key: `${k}:deepdive-oud`, day: k, card: { id: 'deepdive-oud', type: 'deepdive', topic: 'natuur', title, body, source: { name: 'Wikipedia', url: 'https://nl.wikipedia.org/wiki/Test' } } })
    s.saved.push({ key: `${k}:deepdive-stuk`, day: k, card: { id: 'deepdive-stuk', type: 'deepdive', title: 'Stuk', body: ['x'], context: { geen: 'tekst' } } })
    localStorage.setItem('kennis:v1', JSON.stringify(s))
  }, { k: await today(), title: dive.title, body: dive.body })
  await p.reload(); await p.waitForSelector('.card')
  await p.locator('#toggle-saved').tap(); await p.waitForSelector('.saved-list')
  const cards = p.locator('.saved-list .card')
  ok('bewaard: de stap en de oude verdieping; de beschadigde kaart is weggelaten', await cards.count() === 2 && !(await text('.saved-list')).includes('Stuk'))
  ok('bewaarde stap toont titel van de verdieping, kernzin en één alinea', await cards.nth(0).locator('.card__context').innerText() === dive.title && await cards.nth(0).locator('.card__title').innerText() === dive.heads[3] && await cards.nth(0).locator('.card__body').count() === 1)
  ok('oude bewaarde verdieping blijft compleet leesbaar', await cards.nth(1).locator('.card__title').innerText() === dive.title && await cards.nth(1).locator('.card__body').count() === 4 && await cards.nth(1).locator('.card__context').count() === 0)
  await p.screenshot({ path: out + '/111-bewaarde-stap.png' })
  await p.locator('#toggle-saved').tap(); await p.waitForSelector('.stage .card')

  console.log('== Afronden en overgang')
  ok('na herladen terug op dezelfde stap', await pos() === '16 / 17', await pos())
  await swipe()
  ok('na de vierde stap volgt de quiz, met twee vragen over de verdieping', await p.locator('.card--quiz').count() === 1 && (await p.locator('.question__tag').allInnerTexts()).filter((t) => t.toUpperCase().includes('VERDIEPING')).length === 2)
  for (const q of await p.locator('.question').all()) await q.locator('.option').first().tap()
  await swipe(); await p.waitForSelector('.done')
  // Een dag die in de vorige versie (14 kaarten) is afgerond: de positie wijst nu naar een stapkaart.
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('kennis:v1')); const k = Object.keys(s.progress)[0]; s.progress[k].index = 14; localStorage.setItem('kennis:v1', JSON.stringify(s)) })
  await p.reload(); await p.waitForSelector('.card, .done')
  ok('een al afgeronde dag opent op het eindscherm, niet op een nieuwe stapkaart', await pos() === 'KLAAR', await pos())
  await p.locator('text=Editie teruglezen').tap(); await p.waitForSelector('.card')
  ok('teruglezen begint bij kaart 1 van 17', await pos() === '1 / 17')

  console.log('== Smal scherm en langste kernzin')
  const longest = deepdives.flatMap((d) => d.heads.map((head, i) => ({ d, i, head }))).sort((a, c) => c.head.length - a.head.length)[0]
  const ctx = await b.newContext({ ...devices['Pixel 7'], viewport: { width: 320, height: 640 }, locale: 'nl-NL' })
  await mockNews(ctx); await mockWiki(ctx); await mockTranslate(ctx)
  const q = await ctx.newPage()
  await q.goto(BASE); await q.waitForSelector('.card')
  // De verdieping met de langste kernzin kiezen en direct naar die stap gaan.
  await q.evaluate(({ id, step }) => {
    const s = JSON.parse(localStorage.getItem('kennis:v1')); const k = Object.keys(s.progress)[0]
    s.progress[k].picks.deepdive = id; s.progress[k].index = 12 + step; s.progress[k].guesses = { skip: -1 }
    localStorage.setItem('kennis:v1', JSON.stringify(s))
  }, { id: longest.d.id, step: longest.i })
  await q.reload(); await q.waitForSelector('.card--deepdive')
  const m = await q.evaluate(() => {
    const title = document.querySelector('.card__title').getBoundingClientRect(), card = document.querySelector('.card').getBoundingClientRect()
    const dots = [...document.querySelectorAll('.steps li')].map((n) => n.getBoundingClientRect().width)
    const kicker = document.querySelector('.card__kicker'), short = document.querySelector('.kicker__short')
    return { kicker: short.innerText, kickerShown: getComputedStyle(short).display !== 'none', kickerCut: kicker.scrollWidth > kicker.clientWidth, kickerName: document.querySelector('.kicker__long').textContent, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, lines: Math.round(title.height / parseFloat(getComputedStyle(document.querySelector('.card__title')).lineHeight)), inside: title.right <= card.right, dots: dots.length, dot: Math.min(...dots) }
  })
  ok(`320 px: de langste kernzin (${longest.head.length} tekens) past, zonder overloop`, await q.innerText('.card__title') === longest.head && m.overflow <= 0 && m.inside && m.lines <= 5, JSON.stringify(m))
  ok('320 px: kort label met het stapnummer, niet afgekapt; schermlezers houden de lange vorm', m.kickerShown && !m.kickerCut && m.kicker.toUpperCase() === `VERDIEPING ${longest.i + 1}/4` && m.kickerName === `Verdieping · ${longest.i + 1} van 4`, `${m.kicker} | ${m.kickerName}`)
  ok('320 px: 17 stippen blijven zichtbaar', m.dots === 17 && m.dot >= 6, `smalste stip ${m.dot.toFixed(1)}px`)
  await q.screenshot({ path: out + '/112-stap-smal.png' })
  await ctx.close()

  console.log('console errors:', errors, '| mislukt:', failures()); await b.close(); process.exit(failures() || errors.length ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
