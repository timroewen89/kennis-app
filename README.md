# Kennis

Een dagelijkse kennisfeed tegen doomscrollen. Elke dag één eindige editie van 12 kaarten:
6 nieuwskaarten (landelijk, Drenthe, wereld), 1 kaart "Kort nieuws" met vijf koppen, 1 "vandaag in de
geschiedenis", 1 tijdlijn, 1 weetje, 1 verdieping en een mini-quiz.
Daarna: klaar voor vandaag.

Het weetje en de geschiedeniskaart beginnen met een vraag: **eerst raden, dan lezen**. Je kiest een
antwoord of "Geen idee", en dan draait de kaart om.

Na de geschiedeniskaart volgt de **tijdlijn**: drie andere gebeurtenissen van dezelfde datum, die je
aantikt van vroegst naar laatst. Daarna zie je de juiste volgorde met de jaartallen. Is Wikipedia
onbereikbaar, dan vervalt deze kaart die dag.

De mini-quiz heeft vijf vragen: twee over de verdieping van vandaag en drie **herhalingsvragen** uit
edities die je eerder hebt afgerond.

- Een vraag komt op zijn vroegst twee dagen later terug, en daarna hooguit eens per vijf dagen.
- Wat je fout had of niet wist, komt het eerst terug.
- Heb je een vraag twee keer achter elkaar goed, of is hij ouder dan 45 dagen, dan verdwijnt hij uit de herhaling.
- De eerste dagen valt er nog niets te herhalen; dan vullen de vragen van vandaag de quiz aan.

Op zondag is er na de editie een **weekquiz**: tien vragen uit de edities die je in de afgelopen zeven
dagen hebt afgerond, met een weekscore. De antwoorden tellen mee voor de herhaling. Heb je die week
te weinig gelezen, dan is er geen weekquiz.

Tik op het vlammetje met je dagreeks voor je **voortgang**: je reeks, het aantal afgeronde edities,
je gemiddelde quizscore, een kalender van de laatste vijf weken en mijlpalen bij 7, 30 en 100 dagen
op rij. Er zijn geen punten of ranglijsten.

Via het tandwiel rechtsboven kies je je **onderwerpen**: Nederland, Wereldgeschiedenis, Wetenschap &
techniek, Natuur & aarde en Taal & cultuur. De keuze bepaalt welk weetje en welke verdieping je
krijgt. Een wijziging geldt meteen als je de editie van vandaag nog niet hebt afgerond, anders vanaf
morgen.

Bladeren doe je door te vegen: naar links voor de volgende kaart, naar rechts voor de vorige. Dat kan
op de kaart zelf en in de ruimte eronder.
Op een computer zijn er knoppen en werken de pijltjestoetsen.

De app bestaat uit `index.html`, `styles.css` en `app.js`, zonder bouwstap. Geen account, geen betaalde diensten;
dagreeks, voortgang, weekscores, bewaarde kaarten, gekozen onderwerpen en de vragen voor de herhaling
staan lokaal in je browser.

## Bekijken via GitHub Pages

1. Ga in de repo naar **Settings → Pages**.
2. Kies bij *Source* **Deploy from a branch**, selecteer de branch en de map **/ (root)**, en klik **Save**.
3. Na een minuut staat de app op `https://timroewen89.github.io/kennis-app/`.

Op je telefoon kun je hem daarna via het browsermenu op je beginscherm zetten ("Toevoegen aan startscherm").

## Nieuws verversen

`news.json` bevat de zes nieuwskaarten en de vijf koppen voor "Kort nieuws". De workflow
`.github/workflows/nieuws.yml` ververst dat bestand twee keer per dag (rond 05:15 en 12:15 in de
winter, een uur later in de zomer) en zet het terug in de repo; Pages publiceert het daarna vanzelf.

- Per bron kiest het script het eerste bericht van de laatste 24 uur. Agenda's, live-uitzendingen,
  liveblogs en podcasts worden overgeslagen.
- Geplande runs werken alleen vanaf de standaard-branch (`main`) en kunnen bij GitHub vertraagd zijn.
  Of een run is gelukt, zie je onder **Actions → Nieuws verversen**; daar kun je hem ook handmatig starten.
- Open je de app vóór de ochtendverversing, dan zie je het nieuws van de vorige avond. Bij de volgende
  keer openen haalt de app het nieuwe nieuws op, tenzij je de editie al had afgerond.
- Is het nieuws ouder dan anderhalve dag, dan meldt de app dat bovenaan de editie.

## Bronnen

| Onderdeel | Bron | Hoe |
| --- | --- | --- |
| Nieuws | NOS (2), RTV Drenthe (2), BBC News en The Guardian (vertaald) | `scripts/fetch-news.mjs` schrijft `news.json`; de feeds staan geen directe browser-aanroep toe |
| Kort nieuws | NOS binnenland en buitenland, RTV Drenthe | Vijf koppen met link, zonder samenvatting; uit hetzelfde `news.json` |
| Geschiedenis en tijdlijn | Engelse Wikipedia, On this day (vertaald) | Rechtstreeks vanuit de app; de Nederlandse variant van deze API bestaat niet |
| Weetje | `content/facts.js` (nl) | Elke dag het volgende uit de lijst, binnen je gekozen onderwerpen |
| Verdieping | `content/deepdives.js` (nl) | Elke dag de volgende uit de lijst, binnen je gekozen onderwerpen |
| Mini-quiz | De kaarten van vandaag en van eerdere dagen | Twee vragen over de verdieping, drie herhalingsvragen |

