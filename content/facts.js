// Weetjes. Elke dag komt de volgende aan de beurt; na de laatste begint de lijst opnieuw.
// De volgorde wisselt de thema's af. Een nieuw weetje toevoegen = een blok toevoegen (zie README).
// 'topic' is een thema uit content/topics.js.
// 'answer' is de positie van het goede antwoord in 'options', geteld vanaf 0.
import { wiki } from './topics.js'

export const facts = [
  // ---------- ronde 1 ----------
  {
    id: 'laagste-punt',
    topic: 'nederland',
    title: 'Het laagste punt van Nederland ligt bijna zeven meter onder zeeniveau',
    body: [
      'In de Zuidplaspolder, bij Nieuwerkerk aan den IJssel, ligt het land 6,76 meter onder NAP. Zonder dijken en gemalen zou het er permanent onder water staan. Ongeveer een kwart van Nederland ligt onder zeeniveau.',
    ],
    source: wiki('Zuidplaspolder'),
    question: {
      q: 'Hoe diep onder NAP ligt het laagste punt van Nederland?',
      options: ['Ongeveer 2 meter', 'Bijna 7 meter', 'Ruim 12 meter'],
      answer: 1,
      explain: 'Het ligt 6,76 meter onder NAP, in de Zuidplaspolder.',
    },
  },
  {
    id: 'octopus-harten',
    topic: 'natuur',
    title: 'Een octopus heeft drie harten',
    body: [
      'Twee harten pompen bloed door de kieuwen, het derde door de rest van het lichaam. Dat bloed is bovendien blauw: het zuurstof wordt vervoerd door het koperhoudende hemocyanine in plaats van het ijzerhoudende hemoglobine.',
    ],
    source: wiki('Octopoda'),
    question: {
      q: 'Hoeveel harten heeft een octopus?',
      options: ['Eén', 'Twee', 'Drie'],
      answer: 2,
      explain: 'Twee voor de kieuwen, één voor de rest van het lichaam.',
    },
  },
  {
    id: 'oxford-azteken',
    topic: 'wereld',
    title: 'De universiteit van Oxford is ouder dan het Azteekse rijk',
    body: [
      'In Oxford werd al rond 1096 lesgegeven. De Azteken stichtten hun hoofdstad Tenochtitlan volgens de overlevering pas in 1325, ruim twee eeuwen later. Geschiedenis loopt op verschillende plekken minder gelijk op dan je zou denken.',
    ],
    source: wiki('Universiteit_van_Oxford'),
    question: {
      q: 'Wat is ouder?',
      options: ['De Azteekse hoofdstad Tenochtitlan', 'De universiteit van Oxford', 'Ze zijn even oud'],
      answer: 1,
      explain: 'In Oxford werd rond 1096 al lesgegeven; Tenochtitlan is volgens de overlevering in 1325 gesticht.',
    },
  },
  {
    id: 'venus-dag',
    topic: 'wetenschap',
    title: 'Op Venus duurt één omwenteling langer dan een jaar',
    body: [
      'Venus draait uitzonderlijk traag om haar as: één omwenteling duurt ongeveer 243 aardse dagen. Een rondje om de zon is al na zo’n 225 dagen klaar. Ze draait ook nog eens de andere kant op dan de meeste planeten. Van zonsopkomst tot zonsopkomst duurt het er daardoor korter: ongeveer 117 aardse dagen.',
    ],
    source: wiki('Venus_(planeet)'),
    question: {
      q: 'Wat duurt op Venus het langst?',
      options: ['Eén omwenteling om haar as', 'Eén rondje om de zon', 'Ze duren precies even lang'],
      answer: 0,
      explain: 'Een omwenteling duurt ongeveer 243 aardse dagen, een baan om de zon ongeveer 225.',
    },
  },
  {
    id: 'eenhoorn',
    topic: 'cultuur',
    title: 'Het nationale dier van Schotland is de eenhoorn',
    body: [
      'De eenhoorn staat al sinds de middeleeuwen in het Schotse koninklijke wapen. In de heraldiek gold het fabeldier als trots en ontembaar. In het wapen van het Verenigd Koninkrijk staat hij nog altijd tegenover de Engelse leeuw.',
    ],
    source: wiki('Eenhoorn_(fabeldier)'),
    question: {
      q: 'Wat is het nationale dier van Schotland?',
      options: ['Het edelhert', 'De eenhoorn', 'De steenarend'],
      answer: 1,
      explain: 'De eenhoorn, die ook in het Britse wapen staat.',
    },
  },
  // ---------- ronde 2 ----------
  {
    id: 'hunebedden',
    topic: 'nederland',
    title: 'De Drentse hunebedden zijn ouder dan de piramides',
    body: [
      'De hunebedden zijn grafkamers van zwerfkeien, gebouwd door boeren van de trechterbekercultuur tussen ongeveer 3400 en 3000 voor Christus. Dat is eeuwen vóór de piramides van Gizeh. Nederland telt er nog 54: 52 in Drenthe en 2 in Groningen.',
    ],
    source: wiki('Hunebed'),
    question: {
      q: 'Hoeveel hunebedden zijn er in Nederland bewaard gebleven?',
      options: ['14', '54', '154'],
      answer: 1,
      explain: 'Het zijn er 54, waarvan 52 in Drenthe.',
    },
  },
  {
    id: 'honing',
    topic: 'natuur',
    title: 'Honing bederft vrijwel nooit',
    body: [
      'Honing bevat zo weinig water en is zo zuur dat bacteriën en schimmels er niet in kunnen groeien. Goed afgesloten blijft honing daardoor jarenlang goed. Het bekende verhaal dat in Egyptische graven nog eetbare honing van duizenden jaren oud is gevonden, is nooit bewezen.',
    ],
    source: wiki('Honing'),
    question: {
      q: 'Waarom bederft honing nauwelijks?',
      options: ['Er zit te weinig water in', 'Bijen voegen zout toe', 'Het is altijd gepasteuriseerd'],
      answer: 0,
      explain: 'Door het lage watergehalte en de zuurgraad kunnen bacteriën er niet in groeien.',
    },
  },
  {
    id: 'cleopatra',
    topic: 'wereld',
    title: 'Cleopatra leefde dichter bij de maanlanding dan bij de bouw van de piramides',
    body: [
      'De Grote Piramide van Gizeh werd rond 2560 voor Christus gebouwd. Cleopatra stierf in 30 voor Christus, ongeveer 2.500 jaar later. Van haar dood tot de maanlanding in 1969 is het ongeveer 2.000 jaar.',
    ],
    source: wiki('Cleopatra_VII'),
    question: {
      q: 'Wat ligt in de tijd het dichtst bij Cleopatra?',
      options: ['De bouw van de Grote Piramide', 'De eerste maanlanding', 'Het ligt precies even ver'],
      answer: 1,
      explain: 'Ongeveer 2.000 jaar tot de maanlanding, tegen 2.500 jaar sinds de piramide.',
    },
  },
  {
    id: 'eiffeltoren-zomer',
    topic: 'wetenschap',
    title: 'De Eiffeltoren is in de zomer hoger',
    body: [
      'IJzer zet uit als het warm wordt. Op hete zomerdagen is de Eiffeltoren daardoor iets hoger dan in de winter: schattingen lopen van een paar centimeter tot ongeveer 15 centimeter. De top buigt ook van de zon af, omdat de zonkant sterker uitzet; dat kan ruim 15 centimeter schelen.',
    ],
    source: wiki('Eiffeltoren'),
    question: {
      q: 'Waardoor is de Eiffeltoren ’s zomers hoger?',
      options: ['Het ijzer zet uit door de warmte', 'De grond eronder zwelt op', 'Er wordt een antenne bijgeplaatst'],
      answer: 0,
      explain: 'Het ijzer zet uit door de warmte; schattingen lopen op tot ongeveer 15 centimeter.',
    },
  },
  {
    id: 'langste-plaatsnaam',
    topic: 'cultuur',
    title: 'De langste plaatsnaam van Europa telt 58 letters',
    body: [
      'Het dorp Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch ligt op het eiland Anglesey in Wales. De naam is in de negentiende eeuw bewust zo lang gemaakt om reizigers naar het treinstation te lokken. Inwoners zeggen meestal gewoon Llanfairpwll.',
    ],
    source: wiki('Llanfairpwllgwyngyll'),
    question: {
      q: 'Waarom kreeg het Welshe dorp zo’n lange naam?',
      options: ['Als publiciteitsstunt', 'Het is een oude Keltische toverspreuk', 'Door een fout van een ambtenaar'],
      answer: 0,
      explain: 'De naam werd in de negentiende eeuw bedacht om bezoekers te trekken.',
    },
  },
  // ---------- ronde 3 ----------
  {
    id: 'flevoland',
    topic: 'nederland',
    title: 'Flevoland bestaat pas sinds 1986 als provincie',
    body: [
      'De twaalfde provincie werd op 1 januari 1986 opgericht en ligt vrijwel helemaal op de bodem van de vroegere Zuiderzee. De Noordoostpolder viel droog in 1942, Oostelijk Flevoland in 1957 en Zuidelijk Flevoland in 1968.',
    ],
    source: wiki('Flevoland'),
    question: {
      q: 'Sinds welk jaar is Flevoland een provincie?',
      options: ['1942', '1968', '1986'],
      answer: 2,
      explain: 'Sinds 1 januari 1986; het land zelf viel tussen 1942 en 1968 droog.',
    },
  },
  {
    id: 'banaan-bes',
    topic: 'natuur',
    title: 'Een banaan is een bes, een aardbei niet',
    body: [
      'In de plantkunde is een bes een vlezige vrucht die uit één vruchtbeginsel groeit, met de zaden in het vruchtvlees. Bananen, druiven en tomaten voldoen daaraan. De aardbei is een schijnvrucht: het rode deel is de opgezwollen bloembodem, de echte vruchtjes zijn de pitjes aan de buitenkant.',
    ],
    source: wiki('Bes_(botanisch)'),
    question: {
      q: 'Welke van deze drie is voor een plantkundige een bes?',
      options: ['Aardbei', 'Banaan', 'Framboos'],
      answer: 1,
      explain: 'De banaan is een bes; aardbei en framboos zijn dat botanisch gezien niet.',
    },
  },
  {
    id: 'kortste-oorlog',
    topic: 'wereld',
    title: 'De kortste oorlog uit de geschiedenis duurde nog geen uur',
    body: [
      'Op 27 augustus 1896 beschoten Britse oorlogsschepen het paleis van de sultan van Zanzibar, die zonder Britse instemming de troon had bestegen. Na ongeveer 38 minuten was de vlag van het paleis weggeschoten en staakten de Britten het vuren; de sultan vluchtte naar het Duitse consulaat. De Engels-Zanzibarese Oorlog geldt als de kortste oorlog ooit.',
    ],
    source: wiki('Engels-Zanzibarese_Oorlog'),
    question: {
      q: 'Hoe lang duurde de Engels-Zanzibarese Oorlog van 1896?',
      options: ['Ongeveer 38 minuten', 'Ongeveer 38 uur', 'Ongeveer 38 dagen'],
      answer: 0,
      explain: 'De beschieting duurde ongeveer 38 minuten; daarna was de strijd voorbij.',
    },
  },
  {
    id: 'zonlicht',
    topic: 'wetenschap',
    title: 'Zonlicht is ruim acht minuten onderweg',
    body: [
      'Licht legt bijna 300.000 kilometer per seconde af, maar de zon staat gemiddeld 150 miljoen kilometer ver. Het licht dat je nu ziet, vertrok dus ongeveer 8 minuten en 20 seconden geleden. Zou de zon nu doven, dan merkten we dat pas na die tijd.',
    ],
    source: wiki('Astronomische_eenheid'),
    question: {
      q: 'Hoe lang doet zonlicht over de reis naar de aarde?',
      options: ['Ongeveer 8 seconden', 'Ongeveer 8 minuten', 'Ongeveer 8 uur'],
      answer: 1,
      explain: 'Ongeveer 8 minuten en 20 seconden.',
    },
  },
  {
    id: 'hawaiiaans-alfabet',
    topic: 'cultuur',
    title: 'Het Hawaïaanse alfabet heeft maar dertien letters',
    body: [
      'Het Hawaïaans wordt geschreven met vijf klinkers (a, e, i, o, u), zeven medeklinkers (h, k, l, m, n, p, w) en de ʻokina, een teken voor een korte onderbreking van de stem. Wie de ʻokina niet meetelt, komt op twaalf. Het alfabet werd in de negentiende eeuw door zendelingen vastgelegd; daarvoor was de taal alleen gesproken.',
    ],
    source: wiki('Hawaïaans'),
    question: {
      q: 'Hoeveel letters telt het Hawaïaanse alfabet?',
      options: ['13', '21', '26'],
      answer: 0,
      explain: 'Vijf klinkers, zeven medeklinkers en de ʻokina; zonder de ʻokina zijn het er twaalf.',
    },
  },
  // ---------- ronde 4 ----------
  {
    id: 'mount-scenery',
    topic: 'nederland',
    title: 'Het hoogste punt van Nederland ligt in de Caribische Zee',
    body: [
      'De Vaalserberg in Zuid-Limburg is met ruim 322 meter het hoogste punt van Europees Nederland. Maar sinds Saba in 2010 een bijzondere gemeente van Nederland werd, is Mount Scenery het hoogste punt van het land. Die slapende vulkaan is 870 meter hoog.',
    ],
    source: wiki('Mount_Scenery'),
    question: {
      q: 'Wat is het hoogste punt van Nederland, de Caribische gemeenten meegerekend?',
      options: ['De Vaalserberg', 'Mount Scenery op Saba', 'De Sint-Pietersberg'],
      answer: 1,
      explain: 'Mount Scenery op Saba is met 870 meter bijna drie keer zo hoog als de Vaalserberg.',
    },
  },
  {
    id: 'wombat',
    topic: 'natuur',
    title: 'Wombats poepen in blokjes',
    body: [
      'De keutels van een wombat zijn bijna kubusvormig. Dat komt door de darmwand, die op sommige plekken stugger is dan op andere en de inhoud zo in hoeken kneedt. De dieren leggen de blokjes op stenen en boomstronken om hun gebied te markeren.',
    ],
    source: wiki('Wombats'),
    question: {
      q: 'Welk dier heeft kubusvormige keutels?',
      options: ['De koala', 'De wombat', 'Het vogelbekdier'],
      answer: 1,
      explain: 'De wombat; de vorm ontstaat in de darm.',
    },
  },
  {
    id: 'honderdjarige-oorlog',
    topic: 'wereld',
    title: 'De Honderdjarige Oorlog duurde 116 jaar',
    body: [
      'De strijd tussen Engeland en Frankrijk om de Franse troon begon in 1337 en eindigde in 1453. Er werd niet onafgebroken gevochten: de oorlog bestond uit een reeks veldtochten met lange bestanden ertussen. De naam is pas eeuwen later bedacht.',
    ],
    source: wiki('Honderdjarige_Oorlog'),
    question: {
      q: 'Hoe lang duurde de Honderdjarige Oorlog?',
      options: ['Precies 100 jaar', '84 jaar', '116 jaar'],
      answer: 2,
      explain: 'Van 1337 tot 1453, met lange onderbrekingen.',
    },
  },
  {
    id: 'botten',
    topic: 'wetenschap',
    title: 'Een baby heeft meer botten dan een volwassene',
    body: [
      'Een pasgeboren baby heeft ongeveer 270 tot 300 botten en botdelen, waarvan een groot deel nog uit kraakbeen bestaat. Tijdens het opgroeien vergroeien veel daarvan met elkaar, bijvoorbeeld in de schedel. Een volwassene houdt er 206 over.',
    ],
    source: wiki('Skelet_(mens)'),
    question: {
      q: 'Hoeveel botten heeft een volwassen mens?',
      options: ['106', '206', '306'],
      answer: 1,
      explain: 'Een volwassene heeft 206 botten; een baby begint met ongeveer 270 tot 300.',
    },
  },
  {
    id: 'mona-lisa',
    topic: 'cultuur',
    title: 'De Mona Lisa werd pas wereldberoemd toen ze gestolen was',
    body: [
      'In augustus 1911 nam de Italiaan Vincenzo Peruggia, die eerder als glaszetter in het Louvre had gewerkt, het schilderij mee uit het museum. Het bleef ruim twee jaar weg. Kranten over de hele wereld schreven erover, en mensen kwamen in het museum naar de lege plek aan de muur kijken.',
    ],
    source: wiki('Mona_Lisa'),
    question: {
      q: 'Hoe lang was de Mona Lisa na de diefstal van 1911 zoek?',
      options: ['Twee dagen', 'Ruim twee jaar', 'Bijna twintig jaar'],
      answer: 1,
      explain: 'Het schilderij dook eind 1913 weer op in Italië.',
    },
  },
  // ---------- ronde 5 ----------
  {
    id: 'fietsen',
    topic: 'nederland',
    title: 'Nederland telt meer fietsen dan inwoners',
    body: [
      'Er staan naar schatting ruim 24 miljoen fietsen in Nederland, op ongeveer 18 miljoen inwoners. Geen ander land heeft er per persoon zoveel. Ruim een kwart van alle verplaatsingen gaat hier met de fiets.',
    ],
    source: wiki('Fietsverkeer'),
    question: {
      q: 'Waarvan zijn er in Nederland meer?',
      options: ['Inwoners', 'Fietsen', 'Het is vrijwel gelijk'],
      answer: 1,
      explain: 'Ruim 24 miljoen fietsen tegen ongeveer 18 miljoen inwoners.',
    },
  },
  {
    id: 'haaien-bomen',
    topic: 'natuur',
    title: 'Haaien zijn ouder dan bomen',
    body: [
      'De oudste sporen van haaiachtige vissen zijn ruim 400 miljoen jaar oud. De eerste echte bomen verschenen pas ongeveer 385 miljoen jaar geleden. Haaien hebben sindsdien meerdere massa-uitstervingen overleefd.',
    ],
    source: wiki('Haaien'),
    question: {
      q: 'Wat bestond er het eerst?',
      options: ['Bomen', 'Haaien', 'Dinosauriërs'],
      answer: 1,
      explain: 'Haaien: ruim 400 miljoen jaar geleden, nog vóór de eerste bomen.',
    },
  },
  {
    id: 'chinese-muur',
    topic: 'wereld',
    title: 'De Chinese Muur is vanuit de ruimte vrijwel niet met het blote oog te zien',
    body: [
      'De muur is duizenden kilometers lang, maar op de meeste plekken maar een paar meter breed en ongeveer even grijsbruin als het landschap. De eerste Chinese ruimtevaarder, Yang Liwei, zei in 2003 dat hij hem niet had kunnen zien. Volgens NASA is hij hooguit onder vrijwel perfecte omstandigheden net te onderscheiden. Snelwegen en vliegvelden zijn vanuit een baan om de aarde makkelijker te herkennen.',
    ],
    source: wiki('Chinese_Muur'),
    question: {
      q: 'Kun je de Chinese Muur vanuit de ruimte met het blote oog zien?',
      options: ['Ja, als enige bouwwerk', 'Vrijwel niet: hij is te smal', 'Alleen ’s nachts'],
      answer: 1,
      explain: 'De muur is lang maar smal, en valt weg tegen het landschap.',
    },
  },
  {
    id: 'geen-nobelprijs-wiskunde',
    topic: 'wetenschap',
    title: 'Er bestaat geen Nobelprijs voor wiskunde',
    body: [
      'Alfred Nobel liet in zijn testament prijzen vastleggen voor natuurkunde, scheikunde, geneeskunde, literatuur en vrede. Wiskunde ontbreekt. Wiskundigen hebben hun eigen onderscheidingen: de Fieldsmedaille, die om de vier jaar naar onderzoekers onder de veertig gaat, en sinds 2003 de Abelprijs.',
    ],
    source: wiki('Fieldsmedaille'),
    question: {
      q: 'Welke prijs geldt als een van de hoogste onderscheidingen voor wiskundigen?',
      options: ['De Nobelprijs voor wiskunde', 'De Fieldsmedaille', 'De Pulitzerprijs'],
      answer: 1,
      explain: 'Een Nobelprijs voor wiskunde bestaat niet; de Fieldsmedaille wel.',
    },
  },
  {
    id: 'olympische-kunst',
    topic: 'cultuur',
    title: 'Op de Olympische Spelen kon je ooit een medaille winnen met een schilderij',
    body: [
      'Van 1912 tot en met 1948 hoorden kunstwedstrijden bij de Spelen. Er waren medailles voor architectuur, literatuur, muziek, schilderkunst en beeldhouwkunst; het werk moest wel over sport gaan. Na 1948 werden de wedstrijden geschrapt, onder meer omdat de meeste kunstenaars beroeps waren.',
    ],
    source: wiki('Kunstwedstrijden_op_de_Olympische_Spelen'),
    question: {
      q: 'In welke periode waren er kunstwedstrijden op de Olympische Spelen?',
      options: ['1896 tot 1908', '1912 tot 1948', '1952 tot 1972'],
      answer: 1,
      explain: 'Van de Spelen van 1912 tot en met die van 1948.',
    },
  },
  // ---------- ronde 6 ----------
  {
    id: 'elfstedentocht',
    topic: 'nederland',
    title: 'De Elfstedentocht is sinds 1909 maar vijftien keer verreden',
    body: [
      'De schaatstocht van bijna 200 kilometer langs elf Friese steden kan alleen doorgaan als het ijs over de hele route dik genoeg is. Dat gebeurde voor het laatst op 4 januari 1997, toen Henk Angenent won. De langste periode zonder tocht duurt nog altijd voort.',
    ],
    source: wiki('Elfstedentocht'),
    question: {
      q: 'In welk jaar werd de Elfstedentocht voor het laatst verreden?',
      options: ['1986', '1997', '2012'],
      answer: 1,
      explain: 'Op 4 januari 1997; in 2012 scheelde het weinig, maar het ijs was net niet dik genoeg.',
    },
  },
  {
    id: 'bliksem',
    topic: 'natuur',
    title: 'Bliksem is heter dan het oppervlak van de zon',
    body: [
      'Een bliksemflits verhit de lucht eromheen in een fractie van een seconde tot zo’n 30.000 graden Celsius. Het oppervlak van de zon is ongeveer 5.500 graden. De lucht zet door die hitte explosief uit, en dat hoor je als donder.',
    ],
    source: wiki('Bliksem'),
    question: {
      q: 'Wat veroorzaakt het geluid van donder?',
      options: ['Wolken die botsen', 'Lucht die door de hitte explosief uitzet', 'De inslag in de grond'],
      answer: 1,
      explain: 'De lucht rond de flits wordt ongeveer 30.000 graden en zet razendsnel uit.',
    },
  },
  {
    id: 'mammoet-piramide',
    topic: 'wereld',
    title: 'Toen de piramides werden gebouwd, leefden er nog mammoeten',
    body: [
      'Op het vasteland stierf de wolharige mammoet ongeveer 10.000 jaar geleden uit. Maar op Wrangel, een eiland in de Noordelijke IJszee, hield een kleine groep het vol tot ongeveer 4.000 jaar geleden. De Grote Piramide van Gizeh stond er toen al ruim vijf eeuwen.',
    ],
    source: wiki('Wolharige_mammoet'),
    question: {
      q: 'Waar leefden de laatste wolharige mammoeten?',
      options: ['Op het eiland Wrangel', 'In de Alpen', 'In Patagonië'],
      answer: 0,
      explain: 'Op Wrangel, in de Noordelijke IJszee, tot ongeveer 4.000 jaar geleden.',
    },
  },
  {
    id: 'gps-relativiteit',
    topic: 'wetenschap',
    title: 'Zonder Einstein zou je navigatie er kilometers naast zitten',
    body: [
      'De klokken in gps-satellieten lopen per dag ongeveer 38 miljoenste seconde vóór op klokken op aarde. Ze tikken iets sneller omdat de zwaartekracht daar zwakker is, en iets trager omdat ze zo hard bewegen. Zonder correctie volgens de relativiteitstheorie zou de plaatsbepaling elke dag kilometers verder afwijken.',
    ],
    source: wiki('Global_Positioning_System'),
    question: {
      q: 'Waarom moeten de klokken in gps-satellieten worden gecorrigeerd?',
      options: ['Ze lopen anders door zwaartekracht en snelheid', 'De batterijen raken leeg', 'Door storing van de zon'],
      answer: 0,
      explain: 'Volgens de relativiteitstheorie loopt de tijd in een satelliet net iets anders dan op aarde.',
    },
  },
  {
    id: 'beethoven-negende',
    topic: 'cultuur',
    title: 'Beethoven hoorde het applaus voor zijn Negende symfonie niet',
    body: [
      'Toen de Negende op 7 mei 1824 in Wenen in première ging, was Ludwig van Beethoven vrijwel doof. Hij stond op het podium en sloeg de maat, met zijn rug naar de zaal. Een van de zangeressen draaide hem na afloop om, zodat hij het juichende publiek kon zien.',
    ],
    source: wiki('Symfonie_nr._9_(Beethoven)'),
    question: {
      q: 'Wat was er bijzonder aan de première van Beethovens Negende symfonie?',
      options: ['De componist was vrijwel doof', 'Het orkest speelde in het donker', 'De componist was al overleden'],
      answer: 0,
      explain: 'Beethoven moest worden omgedraaid om het applaus te kunnen zien.',
    },
  },
  // ---------- ronde 7 ----------
  {
    id: 'afsluitdijk',
    topic: 'nederland',
    title: 'De Afsluitdijk maakte van een zee een meer',
    body: [
      'De dijk van 32 kilometer tussen Noord-Holland en Friesland werd op 28 mei 1932 gesloten. Daarmee werd de zoute Zuiderzee het IJsselmeer, dat in de jaren daarna zoet werd. De dijk maakte ook de inpoldering van Flevoland mogelijk.',
    ],
    source: wiki('Afsluitdijk'),
    question: {
      q: 'Hoe lang is de Afsluitdijk?',
      options: ['12 kilometer', '32 kilometer', '62 kilometer'],
      answer: 1,
      explain: 'De dijk is 32 kilometer lang en werd in 1932 gesloten.',
    },
  },
  {
    id: 'stille-oceaan',
    topic: 'natuur',
    title: 'De Stille Oceaan is groter dan al het land samen',
    body: [
      'De Stille Oceaan beslaat ongeveer 165 miljoen vierkante kilometer. Alle continenten en eilanden bij elkaar komen op ongeveer 149 miljoen. Op zijn breedst beslaat de oceaan bijna de halve aardbol.',
    ],
    source: wiki('Grote_Oceaan'),
    question: {
      q: 'Wat is groter?',
      options: ['Al het land op aarde samen', 'De Stille Oceaan', 'De Atlantische Oceaan'],
      answer: 1,
      explain: 'De Stille Oceaan: ongeveer 165 tegen 149 miljoen vierkante kilometer.',
    },
  },
  {
    id: 'vikingen-amerika',
    topic: 'wereld',
    title: 'Vikingen waren bijna vijf eeuwen eerder in Amerika dan Columbus',
    body: [
      'Rond het jaar 1000 bouwden Noormannen een nederzetting bij L’Anse aux Meadows, op het Canadese eiland Newfoundland. Onderzoek aan jaarringen van hout dat ze kapten, wijst precies het jaar 1021 aan. De kolonie hield maar kort stand. Het verhaal bleef bewaard in IJslandse saga’s, maar was in de rest van Europa nauwelijks bekend.',
    ],
    source: wiki("L'Anse_aux_Meadows"),
    question: {
      q: 'Waar lag de nederzetting van de Vikingen in Noord-Amerika?',
      options: ['Op Newfoundland', 'In Florida', 'Aan de Mississippi'],
      answer: 0,
      explain: 'Bij L’Anse aux Meadows op Newfoundland, rond het jaar 1000.',
    },
  },
  {
    id: 'absolute-nulpunt',
    topic: 'wetenschap',
    title: 'Kouder dan min 273 graden kan het niet worden',
    body: [
      'Temperatuur is de beweging van atomen en moleculen. Bij −273,15 graden Celsius, het absolute nulpunt, is die beweging zo klein als ze maar kan worden. De kelvinschaal begint daar: 0 kelvin. In laboratoria is men er tot op een fractie van een graad bij gekomen, maar het punt zelf is niet te bereiken.',
    ],
    source: wiki('Absoluut_nulpunt_(temperatuur)'),
    question: {
      q: 'Bij welke temperatuur ligt het absolute nulpunt?',
      options: ['−100 °C', '−273,15 °C', '−1000 °C'],
      answer: 1,
      explain: 'Bij −273,15 graden Celsius, oftewel 0 kelvin.',
    },
  },
  {
    id: 'van-gogh-verkoop',
    topic: 'cultuur',
    title: 'Van Gogh verkocht tijdens zijn leven vrijwel niets',
    body: [
      'Vincent van Gogh maakte in ongeveer tien jaar tijd ruim 2.000 kunstwerken. Het enige verkochte schilderij dat we bij naam kennen, is De rode wijngaard: de Belgische schilderes Anna Boch kocht het in 1890 voor 400 frank. Een paar maanden later overleed hij.',
    ],
    source: wiki('De_rode_wijngaard'),
    question: {
      q: 'Welk schilderij van Van Gogh is het enige dat hij verkocht en dat we bij naam kennen?',
      options: ['De sterrennacht', 'De rode wijngaard', 'De aardappeleters'],
      answer: 1,
      explain: 'De rode wijngaard, in 1890 gekocht door Anna Boch.',
    },
  },
  // ---------- ronde 8 ----------
  {
    id: 'nieuw-amsterdam',
    topic: 'nederland',
    title: 'New York heette eerst Nieuw-Amsterdam',
    body: [
      'De stad op de punt van Manhattan was de hoofdplaats van de Nederlandse kolonie Nieuw-Nederland. In 1664 namen de Engelsen haar zonder strijd over en noemden haar naar de hertog van York. Namen als Brooklyn (Breukelen), Harlem (Haarlem) en Wall Street (naar de wal die de Nederlanders er bouwden) herinneren nog aan de Nederlandse tijd.',
    ],
    source: wiki('Nieuw-Amsterdam_(Nieuw-Nederland)'),
    question: {
      q: 'In welk jaar namen de Engelsen Nieuw-Amsterdam over?',
      options: ['1609', '1664', '1776'],
      answer: 1,
      explain: 'In 1664; daarna heette de stad New York.',
    },
  },
  {
    id: 'bomen-sterren',
    topic: 'natuur',
    title: 'Er zijn meer bomen op aarde dan sterren in de Melkweg',
    body: [
      'Onderzoekers schatten in 2015 dat er ongeveer 3 biljoen bomen op aarde staan, dus 3.000 miljard. De Melkweg telt naar schatting 100 tot 400 miljard sterren. Sinds het begin van de landbouw is het aantal bomen wel bijna gehalveerd.',
    ],
    source: wiki('Boom_(plant)'),
    question: {
      q: 'Waar zijn er meer van?',
      options: ['Sterren in de Melkweg', 'Bomen op aarde', 'Het is ongeveer gelijk'],
      answer: 1,
      explain: 'Ongeveer 3.000 miljard bomen tegen hooguit 400 miljard sterren.',
    },
  },
  {
    id: 'kalender-1582',
    topic: 'wereld',
    title: 'In 1582 verdwenen er tien dagen uit de kalender',
    body: [
      'De oude juliaanse kalender liep in de loop der eeuwen steeds verder achter op de seizoenen. Paus Gregorius XIII liet daarom tien dagen overslaan: in onder meer Spanje, Portugal en Italië volgde op donderdag 4 oktober 1582 meteen vrijdag 15 oktober. Andere landen stapten pas later over, soms eeuwen later.',
    ],
    source: wiki('Gregoriaanse_kalender'),
    question: {
      q: 'Hoeveel dagen werden bij de invoering van de gregoriaanse kalender overgeslagen?',
      options: ['Eén', 'Tien', 'Dertig'],
      answer: 1,
      explain: 'Na 4 oktober 1582 kwam meteen 15 oktober.',
    },
  },
  {
    id: 'diamant-grafiet',
    topic: 'wetenschap',
    title: 'Een diamant en een potloodpunt zijn van hetzelfde gemaakt',
    body: [
      'Diamant en grafiet bestaan allebei uit zuivere koolstof. Het verschil zit in de rangschikking van de atomen. In diamant zit elk atoom stevig vast aan vier buren, wat het extreem hard maakt. In grafiet liggen de atomen in laagjes die makkelijk over elkaar schuiven, en zo blijft er een streep op papier achter.',
    ],
    source: wiki('Koolstof'),
    question: {
      q: 'Waaruit bestaan zowel diamant als grafiet?',
      options: ['Koolstof', 'Silicium', 'Lood'],
      answer: 0,
      explain: 'Allebei zuivere koolstof, alleen anders gerangschikt.',
    },
  },
  {
    id: 'nederlandse-leenwoorden',
    topic: 'cultuur',
    title: 'Het Engels heeft honderden woorden uit het Nederlands geleend',
    body: [
      'Cookie komt van koekje, boss van baas, yacht van jacht en landscape van landschap. Veel van die woorden kwamen mee met zeelieden, handelaren en schilders in de zeventiende eeuw, of via de Nederlandse kolonisten in Amerika. Ook Santa Claus is een verbastering van Sinterklaas.',
    ],
    source: wiki('Lijst_van_Nederlandse_leenwoorden_in_het_Amerikaans-Engels'),
    question: {
      q: 'Welk Engels woord komt uit het Nederlands?',
      options: ['Cookie', 'Window', 'Table'],
      answer: 0,
      explain: 'Cookie komt van koekje; window komt uit het Oudnoors en table via het Frans uit het Latijn.',
    },
  },
  // ---------- ronde 9 ----------
  {
    id: 'waddenzee',
    topic: 'nederland',
    title: 'De Waddenzee is het grootste aaneengesloten getijdengebied ter wereld',
    body: [
      'Nergens anders ligt zo’n groot aaneengesloten gebied van zand- en slikplaten dat twee keer per dag droogvalt. Het strekt zich uit langs de kust van Nederland, Duitsland en Denemarken. Sinds 2009 staat de Waddenzee op de Werelderfgoedlijst van UNESCO; het Deense deel kwam er in 2014 bij.',
    ],
    source: wiki('Waddenzee'),
    question: {
      q: 'Langs welke drie landen ligt de Waddenzee?',
      options: ['Nederland, Duitsland en Denemarken', 'Nederland, België en Frankrijk', 'Nederland, Duitsland en Polen'],
      answer: 0,
      explain: 'Van Den Helder tot aan het Deense Esbjerg.',
    },
  },
  {
    id: 'blauwe-vinvis',
    topic: 'natuur',
    title: 'De blauwe vinvis is het grootste dier dat we kennen, ook uit het verleden',
    body: [
      'Een blauwe vinvis kan ongeveer 30 meter lang worden en meer dan 150 ton wegen. Daarmee is hij, voor zover bekend, zwaarder dan zelfs de grootste dinosauriërs. Toch leeft hij vooral van krill, garnaalachtige diertjes van een paar centimeter.',
    ],
    source: wiki('Blauwe_vinvis'),
    question: {
      q: 'Wat eet het grootste dier ter wereld vooral?',
      options: ['Grote vissen', 'Krill', 'Zeewier'],
      answer: 1,
      explain: 'Krill: kleine garnaalachtige diertjes, tot zo’n vier ton per dag.',
    },
  },
  {
    id: 'napoleon-lengte',
    topic: 'wereld',
    title: 'Napoleon was niet klein',
    body: [
      'Napoleon Bonaparte was ongeveer 1,68 meter lang, gemiddeld of iets langer dan gemiddeld voor een Fransman van zijn tijd. Het beeld van het kleine mannetje komt deels uit Britse spotprenten, en deels uit verwarring over maten: de Franse duim was langer dan de Engelse inch.',
    ],
    source: wiki('Napoleon_Bonaparte'),
    question: {
      q: 'Waar komt het idee vandaan dat Napoleon heel klein was?',
      options: ['Uit Britse spotprenten en verwarring over maten', 'Uit zijn eigen dagboeken', 'Hij was echt uitzonderlijk klein'],
      answer: 0,
      explain: 'Hij was ongeveer 1,68 meter, gewoon voor zijn tijd.',
    },
  },
  {
    id: 'eerste-foto',
    topic: 'wetenschap',
    title: 'Voor de oudste camerafoto moest de plaat urenlang worden belicht',
    body: [
      'De Fransman Nicéphore Niépce maakte in 1826 of 1827 de oudste bewaard gebleven foto die met een camera is gemaakt: het uitzicht uit een raam van zijn landhuis Le Gras, in het Franse Saint-Loup-de-Varennes. De tinnen plaat moest minstens acht uur worden belicht, en volgens later onderzoek misschien zelfs dagen. Daardoor lijkt de zon op de foto beide kanten van de binnenplaats te beschijnen.',
    ],
    source: wiki('Uitzicht_vanuit_het_raam_in_Le_Gras'),
    question: {
      q: 'Hoe lang duurde de belichting van de oudste bewaard gebleven camerafoto?',
      options: ['Een paar seconden', 'Ongeveer een minuut', 'Minstens acht uur'],
      answer: 2,
      explain: 'Minstens acht uur, waardoor de zon van twee kanten lijkt te schijnen.',
    },
  },
  {
    id: 'braille',
    topic: 'cultuur',
    title: 'Braille werd bedacht door een jongen van vijftien',
    body: [
      'Louis Braille werd als kind blind door een ongeluk in de werkplaats van zijn vader. Op zijn vijftiende, in 1824, ontwierp hij een schrift van voelbare punten, gebaseerd op een puntenschrift van de oud-officier Charles Barbier. Elke letter past in een vakje van zes punten.',
    ],
    source: wiki('Braille'),
    question: {
      q: 'Uit hoeveel punten bestaat een vakje in het brailleschrift?',
      options: ['Vier', 'Zes', 'Tien'],
      answer: 1,
      explain: 'Zes punten, in twee kolommen van drie.',
    },
  },
]
