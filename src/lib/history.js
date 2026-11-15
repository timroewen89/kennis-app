import { HISTORY } from '../data/sources.js'
import { safeUrl } from './safeUrl.js'

// Haalt de gebeurtenissen van deze datum op en kiest er één.
// Geeft { card, question } terug; de quizvraag hoort bij de gekozen gebeurtenis.
export async function fetchHistory(day) {
  const [year, month, date] = day.split('-')
  const res = await fetch(HISTORY.url(month, date))
  if (!res.ok) throw new Error(`Wikipedia gaf status ${res.status}`)
  const events = ((await res.json()).selected ?? []).filter(
    (e) => Number.isInteger(e.year) && typeof e.text === 'string',
  )
  if (events.length === 0) throw new Error('Geen gebeurtenissen gevonden')

  // Vaste keuze per dag (elk jaar een andere), zodat de editie niet verspringt.
  const pick = Number(year) % events.length
  const event = events[pick]
  const page = event.pages?.[0]
  const text = clean(event.text)

  const card = {
    id: `history-${day}`,
    type: 'history',
    lang: HISTORY.lang,
    year: formatYear(event.year),
    title: text,
    body: page?.extract ? [page.extract] : [],
    source: {
      name: page ? `${HISTORY.name}: ${page.titles?.normalized ?? page.title}` : HISTORY.name,
      url: safeUrl(page?.content_urls?.desktop?.page),
    },
  }

  return { card, question: yearQuestion(events, pick, text) }
}

// "In welk jaar?" met twee andere jaren van dezelfde datum als afleiders.
function yearQuestion(events, pick, text) {
  const right = events[pick].year
  const others = [...new Set(events.map((e) => e.year))].filter((y) => y !== right)
  if (others.length < 2) return null
  // De twee jaren die er het dichtst bij liggen zijn de lastigste afleiders.
  others.sort((a, b) => Math.abs(a - right) - Math.abs(b - right))
  const years = [right, others[0], others[1]].sort((a, b) => a - b)
  return {
    q: `In welk jaar gebeurde dit? “${text}”`,
    lang: HISTORY.lang,
    options: years.map(formatYear),
    answer: years.indexOf(right),
    explain: `Het was ${formatYear(right)}.`,
  }
}

function clean(text) {
  return text.replace(/\s*\((?:[^()]*\s)?pictured\)/g, '').trim()
}

function formatYear(year) {
  return year < 0 ? `${-year} v.Chr.` : String(year)
}
