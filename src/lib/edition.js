// Eén plek waar de editie van de dag vandaan komt.
// Echte bronnen waar het kan, voorbeeldinhoud als terugval (offline, bron onbereikbaar).
// Weetje en verdieping komen voorlopig nog uit de voorbeeldeditie.
import { sampleEdition } from '../data/sampleEdition.js'
import { fetchHistory } from './history.js'
import { fetchNews } from './news.js'

const CACHE_KEY = 'kennis:edition:v1'

export async function getEdition(day) {
  const cached = readCache(day)
  if (cached) return cached

  const [news, history] = await Promise.allSettled([fetchNews(), fetchHistory(day)])
  const missing = []
  let cards = sampleEdition.cards

  if (news.status === 'fulfilled') {
    cards = [...news.value, ...cards.filter((c) => c.type !== 'news')]
  } else {
    missing.push('nieuws')
  }

  if (history.status === 'fulfilled') {
    const { card, question } = history.value
    cards = cards.map((c) => {
      if (c.type === 'history') return card
      if (c.type === 'quiz' && question) {
        // De voorbeeldvraag over geschiedenis vervangen door een vraag over de echte kaart.
        return { ...c, questions: c.questions.map((q) => (q.about === 'history' ? question : q)) }
      }
      return c
    })
  } else {
    missing.push('geschiedenis')
  }

  const edition = { day, cards, missing }
  // Alleen een complete editie vastleggen; anders proberen we het de volgende keer opnieuw.
  if (missing.length === 0) writeCache(edition)
  return edition
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
    localStorage.setItem(CACHE_KEY, JSON.stringify(edition))
  } catch {
    // Geen opslag beschikbaar: dan halen we de editie elke keer opnieuw op.
  }
}
