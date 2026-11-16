// Kennis — dagelijkse editie. Geen bouwstap: GitHub Pages toont index.html, styles.css en dit bestand direct.
// Weetjes en verdiepingen staan in de map content/, het nieuws in news.json.

// De eigen inhoud wordt bij het starten geladen (zie loadContent). Zo geeft een typfout in een
// inhoudsbestand een duidelijke melding in plaats van een app die blijft hangen.
let facts = []
let deepdives = []
let TOPICS = []

async function loadContent() {
  const load = async (file) => {
    try {
      return await import(`./content/${file}`)
    } catch (error) {
      throw Object.assign(new Error(`content/${file}: ${error.message}`), { file: `content/${file}` })
    }
  }
  // Na elkaar: facts.js en deepdives.js gebruiken zelf topics.js.
  ;({ TOPICS } = await load('topics.js'))
  ;({ facts } = await load('facts.js'))
  ;({ deepdives } = await load('deepdives.js'))
  for (const [name, list] of [['TOPICS', TOPICS], ['facts', facts], ['deepdives', deepdives]]) {
    if (!Array.isArray(list) || list.length === 0) throw new Error(`De lijst ${name} ontbreekt of is leeg.`)
  }
}

// ---------- Datum ----------
// Lokale 'YYYY-MM-DD': een editie hoort bij jouw kalenderdag, niet bij UTC.
function dayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
function toDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function previousDayKey(key) {
  const date = toDate(key)
  date.setDate(date.getDate() - 1)
  return dayKey(date)
}
function formatLongDate(key) {
  return new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }).format(toDate(key))
}
function formatShortDate(key) {
  return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long' }).format(toDate(key))
}
function dayNumber(key) {
  const [y, m, d] = key.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000)
}

// ---------- Opslag (alleen in deze browser; geen account, geen server) ----------
const STATE_KEY = 'kennis:v1'
const EDITION_KEY = 'kennis:edition:v10'
const TRANSLATION_KEY = 'kennis:vertaling:v1'
// Voortgang van vandaag. guesses: je gok per kaart (-1 = 'Geen idee'); answers: je quizantwoorden;
// reviews: de herhalingsvragen die voor vandaag gekozen zijn (null = nog niet gekozen);
// picks: welk weetje en welke verdieping vandaag aan de beurt zijn (null = nog niet gekozen);
// short: of de editie van vandaag de korte vorm heeft (null = nog niet vastgelegd).
const NO_PROGRESS = { v: 2, index: 0, guesses: {}, answers: [], reviews: null, picks: null, short: null, completed: false }
const NEWS_ITEMS_SHORT = 4 // nieuwskaarten in de korte editie (uitgebreid: alle zes)

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}
function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Opslag vol of geblokkeerd (privémodus): de app werkt door, maar onthoudt niets.
  }
}
// Wat in de opslag staat kan beschadigd zijn of door iets anders op hetzelfde adres zijn veranderd.
// Daarom nemen we alleen over wat de vorm heeft die de app verwacht; de rest valt weg.
const isDay = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isText = (value) => typeof value === 'string'
const count = (value, max) => (Number.isInteger(value) ? Math.min(Math.max(value, 0), max) : 0)
const validQuestion = (q) =>
  isObject(q) && isText(q.q) && Array.isArray(q.options) && q.options.length > 0 && q.options.every(isText) && Number.isInteger(q.answer)
const validCard = (card) => isObject(card) && isText(card.id) && isText(card.type) && isText(card.title) && Array.isArray(card.body) && card.body.every(isText)
// Een onthouden vraag (voor de herhaling en de weekquiz).
const validItem = (item) => isObject(item) && isText(item.id) && isDay(item.day) && isText(item.type) && validQuestion(item.question)
const scoreOrNull = (value) => (Array.isArray(value) && value.length === 2 && value.every(Number.isInteger) ? value : null)

function loadState() {
  const stored = readJson(STATE_KEY)
  const saved = isObject(stored) ? stored : {}
  const streak = {
    count: count(saved.streak?.count, 36500),
    best: count(saved.streak?.best, 36500),
    lastCompleted: isDay(saved.streak?.lastCompleted) ? saved.streak.lastCompleted : null,
  }
  // Per afgeronde dag: { quiz: [goed, totaal], guess: [goed, totaal] }. De dagen van je reeks van
  // vóór deze versie zijn niet bewaard; die worden hier als afgerond ingevuld, zonder score.
  const days = {}
  for (const [key, value] of Object.entries(isObject(saved.days) ? saved.days : {})) {
    if (isDay(key) && isObject(value)) days[key] = { quiz: scoreOrNull(value.quiz), guess: scoreOrNull(value.guess) }
  }
  for (let key = streak.lastCompleted, n = 0; key && n < streak.count; key = previousDayKey(key), n++) {
    days[key] ??= { quiz: null, guess: null }
  }
  const weeks = {}
  for (const [key, value] of Object.entries(isObject(saved.weeks) ? saved.weeks : {})) {
    if (!isDay(key) || !isObject(value) || !Array.isArray(value.items)) continue
    weeks[key] = {
      items: value.items.filter(validItem),
      answers: Array.isArray(value.answers) ? value.answers : [],
      done: value.done === true && scoreOrNull(value.score) !== null,
      score: scoreOrNull(value.score),
    }
  }
  return {
    streak,
    days,
    progress: isObject(saved.progress) ? saved.progress : {},
    saved: (Array.isArray(saved.saved) ? saved.saved : []).filter((item) => isObject(item) && isText(item.key) && isDay(item.day) && validCard(item.card)),
    // Vragen uit edities die je hebt afgerond; hieruit komt de herhaling in de quiz.
    log: (Array.isArray(saved.log) ? saved.log : [])
      .filter(validItem)
      .map((item) => ({ ...item, wrong: item.wrong === true, streak: count(item.streak, 99), reviews: count(item.reviews, 9999), lastReview: isDay(item.lastReview) ? item.lastReview : null })),
    // Weekquizzen, per zondag: { items, answers, done, score: [goed, totaal] }.
    weeks,
    // De gekozen thema's (lijst van id's), of null als alle thema's aan staan.
    topics: Array.isArray(saved.topics) && saved.topics.every(isText) ? saved.topics : null,
    // Lengte van de editie: 'long' (zes nieuwskaarten) of 'short' (vier).
    length: saved.length === 'short' ? 'short' : 'long',
  }
}

// De voortgang van één dag, met ontbrekende of ongeldige onderdelen aangevuld.
function cleanProgress(stored) {
  if (!isObject(stored) || stored.v !== 2) return NO_PROGRESS
  return {
    v: 2,
    index: count(stored.index, 1000),
    guesses: isObject(stored.guesses) ? stored.guesses : {},
    answers: Array.isArray(stored.answers) ? stored.answers : [],
    reviews: Array.isArray(stored.reviews) ? stored.reviews.filter(validItem) : null,
    picks: isObject(stored.picks) && isText(stored.picks.fact) && isText(stored.picks.deepdive) ? stored.picks : null,
    short: typeof stored.short === 'boolean' ? stored.short : null,
    completed: stored.completed === true,
  }
}

// De opgehaalde bronnen van vandaag uit de opslag, of null als ze niet de verwachte vorm hebben.
function validSources(stored, day) {
  if (!isObject(stored) || stored.day !== day) return null
  const { news, topics, brief, history, notes } = stored
  const timeline = history?.timeline
  const ok =
    Array.isArray(news) && news.length > 0 && news.every(validCard) &&
    Array.isArray(notes) && notes.every(isText) &&
    (topics === undefined || (Array.isArray(topics) && topics.every(validCard))) &&
    (brief === undefined || (Array.isArray(brief) && brief.every((item) => isObject(item) && isText(item.title) && isText(item.url)))) &&
    isObject(history) && validCard(history.card) &&
    (history.question == null || validQuestion(history.question)) &&
    (timeline == null ||
      (isObject(timeline) && isText(timeline.id) && isObject(timeline.source) && Array.isArray(timeline.items) &&
        timeline.items.every((item) => isObject(item) && isText(item.text) && isText(item.label) && Number.isFinite(item.year))))
  return ok ? stored : null
}

// De reeks telt alleen als je vandaag of gisteren een editie hebt afgerond.
function currentStreak(streak, today) {
  const ok = streak.lastCompleted === today || streak.lastCompleted === previousDayKey(today)
  return ok ? streak.count : 0
}
function completeDay(streak, today) {
  if (streak.lastCompleted === today) return streak
  const count = streak.lastCompleted === previousDayKey(today) ? streak.count + 1 : 1
  return { count, best: Math.max(streak.best, count), lastCompleted: today }
}

