// Het eindpunt: hier houdt de editie op. Geen "meer laden".
export default function Done({ streak, best, score, total, savedCount, onReread, onShowSaved }) {
  return (
    <section className="done">
      <p className="done__mark" aria-hidden="true">✓</p>
      <h2>Klaar voor vandaag</h2>
      <p className="done__lead">Je bent bij. Morgen staat er een nieuwe editie klaar.</p>
      <dl className="stats">
        <div>
          <dt>Dagreeks</dt>
          <dd>
            {streak} {streak === 1 ? 'dag' : 'dagen'}
          </dd>
        </div>
        <div>
          <dt>Quiz</dt>
          <dd>
            {score} van {total}
          </dd>
        </div>
        <div>
          <dt>Langste reeks</dt>
          <dd>{best}</dd>
        </div>
      </dl>
      <div className="done__actions">
        <button type="button" className="btn btn--ghost" onClick={onReread}>
          Editie teruglezen
        </button>
        {savedCount > 0 && (
          <button type="button" className="btn btn--ghost" onClick={onShowSaved}>
            Bewaard ({savedCount})
          </button>
        )}
      </div>
    </section>
  )
}
