const { chromium, BASE, wait, mockWiki, mockTranslate, ok, failures } = require('./lib.cjs')
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 900, height: 800 }, locale: 'nl-NL' })
  await mockWiki(ctx); await mockTranslate(ctx)
  const p = await ctx.newPage(); const errors = []
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text())); p.on('pageerror', (e) => errors.push(String(e)))
  await p.goto(BASE); await p.waitForSelector('.card')
  const focus = () => p.evaluate(() => { const a = document.activeElement; return a === document.body ? 'BODY' : `${a.tagName.toLowerCase()}${a.className ? '.' + String(a.className).trim().split(/\s+/)[0] : ''}` })
  const focusText = () => p.evaluate(() => document.activeElement.textContent.trim().slice(0, 60))
  const announce = () => p.innerText('#announce')
  const key = async (k, n = 1) => { for (let i = 0; i < n; i++) { await p.keyboard.press(k); await wait(60) } }
  // Tab tot een element met deze klasse de focus heeft.
  const tabTo = async (cls) => { for (let i = 0; i < 40; i++) { if ((await focus()).endsWith(cls)) return true; await key('Tab') } return false }

  ok('bij het laden wordt de focus niet verplaatst', await focus() === 'BODY')
  await key('ArrowRight')
  ok('na bladeren: focus op de kop van de nieuwe kaart, positie aangekondigd', await focus() === 'h2.card__title' && await announce() === 'Kaart 2 van 17', `${await focus()} | ${await announce()}`)
  await key('ArrowRight', 8)
  ok('raadkaart geschiedenis', (await announce()) === 'Kaart 10 van 17' && await p.locator('.card--guess').count() === 1)
  await key('ArrowRight'); ok('pijltje doet niets zolang er niet geraden is', await announce() === 'Kaart 10 van 17')
  ok('met Tab bij de antwoorden', await tabTo('.option'))
  await key('Enter'); await wait(450)
  ok('na raden: focus op de uitslag', await focus() === 'p.result', `${await focus()}: ${await focusText()}`)
  await key('ArrowRight')
  ok('tijdlijn', await announce() === 'Kaart 11 van 17' && await focus() === 'h2.card__title')
  ok('met Tab bij de eerste gebeurtenis', await tabTo('.option'))
  await key('Enter'); ok('na aantikken blijft de focus op dezelfde gebeurtenis', await focus() === 'button.option' && (await p.evaluate(() => document.activeElement.getAttribute('aria-pressed'))) === 'true', await focus())
  await key('Tab'); await key('Enter'); await key('Tab'); await key('Enter')
  ok('drie gekozen via toetsenbord', (await p.locator('.timeline__badge').allInnerTexts()).join('') === '123')
  ok('naar Controleer', await tabTo('.btn')); await key('Enter'); await wait(450)
  ok('na controleren: focus op de uitslag', await focus() === 'p.result', await focusText())
  await key('ArrowRight'); await tabTo('.skip'); await key('Enter'); await wait(450)
  ok('weetje via Geen idee: focus op de uitslag', await focus() === 'p.result', await focusText())
  ok('bewaarknop met toetsenbord: focus blijft op de knop', await tabTo('.save') && (await key('Enter'), await focus()) === 'button.save' && (await focusText()).includes('Bewaard'), await focusText())
  await key('ArrowRight', 5) // langs de vier stappen van de verdieping
  ok('quiz', await announce() === 'Kaart 17 van 17')
  for (let q = 0; q < 4; q++) {
    for (let i = 0; i < 20; i++) { const enabled = await p.evaluate(() => document.activeElement.classList.contains('option') && !document.activeElement.disabled); if (enabled) break; await key('Tab') }
    await key('Enter')
    if (q === 0) ok('na een quizantwoord: focus op de uitleg bij die vraag', await focus() === 'p.question__explain' && /^(Goed|Niet goed)/.test(await focusText()), `${await focus()}: ${await focusText()}`)
  }
  ok('alle vier beantwoord', await p.locator('.option:disabled').count() === 12)
  let found = false
  for (let i = 0; i < 40 && !found; i++) { found = await p.evaluate(() => document.activeElement.textContent.trim() === 'Afronden'); if (!found) await key('Tab') }
  ok('met Tab bij Afronden', found); await key('Enter'); await p.waitForSelector('.done')
  ok('klaar: focus op de kop, aangekondigd', await focus() === 'h2' && await announce() === 'Klaar voor vandaag', `${await focus()} | ${await announce()}`)
  // schermen via de kop
  await p.locator('#toggle-topics').focus(); await key('Enter')
  ok('instellingen: focus op de kop van het scherm', await focus() === 'h2' && (await focusText()) === 'Instellingen')
  await tabTo('.topic') ; await p.locator('.topic input[type=checkbox]').first().focus(); await key('Space')
  ok('vinkje omzetten: focus blijft op hetzelfde vinkje', await p.evaluate(() => document.activeElement.type === 'checkbox' && !document.activeElement.checked))
  await key('Space')
  await p.locator('.topic input[type=radio]').first().focus(); await key('ArrowDown')
  ok('lengte kiezen met pijltjes: focus blijft in de keuze', await p.evaluate(() => document.activeElement.type === 'radio' && document.activeElement.value === 'short' && document.activeElement.checked))
  await p.locator('#toggle-progress').focus(); await key('Enter')
  ok('voortgang: focus op de kop; knop heeft een duidelijke naam', await focus() === 'h2' && (await p.getAttribute('#toggle-progress', 'aria-label')).startsWith('Voortgang bekijken. Dagreeks: 1 dag'), await p.getAttribute('#toggle-progress', 'aria-label'))
  ok('kalender zegt de status in tekst', (await p.locator('.calendar__day.is-today').innerText()).includes('(vandaag): afgerond'), (await p.locator('.calendar__day.is-today').innerText()).replace(/\n/g, ' '))
  console.log('console errors:', errors, '| mislukt:', failures()); await b.close(); process.exit(failures() || errors.length ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