// ---------- Bronnen ----------
// Inhoud van buiten is niet te vertrouwen: alleen gewone https-links doorlaten.
function safeUrl(value) {
  try {
    const url = new URL(value)
    // Geen adressen met een naam of wachtwoord ervoor (https://nos.nl@elders.example): die misleiden.
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}
// Kapt te lange tekst van buiten af, zodat één bericht niet honderden vertaalverzoeken kan veroorzaken.
const clip = (text, max) => (text.length > max ? `${text.slice(0, max).trimEnd()}…` : text)

// ---------- Vertalen ----------
// Engelse bronnen worden in de app naar het Nederlands vertaald via MyMemory: gratis, zonder
// account of sleutel. De dienst staat ongeveer 5000 tekens per dag per internetaansluiting toe;
// een editie heeft er zo'n 1500 nodig. Lukt vertalen niet, dan blijft de tekst Engels.
const TRANSLATE_URL = 'https://api.mymemory.translated.net/get'
const TRANSLATE_MAX = 450 // de dienst accepteert alleen korte stukken; lange tekst gaat per zin

// Wat vandaag al vertaald is, wordt onthouden: een tweede poging vraagt alleen op wat nog ontbreekt.
// Een Map, zodat een tekst als 'constructor' niet per ongeluk iets ingebouwds oplevert.
const translations = (() => {
  const stored = readJson(TRANSLATION_KEY)
  const entries = isObject(stored) && stored.day === dayKey() && isObject(stored.map) ? Object.entries(stored.map) : []
  return new Map(entries.filter(([, value]) => isText(value)))
})()

async function translatePiece(text) {
  if (translations.has(text)) return translations.get(text)
  const url = `${TRANSLATE_URL}?q=${encodeURIComponent(text)}&langpair=en|nl`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Vertaaldienst gaf status ${res.status}`)
  const data = await res.json()
  if (Number(data.responseStatus) !== 200 || data.quotaFinished) throw new Error('Vertaaldienst weigert (daglimiet?)')
  // De dienst geeft soms een eerdere vertaling van een andere zin terug, die door iedereen kan zijn
  // ingestuurd. Alleen de machinevertaling van precies deze zin telt; is die er niet, dan blijft de tekst Engels.
  const matches = Array.isArray(data.matches) ? data.matches : []
  const raw = matches.find((match) => match?.['created-by'] === 'MT!')?.translation
  if (typeof raw !== 'string' || !raw.trim() || /^MYMEMORY WARNING/i.test(raw)) throw new Error('Geen machinevertaling ontvangen')
  // Het antwoord kan HTML-codes bevatten (&#39;); omzetten naar gewone tekst, nooit naar HTML.
  const clean = new DOMParser().parseFromString(raw, 'text/html').documentElement.textContent.trim()
  translations.set(text, clean)
  writeJson(TRANSLATION_KEY, { day: dayKey(), map: Object.fromEntries(translations) })
  return clean
}

// Knipt lange tekst op zinsgrenzen in stukken die de dienst aankan.
function splitForTranslation(text) {
  const sentences = text.match(/[^.!?]+(?:[.!?]+["”’')\]]*|$)\s*/g) ?? [text]
  const pieces = []
  let current = ''
  for (const sentence of sentences) {
    if (current && (current + sentence).length > TRANSLATE_MAX) {
      pieces.push(current.trim())
      current = ''
    }
    current += sentence
    // Eén zin die op zichzelf al te lang is: op een woordgrens doorknippen.
    while (current.length > TRANSLATE_MAX) {
      const cut = current.lastIndexOf(' ', TRANSLATE_MAX)
      const at = cut > 0 ? cut : TRANSLATE_MAX
      pieces.push(current.slice(0, at).trim())
      current = current.slice(at)
    }
  }
  if (current.trim()) pieces.push(current.trim())
  // Vangnet: is er bij het knippen iets weggevallen, vertaal de tekst dan liever in vaste stukken.
  const size = (value) => value.replace(/\s/g, '').length
  if (size(pieces.join('')) !== size(text)) return text.match(new RegExp(`[\\s\\S]{1,${TRANSLATE_MAX}}`, 'g'))
  return pieces
}

async function translate(text) {
  if (!text?.trim()) return text
  return (await Promise.all(splitForTranslation(text).map(translatePiece))).join(' ')
}

// Vertaalt titel en tekst van een Engelse kaart. Mislukt het, dan blijft de kaart Engels.
async function translateCard(card) {
  if (card.lang !== 'en') return card
  try {
    const [title, ...body] = await Promise.all([card.title, ...card.body].map(translate))
    return { ...card, title, body, lang: 'nl', translated: true }
  } catch {
    return { ...card, untranslated: true }
  }
}

// Nieuws: news.json wordt dagelijks ververst door een GitHub Action (scripts/fetch-news.mjs),
// omdat nieuwsfeeds niet rechtstreeks vanuit een browser opgehaald mogen worden.
const NEWS_MAX_AGE_HOURS = 36
const NEWS_MAX_ITEMS = 6 // twee van NOS, twee van RTV Drenthe, BBC News en The Guardian
const BRIEF_MAX_ITEMS = 5 // koppen op de kaart 'Kort nieuws'
const TOPIC_MAX_ITEMS = 2 // de kaarten Tech en AI
async function fetchNews() {
  const res = await fetch('news.json', { cache: 'no-cache' })
  if (!res.ok) throw new Error(`news.json gaf status ${res.status}`)
  const { generatedAt, items, topics, brief } = await res.json()
  if (!Array.isArray(items) || items.length === 0) throw new Error('news.json is leeg')
  const age = (Date.now() - new Date(generatedAt).getTime()) / 3_600_000
  // Een bericht uit news.json als nieuwskaart; Engelse berichten worden vertaald.
  const toCard = (item, extra = {}) =>
    translateCard({
      id: `news-${item.id}`,
      type: 'news',
      kicker: item.label ? clip(String(item.label), 40) : null, // bijvoorbeeld 'Nieuws uit Drenthe', 'Tech' of 'AI'
      lang: item.lang,
      title: clip(String(item.title), 300),
      body: item.summary ? [clip(String(item.summary), 600)] : [],
      source: { name: clip(String(item.source), 40), url: safeUrl(item.url) },
      ...extra,
    })
  return {
    stale: !(age < NEWS_MAX_AGE_HOURS) ? new Date(generatedAt) : null,
    // Van vóór vandaag (de verversing van vanochtend is nog niet geweest): wel tonen, later opnieuw ophalen.
    early: dayKey(new Date(generatedAt)) !== dayKey(),
    cards: await Promise.all(items.slice(0, NEWS_MAX_ITEMS).map((item) => toCard(item))),
    // De onderwerpkaarten Tech en AI; 'topic' markeert dat ze ook in de korte editie blijven.
    topics: await Promise.all((Array.isArray(topics) ? topics : []).filter((item) => isObject(item) && item.title).slice(0, TOPIC_MAX_ITEMS).map((item) => toCard(item, { topic: true }))),
    // Koppen voor de kaart 'Kort nieuws'; alleen wat een geldige link heeft.
    brief: (Array.isArray(brief) ? brief : [])
      .map((item) => ({ title: clip(String(item.title), 300), label: clip(String(item.label ?? ''), 40), source: clip(String(item.source), 40), url: safeUrl(item.url) }))
      .filter((item) => item.title && item.url)
      .slice(0, BRIEF_MAX_ITEMS),
  }
}

// Geschiedenis: Wikipedia 'On this day'. Die feed bestaat niet in het Nederlands, wel in het Engels;
// de gekozen gebeurtenis wordt daarna vertaald.
async function fetchHistory(day) {
  const [year, month, date] = day.split('-')
  const res = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected/${month}/${date}`)
  if (!res.ok) throw new Error(`Wikipedia gaf status ${res.status}`)
  const events = ((await res.json()).selected ?? []).filter(
    (e) => Number.isInteger(e.year) && typeof e.text === 'string',
  )
  if (events.length === 0) throw new Error('Geen gebeurtenissen gevonden')

  // Vaste keuze per dag (elk jaar een andere), zodat de editie niet verspringt.
  const pick = Number(year) % events.length
  const event = events[pick]
  const page = event.pages?.[0]
  const cleanText = (value) => clip(value.replace(/ ?\((?:[^()]*\s)?pictured\)/g, '').trim(), 400)
  const text = cleanText(event.text)
  const formatYear = (y) => (y < 0 ? `${-y} v.Chr.` : String(y))

  const card = await translateCard({
    id: `history-${day}`,
    type: 'history',
    lang: 'en',
    year: formatYear(event.year),
    title: text,
    body: page?.extract ? [clip(String(page.extract), 1500)] : [],
    source: {
      name: page ? `Wikipedia (EN): ${page.titles?.normalized ?? page.title}` : 'Wikipedia (EN)',
      url: safeUrl(page?.content_urls?.desktop?.page),
    },
  })

  // Quizvraag "in welk jaar?", met de twee dichtstbijzijnde jaren van dezelfde datum als afleiders.
  let question = null
  const others = [...new Set(events.map((e) => e.year))].filter((y) => y !== event.year)
  if (others.length >= 2) {
    others.sort((a, b) => Math.abs(a - event.year) - Math.abs(b - event.year))
    const years = [event.year, others[0], others[1]].sort((a, b) => a - b)
    question = {
      q: `In welk jaar gebeurde dit? “${card.title}”`,
      lang: card.lang,
      ordered: true, // jaartallen blijven op volgorde staan, dus niet husselen
      options: years.map(formatYear),
      answer: years.indexOf(event.year),
      explain: `Het was ${formatYear(event.year)}.`,
    }
  }

  // Tijdlijn: drie andere gebeurtenissen van deze datum, uit verschillende jaren en zo
  // gekozen dat ze verspreid over de lijst liggen (de lijst loopt van recent naar vroeger).
  let timeline = null
  const chosen = []
  const stride = Math.max(1, Math.floor(events.length / 4))
  for (let step = 1; step < events.length && chosen.length < 3; step++) {
    const candidate = events[(pick + step * stride) % events.length]
    const taken = candidate === event || chosen.includes(candidate) || chosen.some((e) => e.year === candidate.year)
    if (!taken && candidate.year !== event.year) chosen.push(candidate)
  }
  if (chosen.length === 3) {
    let texts = chosen.map((e) => cleanText(e.text))
    let translated = true
    try {
      texts = await Promise.all(texts.map(translate))
    } catch {
      translated = false
    }
    const items = chosen.map((e, i) => ({ text: texts[i], year: e.year, label: formatYear(e.year) }))
    // Vaste, gehusselde volgorde per dag; nooit toevallig al de goede volgorde.
    const order = shuffleQuestion({ options: [0, 1, 2], answer: 0 }, day, 5).options
    let shown = order.map((i) => items[i])
    if (shown.every((item, i) => i === 0 || shown[i - 1].year < item.year)) shown = [shown[1], shown[2], shown[0]]
    const monthName = new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2000, Number(month) - 1, 1))
    timeline = {
      id: `timeline-${day}`,
      type: 'timeline',
      lang: translated ? 'nl' : 'en',
      translated,
      untranslated: !translated,
      items: shown,
      source: { name: 'Wikipedia (EN)', url: `https://en.wikipedia.org/wiki/${monthName}_${Number(date)}` },
    }
  }
  return { card, question, timeline }
}

