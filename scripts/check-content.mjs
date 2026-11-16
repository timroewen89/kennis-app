// Controleert de eigen inhoud op vormfouten. Draai met: node scripts/check-content.mjs
import { deepdives } from '../content/deepdives.js'
import { facts } from '../content/facts.js'
import { TOPICS } from '../content/topics.js'

const MIN_PER_TOPIC = 3 // zodat een thema niet na een paar dagen in herhaling valt
const topicIds = new Set(TOPICS.map((topic) => topic.id))
const problems = []

function check(list, name, minParagraphs, questionKeys) {
  const seen = new Set()
  for (const item of list) {
    const where = `${name} "${item.id ?? item.title}"`
    const fail = (message) => problems.push(`${where}: ${message}`)
    if (!item.id) fail('heeft geen id')
    if (seen.has(item.id)) fail('id komt twee keer voor')
    seen.add(item.id)
    if (!topicIds.has(item.topic)) fail(`onbekend thema "${item.topic}" (kies uit: ${[...topicIds].join(', ')})`)
    if (!item.title?.trim()) fail('heeft geen titel')
    if (!Array.isArray(item.body) || item.body.length < minParagraphs) {
      fail(`heeft minder dan ${minParagraphs} alinea('s)`)
    } else if (item.body.some((p) => typeof p !== 'string' || !p.trim())) {
      fail('heeft een lege alinea')
    }
    if (!item.source?.name || !/^https:\/\//.test(item.source?.url ?? '')) fail('heeft geen bron met https-link')
    // Een weetje heeft één vraag; een verdieping heeft er twee ('question' en 'question2').
    for (const key of questionKeys) {
      const q = item[key]
      if (!q?.q?.trim()) fail(`heeft geen quizvraag (${key})`)
      else {
        if (!Array.isArray(q.options) || q.options.length !== 3) fail(`${key} heeft geen 3 opties`)
        else if (new Set(q.options).size !== 3) fail(`${key} heeft dubbele opties`)
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 2) fail(`${key}: answer moet 0, 1 of 2 zijn`)
        if (!q.explain?.trim()) fail(`${key} heeft geen uitleg`)
      }
    }
  }
  for (const topic of TOPICS) {
    const count = list.filter((item) => item.topic === topic.id).length
    if (count < MIN_PER_TOPIC) problems.push(`${name}: thema "${topic.name}" heeft maar ${count} items (minimaal ${MIN_PER_TOPIC})`)
  }
}

check(facts, 'weetje', 1, ['question'])
check(deepdives, 'verdieping', 3, ['question', 'question2'])

if (problems.length > 0) {
  for (const problem of problems) console.error(`✗ ${problem}`)
  process.exit(1)
}

console.log(`✓ ${facts.length} weetjes en ${deepdives.length} verdiepingen in orde\n`)
console.log('Per thema (weetjes / verdiepingen):')
for (const topic of TOPICS) {
  const count = (list) => list.filter((item) => item.topic === topic.id).length
  console.log(`  ${topic.name.padEnd(22)} ${String(count(facts)).padStart(2)} / ${count(deepdives)}`)
}
