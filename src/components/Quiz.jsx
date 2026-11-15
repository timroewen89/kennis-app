import { CARD_TYPES } from '../lib/cardTypes.js'

// Alle drie de vragen op één kaart. Een antwoord staat vast zodra je het kiest.
export default function Quiz({ card, answers, onAnswer }) {
  return (
    <article className="card card--quiz">
      <header className="card__head">
        <span className="card__kicker">{CARD_TYPES.quiz.label}</span>
      </header>
      <h2 className="card__title">{card.title}</h2>
      {card.questions.map((question, qi) => {
        const chosen = answers[qi]
        const answered = chosen !== undefined && chosen !== null
        return (
          <fieldset key={qi} className="question">
            <legend>
              {qi + 1}. {question.q}
            </legend>
            <div className="options">
              {question.options.map((option, oi) => {
                let state = ''
                if (answered && oi === question.answer) state = 'is-correct'
                else if (answered && oi === chosen) state = 'is-wrong'
                return (
                  <button
                    key={oi}
                    type="button"
                    className={`option ${state}`}
                    disabled={answered}
                    aria-pressed={chosen === oi}
                    onClick={() => onAnswer(qi, oi)}
                  >
                    {option}
                    {state === 'is-correct' && <span aria-hidden="true"> ✓</span>}
                    {state === 'is-wrong' && <span aria-hidden="true"> ✗</span>}
                  </button>
                )
              })}
            </div>
            <p className="question__explain" aria-live="polite">
              {answered &&
                `${chosen === question.answer ? 'Goed.' : 'Niet goed.'} ${question.explain}`}
            </p>
          </fieldset>
        )
      })}
    </article>
  )
}