// Terugval als een bron onbereikbaar is.
const FALLBACK_NEWS = [
  {
    id: 'news-fallback',
    type: 'news',
    title: 'Het nieuws kon niet worden geladen',
    body: ['Het nieuws is op dit moment niet bereikbaar. De rest van de editie is wel compleet.'],
  },
]
const FALLBACK_HISTORY = {
  card: {
    id: 'history-fallback',
    type: 'history',
    title: 'Vandaag in de geschiedenis kon niet worden geladen',
    body: ['Wikipedia is op dit moment niet bereikbaar. Open de app later opnieuw om deze kaart alsnog te zien.'],
  },
  question: null,
}

// ---------- Editie samenstellen ----------
const pickForDay = (list, day) => list[dayNumber(day) % list.length]

// Zet quizantwoorden in een volgorde die per dag vaststaat, zodat het goede antwoord
// niet steeds op dezelfde plek staat.
function shuffleQuestion(question, day, salt) {
  let seed = (dayNumber(day) * 31 + salt * 7919 + 1) >>> 0
  const random = () => {
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
  return { ...question, options: order.map((i) => question.options[i]), answer: order.indexOf(question.answer) }
}
// Een vraag zoals hij vandaag getoond wordt. 'salt' zorgt dat dezelfde vraag op twee plekken
// (raden en quiz) niet dezelfde volgorde krijgt.
const present = (question, day, salt) => (question.ordered ? question : shuffleQuestion(question, day, salt))

// ---------- Herhaling ----------
// Elke dag komen er drie vragen terug uit edities die je eerder hebt afgerond.
const REVIEW_COUNT = 3
const REVIEW_MIN_AGE = 2 // op zijn vroegst twee dagen later
const REVIEW_GAP = 5 // dezelfde vraag hooguit eens per vijf dagen
const REVIEW_MAX_AGE = 45 // daarna verdwijnt een vraag uit de herhaling
const REVIEW_DONE_STREAK = 2 // twee keer achter elkaar goed = onthouden

function pickReviews(log, day) {
  const now = dayNumber(day)
  const due = log.filter(
    (item) =>
      now - dayNumber(item.day) >= REVIEW_MIN_AGE &&
      now - dayNumber(item.day) <= REVIEW_MAX_AGE &&
      (!item.lastReview || now - dayNumber(item.lastReview) >= REVIEW_GAP),
  )
  // Eerst wat je fout had, dan wat je het minst vaak herhaald hebt, dan het oudste.
  due.sort(
    (a, b) =>
      Number(b.wrong) - Number(a.wrong) ||
      a.reviews - b.reviews ||
      dayNumber(a.day) - dayNumber(b.day) ||
      a.id.localeCompare(b.id),
  )
  // Liefst elke vraag uit een andere editie; pas daarna meerdere van dezelfde dag.
  const picked = []
  for (const item of due) {
    if (picked.length < REVIEW_COUNT && !picked.some((other) => other.day === item.day)) picked.push(item)
  }
  for (const item of due) {
    if (picked.length < REVIEW_COUNT && !picked.includes(item)) picked.push(item)
  }
  return picked.map(({ id, day, type, question }) => ({ id, day, type, question }))
}

// ---------- Weekquiz ----------
// Op zondag: tien vragen uit de edities die je de afgelopen zeven dagen hebt afgerond.
const WEEK_QUIZ_SIZE = 10
const WEEK_QUIZ_MIN = 4 // met minder vragen is er geen weekquiz
const WEEKS_KEPT = 12
const isSunday = (day) => toDate(day).getDay() === 0

// Om de beurt één vraag per dag, zodat de hele week aan bod komt; per dag eerst wat je fout had.
function pickWeekItems(log, day) {
  const now = dayNumber(day)
  const byDay = new Map()
  for (const item of log) {
    const age = now - dayNumber(item.day)
    if (age < 0 || age > 6) continue
    if (!byDay.has(item.day)) byDay.set(item.day, [])
    byDay.get(item.day).push(item)
  }
  const groups = [...byDay.keys()]
    .sort()
    .map((key) => byDay.get(key).sort((a, b) => Number(b.wrong) - Number(a.wrong) || a.id.localeCompare(b.id)))
  const picked = []
  for (let round = 0; picked.length < WEEK_QUIZ_SIZE && groups.some((group) => group[round]); round++) {
    for (const group of groups) {
      if (group[round] && picked.length < WEEK_QUIZ_SIZE) picked.push(group[round])
    }
  }
  return picked.map(({ id, day: itemDay, type, question }) => ({ id, day: itemDay, type, question }))
}

// Verwerkt de uitslag van herhalingsvragen ({ id, correct }) in de lijst met onthouden vragen.
function applyReviews(log, results, day) {
  return log.map((item) => {
    const result = results.find((entry) => entry.id === item.id)
    if (!result) return item
    const { correct } = result
    return { ...item, wrong: !correct, streak: correct ? item.streak + 1 : 0, reviews: item.reviews + 1, lastReview: day }
  })
}
// Wat je onthouden hebt of wat te oud is, hoeft niet meer terug te komen.
function pruneLog(log, day) {
  const now = dayNumber(day)
  return log.filter((item) => item.streak < REVIEW_DONE_STREAK && now - dayNumber(item.day) <= REVIEW_MAX_AGE)
}

// Wat van buiten komt (nieuws, geschiedenis, tijdlijn) wordt één keer per dag opgehaald en vastgelegd.
// 'refresh: false' (de editie van vandaag is al afgerond) laat staan wat er staat.
async function getSources(day, { refresh = true } = {}) {
  const cached = validSources(readJson(EDITION_KEY), day)
  // Compleet en van vandaag: niet opnieuw ophalen, zodat de editie niet verspringt.
  if (cached && (cached.complete || !refresh)) return cached

  // De geschiedenis van vandaag verandert niet meer: als die al goed binnen is, niet opnieuw ophalen.
  const historyDone = cached?.historyOk && ![cached.history.card, cached.history.timeline].some((card) => card?.untranslated)
  const [newsResult, historyResult] = await Promise.allSettled([fetchNews(), historyDone ? cached.history : fetchHistory(day)])

  // Per onderdeel: het verse resultaat, anders wat vandaag al eerder is opgehaald (bijvoorbeeld
  // als je nu geen verbinding hebt), en pas als laatste de terugvalkaart.
  let news = FALLBACK_NEWS
  let brief = []
  let topics = []
  let newsEarly = false
  let newsNote = 'Het nieuws kon niet worden geladen.'
  if (newsResult.status === 'fulfilled') {
    news = newsResult.value.cards
    brief = newsResult.value.brief
    topics = newsResult.value.topics
    newsEarly = newsResult.value.early
    newsNote = null
    if (newsResult.value.stale) {
      const when = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long' }).format(newsResult.value.stale)
      newsNote = `Het nieuws is niet van vandaag, maar van ${when}.`
    }
  } else if (cached?.newsOk) {
    news = cached.news
    brief = cached.brief ?? []
    topics = cached.topics ?? []
    newsEarly = Boolean(cached.newsEarly)
    newsNote = cached.newsNote
  }

  let history = FALLBACK_HISTORY
  let historyNote = 'Vandaag in de geschiedenis kon niet worden geladen.'
  if (historyResult.status === 'fulfilled') {
    history = historyResult.value
    historyNote = null
  } else if (cached?.historyOk) {
    history = cached.history
    historyNote = null
  }

  const translateNote = [...news, ...topics, history.card, history.timeline].some((card) => card?.untranslated)
    ? 'Vertalen lukte niet voor alle kaarten; een deel staat in het Engels.'
    : null

  const notes = [newsNote, historyNote, translateNote].filter(Boolean)
  const sources = {
    day,
    notes,
    news,
    topics,
    brief,
    history,
    newsNote,
    newsEarly,
    newsOk: news !== FALLBACK_NEWS,
    historyOk: history !== FALLBACK_HISTORY,
    // Niet compleet (bron onbereikbaar, nieuws verouderd, vertaling mislukt): volgende keer opnieuw proberen.
    // Hetzelfde geldt voor nieuws van vóór vandaag: na de ochtendverversing komt er nieuwer.
    complete: notes.length === 0 && !newsEarly,
  }
  writeJson(EDITION_KEY, sources)
  return sources
}

// Welk weetje en welke verdieping vandaag aan de beurt zijn, binnen de gekozen thema's.
// Past geen enkel item bij de keuze, dan telt de hele lijst mee.
function pickContent(day, topics) {
  const allowed = (list) => {
    const filtered = topics ? list.filter((item) => topics.includes(item.topic)) : list
    return filtered.length > 0 ? filtered : list
  }
  return { fact: pickForDay(allowed(facts), day).id, deepdive: pickForDay(allowed(deepdives), day).id }
}

// Stelt de editie samen uit de bronnen van vandaag en de gekozen eigen inhoud.
function assembleEdition({ day, notes, news, topics, brief, history }, picks, short = false) {
  const fact = facts.find((item) => item.id === picks?.fact) ?? pickForDay(facts, day)
  const deepdive = deepdives.find((item) => item.id === picks?.deepdive) ?? pickForDay(deepdives, day)
  const toCard = ({ question, ...item }, type) => ({ ...item, id: `${type}-${item.id}`, type })
  return {
    day,
    notes,
    cards: [
      ...(short ? news.slice(0, NEWS_ITEMS_SHORT) : news),
      ...(topics ?? []), // Tech en AI; ook in de korte editie
      // Vervalt als de koppen ontbreken (bijvoorbeeld bij een oudere news.json).
      brief?.length > 0 && { id: `brief-${day}`, type: 'brief', items: brief },
      // 'guess' is de vraag op de voorkant van de kaart: eerst raden, dan lezen.
      { ...history.card, guess: history.question },
      history.timeline, // vervalt als Wikipedia onbereikbaar is of te weinig gebeurtenissen heeft
      { ...toCard(fact, 'fact'), guess: present(fact.question, day, 1) },
      toCard(deepdive, 'deepdive'),
      { id: `quiz-${day}`, type: 'quiz', title: 'Wat weet je nog?' },
    ].filter(Boolean),
    // De vragen bij de kaarten van vandaag, zoals ze in de inhoud staan. De quiz wordt hier
    // later uit samengesteld (zie quizQuestions), samen met de herhaling.
    questions: { fact: fact.question, history: history.question, deepdive: deepdive.question, deepdive2: deepdive.question2 ?? null },
  }
}

// ---------- Scherm ----------
const TYPE_NAMES = { fact: 'weetje', history: 'geschiedenis', deepdive: 'verdieping', deepdive2: 'verdieping' }
const LABELS = {
  news: 'Nieuws',
  history: 'Vandaag in de geschiedenis',
  timeline: 'Tijdlijn',
  fact: 'Weetje',
  deepdive: 'Verdieping',
  brief: 'Kort nieuws',
  quiz: 'Mini-quiz',
}

// Bouwt een element. Tekst gaat er altijd als tekst in (nooit als HTML), dus inhoud
// van buiten kan geen code uitvoeren.
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag)
  for (const [name, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue
    if (name === 'class') node.className = value
    else if (name === 'onclick') node.addEventListener('click', value)
    else if (name === 'onchange') node.addEventListener('change', value)
    else if (name === 'disabled') node.disabled = true
    else if (name === 'checked') node.checked = true
    else node.setAttribute(name, value)
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue
    node.append(child)
  }
  return node
}

