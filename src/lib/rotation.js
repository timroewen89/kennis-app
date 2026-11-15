// Kiest voor elke dag het volgende item uit een lijst, en begint na het laatste opnieuw.
// Iedereen krijgt op dezelfde dag hetzelfde item; er is geen server voor nodig.
export function dayNumber(day) {
  const [y, m, d] = day.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000)
}

export function pickForDay(list, day) {
  return list[dayNumber(day) % list.length]
}

// Zet de antwoorden van een quizvraag in een andere volgorde, die per dag vaststaat.
// Zo staat het goede antwoord niet steeds op dezelfde plek.
export function shuffleQuestion(question, day, salt = 0) {
  let seed = (dayNumber(day) * 31 + salt * 7919 + 1) >>> 0
  const random = () => {
    // Kleine vaste toevalsgenerator (mulberry32): zelfde dag, zelfde volgorde.
    seed = (seed + 0x6d2b79f5) >>> 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const order = question.options.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return {
    ...question,
    options: order.map((i) => question.options[i]),
    answer: order.indexOf(question.answer),
  }
}
