// De kop van de app: past op elke schermbreedte, en de focus na het bladeren is onzichtbaar.
const { chromium, devices, BASE, wait, mockWiki, mockTranslate, mockNews, phone, ok, failures } = require('./lib.cjs')
;(async () => {
  const b = await chromium.launch()
  for (const width of [430, 412, 390, 375, 360, 320]) {
    const ctx = await b.newContext({ ...devices['Pixel 7'], viewport: { width, height: 800 }, locale: 'nl-NL' })
    await mockNews(ctx); await mockWiki(ctx); await mockTranslate(ctx)
    const p = await ctx.newPage()
    // Een lange datum, zodat de kop zo vol mogelijk staat (woensdag 30 september).
    await p.clock.setFixedTime(new Date(2026, 8, 30, 12))
    await p.goto(BASE); await p.waitForSelector('.card')
    const m = await p.evaluate(() => {
      const box = (sel) => document.querySelector(sel).getBoundingClientRect()
      const saved = box('#toggle-saved'), gear = box('#toggle-topics'), streak = box('#toggle-progress'), title = box('.top h1')
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        savedHeight: Math.round(saved.height), text: document.querySelector('#toggle-saved').innerText.trim(),
        inside: gear.right <= window.innerWidth && title.left >= 0,
        overlap: !(streak.right <= saved.left + 1 && saved.right <= gear.left + 1 && title.right <= streak.left + 1),
      }
    })
    ok(`${width} px: knoppen op één regel, niets buiten beeld of over elkaar`, m.overflow <= 0 && m.savedHeight <= 44 && m.inside && !m.overlap, `knop "${m.text}" ${m.savedHeight}px hoog, overloop ${m.overflow}px`)
    ok(`${width} px: ${width <= 350 ? 'alleen het aantal' : 'het woord Bewaard staat erbij'}`, width <= 350 ? m.text === '(0)' : m.text === 'Bewaard (0)', m.text)
    ok(`${width} px: knop heeft een duidelijke naam voor schermlezers`, await p.getAttribute('#toggle-saved', 'aria-label') === 'Bewaard (0), bewaarde kaarten bekijken')
    await ctx.close()
  }

  const { page: p, errors, swipe } = await phone(b)
  await p.goto(BASE); await p.waitForSelector('.card')
  await swipe()
  const focus = await p.evaluate(() => { const a = document.activeElement; const s = getComputedStyle(a); return { tag: a.tagName, outline: s.outlineStyle, width: s.outlineWidth } })
  ok('na vegen staat de focus op de titel, zonder zichtbaar kader', focus.tag === 'H2' && (focus.outline === 'none' || focus.width === '0px'), JSON.stringify(focus))
  await p.keyboard.press('Tab')
  const tabbed = await p.evaluate(() => { const a = document.activeElement; const s = getComputedStyle(a); return { tag: a.tagName, outline: s.outlineStyle } })
  ok('een knop die je met Tab bereikt heeft wel een zichtbaar kader', tabbed.tag !== 'H2' && tabbed.outline !== 'none', JSON.stringify(tabbed))
  console.log('console errors:', errors, '| mislukt:', failures()); await b.close(); process.exit(failures() || errors.length ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
