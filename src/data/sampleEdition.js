// Terugval voor als een bron onbereikbaar is (zie src/lib/edition.js).
// De nieuwskaarten zijn verzonnen plaatshouders; de geschiedeniskaart is feitelijk juist,
// maar hoort bij 15 november.
export const sampleNews = [
  {
    id: 'news-1',
    type: 'news',
    title: 'Voorbeeldkop: hier komt het eerste nieuwspunt',
    body: [
      'In de echte editie staat hier de korte samenvatting uit de RSS-feed: twee of drie zinnen, genoeg om te weten wat er speelt.',
    ],
    source: { name: 'Voorbeeldbron', url: null },
  },
  {
    id: 'news-2',
    type: 'news',
    title: 'Voorbeeldkop: het tweede nieuwspunt van de dag',
    body: [
      'Drie nieuwspunten, niet meer. Wie verder wil lezen tikt door naar de bron — maar de editie zelf houdt hier op.',
    ],
    source: { name: 'Voorbeeldbron', url: null },
  },
  {
    id: 'news-3',
    type: 'news',
    title: 'Voorbeeldkop: en het derde, dan is het nieuws klaar',
    body: [
      'Geen eindeloze lijst, geen “meer laden”. Na deze kaart ga je door naar geschiedenis, een weetje en de verdieping.',
    ],
    source: { name: 'Voorbeeldbron', url: null },
  },
]

export const sampleHistory = {
  card: {
    id: 'history-sample',
    type: 'history',
    year: '1889',
    title: 'Brazilië wordt een republiek',
    body: [
      'Op 15 november 1889 zet maarschalk Deodoro da Fonseca met een militaire staatsgreep keizer Pedro II af. Na 67 jaar keizerrijk wordt Brazilië een republiek; de keizerlijke familie vertrekt in ballingschap naar Europa.',
    ],
    source: {
      name: 'Wikipedia',
      url: 'https://nl.wikipedia.org/wiki/Geschiedenis_van_Brazili%C3%AB',
    },
  },
  question: {
    q: 'In welk jaar werd Brazilië een republiek?',
    options: ['1822', '1889', '1930'],
    answer: 1,
    explain: 'In 1889 werd keizer Pedro II afgezet. 1822 was het jaar van de onafhankelijkheid.',
  },
}
