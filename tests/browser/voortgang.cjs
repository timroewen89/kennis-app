const { chromium, devices, BASE, wait, phone, mockWiki, mockTranslate, ok, failures } = require('./lib.cjs')
const { SHOTS: out } = require('./lib.cjs')
;(async () => {
  const b = await chromium.launch()
  const { page: p, errors, swipe, swipeTo, pos, state } = await phone(b)
  const base = Date.now()
  const key = (n) => { const d = new Date(base + n * 86400000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
  const open = async (offset) => { await p.clock.setFixedTime(new Date(base + offset * 86400000)); await p.goto(BASE); await p.waitForSelector('.card, .done') }
  const finishDay = async () => {
    await swipeTo('.card--history')
    await p.locator('.option', { hasText: '1760' }).tap(); await wait(450); await swipe()
    await p.locator('.skip').tap(); await wait(450); await swipe()
    await p.locator('.skip').tap(); await wait(450); await swipeTo('.card--quiz')
    for (const q of await p.locator('.question').all()) await q.locator('.option').first().tap()
    await swipe()
  }
  const tiles = async () => (await p.innerText('.stats--four')).replace(/\n+/g, ' | ')

  console.log('== Leeg')
  await open(0)
  await p.locator('#toggle-progress').tap(); await p.waitForSelector('.progress')
  ok('scherm opent via het vlammetje; nog niets afgerond', (await tiles()).includes('Afgeronde edities | 0') && (await tiles()).includes('–'), await tiles())
  ok('kalender: 5 weken, vandaag gemarkeerd, toekomst gestippeld', await p.locator('.calendar__day').count() === 35 && await p.locator('.calendar__day.is-today').count() === 1 && await p.locator('.calendar__day.is-done').count() === 0)
  const todayCell = (await p.locator('.calendar__day.is-today').evaluate((n) => n.firstChild.textContent))
  ok('vandaag heeft het juiste dagnummer', todayCell === String(new Date(base).getDate()), todayCell)
  ok('laatste rij eindigt op zondag van deze week', (await p.locator('.calendar__day').last().getAttribute('title')).startsWith('zondag'), await p.locator('.calendar__day').last().getAttribute('title'))
  await p.locator('text=Terug naar de editie').tap(); await p.waitForSelector('.card')

  console.log('== Na één en twee dagen')
  await finishDay()
  const d0 = (await state()).days[key(0)]
  ok('dag vastgelegd met quiz- en raadscore', Array.isArray(d0?.quiz) && d0.quiz[1] === 4 && d0.guess[1] === 3, JSON.stringify(d0))
  await p.locator('#toggle-progress').tap(); await p.waitForSelector('.progress')
  ok('1 afgerond, gemiddelde getoond, vandaag ingekleurd', (await tiles()).includes('Afgeronde edities | 1') && /Quiz gemiddeld \| \d+%/.test(await tiles()) && await p.locator('.calendar__day.is-today.is-done').count() === 1, await tiles())
  await open(1); await finishDay()
  await p.locator('#toggle-progress').tap(); await p.waitForSelector('.progress')
  const st = await state()
  const right = st.days[key(0)].quiz[0] + st.days[key(1)].quiz[0], asked = st.days[key(0)].quiz[1] + st.days[key(1)].quiz[1]
  ok('2 afgerond, reeks 2, gemiddelde klopt', (await tiles()).includes('Dagreeks | 2 dagen') && (await tiles()).includes('Afgeronde edities | 2') && (await tiles()).includes(`${Math.round((right / asked) * 100)}% | ${right} van ${asked} vragen`), await tiles())
  ok('mijlpaal telt af', (await p.locator('.milestones li').first().innerText()) === '7 dagen op rij: nog 5 dagen', (await p.locator('.milestones li').allInnerTexts()).join(' | '))
  await p.screenshot({ path: out + '/90-voortgang.png', fullPage: true })
  await p.reload(); await p.waitForSelector('.done')
  await p.locator('#toggle-progress').tap()
  ok('blijft na herladen', await p.locator('.calendar__day.is-done').count() === 2)

  console.log('== Bestaande opslag zonder daggeschiedenis')
  await p.evaluate(([k]) => localStorage.setItem('kennis:v1', JSON.stringify({ streak: { count: 3, best: 8, lastCompleted: k }, progress: {}, saved: [], log: [] })), [key(0)])
  await p.reload(); await p.waitForSelector('.card')
  await p.locator('#toggle-progress').tap(); await p.waitForSelector('.progress')
  ok('dagen van de reeks ingevuld, zonder score', (await tiles()).includes('Afgeronde edities | 3') && (await tiles()).includes('Quiz gemiddeld | –') && await p.locator('.calendar__day.is-done').count() === 3, await tiles())
  ok('gehaalde mijlpaal afgevinkt', (await p.locator('.milestones li.is-done').allInnerTexts()).join('') === '✓ 7 dagen op rij gehaald' && (await p.locator('.milestones li').nth(1).innerText()).includes('nog 27 dagen'), (await p.locator('.milestones li').allInnerTexts()).join(' | '))

  console.log('== Smal scherm')
  const narrow = await b.newContext({ ...devices['Pixel 7'], viewport: { width: 320, height: 640 }, locale: 'nl-NL' })
  await mockWiki(narrow); await mockTranslate(narrow)
  const np = await narrow.newPage(); await np.goto(BASE); await np.waitForSelector('.card')
  await np.locator('#toggle-progress').tap(); await np.waitForSelector('.progress')
  const overflow = await np.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ok('past op 320 px breed', overflow <= 0, `overloop ${overflow}px`)

  console.log('console errors:', errors, '| mislukt:', failures())
  await b.close(); process.exit(failures() || errors.length ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
