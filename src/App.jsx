import { useEffect, useState } from 'react'
import Card from './components/Card.jsx'
import Quiz from './components/Quiz.jsx'
import Done from './components/Done.jsx'
import Saved from './components/Saved.jsx'
import { dayKey, formatLongDate } from './lib/date.js'
import { getEdition } from './lib/edition.js'
import { completeDay, currentStreak, loadState, pruneProgress, saveState } from './lib/storage.js'

const NO_PROGRESS = { index: 0, answers: [], completed: false }

export default function App() {
  const [today] = useState(() => dayKey())
  const [state, setState] = useState(loadState)
  const [edition, setEdition] = useState(null)
  const [view, setView] = useState('edition') // 'edition' | 'saved'

  useEffect(() => {
    let cancelled = false
    getEdition(today).then((e) => !cancelled && setEdition(e))
    return () => {
      cancelled = true
    }
  }, [today])

  useEffect(() => saveState(state), [state])

  const progress = state.progress[today] ?? NO_PROGRESS
  const streak = currentStreak(state.streak, today)

  function setProgress(patch) {
    setState((s) => ({
      ...s,
      progress: {
        ...pruneProgress(s.progress, today),
        [today]: { ...(s.progress[today] ?? NO_PROGRESS), ...patch },
      },
    }))
  }

  function toggleSave(card, day = today) {
    const key = `${day}:${card.id}`
    setState((s) => ({
      ...s,
      saved: s.saved.some((item) => item.key === key)
        ? s.saved.filter((item) => item.key !== key)
        : [{ key, day, card }, ...s.saved],
    }))
  }

  function finish() {
    setState((s) => ({
      ...s,
      streak: completeDay(s.streak, today),
      progress: {
        ...s.progress,
        [today]: { ...(s.progress[today] ?? NO_PROGRESS), index: edition.cards.length, completed: true },
      },
    }))
  }

  let content
  if (view === 'saved') {
    content = <Saved saved={state.saved} onToggleSave={toggleSave} />
  } else if (!edition) {
    content = <p className="loading">Editie laden…</p>
  } else {
    const cards = edition.cards
    const total = cards.length
    const index = Math.min(progress.index, total)
    const quiz = cards.find((c) => c.type === 'quiz')

    if (index >= total) {
      const score = quiz
        ? quiz.questions.filter((q, i) => progress.answers[i] === q.answer).length
        : 0
      content = (
        <Done
          streak={streak}
          best={state.streak.best}
          score={score}
          total={quiz ? quiz.questions.length : 0}
          savedCount={state.saved.length}
          onReread={() => setProgress({ index: 0 })}
          onShowSaved={() => setView('saved')}
        />
      )
    } else {
      const card = cards[index]
      const isLast = index === total - 1
      const quizDone =
        card.type !== 'quiz' ||
        card.questions.every((_, i) => progress.answers[i] !== undefined && progress.answers[i] !== null)

      content = (
        <>
          <ol className="steps" aria-label={`Kaart ${index + 1} van ${total}`}>
            {cards.map((c, i) => (
              <li key={c.id} className={i < index ? 'is-done' : i === index ? 'is-current' : ''} />
            ))}
          </ol>
          {edition.isSample && index === 0 && (
            <p className="notice">Dit is voorbeeldinhoud. De echte bronnen sluiten we later aan.</p>
          )}
          {card.type === 'quiz' ? (
            <Quiz
              key={card.id}
              card={card}
              answers={progress.answers}
              onAnswer={(qi, oi) => {
                const answers = [...progress.answers]
                answers[qi] = oi
                setProgress({ answers })
              }}
            />
          ) : (
            <Card
              key={card.id}
              card={card}
              saved={state.saved.some((item) => item.key === `${today}:${card.id}`)}
              onToggleSave={toggleSave}
            />
          )}
          <nav className="pager">
            <button
              type="button"
              className="btn btn--ghost"
              disabled={index === 0}
              onClick={() => setProgress({ index: index - 1 })}
            >
              Vorige
            </button>
            <span className="pager__count">
              {index + 1} / {total}
            </span>
            <button
              type="button"
              className="btn"
              disabled={!quizDone}
              onClick={() => (isLast ? finish() : setProgress({ index: index + 1 }))}
            >
              {isLast ? 'Afronden' : 'Volgende'}
            </button>
          </nav>
        </>
      )
    }
  }

  return (
    <div className="app">
      <header className="top">
        <div>
          <h1>Kennis</h1>
          <p className="top__date">{formatLongDate(today)}</p>
        </div>
        <div className="top__right">
          <span className="streak" title="Dagreeks">
            <span aria-hidden="true">🔥</span> {streak}
            <span className="sr-only"> {streak === 1 ? 'dag' : 'dagen'} op rij</span>
          </span>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => setView(view === 'saved' ? 'edition' : 'saved')}
          >
            {view === 'saved' ? '← Editie' : `Bewaard (${state.saved.length})`}
          </button>
        </div>
      </header>
      <main>{content}</main>
    </div>
  )
}