const today = dayKey()
let state = loadState()
let edition = null
let fatal = null // als er iets misgaat bij het starten: { title, detail }
let sources = null // nieuws, geschiedenis en tijdlijn van vandaag
let view = 'edition' // 'edition' | 'saved' | 'topics' | 'progress' | 'week'
let navigate = {} // wat 'vorige' en 'volgende' op dit moment doen (voor de pijltjestoetsen)
let flipped = null // id van de kaart die net is omgedraaid (voor de animatie)
let timelinePick = { id: null, order: [] } // welke gebeurtenissen je al hebt aangetikt, in volgorde

const main = document.getElementById('main')
document.getElementById('date').textContent = formatLongDate(today)
document.getElementById('toggle-saved').addEventListener('click', () => {
  view = view === 'edition' ? 'saved' : 'edition'
  render(true)
})
document.getElementById('toggle-progress').addEventListener('click', () => {
  view = view === 'progress' ? 'edition' : 'progress'
  render(true)
})
document.getElementById('toggle-topics').addEventListener('click', () => {
  view = view === 'topics' ? 'edition' : 'topics'
  render(true)
})

// Voortgang van een oudere versie van de app (zonder v: 2) telt niet meer mee.
const progressOf = (s) => cleanProgress(s.progress[today])
function progress() {
  return progressOf(state)
}
function update(change, toTop = false) {
  state = change(state)
  writeJson(STATE_KEY, state)
  render(toTop)
}
function setProgress(patch, toTop = false) {
  // Alleen de voortgang van vandaag bewaren, zodat de opslag niet eindeloos groeit.
  update((s) => ({ ...s, progress: { [today]: { ...progressOf(s), ...patch } } }), toTop)
}
function guess(card, choice) {
  flipped = card.id
  setProgress({ guesses: { ...progress().guesses, [card.id]: choice } })
}

// De vragen van de mini-quiz: twee over de verdieping van vandaag en drie herhalingsvragen.
// Valt er nog niets te herhalen, dan vullen de vragen van vandaag de lege plekken.
function quizQuestions() {
  const { fact, history, deepdive, deepdive2 } = edition.questions
  const reviews = progress().reviews ?? []
  // 'todayType' markeert een vraag over vandaag die na afloop wordt onthouden voor de herhaling.
  const list = [
    { label: 'Vandaag · verdieping', question: present(deepdive, today, 2), todayType: 'deepdive' },
    deepdive2 && { label: 'Vandaag · verdieping', question: present(deepdive2, today, 6), todayType: 'deepdive2' },
  ].filter(Boolean)
  reviews.forEach((item, i) => {
    list.push({
      label: `Herhaling · ${TYPE_NAMES[item.type]} van ${formatShortDate(item.day)}`,
      question: present(item.question, today, 10 + i),
      reviewId: item.id,
    })
  })
  const again = [
    fact && { label: 'Weet je het nog? · weetje van vandaag', question: present(fact, today, 3) },
    history && { label: 'Weet je het nog? · geschiedenis van vandaag', question: present(history, today, 4) },
  ].filter(Boolean)
  return list.concat(again.slice(0, Math.max(0, REVIEW_COUNT - reviews.length)))
}
// Een kaart waarbij je eerst iets moet doen voordat je verder kunt.
const isGuessCard = (card) => Boolean(card.guess) || card.type === 'timeline'
// De goede volgorde van een tijdlijn: de posities van de gebeurtenissen, van vroegst naar laatst.
const timelineAnswer = (card) => card.items.map((_, i) => i).sort((a, b) => card.items[a].year - card.items[b].year)
function isGuessRight(card, choice) {
  if (card.type === 'timeline') return Array.isArray(choice) && choice.join() === timelineAnswer(card).join()
  return choice === card.guess.answer
}
// Hoeveel van de raadkaarten je goed had.
function guessScore() {
  const { guesses } = progress()
  const cards = edition.cards.filter(isGuessCard)
  return { right: cards.filter((card) => isGuessRight(card, guesses[card.id])).length, total: cards.length }
}

function isSaved(card, day = today) {
  return state.saved.some((item) => item.key === `${day}:${card.id}`)
}
function toggleSave(card, day = today) {
  const key = `${day}:${card.id}`
  const { guess: _guess, ...copy } = card // de raadvraag hoeft niet mee bewaard te worden
  update((s) => ({
    ...s,
    saved: s.saved.some((item) => item.key === key)
      ? s.saved.filter((item) => item.key !== key)
      : [{ key, day, card: copy }, ...s.saved], // volledige kopie: blijft bestaan na de editie
  }))
}
function finish() {
  const total = edition.cards.length
  // Na 'Editie teruglezen' is de dag al afgerond: dan alleen terug naar het eindscherm.
  if (progress().completed) return setProgress({ index: total }, true)

  const { answers, guesses } = progress()
  const questions = quizQuestions()
  const isRight = (i) => answers[i] === questions[i].question.answer
  update((s) => {
    // 1. Uitslag van de herhalingsvragen bijwerken.
    const results = questions.map((entry, i) => entry.reviewId && { id: entry.reviewId, correct: isRight(i) }).filter(Boolean)
    let log = applyReviews(s.log, results, today)
    // 2. De vragen van vandaag onthouden voor later (één keer per dag).
    if (!log.some((item) => item.day === today)) {
      const guessedWrong = (type) => {
        const card = edition.cards.find((c) => c.type === type)
        return guesses[card.id] !== card.guess.answer
      }
      const entry = (type, question, wrong) => ({
        id: `${today}:${type}`, day: today, type, question, wrong, streak: 0, reviews: 0, lastReview: null,
      })
      const { fact, history } = edition.questions
      if (fact) log.push(entry('fact', fact, guessedWrong('fact')))
      if (history) log.push(entry('history', history, guessedWrong('history')))
      questions.forEach((item, i) => {
        if (item.todayType) log.push(entry(item.todayType, edition.questions[item.todayType], !isRight(i)))
      })
    }
    // 3. Opruimen.
    log = pruneLog(log, today)
    const guessed = guessScore()
    return {
      ...s,
      streak: completeDay(s.streak, today),
      days: {
        ...s.days,
        [today]: { quiz: [questions.filter((_, i) => isRight(i)).length, questions.length], guess: [guessed.right, guessed.total] },
      },
      log,
      progress: { [today]: { ...progressOf(s), index: total, completed: true } },
    }
  }, true)
}

