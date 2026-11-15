import Card from './Card.jsx'
import { formatLongDate } from '../lib/date.js'

export default function Saved({ saved, onToggleSave }) {
  if (saved.length === 0) {
    return (
      <section className="empty">
        <h2>Nog niets bewaard</h2>
        <p>Tik op “☆ Bewaar” bij een kaart om hem hier terug te vinden.</p>
      </section>
    )
  }
  return (
    <section className="saved-list">
      {saved.map((item) => (
        <Card
          key={item.key}
          card={item.card}
          saved
          savedOn={formatLongDate(item.day)}
          onToggleSave={() => onToggleSave(item.card, item.day)}
        />
      ))}
    </section>
  )
}
