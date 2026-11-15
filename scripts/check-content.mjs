// Controleert de eigen inhoud op vormfouten. Draai met: node scripts/check-content.mjs
import { deepdives } from '../content/deepdives.js'
import { facts } from '../content/facts.js'

// Zelfde keuze als in index.html: elke dag het volgende item uit de lijst.
function pickForDay(list, day) {
  const [y, m, d] = day.split('-').map(Number)
  return list[Math.round(Date.UTC(y, m - 1, d) / 86_400_000) % list.length]
}

const problems = []

function check(list, name, minParagraphs) {
  const seen = new Set()
  for (const item of list) {
    const where = `${name} "${item.id ?? item.title}"`
    const fail = (message) => problems.push(`${where}: ${message}`)
    if (!item.id) fail('heeft geen id')
    if (seen.has(item.id)) fail('id komt twee keer voor')
    seen.add(item.id)
    if (!item.title?.trim()) fail('heeft geen titel')
    if (!Array.isArray(item.body) || item.body.length < minParagraphs) {
      fail(`heeft minder dan ${minParagraphs} alinea('s)`)
    } else if (item.body.some((p) => typeof p !== 'string' || !p.trim())) {
      fail('heeft een lege alinea')
    }
    if (item.source && !/^https:\/\//.test(item.source.url ?? '')) fail('bron-url is geen https-link')
    const q = item.question
    if (!q?.q?.trim()) fail('heeft geen quizvraag')
    else {
      if (!Array.isArray(q.options) || q.options.length !== 3) fail('quizvraag heeft geen 3 opties')
      else if (new Set(q.options).size !== 3) fail('quizvraag heeft dubbele opties')
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 2) fail('answer moet 0, 1 of 2 zijn')
      if (!q.explain?.trim()) fail('quizvraag heeft geen uitleg')
    }
  }
}

check(facts, 'weetje', 1)
check(deepdives, 'verdieping', 3)

if (problems.length > 0) {
  for (const problem of problems) console.error(`✗ ${problem}`)
  process.exit(1)
}

console.log(`✓ ${facts.length} weetjes en ${deepdives.length} verdiepingen in orde`)
const pad = (n) => String(n).padStart(2, '0')
console.log('\nKomende week:')
for (let i = 0; i < 7; i++) {
  const date = new Date()
  date.setDate(date.getDate() + i)
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  console.log(`  ${day}  ${pickForDay(facts, day).title}  |  ${pickForDay(deepdives, day).title}`)
}
