# Kennis

Een dagelijkse kennisfeed tegen doomscrollen. Elke dag één eindige editie van 14 kaarten:
6 nieuwskaarten (landelijk, Drenthe, wereld), 1 kaart Tech, 1 kaart AI, 1 kaart "Kort nieuws" met vijf
koppen, 1 "vandaag in de geschiedenis", 1 tijdlijn, 1 weetje, 1 verdieping en een mini-quiz.
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

Via het tandwiel rechtsboven kies je de **lengte**: uitgebreid (zes nieuwskaarten, 14 kaarten) of kort
(vier nieuwskaarten, 12 kaarten). De kaarten Tech en AI horen bij beide.

Op hetzelfde scherm kies je je **onderwerpen**: Nederland, Wereldgeschiedenis, Wetenschap &
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

`news.json` bevat de zes nieuwskaarten, de kaarten Tech en AI en de vijf koppen voor "Kort nieuws". De workflow
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
| Tech | NOS Tech; als die uitvalt BBC Technology (vertaald) | Eén volledige kaart; uit hetzelfde `news.json` |
| AI | TechCrunch, AI-rubriek (vertaald); als die uitvalt The Guardian Technology, alleen berichten over AI | Eén volledige kaart; is er geen bruikbaar bericht, dan vervalt de kaart die dag |
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
  ongeveer 2300 nodig, één keer per dag per apparaat.
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
| `styles.css` | De opmaak: één donker ontwerp; de kleuren staan bovenin als variabelen |
| `app.js` | De hele werking: schermen, raden, tijdlijn, herhaling, onderwerpen, voortgang, dagreeks, bewaren, quiz |
| `content/facts.js`, `content/deepdives.js` | Eigen weetjes en verdiepingen, met thema, bron en quizvraag |
| `content/topics.js` | De thema's waaruit je kunt kiezen |
| `news.json` | De nieuwspunten van vandaag (automatisch ververst) |
| `scripts/fetch-news.mjs` | Haalt de RSS-feeds op; de lijst met feeds staat bovenin |
| `scripts/news-lib.mjs` | Kiest en schoont de berichten op; getest in `tests/news-lib.test.mjs` |
| `scripts/check-content.mjs` | Controleert de eigen inhoud |
| `.github/workflows/nieuws.yml` | Draait het nieuws-script elke ochtend |
| `manifest.webmanifest`, `sw.js`, `icons/` | Installeren op je telefoon en gebruik zonder verbinding |
| `tests/` | Tests voor de nieuwsselectie en de browsertests; alleen hier staan pakketten in |
| `.github/workflows/controle.yml` | Draait de controles bij elke wijziging |

## Beveiliging

De hele code is nagelopen door een onafhankelijke reviewer. Er is geen manier gevonden waarop tekst
van buiten (nieuwsfeeds, Wikipedia, de vertaaldienst) of uit de opslag als code kan worden uitgevoerd.
De lichtere punten uit de review zijn opgelost:

- Links worden gecontroleerd op het moment dat ze getoond worden, ook als ze uit de opslag komen.
- Beschadigde of gemanipuleerde opslag laat de app niet meer vastlopen; wat niet de verwachte vorm
  heeft, wordt overgeslagen. Als laatste redmiddel kun je op het foutscherm je gegevens wissen.
- Het lezen van de nieuwsfeeds is begrensd in tijd en omvang.
- De service worker blijft binnen zijn eigen opslag.
- Alleen een machinevertaling van precies de gevraagde zin wordt overgenomen.
- De pagina mag niets laden van buiten en alleen verbinding maken met Wikipedia en de vertaaldienst.

Wat openstaat:

- De workflows gebruiken `actions/checkout@v4` en `actions/setup-node@v4` op versienummer. Strenger is
  vastzetten op een commit-SHA; dat is hier niet gedaan omdat de SHA's niet te controleren waren.
- Alle projecten onder `timroewen89.github.io` delen één adres en dus één opslag. Een ander project
  op dat adres kan de gegevens van deze app lezen en wijzigen. Alleen een eigen domein scheidt dat.
- Een Content-Security-Policy in de pagina zelf kan niet verbieden dat de app in een andere pagina
  wordt ingesloten; dat kan alleen met een header, en die biedt GitHub Pages niet.

## Toegankelijkheid

- De hele editie is met het toetsenbord te doen: pijltjestoetsen om te bladeren, Tab en Enter voor de rest.
- Na bladeren staat de focus op de kop van de nieuwe kaart en wordt de positie voorgelezen
  ("Kaart 5 van 12"); na raden staat de focus op de uitslag.
- De app heeft één donker ontwerp, ongeacht de instelling van je toestel. Het contrast van alle
  kleurparen is nagerekend.
- Alle schermen zijn nagelopen met een geautomatiseerde controle (axe).
  Met een echte schermlezer is niet getest.

## Als er iets misgaat

- Zit er een fout in een inhoudsbestand (bijvoorbeeld een vergeten komma), dan toont de app
  "De inhoud kon niet worden geladen" met de naam van het bestand en de foutmelding.
- Staat de app nog open van gisteren, dan laadt hij de editie van vandaag zodra je terugkomt.
- De pagina mag alleen eigen bestanden laden en alleen verbinding maken met Wikipedia en de
  vertaaldienst. Voeg je een nieuwe bron toe die vanuit de app wordt opgehaald, zet het adres dan ook
  in de regel `Content-Security-Policy` bovenin `index.html`.

## Controle en tests

Bij elke wijziging op `main` draait de workflow `.github/workflows/controle.yml`:

- **Inhoud** (enkele seconden): zijn de inhoudsbestanden en de code geldig, en klopt de vorm van elk
  weetje en elke verdieping?
- **Browser** (een minuut of tien): de hele app in een nagebootste telefoon. Dertien reeksen in
  `tests/browser/`, onder meer een editie over meerdere dagen, vegen, tijdlijn, weekquiz, instellingen,
  gebruik zonder verbinding, een hele editie met alleen het toetsenbord en een toegankelijkheidscontrole.

Mislukt er iets, dan stuurt GitHub een mail en staat er een rood kruis bij de commit. De dagelijkse
nieuws-commit wordt niet opnieuw getest.

Zelf draaien kan met Node:

```bash
node scripts/check-content.mjs          # inhoud
node --test tests/news-lib.test.mjs     # nieuwsselectie
cd tests && npm ci && npx playwright install chromium && cd ..
node tests/browser/run.cjs              # alle browsertests; of bijvoorbeeld: node tests/browser/run.cjs vegen
```

## Lokaal bekijken

Dubbelklikken op `index.html` werkt niet (de browser laadt dan de inhoudsbestanden niet).
Start in de map een eenvoudige server, bijvoorbeeld `python3 -m http.server`, en open
`http://localhost:8000`.