// Een link naar buiten. Het adres wordt hier nog eens gecontroleerd, omdat het ook uit de opslag
// kan komen; is het geen gewone https-link, dan staat er alleen de tekst.
function link(url, text) {
  const href = safeUrl(url)
  return href ? el('a', { href, target: '_blank', rel: 'noopener noreferrer' }, text) : el('span', {}, text)
}

// Kort nieuws: vijf koppen met een link naar het bericht, zonder samenvatting.
function briefView(card) {
  return el(
    'article',
    { class: 'card card--brief' },
    el('header', { class: 'card__head' }, el('span', { class: 'card__kicker' }, LABELS.brief)),
    el('h2', { class: 'card__title' }, 'Verder in het nieuws'),
    el(
      'ul',
      { class: 'brief' },
      card.items.map((item) =>
        el(
          'li',
          {},
          el('span', { class: 'brief__label' }, [item.label, item.source].filter(Boolean).join(' · ')),
          link(item.url, `${item.title} ↗`),
        ),
      ),
    ),
  )
}

// De voorkant van een raadkaart: eerst een gok, dan pas de inhoud.
function guessView(card) {
  const question = card.guess
  return el(
    'article',
    { class: `card card--${card.type} card--guess` },
    el(
      'header',
      { class: 'card__head' },
      el('span', { class: 'card__kicker' }, card.kicker ?? LABELS[card.type]),
      el('span', { class: 'card__tag' }, 'Eerst raden'),
    ),
    card.type === 'history'
      ? [el('h2', { class: 'card__title' }, 'In welk jaar gebeurde dit?'), el('p', { class: 'card__body', lang: card.lang }, card.title)]
      : el('h2', { class: 'card__title', lang: question.lang }, question.q),
    el(
      'div',
      { class: 'options' },
      question.options.map((option, i) => el('button', { type: 'button', class: 'option', onclick: () => guess(card, i) }, option)),
    ),
    el('button', { type: 'button', class: 'skip', onclick: () => guess(card, -1) }, 'Geen idee'),
  )
}

// Tijdlijn: tik de gebeurtenissen aan van vroegst naar laatst. 'choice' is je vastgelegde
// volgorde (een lijst posities), -1 voor 'Geen idee', of undefined zolang je nog bezig bent.
function timelineView(card, choice) {
  const head = (tag) =>
    el(
      'header',
      { class: 'card__head' },
      el('span', { class: 'card__kicker' }, LABELS.timeline),
      tag && el('span', { class: 'card__tag' }, tag),
    )
  const foot = el(
    'footer',
    { class: 'card__foot' },
    link(card.source.url, `Bron: ${card.source.name} ↗`),
    card.translated && el('span', {}, 'Automatisch vertaald uit het Engels'),
  )

  if (choice === undefined) {
    if (timelinePick.id !== card.id) timelinePick = { id: card.id, order: [] }
    const { order } = timelinePick
    const toggle = (i) => {
      timelinePick = { id: card.id, order: order.includes(i) ? order.filter((x) => x !== i) : [...order, i] }
      render()
    }
    const confirm = (value) => {
      flipped = card.id
      setProgress({ guesses: { ...progress().guesses, [card.id]: value } })
    }
    return el(
      'article',
      { class: 'card card--timeline card--guess' },
      head('Eerst raden'),
      el('h2', { class: 'card__title' }, 'Wat gebeurde het eerst?'),
      el('p', { class: 'timeline__intro' }, 'Tik de gebeurtenissen aan van vroegst naar laatst.'),
      el(
        'div',
        { class: 'options', lang: card.lang },
        card.items.map((item, i) => {
          const place = order.indexOf(i) + 1
          return el(
            'button',
            {
              type: 'button',
              class: `option timeline__item ${place ? 'is-picked' : ''}`,
              'aria-pressed': String(place > 0),
              'aria-label': place ? `${place}: ${item.text}` : item.text,
              onclick: () => toggle(i),
            },
            el('span', { class: 'timeline__badge', 'aria-hidden': 'true' }, place ? String(place) : ''),
            el('span', {}, item.text),
          )
        }),
      ),
      el(
        'div',
        { class: 'timeline__actions' },
        el('button', { type: 'button', class: 'btn', disabled: order.length < card.items.length, onclick: () => confirm(order) }, 'Controleer'),
        el('button', { type: 'button', class: 'skip', onclick: () => confirm(-1) }, 'Geen idee'),
      ),
    )
  }

  const answer = timelineAnswer(card)
  const tried = Array.isArray(choice)
  const right = isGuessRight(card, choice)
  return el(
    'article',
    { class: 'card card--timeline' },
    head(),
    right
      ? el('p', { class: 'result is-correct', role: 'status' }, '✓ Goed: alles in de juiste volgorde')
      : tried
        ? el('p', { class: 'result', role: 'status' }, '✗ Niet helemaal. Dit is de juiste volgorde:')
        : el('p', { class: 'result is-neutral', role: 'status' }, 'Dit is de juiste volgorde:'),
    el(
      'ol',
      { class: 'timeline__result', lang: card.lang },
      answer.map((itemIndex, place) => {
        const yours = tried ? choice.indexOf(itemIndex) : -1
        const good = yours === place
        return el(
          'li',
          { class: !tried ? '' : good ? 'is-correct' : 'is-wrong' },
          el('span', { class: 'timeline__year' }, card.items[itemIndex].label),
          el('span', {}, card.items[itemIndex].text),
          tried && !good && el('span', { class: 'timeline__note', lang: 'nl' }, `Jij zette dit op plek ${yours + 1}.`),
        )
      }),
    ),
    foot,
  )
}

// De uitslag van je gok, bovenaan de omgedraaide kaart.
function guessResult(card, choice) {
  const { options, answer } = card.guess
  if (choice === answer) return el('p', { class: 'result is-correct', role: 'status' }, '✓ Goed geraden')
  if (choice === -1) return el('p', { class: 'result is-neutral', role: 'status' }, `Het was: ${options[answer]}`)
  return el('p', { class: 'result', role: 'status' }, `✗ Niet geraden — het was: ${options[answer]}`)
}

function cardView(card, { day = today, savedOn = null, choice = null } = {}) {
  const saved = isSaved(card, day)
  const source =
    card.source &&
    (card.source.url
      ? link(card.source.url, `Bron: ${card.source.name} ↗`)
      : el('span', {}, `Bron: ${card.source.name}`))
  return el(
    'article',
    { class: `card card--${card.type}` },
    el(
      'header',
      { class: 'card__head' },
      el('span', { class: 'card__kicker' }, card.kicker ?? LABELS[card.type]),
      el(
        'button',
        { type: 'button', class: 'save', 'aria-pressed': String(saved), onclick: () => toggleSave(card, day) },
        saved ? '★ Bewaard' : '☆ Bewaar',
      ),
    ),
    Number.isInteger(choice) && guessResult(card, choice),
    // lang: zodat schermlezers en afbreking de taal van de bron volgen
    el(
      'div',
      { lang: card.lang },
      card.year && el('p', { class: 'card__year' }, card.year),
      el('h2', { class: 'card__title' }, card.title),
      card.body.map((text) => el('p', { class: 'card__body' }, text)),
    ),
    el(
      'footer',
      { class: 'card__foot' },
      source,
      card.translated && el('span', {}, 'Automatisch vertaald uit het Engels'),
      savedOn && el('span', {}, `Bewaard op ${savedOn}`),
    ),
  )
}

function answerDaily(qi, oi) {
  const next = [...progress().answers]
  next[qi] = oi
  setProgress({ answers: next })
}

// onAnswer(vraagnummer, keuze) legt een antwoord vast; standaard is dat de dagquiz.
function quizView(card, questions, answers, onAnswer = answerDaily) {
  return el(
    'article',
    { class: 'card card--quiz' },
    el('header', { class: 'card__head' }, el('span', { class: 'card__kicker' }, card.kicker ?? LABELS.quiz)),
    el('h2', { class: 'card__title' }, card.title),
    questions.map(({ label, question }, qi) => {
      const chosen = answers[qi]
      const answered = Number.isInteger(chosen)
      return el(
        'fieldset',
        { class: 'question' },
        el('legend', {}, el('span', { class: 'question__tag' }, label), el('span', { lang: question.lang }, `${qi + 1}. ${question.q}`)),
        el(
          'div',
          { class: 'options' },
          question.options.map((option, oi) => {
            const result = !answered ? '' : oi === question.answer ? 'is-correct' : oi === chosen ? 'is-wrong' : ''
            const mark = result === 'is-correct' ? ' ✓' : result === 'is-wrong' ? ' ✗' : ''
            return el(
              'button',
              {
                type: 'button',
                class: `option ${result}`,
                disabled: answered,
                'aria-pressed': String(chosen === oi),
                // Een antwoord staat vast zodra je het kiest.
                onclick: () => onAnswer(qi, oi),
              },
              option + mark,
            )
          }),
        ),
        el(
          'p',
          { class: 'question__explain' },
          answered && `${chosen === question.answer ? 'Goed.' : 'Niet goed.'} ${question.explain}`,
        ),
      )
    }),
  )
}

