// Voorbeeldinhoud en terugval. Nieuws en geschiedenis worden vervangen door echte
// bronnen zodra die bereikbaar zijn (zie src/lib/edition.js).
// De nieuwskaarten zijn verzonnen plaatshouders; de overige kaarten zijn feitelijk juist.
export const sampleEdition = {
  cards: [
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
    {
      id: 'history-1',
      type: 'history',
      year: 1889,
      title: 'Brazilië wordt een republiek',
      body: [
        'Op 15 november 1889 zet maarschalk Deodoro da Fonseca met een militaire staatsgreep keizer Pedro II af. Na 67 jaar keizerrijk wordt Brazilië een republiek; de keizerlijke familie vertrekt in ballingschap naar Europa.',
      ],
      source: {
        name: 'Wikipedia',
        url: 'https://nl.wikipedia.org/wiki/Geschiedenis_van_Brazili%C3%AB',
      },
    },
    {
      id: 'fact-1',
      type: 'fact',
      title: 'Een octopus heeft drie harten',
      body: [
        'Twee harten pompen bloed door de kieuwen, het derde door de rest van het lichaam. Dat bloed is bovendien blauw: het zuurstof wordt vervoerd door het koperhoudende hemocyanine in plaats van het ijzerhoudende hemoglobine.',
      ],
    },
    {
      id: 'deepdive-1',
      type: 'deepdive',
      title: 'De Watersnoodramp van 1953',
      body: [
        'In de nacht van 31 januari op 1 februari 1953 viel een zware noordwesterstorm samen met springtij. Het water in de Noordzee werd opgestuwd tot ver boven de hoogte waarop de dijken berekend waren. In Zeeland, op de Zuid-Hollandse eilanden en in West-Brabant braken ze op honderden plaatsen door.',
        'In Nederland kwamen 1.836 mensen om het leven. Tienduizenden moesten worden geëvacueerd, grote delen van het zuidwesten stonden maandenlang onder water. Waarschuwingen bereikten veel dorpen niet: het was nacht, het was weekend, en telefoon- en radioverbindingen vielen weg.',
        'Nog geen drie weken later werd de Deltacommissie ingesteld. Haar advies leidde tot de Deltawerken: een stelsel van dammen en keringen dat de kustlijn honderden kilometers korter maakte. De Oosterscheldekering, het bekendste onderdeel, werd in 1986 geopend.',
        'De ramp veranderde hoe Nederland naar water kijkt: niet langer herstellen na een doorbraak, maar vooraf vastleggen hoe klein de kans op een overstroming mag zijn.',
      ],
      source: { name: 'Wikipedia', url: 'https://nl.wikipedia.org/wiki/Watersnood_van_1953' },
    },
    {
      id: 'quiz-1',
      type: 'quiz',
      title: 'Drie vragen over vandaag',
      questions: [
        {
          q: 'Hoeveel harten heeft een octopus?',
          options: ['Eén', 'Twee', 'Drie'],
          answer: 2,
          explain: 'Twee voor de kieuwen, één voor de rest van het lichaam.',
        },
        {
          about: 'history',
          q: 'In welk jaar werd Brazilië een republiek?',
          options: ['1822', '1889', '1930'],
          answer: 1,
          explain: 'In 1889 werd keizer Pedro II afgezet. 1822 was het jaar van de onafhankelijkheid.',
        },
        {
          q: 'Wat kwam er als direct gevolg van de Watersnoodramp?',
          options: ['De Afsluitdijk', 'De Deltawerken', 'De Flevopolders'],
          answer: 1,
          explain: 'De Afsluitdijk was er al sinds 1932; de Deltawerken volgden op 1953.',
        },
      ],
    },
  ],
}
