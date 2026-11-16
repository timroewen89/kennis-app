// 'Vandaag geleerd' op het eindscherm: de kern van het weetje, de geschiedenis en de verdieping.
const { chromium, BASE, SHOTS: out, wait, phone, ok, failures } = require('./lib.cjs')
;(async () => {
  const load = (name) => import(require('url').pathToFileURL(require('path').join(__dirname, `../../content/${name}.js`)).href)
  const { facts } = await load('facts')
  const { deepdives } = await load('deepdives')
  const b = await chromium.launch()
  const finishDay = async ({ page, swipe, swipeTo }) => {
    await swipeTo('.card--history, .card--fact')
    if (await page.locator('.card--history.card--guess').count()) { await page.locator('.option').first().tap(); await wait(450); await swipe(); await page.locator('.skip').tap(); await wait(450); await swipe() }
    else if (await page.locator('.card--history').count()) await swipe()
    await page.locator('.skip').tap(); await wait(450); await swipeTo('.card--quiz')
    for (const q of await page.locator('.question').all()) await q.locator('.option').first().tap()
    await swipe(); await page.waitForSelector('.done')
  }
  const read = (page) => page.evaluate(() => [...document.querySelectorAll('.learned__list > li')].map((li) => ({
    label: li.querySelector('.learned__label').textContent, text: li.querySelector('.learned__text').textContent, lang: li.querySelector('.learned__text').getAttribute('lang'),
    points: [...li.querySelectorAll('.learned__points li')].map((n) => n.textContent),
  })))

  console.log('== Gewone dag')
  const one = await phone(b); const p = one.page
  await p.goto(BASE); await p.waitForSelector('.card')
  await finishDay(one)
  const picks = Object.values((await one.state()).progress)[0].picks
  const fact = facts.find((f) => f.id === picks.fact), dive = deepdives.find((d) => d.id === picks.deepdive)
  let items = await read(p)
  console.log('   ' + items.map((i) => `${i.label}: ${i.text}`).join('\n   '))
  ok('kop en drie onderdelen, in de volgorde van de editie', await p.innerText('.learned h3') === 'Vandaag geleerd' && items.map((i) => i.label).join() === 'Op deze dag,Weetje,Verdieping', items.map((i) => i.label).join())
  ok('geschiedenis: jaartal en gebeurtenis', /^1760: \[nl\] /.test(items[0].text) && items[0].text.length <= 170, items[0].text)
  ok('weetje: de titel van het weetje van vandaag', items[1].text === fact.title && items[1].points.length === 0, items[1].text)
  ok('verdieping: de titel met de vier kernzinnen', items[2].text === dive.title && items[2].points.join('|') === dive.heads.join('|'), items[2].points.join(' | '))
  ok('het blok staat onder de cijfers en boven de knoppen', await p.evaluate(() => { const y = (s) => document.querySelector(s).getBoundingClientRect().top; return y('.stats') < y('.learned') && y('.learned') < y('.done__actions') }))
  ok('niets loopt buiten beeld', await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
  await p.screenshot({ path: out + '/120-geleerd.png', fullPage: true })
  const before = JSON.stringify(items)
  await p.reload(); await p.waitForSelector('.done')
  ok('na herladen hetzelfde', JSON.stringify(await read(p)) === before)
  await p.locator('text=Editie teruglezen').tap(); await p.waitForSelector('.card')
  await one.swipeTo('.card--quiz'); await p.locator('.btn--finish').tap(); await p.waitForSelector('.done')
  ok('na teruglezen en opnieuw afronden hetzelfde', JSON.stringify(await read(p)) === before)
  ok('geen fouten in de console', one.errors.length === 0, one.errors.join(' | '))
  await one.ctx.close()

  console.log('== Wikipedia onbereikbaar')
  const two = await phone(b, { wiki: false })
  await two.ctx.route(/wikimedia/, (r) => r.abort())
  await two.page.goto(BASE); await two.page.waitForSelector('.card')
  await finishDay(two)
  items = await read(two.page)
  ok('zonder geschiedenis: alleen weetje en verdieping', items.map((i) => i.label).join() === 'Weetje,Verdieping', items.map((i) => i.label).join())
  await two.ctx.close()

  console.log('== Vertalen mislukt')
  const three = await phone(b, { translate: false })
  await three.ctx.route(/mymemory/, (r) => r.abort())
  await three.page.goto(BASE); await three.page.waitForSelector('.card')
  await finishDay(three)
  items = await read(three.page)
  ok('onvertaalde geschiedenis is als Engels gemarkeerd; de eigen teksten niet', items[0].lang === 'en' && !items[0].text.includes('[nl]') && items[1].lang === null && items[2].lang === null, `${items[0].lang}: ${items[0].text.slice(0, 60)}`)
  await three.ctx.close()

  console.log('mislukt:', failures()); await b.close(); process.exit(failures() ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
