// Verdiepingen: een serieus onderwerp van vroeger, in een paar alinea's.
// Elke dag komt de volgende aan de beurt; na de laatste begint de lijst opnieuw.
// 'answer' is de positie van het goede antwoord in 'options', geteld vanaf 0.
const wiki = (title) => ({ name: 'Wikipedia', url: `https://nl.wikipedia.org/wiki/${title}` })

export const deepdives = [
  {
    id: 'watersnood-1953',
    title: 'De Watersnoodramp van 1953',
    body: [
      'In de nacht van 31 januari op 1 februari 1953 viel een zware noordwesterstorm samen met springtij. Het water in de Noordzee werd opgestuwd tot ver boven de hoogte waarop de dijken berekend waren. In Zeeland, op de Zuid-Hollandse eilanden en in West-Brabant braken ze op honderden plaatsen door.',
      'In Nederland kwamen 1.836 mensen om het leven. Tienduizenden moesten worden geëvacueerd, grote delen van het zuidwesten stonden maandenlang onder water. Waarschuwingen bereikten veel dorpen niet: het was nacht, het was weekend, en telefoon- en radioverbindingen vielen weg.',
      'Nog geen drie weken later werd de Deltacommissie ingesteld. Haar advies leidde tot de Deltawerken: een stelsel van dammen en keringen dat de kustlijn honderden kilometers korter maakte. De Oosterscheldekering, het bekendste onderdeel, werd in 1986 geopend.',
      'De ramp veranderde hoe Nederland naar water kijkt: niet langer herstellen na een doorbraak, maar vooraf vastleggen hoe klein de kans op een overstroming mag zijn.',
    ],
    source: wiki('Watersnood_van_1953'),
    question: {
      q: 'Wat kwam er als direct gevolg van de Watersnoodramp?',
      options: ['De Afsluitdijk', 'De Deltawerken', 'De Flevopolders'],
      answer: 1,
      explain: 'De Afsluitdijk was er al sinds 1932; de Deltawerken volgden op 1953.',
    },
  },
  {
    id: 'zwarte-dood',
    title: 'De Zwarte Dood',
    body: [
      'In 1347 bereikte de pest Europa via handelsschepen uit het Zwarte Zeegebied. Binnen vier jaar trok de ziekte over vrijwel het hele continent. Schattingen lopen uiteen, maar een derde tot de helft van de Europese bevolking overleefde het niet.',
      'De veroorzaker was de bacterie Yersinia pestis, verspreid door vlooien op ratten en waarschijnlijk ook van mens op mens. Tijdgenoten wisten dat niet. Ze zochten de oorzaak in bedorven lucht, de stand van de planeten of de toorn van God. In veel steden kregen Joden de schuld en werden hele gemeenschappen vermoord.',
      'De gevolgen reikten verder dan de sterfte zelf. Arbeid werd schaars, waardoor boeren en ambachtslieden hogere lonen en meer vrijheid konden eisen. Het oude stelsel van horigheid raakte in West-Europa in verval.',
      'De pest bleef eeuwenlang terugkomen. Uit die tijd stammen maatregelen die nog steeds bestaan, zoals de quarantaine: schepen moesten in Venetië veertig dagen wachten voor ze mochten aanleggen.',
    ],
    source: wiki('Zwarte_Dood'),
    question: {
      q: 'Welk deel van de Europese bevolking stierf naar schatting aan de Zwarte Dood?',
      options: ['Ongeveer een twintigste', 'Ongeveer een tiende', 'Een derde tot de helft'],
      answer: 2,
      explain: 'Schattingen lopen uiteen van een derde tot de helft van de bevolking.',
    },
  },
  {
    id: 'boekdrukkunst',
    title: 'Gutenberg en de boekdrukkunst',
    body: [
      'Rond 1450 ontwikkelde Johannes Gutenberg in Mainz een manier om te drukken met losse metalen letters. Die konden snel worden gegoten, gezet en hergebruikt. Zijn Bijbel, voltooid rond 1455, verscheen in ongeveer 180 exemplaren, een aantal waar kopiisten jaren over gedaan zouden hebben.',
      'De techniek verspreidde zich razendsnel. Rond 1500 stonden er drukpersen in honderden Europese steden en waren er naar schatting twintig miljoen boeken gedrukt. Boeken werden goedkoper, en teksten waren voor het eerst in grote aantallen precies gelijk.',
      'Dat had grote gevolgen. De stellingen van Luther uit 1517 gingen binnen weken door heel Duitsland, iets wat een eeuw eerder ondenkbaar was. Ook wetenschappers konden nu op elkaars werk voortbouwen met dezelfde tabellen, kaarten en tekeningen voor zich.',
      'Drukken met losse letters bestond al eerder in China en Korea. Gutenbergs combinatie van gietvorm, inkt en pers paste goed bij het Latijnse alfabet, met zijn kleine aantal tekens, en bij een markt die om boeken vroeg.',
    ],
    source: wiki('Boekdrukkunst'),
    question: {
      q: 'Wat was het vernieuwende aan Gutenbergs manier van drukken?',
      options: ['Losse, herbruikbare metalen letters', 'Papier in plaats van perkament', 'Drukken in kleur'],
      answer: 0,
      explain: 'Losse metalen letters konden snel gegoten, gezet en opnieuw gebruikt worden.',
    },
  },
  {
    id: 'tachtigjarige-oorlog',
    title: 'De Tachtigjarige Oorlog',
    body: [
      'In de zestiende eeuw hoorden de Nederlanden bij het rijk van de Spaanse koning Filips II. Onvrede over hoge belastingen, de vervolging van protestanten en het inperken van oude rechten kwam in 1566 tot uitbarsting in de Beeldenstorm. Filips stuurde de hertog van Alva om de orde te herstellen.',
      'Alva’s harde optreden werkte averechts. In 1568 begon onder leiding van Willem van Oranje de Opstand. In 1581 verklaarden de opstandige gewesten met het Plakkaat van Verlatinghe dat Filips zijn recht om te regeren had verspeeld: een vorst die zijn onderdanen onderdrukt, hoeft niet gehoorzaamd te worden.',
      'Uit de opstand groeide de Republiek der Zeven Verenigde Nederlanden. Terwijl de oorlog doorging, met een onderbreking tijdens het Twaalfjarig Bestand, werd die een van de rijkste handelsstaten van Europa.',
      'Met de Vrede van Münster in 1648 erkende Spanje de Republiek als onafhankelijke staat. De zuidelijke Nederlanden bleven Spaans; die scheiding ligt aan de basis van de latere grens tussen Nederland en België.',
    ],
    source: wiki('Tachtigjarige_Oorlog'),
    question: {
      q: 'Met welke vrede eindigde de Tachtigjarige Oorlog?',
      options: ['De Vrede van Utrecht', 'De Vrede van Münster', 'De Unie van Utrecht'],
      answer: 1,
      explain: 'De Vrede van Münster in 1648; de Unie van Utrecht (1579) was een verbond tussen gewesten.',
    },
  },
  {
    id: 'hongerwinter',
    title: 'De Hongerwinter',
    body: [
      'In september 1944 was het zuiden van Nederland bevrijd, maar het westen niet. Na de spoorwegstaking die de regering in Londen had afgekondigd, blokkeerde de bezetter wekenlang de aanvoer van voedsel naar de grote steden. Toen de blokkade werd versoepeld, lagen de vaarwegen dichtgevroren.',
      'De rantsoenen daalden in de eerste maanden van 1945 tot minder dan 500 kilocalorieën per dag, een kwart van wat een volwassene nodig heeft. Mensen aten tulpenbollen en suikerbieten en trokken op hongertochten naar het platteland om spullen te ruilen voor eten. Zeker 20.000 mensen stierven.',
      'Hulp kwam laat. Vanaf eind april 1945 wierpen geallieerde bommenwerpers voedselpakketten af boven West-Nederland, kort voor de bevrijding op 5 mei.',
      'De Hongerwinter heeft ook de geneeskunde iets geleerd. Kinderen die in die maanden in de baarmoeder zaten, bleken decennia later vaker hart- en vaatziekten en diabetes te hebben. Het is een van de duidelijkste aanwijzingen dat omstandigheden vóór de geboorte een leven lang doorwerken.',
    ],
    source: wiki('Hongerwinter'),
    question: {
      q: 'Wat bleek later uit onderzoek naar kinderen die tijdens de Hongerwinter werden verwacht?',
      options: [
        'Ze werden gemiddeld langer',
        'Ze hadden later vaker hart- en vaatziekten en diabetes',
        'Er was geen verschil met andere kinderen',
      ],
      answer: 1,
      explain: 'Ondervoeding vóór de geboorte bleek tientallen jaren later nog door te werken.',
    },
  },
  {
    id: 'afschaffing-slavernij',
    title: 'De afschaffing van de slavernij in Suriname en op de Antillen',
    body: [
      'Op 1 juli 1863 schafte Nederland de slavernij af in Suriname en op de Nederlandse Antillen. Ongeveer 34.000 mensen in Suriname en 12.000 op de eilanden werden die dag voor de wet vrij. Nederland was laat: Groot-Brittannië had die stap dertig jaar eerder gezet, Frankrijk in 1848.',
      'De schadeloosstelling ging naar de eigenaren, niet naar de mensen die tot slaaf waren gemaakt. De staat betaalde in Suriname 300 gulden per vrijgemaakte persoon aan de plantagehouders.',
      'In Suriname was de vrijheid bovendien niet meteen volledig. Wie op een plantage had gewerkt, moest onder staatstoezicht nog tien jaar tegen loon arbeid blijven verrichten. Pas in 1873 kwam daar een einde aan.',
      'De afschaffing wordt elk jaar op 1 juli herdacht en gevierd met Keti Koti, wat ‘verbroken ketenen’ betekent. In 2022 bood de Nederlandse regering excuses aan voor het slavernijverleden.',
    ],
    source: wiki('Geschiedenis_van_de_Nederlandse_slavernij'),
    question: {
      q: 'Wie kreeg in 1863 een schadeloosstelling van de Nederlandse staat?',
      options: ['De vrijgemaakte mensen', 'De eigenaren', 'Niemand'],
      answer: 1,
      explain: 'De eigenaren kregen in Suriname 300 gulden per vrijgemaakte persoon.',
    },
  },
  {
    id: 'spaanse-griep',
    title: 'De Spaanse griep',
    body: [
      'Tussen 1918 en 1920 trok een griepvirus in enkele golven over de wereld. Naar schatting raakte een derde van de wereldbevolking besmet. Het aantal doden wordt meestal op 20 tot 50 miljoen geschat, meer dan er in de Eerste Wereldoorlog sneuvelden.',
      'De naam is misleidend. De ziekte begon vrijwel zeker niet in Spanje. Dat land was neutraal en kende geen oorlogscensuur, dus Spaanse kranten schreven er vrijuit over, terwijl de oorlogvoerende landen het nieuws stilhielden om het moreel niet te schaden.',
      'Ongewoon was wie er stierven. Griep treft doorgaans vooral ouderen en heel jonge kinderen, maar deze variant was juist dodelijk voor gezonde volwassenen tussen de twintig en veertig. Troepenverplaatsingen en overvolle kazernes hielpen het virus de wereld rond.',
      'Antibiotica en griepvaccins bestonden nog niet. Steden die vroeg scholen en theaters sloten en bijeenkomsten verboden, hadden aantoonbaar minder doden. Die ervaring is een eeuw later opnieuw bestudeerd.',
    ],
    source: wiki('Spaanse_griep'),
    question: {
      q: 'Waarom heet de Spaanse griep zo?',
      options: [
        'Het virus ontstond in Spanje',
        'Spanje had de meeste doden',
        'Spaanse kranten schreven er vrijuit over',
      ],
      answer: 2,
      explain: 'Spanje was neutraal en had geen oorlogscensuur, dus daar kwam het nieuws vandaan.',
    },
  },
  {
    id: 'berlijnse-muur',
    title: 'De Berlijnse Muur',
    body: [
      'Na de Tweede Wereldoorlog was Duitsland verdeeld in een westelijk en een oostelijk deel, en Berlijn ook. Via West-Berlijn verlieten miljoenen Oost-Duitsers hun land. In de nacht van 12 op 13 augustus 1961 sloot de DDR de grens af, eerst met prikkeldraad, daarna met beton.',
      'De Muur liep ongeveer 155 kilometer rond heel West-Berlijn. Families en straten werden van de ene op de andere dag gescheiden. Bij pogingen om over te steken kwamen in 28 jaar zeker 140 mensen om het leven.',
      'In 1989 groeide het protest in Oost-Duitsland, terwijl Hongarije zijn grens met het Westen opende. Op 9 november zei een partijwoordvoerder op een persconferentie, slecht voorbereid, dat nieuwe reisregels ‘per direct’ golden. Diezelfde avond stroomden duizenden mensen naar de grensposten, die uiteindelijk opengingen.',
      'Minder dan een jaar later, op 3 oktober 1990, was Duitsland herenigd. De val van de Muur geldt als het symbolische einde van de Koude Oorlog.',
    ],
    source: wiki('Berlijnse_Muur'),
    question: {
      q: 'In welk jaar viel de Berlijnse Muur?',
      options: ['1961', '1989', '1991'],
      answer: 1,
      explain: 'Op 9 november 1989; in 1961 werd hij gebouwd.',
    },
  },
]