function doneView(questions, answers) {
  const streak = currentStreak(state.streak, today)
  const score = questions.filter((entry, i) => answers[i] === entry.question.answer).length
  const guessed = guessScore()
  const stat = (label, value, sub) => el('div', {}, el('dt', {}, label), el('dd', {}, value, sub && el('small', {}, sub)))
  return el(
    'section',
    { class: 'done' },
    el('p', { class: 'done__mark', 'aria-hidden': 'true' }, '✓'),
    el('h2', {}, 'Klaar voor vandaag'),
    el('p', { class: 'done__lead' }, 'Je bent bij. Morgen staat er een nieuwe editie klaar.'),
    el(
      'dl',
      { class: 'stats' },
      stat('Dagreeks', `${streak} ${streak === 1 ? 'dag' : 'dagen'}`, `langste: ${state.streak.best}`),
      stat('Geraden', `${guessed.right} van ${guessed.total}`),
      stat('Quiz', `${score} van ${questions.length}`),
    ),
    isSunday(today) && weekBlock(),
    el(
      'div',
      { class: 'done__actions' },
      el('button', { type: 'button', class: 'btn btn--ghost', onclick: () => setProgress({ index: 0 }, true) }, 'Editie teruglezen'),
      state.saved.length > 0 &&
        el(
          'button',
          {
            type: 'button',
            class: 'btn btn--ghost',
            onclick: () => {
              view = 'saved'
              render(true)
            },
          },
          `Bewaard (${state.saved.length})`,
        ),
    ),
  )
}

function savedView() {
  if (state.saved.length === 0) {
    return el(
      'section',
      { class: 'empty' },
      el('h2', {}, 'Nog niets bewaard'),
      el('p', {}, 'Tik op “☆ Bewaar” bij een kaart om hem hier terug te vinden.'),
    )
  }
  return el(
    'section',
    { class: 'saved-list' },
    state.saved.map((item) => cardView(item.card, { day: item.day, savedOn: formatLongDate(item.day) })),
  )
}

// Legt de gekozen thema's vast. Zolang de editie van vandaag niet is afgerond, worden het
// weetje en de verdieping van vandaag meteen opnieuw gekozen.
function setTopics(ids) {
  const topics = ids.length === TOPICS.length ? null : ids
  const current = progress()
  const applyNow = sources && !current.completed
  state = {
    ...state,
    topics,
    progress: applyNow ? { [today]: { ...current, picks: pickContent(today, topics) } } : state.progress,
  }
  writeJson(STATE_KEY, state)
  if (applyNow) edition = assembleEdition(sources, progress().picks, progress().short === true)
  render()
}

// Legt de lengte van de editie vast ('long' of 'short'). Net als bij de onderwerpen geldt de
// wijziging meteen als de editie van vandaag nog niet is afgerond.
function setLength(length) {
  const current = progress()
  const applyNow = sources && !current.completed
  if (!applyNow) {
    state = { ...state, length }
    writeJson(STATE_KEY, state)
    return render()
  }
  // De kaart waar je bent gebleven terugvinden in de nieuwe editie; bestaat die niet meer
  // (een nieuwskaart die wegvalt), dan verder bij de eerste kaart na het nieuws.
  const currentId = edition.cards[Math.min(current.index, edition.cards.length - 1)]?.id
  const next = assembleEdition(sources, current.picks, length === 'short')
  let index = current.index >= edition.cards.length ? next.cards.length : next.cards.findIndex((card) => card.id === currentId)
  if (index < 0) index = next.cards.findIndex((card) => card.type !== 'news' || card.topic)
  state = { ...state, length, progress: { [today]: { ...current, short: length === 'short', index } } }
  writeJson(STATE_KEY, state)
  edition = next
  render()
}

function topicsView() {
  const selected = state.topics ?? TOPICS.map((topic) => topic.id)
  const count = (list, id) => list.filter((item) => item.topic === id).length
  return el(
    'section',
    { class: 'topics' },
    el('h2', {}, 'Instellingen'),
    el('h3', {}, 'Lengte van de editie'),
    el(
      'div',
      { class: 'topics__list', role: 'radiogroup', 'aria-label': 'Lengte van de editie' },
      [
        ['long', 'Uitgebreid', 'Zes nieuwskaarten, plus Tech en AI; 14 kaarten in totaal'],
        ['short', 'Kort', 'Vier nieuwskaarten, plus Tech en AI; 12 kaarten in totaal'],
      ].map(([value, name, detail]) =>
        el(
          'label',
          { class: 'topic' },
          el('input', { type: 'radio', name: 'length', value, checked: state.length === value, onchange: () => setLength(value) }),
          el('span', {}, el('span', { class: 'topic__name' }, name), el('span', { class: 'topic__count' }, detail)),
        ),
      ),
    ),
    el('h3', {}, 'Onderwerpen'),
    el('p', {}, 'Kies waarover je weetjes en verdiepingen wilt krijgen. Het nieuws, de geschiedeniskaart en de tijdlijn blijven zoals ze zijn.'),
    el(
      'ul',
      { class: 'topics__list' },
      TOPICS.map((topic) => {
        const checked = selected.includes(topic.id)
        return el(
          'li',
          {},
          el(
            'label',
            { class: 'topic' },
            el('input', {
              type: 'checkbox',
              checked,
              // Er moet altijd minstens één thema aan blijven staan.
              disabled: checked && selected.length === 1,
              onchange: () =>
                setTopics(TOPICS.map((t) => t.id).filter((id) => (id === topic.id ? !checked : selected.includes(id)))),
            }),
            el(
              'span',
              {},
              el('span', { class: 'topic__name' }, topic.name),
              el('span', { class: 'topic__count' }, `${count(facts, topic.id)} weetjes · ${count(deepdives, topic.id)} verdiepingen`),
            ),
          ),
        )
      }),
    ),
    el(
      'p',
      { role: 'status' },
      selected.length === 1 ? 'Er blijft altijd minstens één onderwerp aan. ' : '',
      progress().completed
        ? 'Je hebt de editie van vandaag al afgerond; een wijziging geldt vanaf morgen.'
        : 'Een wijziging geldt meteen voor de editie van vandaag.',
    ),
    el('button', { type: 'button', class: 'btn', onclick: () => ((view = 'edition'), render(true)) }, 'Terug naar de editie'),
  )
}

const thisWeek = () => state.weeks[today] ?? null

function openWeekQuiz() {
  view = 'week'
  if (thisWeek()) return render(true)
  // De vragen één keer kiezen en vastleggen, zodat de quiz gelijk blijft als je later terugkomt.
  update((s) => ({ ...s, weeks: { ...s.weeks, [today]: { items: pickWeekItems(s.log, today), answers: [], done: false, score: null } } }), true)
}
function weekQuestions() {
  const weekday = (day) => (day === today ? 'vandaag' : new Intl.DateTimeFormat('nl-NL', { weekday: 'long' }).format(toDate(day)))
  return thisWeek().items.map((item, i) => {
    const name = TYPE_NAMES[item.type]
    return {
      label: `${name[0].toUpperCase()}${name.slice(1)} van ${weekday(item.day)}`,
      question: present(item.question, today, 20 + i),
      reviewId: item.id,
    }
  })
}
function answerWeek(qi, oi) {
  update((s) => {
    const week = s.weeks[today]
    const answers = [...week.answers]
    answers[qi] = oi
    return { ...s, weeks: { ...s.weeks, [today]: { ...week, answers } } }
  })
}
function finishWeek() {
  const questions = weekQuestions()
  const { answers } = thisWeek()
  const results = questions.map((entry, i) => ({ id: entry.reviewId, correct: answers[i] === entry.question.answer }))
  update((s) => {
    const weeks = { ...s.weeks, [today]: { ...s.weeks[today], done: true, score: [results.filter((r) => r.correct).length, results.length] } }
    // Alleen de laatste weken bewaren.
    for (const key of Object.keys(weeks).sort().slice(0, -WEEKS_KEPT)) delete weeks[key]
    // De antwoorden tellen ook mee voor de dagelijkse herhaling.
    return { ...s, weeks, log: pruneLog(applyReviews(s.log, results, today), today) }
  }, true)
}

// Het blok op het klaar-scherm van zondag.
function weekBlock() {
  const week = thisWeek()
  const available = week ? week.items.length : pickWeekItems(state.log, today).length
  if (week?.done) {
    return el(
      'div',
      { class: 'done__week' },
      el('p', {}, `Weekquiz gedaan: ${week.score[0]} van ${week.score[1]} goed.`),
      el('button', { type: 'button', class: 'btn btn--ghost', onclick: openWeekQuiz }, 'Weekquiz bekijken'),
    )
  }
  if (available < WEEK_QUIZ_MIN) {
    return el('div', { class: 'done__week' }, el('p', {}, 'Voor de weekquiz heb je deze week nog te weinig gelezen. Volgende zondag is er weer een.'))
  }
  return el(
    'div',
    { class: 'done__week' },
    el('p', {}, 'Het is zondag: wat weet je nog van deze week?'),
    el(
      'button',
      { type: 'button', class: 'btn', onclick: openWeekQuiz },
      week ? 'Weekquiz afmaken' : `Weekquiz: ${available} vragen over deze week`,
    ),
  )
}