Is een bron onbereikbaar, dan meldt de app dat en is de rest van de editie gewoon compleet.
Een complete editie wordt per dag vastgelegd, zodat hij niet verspringt en zonder verbinding werkt.

### Vertaling

Kaarten uit Engelse bronnen worden in de app naar het Nederlands vertaald en krijgen de regel
"Automatisch vertaald uit het Engels". De link gaat naar het Engelse origineel.

- De vertaling komt van [MyMemory](https://mymemory.translated.net/): gratis, zonder account of sleutel.
- De app stuurt daarvoor de Engelse tekst van die kaarten vanuit je browser naar die dienst. Dat is
  openbare tekst; er gaat niets persoonlijks mee.
- De dienst staat ongeveer 5000 tekens per dag per internetaansluiting toe. Een editie heeft er
  ongeveer 2000 nodig, één keer per dag per apparaat.
- Lukt vertalen niet (limiet bereikt, dienst onbereikbaar), dan staat de kaart in het Engels en meldt
  de app dat. Bij de volgende keer openen probeert hij het opnieuw.
- Het is een machinevertaling: namen en uitdrukkingen kunnen soms vreemd uitvallen.

## Eigen inhoud toevoegen

Weetjes en verdiepingen staan als gewone lijsten in `content/facts.js` en `content/deepdives.js`.
Dat kan rechtstreeks op GitHub (potloodje bij het bestand). Kopieer een bestaand blok, plak het
erbij en pas het aan:

```js
{
  id: 'korte-unieke-naam',
  topic: 'natuur', // nederland, wereld, wetenschap, natuur of cultuur (zie content/topics.js)
  title: 'De kop van de kaart',
  body: ['Eerste alinea.', 'Tweede alinea.'],
  source: wiki('Titel_van_het_Wikipedia-artikel'),
  question: {
    q: 'De quizvraag?',
    options: ['Antwoord A', 'Antwoord B', 'Antwoord C'],
    answer: 1, // positie van het goede antwoord, geteld vanaf 0
    explain: 'Korte uitleg die na het antwoorden verschijnt.',
  },
},
```

Een verdieping heeft daarnaast een tweede vraag, `question2`, in dezelfde vorm.

De lijsten lopen rond (nu 65 weetjes en 36 verdiepingen) en wisselen de thema's af; de app husselt
de antwoorden per dag. Voeg je een item toe, dan schuift de volgorde voor de dagen erna op.

Alle 101 teksten zijn nagelopen tegen Wikipedia en andere bronnen. Waar bronnen elkaar tegenspreken,
staat dat in de tekst of is een voorzichtige formulering gekozen. Controleer een nieuw item zelf
voordat je het toevoegt.

Wie Node heeft, kan de inhoud laten controleren met `node scripts/check-content.mjs`: dat meldt
vormfouten en laat zien hoeveel items elk thema heeft.

## Bestanden

| Bestand | Wat het doet |
| --- | --- |
| `index.html` | De pagina zelf, met de beveiligingsregels (Content-Security-Policy) |
| `styles.css` | De opmaak |
| `app.js` | De hele werking: schermen, raden, tijdlijn, herhaling, onderwerpen, voortgang, dagreeks, bewaren, quiz |
| `content/facts.js`, `content/deepdives.js` | Eigen weetjes en verdiepingen, met thema, bron en quizvraag |
| `content/topics.js` | De thema's waaruit je kunt kiezen |
| `news.json` | De nieuwspunten van vandaag (automatisch ververst) |
| `scripts/fetch-news.mjs` | Haalt de RSS-feeds op; de lijst met feeds staat bovenin |
| `scripts/news-lib.mjs` | Kiest en schoont de berichten op; getest in `tests/news-lib.test.mjs` |
| `scripts/check-content.mjs` | Controleert de eigen inhoud |
| `.github/workflows/nieuws.yml` | Draait het nieuws-script elke ochtend |
| `manifest.webmanifest`, `sw.js`, `icons/` | Installeren op je telefoon en gebruik zonder verbinding |

## Als er iets misgaat

- Zit er een fout in een inhoudsbestand (bijvoorbeeld een vergeten komma), dan toont de app
  "De inhoud kon niet worden geladen" met de naam van het bestand en de foutmelding.
- Staat de app nog open van gisteren, dan laadt hij de editie van vandaag zodra je terugkomt.
- De pagina mag alleen eigen bestanden laden en alleen verbinding maken met Wikipedia en de
  vertaaldienst. Voeg je een nieuwe bron toe die vanuit de app wordt opgehaald, zet het adres dan ook
  in de regel `Content-Security-Policy` bovenin `index.html`.

## Lokaal bekijken

Dubbelklikken op `index.html` werkt niet (de browser laadt dan de inhoudsbestanden niet).
Start in de map een eenvoudige server, bijvoorbeeld `python3 -m http.server`, en open
`http://localhost:8000`.
