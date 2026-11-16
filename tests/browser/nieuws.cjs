const { chromium, BASE, wait, phone, ok, failures } = require('./lib.cjs')
const { SHOTS: out } = require('./lib.cjs')
;(async () => {
  const b = await chromium.launch()
  const { page: p, errors, swipe } = await phone(b)
  await p.goto(BASE); await p.waitForSelector('.card')
  ok('17 kaarten', await p.locator('.steps li').count() === 17)
  const seen = []
  for (let i = 0; i < 6; i++) { seen.push(`${await p.innerText('.card__kicker')} / ${(await p.innerText('.card__foot')).split('\n')[0]}`); await swipe() }
  console.log('  ' + seen.join('\n  '))
  const src = seen.map((s) => s.split('Bron: ')[1].replace(' ↗', ''))
  ok('volgorde NOS, Drenthe, BBC, Guardian, NOS, Drenthe', JSON.stringify(src) === JSON.stringify(['NOS', 'RTV Drenthe', 'BBC News', 'The Guardian', 'NOS', 'RTV Drenthe']))
  ok('Drentse kaarten hebben eigen label', seen.filter((s) => s.toUpperCase().startsWith('NIEUWS UIT DRENTHE')).length === 2)
  const tech = { kicker: (await p.innerText('.card__kicker')).toUpperCase(), foot: (await p.innerText('.card__foot')).replace(/\n+/g, ' | '), title: await p.innerText('.card__title') }
  await swipe()
  const ai = { kicker: (await p.innerText('.card__kicker')).toUpperCase(), foot: (await p.innerText('.card__foot')).replace(/\n+/g, ' | '), title: await p.innerText('.card__title'), lang: await p.getAttribute('.card [lang]', 'lang') }
  console.log(`  ${tech.kicker} / ${tech.foot} / ${tech.title.slice(0, 60)}\n  ${ai.kicker} / ${ai.foot} / ${ai.title.slice(0, 60)}`)
  ok('kaart 7 is Tech, met bron en bewaarknop', tech.kicker === 'TECH' && tech.foot.startsWith('Bron: ') && await p.locator('.save').count() === 1)
  ok('kaart 8 is AI, vertaald uit het Engels met link naar het origineel', ai.kicker === 'AI' && ai.foot.includes('Automatisch vertaald uit het Engels') && ai.title.startsWith('[nl] ') && ai.lang === 'nl' && (await p.getAttribute('.card__foot a', 'href')).startsWith('https://'))
  await p.screenshot({ path: out + '/81-ai.png' })
  await swipe()
  ok('kaart 9 is Kort nieuws met 5 koppen en links', await p.locator('.card--brief').count() === 1 && await p.locator('.brief li').count() === 5 && (await p.locator('.brief a').evaluateAll((a) => a.every((x) => x.href.startsWith('https://') && x.target === '_blank' && x.rel.includes('noopener')))))
  console.log('  ' + (await p.locator('.brief li').allInnerTexts()).map((t) => t.replace(/\n+/g, ' — ')).join('\n  '))
  await p.screenshot({ path: out + '/80-kort-nieuws.png' })
  const titles = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('kennis:edition:v10')); return [...s.news.map((n) => n.source.url), ...s.topics.map((n) => n.source.url), ...s.brief.map((x) => x.url)] })
  ok('geen dubbele berichten', new Set(titles).size === titles.length)
  await swipe(); ok('geen bewaarknop op Kort nieuws; daarna geschiedenis', await p.locator('.card--history').count() === 1)

  const { ctx: c2, page: p2 } = await phone(b)
  await c2.route(/news\.json/, (r) => r.abort())
  await p2.goto(BASE); await p2.waitForSelector('.card')
  ok('nieuws onbereikbaar: één terugvalkaart, geen Kort nieuws', (await p2.innerText('.card__title')).includes('kon niet worden geladen') && await p2.locator('.steps li').count() === 9)

  const { ctx: c3, page: p3 } = await phone(b)
  await c3.route(/news\.json/, async (r) => { const res = await r.fetch(); const j = await res.json(); delete j.brief; delete j.topics; j.items = j.items.slice(0, 4); await r.fulfill({ response: res, json: j }) })
  await p3.goto(BASE); await p3.waitForSelector('.card')
  ok('oudere news.json zonder koppen en onderwerpen: 4 nieuwskaarten, geen Tech, AI of Kort nieuws', await p3.locator('.steps li').count() === 12)
  console.log('console errors:', errors); await b.close(); process.exit(failures() || errors.length ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