function weekView() {
  const week = thisWeek()
  const questions = weekQuestions()
  const allAnswered = questions.every((_, i) => Number.isInteger(week.answers[i]))
  const back = () => ((view = 'edition'), render(true))
  return el(
    'section',
    { class: 'week' },
    week.done &&
      el('p', { class: 'week__score', role: 'status' }, 'Je weekscore', el('strong', {}, `${week.score[0]} van ${week.score[1]}`)),
    quizView({ kicker: 'Weekquiz', title: 'Wat weet je nog van deze week?' }, questions, week.answers, answerWeek),
    el(
      'div',
      { class: 'week__actions' },
      el('button', { type: 'button', class: 'btn btn--ghost', onclick: back }, week.done ? 'Terug' : 'Later verder'),
      !week.done && el('button', { type: 'button', class: 'btn', disabled: !allAnswered, onclick: finishWeek }, 'Weekquiz afronden'),
    ),
  )
}

const MILESTONES = [7, 30, 100] // dagen op rij

// De laatste weekquizzen, nieuwste eerst.
function weekScores() {
  const done = Object.entries(state.weeks).filter(([, week]) => week.done).sort(([a], [b]) => b.localeCompare(a)).slice(0, 4)
  if (done.length === 0) return null
  return [
    el('h3', {}, 'Weekquizzen'),
    el(
      'ul',
      { class: 'weekscores' },
      done.map(([day, week]) => el('li', {}, el('span', {}, `Zondag ${formatShortDate(day)}`), el('strong', {}, `${week.score[0]} van ${week.score[1]}`))),
    ),
  ]
}

// Voortgang: wat je hebt afgerond, zonder punten of ranglijsten.
function progressView() {
  const streak = currentStreak(state.streak, today)
  const best = Math.max(state.streak.best, streak)
  const doneDays = Object.keys(state.days)
  const scored = Object.values(state.days).filter((day) => Array.isArray(day.quiz) && day.quiz[1] > 0)
  const right = scored.reduce((sum, day) => sum + day.quiz[0], 0)
  const asked = scored.reduce((sum, day) => sum + day.quiz[1], 0)
  const stat = (label, value, sub) => el('div', {}, el('dt', {}, label), el('dd', {}, value, sub && el('small', {}, sub)))

  // Kalender: vijf hele weken (maandag tot en met zondag), eindigend met deze week.
  const start = toDate(today)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - 28)
  const cells = Array.from({ length: 35 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    const key = dayKey(date)
    const done = key in state.days
    const future = key > today
    const status = future ? 'nog niet geweest' : done ? 'afgerond' : 'niet afgerond'
    const month = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(date)
    return el(
      'li',
      { class: `calendar__day ${done ? 'is-done' : ''} ${key === today ? 'is-today' : ''} ${future ? 'is-future' : ''}`, title: `${formatLongDate(key)}: ${status}` },
      String(date.getDate()),
      el('span', { class: 'sr-only' }, ` ${month}${key === today ? ' (vandaag)' : ''}: ${status}`),
    )
  })

  return el(
    'section',
    { class: 'progress' },
    el('h2', {}, 'Voortgang'),
    el(
      'dl',
      { class: 'stats stats--four' },
      stat('Dagreeks', `${streak} ${streak === 1 ? 'dag' : 'dagen'}`),
      stat('Langste reeks', `${best} ${best === 1 ? 'dag' : 'dagen'}`),
      stat('Afgeronde edities', String(doneDays.length)),
      stat('Quiz gemiddeld', asked > 0 ? `${Math.round((right / asked) * 100)}%` : '–', asked > 0 && `${right} van ${asked} vragen`),
    ),
    el('h3', {}, 'Laatste vijf weken'),
    el(
      'ol',
      { class: 'calendar' },
      ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'].map((name) => el('li', { class: 'calendar__head', 'aria-hidden': 'true' }, name)),
      cells,
    ),
    el('h3', {}, 'Mijlpalen'),
    el(
      'ul',
      { class: 'milestones' },
      MILESTONES.map((goal) =>
        best >= goal
          ? el('li', { class: 'is-done' }, `✓ ${goal} dagen op rij gehaald`)
          : el('li', {}, `${goal} dagen op rij: nog ${goal - streak} ${goal - streak === 1 ? 'dag' : 'dagen'}`),
      ),
    ),
    weekScores(),
    el('p', { class: 'progress__note' }, 'De app houdt dit bij sinds deze versie; eerdere quizscores zijn niet bewaard. Alles staat alleen in je browser.'),
    el('button', { type: 'button', class: 'btn', onclick: () => ((view = 'edition'), render(true)) }, 'Terug naar de editie'),
  )
}

// Maakt een kaart veegbaar: naar links = volgende, naar rechts = vorige. Je kunt de veeg overal
// in 'area' beginnen (ook in de lege ruimte onder een korte kaart); 'node' is de kaart die meebeweegt.
// onNext/onPrev zijn null als die richting (nog) niet mag; de kaart veert dan terug.
function makeSwipeable(area, node, { onNext, onPrev }) {
  let start = null
  let dragging = false
  let dx = 0
  let suppressClick = false

  const settle = (transform, opacity, after) => {
    node.classList.add('is-settling')
    node.style.transform = transform
    node.style.opacity = opacity
    if (after) setTimeout(after, 180)
  }

  node.classList.add('swipe')
  area.addEventListener('pointerdown', (event) => {
    // Met de muis blijft slepen tekst selecteren; daar zijn de knoppen en pijltjestoetsen voor.
    if (event.pointerType === 'mouse' || !event.isPrimary) return
    start = { x: event.clientX, y: event.clientY, time: event.timeStamp }
    dragging = false
    dx = 0
  })
  area.addEventListener('pointermove', (event) => {
    if (!start) return
    dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (!dragging) {
      if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) start = null // verticaal: scrollen
      else if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        dragging = true
        node.classList.remove('is-settling', 'enter-left', 'enter-right', 'flip-in')
        area.setPointerCapture(event.pointerId)
      }
      if (!dragging) return
    }
    const allowed = dx < 0 ? onNext : onPrev
    const shown = allowed ? dx : dx * 0.2 // weerstand als deze kant niet kan
    node.style.transform = `translateX(${shown}px) rotate(${shown / 60}deg)`
  })
  const end = (event) => {
    if (!start) return
    const wasDragging = dragging
    const speed = Math.abs(dx) / Math.max(event.timeStamp - start.time, 1) // pixels per ms
    start = null
    dragging = false
    if (!wasDragging) return
    suppressClick = true
    setTimeout(() => (suppressClick = false), 50)
    const action = dx < 0 ? onNext : onPrev
    const far = Math.abs(dx) > Math.min(110, node.offsetWidth * 0.3)
    const flick = Math.abs(dx) > 40 && speed > 0.5
    if (event.type === 'pointerup' && action && (far || flick)) {
      settle(`translateX(${dx < 0 ? -110 : 110}%)`, '0', action)
    } else {
      settle('', '')
    }
  }
  area.addEventListener('pointerup', end)
  area.addEventListener('pointercancel', end)
  // Tijdens een horizontale veeg de aanraking zelf afhandelen. Anders ziet de browser een snelle
  // veeg als 'uitrollen' en slikt hij de eerstvolgende tik in (bijvoorbeeld op een antwoord).
  area.addEventListener('touchmove', (event) => dragging && event.cancelable && event.preventDefault(), { passive: false })
  // Na een veeg mag de knop onder je vinger niet ook nog afgaan.
  area.addEventListener('click', (event) => suppressClick && (event.stopPropagation(), event.preventDefault()), true)
  return area
}

// Vanaf welke kant de volgende kaart het beeld in schuift ('left', 'right' of null).
let enterFrom = null
function go(index, from) {
  enterFrom = from
  setProgress({ index }, true)
}

function editionView() {
  const cards = edition.cards
  const total = cards.length
  const { answers, guesses } = progress()
  const index = Math.min(progress().index, total)
  const questions = quizQuestions()
  if (index >= total) return [doneView(questions, answers)]

  const card = cards[index]
  const isLast = index === total - 1
  // Verder kan pas als je geraden hebt (raadkaart) of alle vragen beantwoord hebt (quiz).
  const needsGuess = isGuessCard(card) && guesses[card.id] === undefined
  const quizDone = card.type !== 'quiz' || questions.every((_, i) => Number.isInteger(answers[i]))
  const onPrev = index > 0 ? () => go(index - 1, 'left') : null
  const onNext = needsGuess || !quizDone ? null : isLast ? finish : () => go(index + 1, 'right')
  navigate = { onPrev, onNext }

  const content =
    card.type === 'quiz'
      ? quizView(card, questions, answers)
      : card.type === 'brief'
        ? briefView(card)
        : card.type === 'timeline'
          ? timelineView(card, guesses[card.id])
        : needsGuess
          ? guessView(card)
          : cardView(card, { choice: card.guess ? guesses[card.id] : null })
  const stage = makeSwipeable(el('div', { class: 'stage' }, content), content, { onNext, onPrev })
  if (flipped === card.id) content.classList.add('flip-in')
  else if (enterFrom) content.classList.add(`enter-${enterFrom}`)
  flipped = null
  enterFrom = null
  const hint = needsGuess ? (card.type === 'timeline' ? ' · zet ze eerst op volgorde' : ' · kies eerst een antwoord') : index === 0 ? ' · veeg naar links voor de volgende' : null

  return [
    el(
      'ol',
      { class: 'steps', 'aria-label': `Kaart ${index + 1} van ${total}` },
      cards.map((_, i) => el('li', { class: i < index ? 'is-done' : i === index ? 'is-current' : '' })),
    ),
    index === 0 && edition.notes.map((note) => el('p', { class: 'notice' }, note)),
    stage,
    el(
      'nav',
      { class: 'pager' },
      el('button', { type: 'button', class: 'btn btn--ghost nav-btn', disabled: !onPrev, onclick: onPrev }, 'Vorige'),
      el(
        'span',
        { class: 'pager__count' },
        `${index + 1} / ${total}`,
        hint && el('span', { class: 'pager__hint' }, hint),
      ),
      // 'Afronden' blijft altijd een zichtbare knop; bladeren doe je op een aanraakscherm met vegen.
      el(
        'button',
        { type: 'button', class: isLast ? 'btn btn--finish' : 'btn nav-btn', disabled: !onNext, onclick: onNext },
        isLast ? 'Afronden' : 'Volgende',
      ),
    ),
  ]
}

