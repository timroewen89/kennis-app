import { CARD_TYPES } from '../lib/cardTypes.js'

// Eén inhoudskaart (nieuws, geschiedenis, weetje of verdieping).
export default function Card({ card, saved, onToggleSave, savedOn }) {
  const { label } = CARD_TYPES[card.type]
  return (
    <article className={`card card--${card.type}`}>
      <header className="card__head">
        <span className="card__kicker">{label}</span>
        {onToggleSave && (
          <button
            type="button"
            className="save"
            aria-pressed={saved}
            onClick={() => onToggleSave(card)}
          >
            {saved ? '★ Bewaard' : '☆ Bewaar'}
          </button>
        )}
      </header>
      {/* lang: zodat schermlezers en afbreking de taal van de bron volgen */}
      <div lang={card.lang}>
        {card.year && <p className="card__year">{card.year}</p>}
        <h2 className="card__title">{card.title}</h2>
        {card.body.map((p, i) => (
          <p key={i} className="card__body">
            {p}
          </p>
        ))}
      </div>
      <footer className="card__foot">
        {card.source &&
          (card.source.url ? (
            <a href={card.source.url} target="_blank" rel="noopener noreferrer">
              Bron: {card.source.name} ↗
            </a>
          ) : (
            <span>Bron: {card.source.name}</span>
          ))}
        {savedOn && <span>Bewaard op {savedOn}</span>}
      </footer>
    </article>
  )
}
