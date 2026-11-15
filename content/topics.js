// De thema's waaruit je in de app kunt kiezen. Elk weetje en elke verdieping heeft er één ('topic').
export const TOPICS = [
  { id: 'nederland', name: 'Nederland' },
  { id: 'wereld', name: 'Wereldgeschiedenis' },
  { id: 'wetenschap', name: 'Wetenschap & techniek' },
  { id: 'natuur', name: 'Natuur & aarde' },
  { id: 'cultuur', name: 'Taal & cultuur' },
]

// Bronverwijzing naar een artikel op de Nederlandse Wikipedia.
export const wiki = (title) => ({ name: 'Wikipedia', url: `https://nl.wikipedia.org/wiki/${title}` })
