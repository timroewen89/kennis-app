// Eén plek waar de editie van de dag wordt samengesteld:
//   3x nieuws      public/news.json (RSS), anders voorbeeldinhoud
//   geschiedenis   Wikipedia On this day, anders voorbeeldinhoud
//   weetje         src/data/facts.js, elke dag de volgende
//   verdieping     src/data/deepdives.js, elke dag de volgende
//   mini-quiz      één vraag bij het weetje, de geschiedenis en de verdieping
import { deepdives } from '../data/deepdives.js'
import { facts } from '../data/facts.js'
import { sampleHistory, sampleNews } from '../data/sampleEdition.js'
import { fetchHistory } from './history.js'
import { fetchNews } from './news.js'
import { pickForDay, shuffleQuestion } from './rotation.js'

const CACHE_KEY = 'kennis:edition:v3'

export async function getEdition(day) {
  const cached = readCache(day)
  if (cached) return cached

  const [newsResult, historyResult] = await Promise.allSettled([fetchNews(), fetchHistory(day)])
  const missing = []
  if (newsResult.status === 'rejected') missing.push('nieuws')
  if (historyResult.status === 'rejected') missing.push('geschiedenis')

  const news = newsResult.status === 'fulfilled' ? newsResult.value : sampleNews
  const history = historyResult.status === 'fulfilled' ? historyResult.value : sampleHistory
  const fact = pickForDay(facts, day)
  const deepdive = pickForDay(deepdives, day)

  const cards = [
    ...news,
    history.card,
    toCard(fact, 'fact'),
    toCard(deepdive, 'deepdive'),
    {
      id: `quiz-${day}`,
      type: 'quiz',
      title: 'Drie vragen over vandaag',
      // De jaartallen bij de geschiedenisvraag blijven op volgorde staan.
      questions: [
        shuffleQuestion(fact.question, day, 1),
        history.question,
        shuffleQuestion(deepdive.question, day, 2),
      ].filter(Boolean),
    },
  ]

  const edition = { day, cards, missing }
  // Alleen een complete editie vastleggen; anders proberen we het de volgende keer opnieuw.
  if (missing.length === 0) writeCache(edition)
  return edition
}

function toCard({ question, ...item }, type) {
  return { ...item, id: `${type}-${item.id}`, type }
}

function readCache(day) {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    return cached?.day === day ? cached : null
  } catch {
    return null
  }
}

function writeCache(edition) {
  try {
    for (const old of ['v1', 'v2']) localStorage.removeItem(`kennis:edition:${old}`)
    localStorage.setItem(CACHE_KEY, JSON.stringify(edition))
  } catch {
    // Geen opslag beschikbaar: dan halen we de editie elke keer opnieuw op.
  }
}
