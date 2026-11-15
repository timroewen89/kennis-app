// Alles staat lokaal in de browser (localStorage). Geen account, geen server.
import { previousDayKey } from './date.js'

const KEY = 'kennis:v1'

const EMPTY = {
  streak: { count: 0, best: 0, lastCompleted: null },
  progress: {}, // per dag: { index, answers, completed }
  saved: [], // volledige kopie van de kaart, zodat hij blijft bestaan na de editie
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    return {
      streak: { ...EMPTY.streak, ...parsed.streak },
      progress: parsed.progress ?? {},
      saved: Array.isArray(parsed.saved) ? parsed.saved : [],
    }
  } catch {
    return EMPTY
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Opslag vol of geblokkeerd (privémodus): de app blijft werken, alleen zonder geheugen.
  }
}

// De reeks telt alleen als je vandaag of gisteren een editie hebt afgerond.
export function currentStreak(streak, today) {
  const { lastCompleted, count } = streak
  if (lastCompleted === today || lastCompleted === previousDayKey(today)) return count
  return 0
}

export function completeDay(streak, today) {
  if (streak.lastCompleted === today) return streak
  const count = streak.lastCompleted === previousDayKey(today) ? streak.count + 1 : 1
  return { count, best: Math.max(streak.best, count), lastCompleted: today }
}

// Oude voortgang opruimen zodat de opslag niet eindeloos groeit.
export function pruneProgress(progress, today) {
  return today in progress ? { [today]: progress[today] } : {}
}
