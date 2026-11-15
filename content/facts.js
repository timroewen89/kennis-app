// Weetjes. Elke dag komt de volgende aan de beurt; na de laatste begint de lijst opnieuw.
// Een nieuw weetje toevoegen = een blok onderaan toevoegen (zie README).
// 'answer' is de positie van het goede antwoord in 'options', geteld vanaf 0.
export const facts = [
  {
    id: 'octopus-harten',
    title: 'Een octopus heeft drie harten',
    body: [
      'Twee harten pompen bloed door de kieuwen, het derde door de rest van het lichaam. Dat bloed is bovendien blauw: het zuurstof wordt vervoerd door het koperhoudende hemocyanine in plaats van het ijzerhoudende hemoglobine.',
    ],
    question: {
      q: 'Hoeveel harten heeft een octopus?',
      options: ['Eén', 'Twee', 'Drie'],
      answer: 2,
      explain: 'Twee voor de kieuwen, één voor de rest van het lichaam.',
    },
  },
  {
    id: 'honing',
    title: 'Honing bederft vrijwel nooit',
    body: [
      'Honing bevat zo weinig water en is zo zuur dat bacteriën en schimmels er niet in kunnen groeien. In Egyptische graven zijn potten honing van duizenden jaren oud gevonden die nog eetbaar waren.',
    ],
    question: {
      q: 'Waarom bederft honing nauwelijks?',
      options: ['Er zit te weinig water in', 'Bijen voegen zout toe', 'Het is altijd gepasteuriseerd'],
      answer: 0,
      explain: 'Door het lage watergehalte en de zuurgraad kunnen bacteriën er niet in groeien.',
    },
  },
  {
    id: 'venus-dag',
    title: 'Op Venus duurt een dag langer dan een jaar',
    body: [
      'Venus draait uitzonderlijk traag om haar as: één omwenteling duurt ongeveer 243 aardse dagen. Een rondje om de zon is al na zo’n 225 dagen klaar. Ze draait ook nog eens de andere kant op dan de meeste planeten.',
    ],
    question: {
      q: 'Wat duurt op Venus het langst?',
      options: ['Eén omwenteling om haar as', 'Eén rondje om de zon', 'Ze duren precies even lang'],
      answer: 0,
      explain: 'Een omwenteling duurt ongeveer 243 aardse dagen, een baan om de zon ongeveer 225.',
    },
  },
  {
    id: 'banaan-bes',
    title: 'Een banaan is een bes, een aardbei niet',
    body: [
      'In de plantkunde is een bes een vlezige vrucht die uit één vruchtbeginsel groeit, met de zaden in het vruchtvlees. Bananen, druiven en tomaten voldoen daaraan. De aardbei is een schijnvrucht: het rode deel is de opgezwollen bloembodem, de echte vruchtjes zijn de pitjes aan de buitenkant.',
    ],
    question: {
      q: 'Welke van deze drie is voor een plantkundige een bes?',
      options: ['Aardbei', 'Banaan', 'Framboos'],
      answer: 1,
      explain: 'De banaan is een bes; aardbei en framboos zijn dat botanisch gezien niet.',
    },
  },
  {
    id: 'eiffeltoren-zomer',
    title: 'De Eiffeltoren is in de zomer hoger',
    body: [
      'IJzer zet uit als het warm wordt. Op hete zomerdagen kan de top van de Eiffeltoren daardoor tot ongeveer 15 centimeter hoger komen dan in de winter. De toren buigt ook een paar centimeter van de zon af, omdat de zonkant sterker uitzet.',
    ],
    question: {
      q: 'Waardoor is de Eiffeltoren ’s zomers hoger?',
      options: ['Het ijzer zet uit door de warmte', 'De grond eronder zwelt op', 'Er wordt een antenne bijgeplaatst'],
      answer: 0,
      explain: 'Het ijzer zet uit; dat scheelt tot ongeveer 15 centimeter.',
    },
  },
  {
    id: 'zonlicht',
    title: 'Zonlicht is ruim acht minuten onderweg',
    body: [
      'Licht legt bijna 300.000 kilometer per seconde af, maar de zon staat gemiddeld 150 miljoen kilometer ver. Het licht dat je nu ziet, vertrok dus ongeveer 8 minuten en 20 seconden geleden. Zou de zon nu doven, dan merkten we dat pas na die tijd.',
    ],
    question: {
      q: 'Hoe lang doet zonlicht over de reis naar de aarde?',
      options: ['Ongeveer 8 seconden', 'Ongeveer 8 minuten', 'Ongeveer 8 uur'],
      answer: 1,
      explain: 'Ongeveer 8 minuten en 20 seconden.',
    },
  },
  {
    id: 'wombat',
    title: 'Wombats poepen in blokjes',
    body: [
      'De keutels van een wombat zijn bijna kubusvormig. Dat komt door de darmwand, die op sommige plekken stugger is dan op andere en de inhoud zo in hoeken kneedt. De dieren leggen de blokjes op stenen en boomstronken om hun gebied te markeren.',
    ],
    question: {
      q: 'Welk dier heeft kubusvormige keutels?',
      options: ['De koala', 'De wombat', 'Het vogelbekdier'],
      answer: 1,
      explain: 'De wombat; de vorm ontstaat in de darm.',
    },
  },
  {
    id: 'oxford-azteken',
    title: 'De universiteit van Oxford is ouder dan het Azteekse rijk',
    body: [
      'In Oxford werd al rond 1096 lesgegeven. De Azteken stichtten hun hoofdstad Tenochtitlan pas in 1325, ruim twee eeuwen later. Geschiedenis loopt op verschillende plekken minder gelijk op dan je zou denken.',
    ],
    question: {
      q: 'Wat is ouder?',
      options: ['De Azteekse hoofdstad Tenochtitlan', 'De universiteit van Oxford', 'Ze zijn even oud'],
      answer: 1,
      explain: 'In Oxford werd rond 1096 al lesgegeven; Tenochtitlan dateert van 1325.',
    },
  },
  {
    id: 'botten',
    title: 'Een baby heeft meer botten dan een volwassene',
    body: [
      'Een pasgeboren baby heeft ongeveer 300 botten en botdelen, waarvan een groot deel nog uit kraakbeen bestaat. Tijdens het opgroeien vergroeien veel daarvan met elkaar, bijvoorbeeld in de schedel. Een volwassene houdt er 206 over.',
    ],
    question: {
      q: 'Hoeveel botten heeft een volwassen mens?',
      options: ['106', '206', '306'],
      answer: 1,
      explain: 'Een volwassene heeft 206 botten; een baby begint met ongeveer 300.',
    },
  },
  {
    id: 'haaien-bomen',
    title: 'Haaien zijn ouder dan bomen',
    body: [
      'De oudste sporen van haaiachtige vissen zijn ruim 400 miljoen jaar oud. De eerste echte bomen verschenen pas ongeveer 385 miljoen jaar geleden. Haaien hebben sindsdien meerdere massa-uitstervingen overleefd.',
    ],
    question: {
      q: 'Wat bestond er het eerst?',
      options: ['Bomen', 'Haaien', 'Dinosauriërs'],
      answer: 1,
      explain: 'Haaien: ruim 400 miljoen jaar geleden, nog vóór de eerste bomen.',
    },
  },
  {
    id: 'bliksem',
    title: 'Bliksem is heter dan het oppervlak van de zon',
    body: [
      'Een bliksemflits verhit de lucht eromheen in een fractie van een seconde tot zo’n 30.000 graden Celsius. Het oppervlak van de zon is ongeveer 5.500 graden. De lucht zet door die hitte explosief uit, en dat hoor je als donder.',
    ],
    question: {
      q: 'Wat veroorzaakt het geluid van donder?',
      options: ['Wolken die botsen', 'Lucht die door de hitte explosief uitzet', 'De inslag in de grond'],
      answer: 1,
      explain: 'De lucht rond de flits wordt ongeveer 30.000 graden en zet razendsnel uit.',
    },
  },
  {
    id: 'eenhoorn',
    title: 'Het nationale dier van Schotland is de eenhoorn',
    body: [
      'De eenhoorn staat al sinds de middeleeuwen in het Schotse koninklijke wapen. In de heraldiek gold het fabeldier als trots en ontembaar. In het wapen van het Verenigd Koninkrijk staat hij nog altijd tegenover de Engelse leeuw.',
    ],
    question: {
      q: 'Wat is het nationale dier van Schotland?',
      options: ['Het edelhert', 'De eenhoorn', 'De steenarend'],
      answer: 1,
      explain: 'De eenhoorn, die ook in het Britse wapen staat.',
    },
  },
  {
    id: 'cleopatra',
    title: 'Cleopatra leefde dichter bij de maanlanding dan bij de bouw van de piramides',
    body: [
      'De Grote Piramide van Gizeh werd rond 2560 voor Christus gebouwd. Cleopatra stierf in 30 voor Christus, ongeveer 2.500 jaar later. Van haar dood tot de maanlanding in 1969 is het ongeveer 2.000 jaar.',
    ],
    question: {
      q: 'Wat ligt in de tijd het dichtst bij Cleopatra?',
      options: ['De bouw van de Grote Piramide', 'De eerste maanlanding', 'Het ligt precies even ver'],
      answer: 1,
      explain: 'Ongeveer 2.000 jaar tot de maanlanding, tegen 2.500 jaar sinds de piramide.',
    },
  },
  {
    id: 'stille-oceaan',
    title: 'De Stille Oceaan is groter dan al het land samen',
    body: [
      'De Stille Oceaan beslaat ongeveer 165 miljoen vierkante kilometer. Alle continenten en eilanden bij elkaar komen op ongeveer 149 miljoen. Op zijn breedst beslaat de oceaan bijna de halve aardbol.',
    ],
    question: {
      q: 'Wat is groter?',
      options: ['Al het land op aarde samen', 'De Stille Oceaan', 'De Atlantische Oceaan'],
      answer: 1,
      explain: 'De Stille Oceaan: ongeveer 165 tegen 149 miljoen vierkante kilometer.',
    },
  },
  {
    id: 'bomen-sterren',
    title: 'Er zijn meer bomen op aarde dan sterren in de Melkweg',
    body: [
      'Onderzoekers schatten in 2015 dat er ongeveer 3 biljoen bomen op aarde staan, dus 3.000 miljard. De Melkweg telt naar schatting 100 tot 400 miljard sterren. Sinds het begin van de landbouw is het aantal bomen wel bijna gehalveerd.',
    ],
    question: {
      q: 'Waar zijn er meer van?',
      options: ['Sterren in de Melkweg', 'Bomen op aarde', 'Het is ongeveer gelijk'],
      answer: 1,
      explain: 'Ongeveer 3.000 miljard bomen tegen hooguit 400 miljard sterren.',
    },
  },
]
