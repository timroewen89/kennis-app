// Eén plek waar de editie van de dag vandaan komt.
// Nu: vaste voorbeeldinhoud. Later vervangen we de onderdelen één voor één
// door echte bronnen (NOS-RSS, Wikipedia 'On this day', eigen weetjes/verdiepingen).
import { sampleEdition } from '../data/sampleEdition.js'

export async function getEdition(day) {
  return { ...sampleEdition, day }
}