// ---------- Focus en aankondigingen (toegankelijkheid) ----------
// Het scherm wordt bij elke wijziging opnieuw opgebouwd. Zonder hulp raakt de focus dan kwijt,
// wat lastig is met een toetsenbord of schermlezer. Daarom: bij een nieuw scherm of een nieuwe
// kaart gaat de focus naar de kop, na raden naar de uitslag, en anders terug naar waar hij stond.
let interacted = false // pas na de eerste handeling van de gebruiker; niet bij het laden
let lastScreen = null
for (const type of ['pointerdown', 'keydown']) window.addEventListener(type, () => (interacted = true), { capture: true })

function screenId() {
  if (view !== 'edition' || !edition) return { view, card: null, open: false }
  const index = Math.min(progress().index, edition.cards.length)
  const card = edition.cards[index]
  return { view, card: index, open: Boolean(card) && progress().guesses[card.id] !== undefined }
}
function announce(text) {
  document.getElementById('announce').textContent = text
}
function manageFocus(place) {
  const now = screenId()
  const before = lastScreen
  lastScreen = now
  if (!interacted || !before) return
  let target = null
  if (now.view !== before.view || now.card !== before.card) {
    target = main.querySelector('h2')
    if (now.view === 'edition' && edition) {
      announce(now.card >= edition.cards.length ? 'Klaar voor vandaag' : `Kaart ${now.card + 1} van ${edition.cards.length}`)
    }
  } else if (now.open && !before.open) {
    target = main.querySelector('.result') ?? main.querySelector('h2')
  } else if (place) {
    const same = main.querySelectorAll(place.tag)[place.index]
    // Een quizantwoord wordt na het kiezen uitgeschakeld: dan naar de uitleg bij die vraag.
    target = same?.disabled ? same.closest('.question')?.querySelector('.question__explain') ?? null : same ?? null
  }
  if (!target) return
  if (!target.matches('button, a, input')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}

// Een fout bij het starten: zeggen wat er mis is en een knop om het opnieuw te proberen.
function errorView() {
  // Bij een fout in de opgeslagen gegevens helpt opnieuw proberen niet; dan kun je ze wissen.
  const wipe = () => {
    for (const key of [STATE_KEY, EDITION_KEY, TRANSLATION_KEY]) localStorage.removeItem(key)
    location.reload()
  }
  return el(
    'section',
    { class: 'empty error', role: 'alert' },
    el('h2', {}, fatal.title),
    el('p', {}, fatal.detail),
    el('button', { type: 'button', class: 'btn', onclick: () => location.reload() }, 'Opnieuw proberen'),
    fatal.canWipe &&
      (fatal.confirmWipe
        ? el(
            'div',
            { class: 'error__wipe' },
            el('p', {}, 'Hiermee verdwijnen je dagreeks, voortgang, weekscores en bewaarde kaarten van dit apparaat. Dat kan niet ongedaan worden gemaakt.'),
            el('button', { type: 'button', class: 'btn', onclick: wipe }, 'Ja, wis mijn gegevens'),
            el('button', { type: 'button', class: 'btn btn--ghost', onclick: () => ((fatal.confirmWipe = false), render()) }, 'Annuleren'),
          )
        : el(
            'div',
            { class: 'error__wipe' },
            el('p', {}, 'Blijft dit terugkomen, dan zijn de opgeslagen gegevens mogelijk beschadigd.'),
            el('button', { type: 'button', class: 'btn btn--ghost', onclick: () => ((fatal.confirmWipe = true), render()) }, 'Opgeslagen gegevens wissen'),
          )),
  )
}

function render(toTop = false) {
  const streak = currentStreak(state.streak, today)
  document.getElementById('streak').textContent = streak
  document.getElementById('streak-label').textContent = ` ${streak === 1 ? 'dag' : 'dagen'} op rij`
  const savedButton = document.getElementById('toggle-saved')
  if (view === 'edition') {
    // Het woord staat apart, zodat het op heel smalle schermen kan wegvallen.
    savedButton.replaceChildren(el('span', { class: 'top__word' }, 'Bewaard '), `(${state.saved.length})`)
    // De naam begint met de zichtbare tekst, zodat spraakbediening ('tik Bewaard') ook werkt.
    savedButton.setAttribute('aria-label', `Bewaard (${state.saved.length}), bewaarde kaarten bekijken`)
  } else {
    savedButton.textContent = '← Editie'
    savedButton.setAttribute('aria-label', 'Editie, terug naar de editie')
  }
  document.getElementById('toggle-topics').setAttribute('aria-pressed', String(view === 'topics'))
  document.getElementById('toggle-progress').setAttribute('aria-pressed', String(view === 'progress'))
  document.getElementById('toggle-progress').setAttribute('aria-label', `Voortgang bekijken. Dagreeks: ${streak} ${streak === 1 ? 'dag' : 'dagen'}`)

  navigate = {}
  let content
  try {
    if (view === 'saved') content = [savedView()]
    else if (view === 'topics') content = [topicsView()]
    else if (view === 'progress') content = [progressView()]
    else if (view === 'week' && thisWeek()) content = [weekView()]
    else if (fatal) content = [errorView()]
    else if (!edition) content = [el('p', { class: 'loading' }, 'Editie laden…')]
    else content = editionView()
  } catch (error) {
    // Een scherm dat niet opgebouwd kan worden mag de app niet laten hangen.
    fatal = { title: 'Dit scherm kon niet worden getoond', detail: `Melding: ${error.message}`, canWipe: true }
    view = 'edition'
    content = [errorView()]
  }
  // Onthouden waar de focus stond: het soort element en het volgnummer binnen het scherm.
  const active = main.contains(document.activeElement) ? document.activeElement : null
  const place = active && { tag: active.tagName, index: [...main.querySelectorAll(active.tagName)].indexOf(active) }
  main.replaceChildren(...content.flat().filter(Boolean))
  if (toTop) window.scrollTo(0, 0)
  manageFocus(place)
}

async function start() {
  render() // toont 'Editie laden…'
  try {
    await loadContent()
  } catch (error) {
    fatal = {
      title: 'De inhoud kon niet worden geladen',
      detail: error.file
        ? `Er zit een fout in ${error.file}, of het bestand is niet bereikbaar. Melding: ${error.message}`
        : `Melding: ${error.message}`,
    }
    return render()
  }
  try {
    sources = await getSources(today, { refresh: !progress().completed })
    // Eén keer per dag kiezen en vastleggen welke herhalingsvragen, welk weetje en welke
    // verdieping aan de beurt zijn, zodat de editie gelijk blijft als je de app opnieuw opent.
    const patch = {}
    if (progress().reviews === null) patch.reviews = pickReviews(state.log, today)
    if (!progress().picks) patch.picks = pickContent(today, state.topics)
    if (progress().short == null) patch.short = state.length === 'short'
    if (Object.keys(patch).length > 0) {
      state = { ...state, progress: { [today]: { ...progress(), ...patch } } }
      writeJson(STATE_KEY, state)
    }
    edition = assembleEdition(sources, progress().picks, progress().short === true)
  } catch (error) {
    fatal = { title: 'De editie kon niet worden opgebouwd', detail: `Melding: ${error.message}`, canWipe: true }
  }
  render()
}
start()

// Nieuwe dag: staat de app nog open van gisteren (bijvoorbeeld op je telefoon op de achtergrond),
// dan wordt bij terugkomen de editie van vandaag geladen.
function reloadOnNewDay() {
  if (document.visibilityState === 'visible' && dayKey() !== today) location.reload()
}
document.addEventListener('visibilitychange', reloadOnNewDay)
window.addEventListener('pageshow', reloadOnNewDay)
window.addEventListener('focus', reloadOnNewDay)

// Pijltjestoetsen: links = vorige, rechts = volgende.
document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  if (event.key === 'ArrowLeft') navigate.onPrev?.()
  else if (event.key === 'ArrowRight' && edition && progress().index < edition.cards.length - 1) navigate.onNext?.()
})

// Service worker: maakt de app installeerbaar en bruikbaar zonder verbinding.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {})
}
