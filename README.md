# Kennis

Een dagelijkse kennisfeed tegen doomscrollen. Elke dag één eindige editie van 7 kaarten:
3 nieuwspunten, 1 "vandaag in de geschiedenis", 1 weetje, 1 verdieping en een mini-quiz.
Daarna: klaar voor vandaag.

De app is één `index.html` zonder bouwstap. Geen account, geen betaalde diensten;
dagreeks en bewaarde kaarten staan lokaal in je browser.

## Bekijken via GitHub Pages

1. Ga in de repo naar **Settings → Pages**.
2. Kies bij *Source* **Deploy from a branch**, selecteer de branch en de map **/ (root)**, en klik **Save**.
3. Na een minuut staat de app op `https://timroewen89.github.io/kennis-app/`.

Op je telefoon kun je hem daarna via het browsermenu op je beginscherm zetten ("Toevoegen aan startscherm").

## Nieuws dagelijks verversen

`news.json` bevat de drie nieuwspunten. De workflow `.github/workflows/nieuws.yml` ververst dat
bestand elke ochtend rond 05:00 en zet het terug in de repo; Pages publiceert het daarna vanzelf.

- Geplande runs werken alleen vanaf de standaard-branch (`main`). De workflow moet dus op `main` staan.
- Handmatig starten kan via **Actions → Nieuws verversen → Run workflow**.
- Is het nieuws ouder dan anderhalve dag, dan meldt de app dat bovenaan de editie.

## Bronnen

| Onderdeel | Bron | Hoe |
| --- | --- | --- |
| Nieuws | NOS (nl), BBC News (en), The Guardian (en) | `scripts/fetch-news.mjs` schrijft `news.json`; de feeds staan geen directe browser-aanroep toe |
| Geschiedenis | Engelse Wikipedia, On this day | Rechtstreeks vanuit de app; de Nederlandse variant van deze API bestaat niet |
| Weetje | `content/facts.js` (nl) | Elke dag het volgende uit de lijst |
| Verdieping | `content/deepdives.js` (nl) | Elke dag de volgende uit de lijst |
| Mini-quiz | De kaarten van de dag | Eén vraag bij het weetje, de geschiedenis en de verdieping |

Engelse kaarten blijven in het Engels (geen vertaaldienst). Is een bron onbereikbaar, dan meldt de
app dat en is de rest van de editie gewoon compleet. Een complete editie wordt per dag vastgelegd,
zodat hij niet verspringt en zonder verbinding werkt.

## Eigen inhoud toevoegen

Weetjes en verdiepingen staan als gewone lijsten in `content/facts.js` en `content/deepdives.js`.
Dat kan rechtstreeks op GitHub (potloodje bij het bestand). Kopieer een bestaand blok, plak het
onderaan en pas het aan:

```js
{
  id: 'korte-unieke-naam',
  title: 'De kop van de kaart',
  body: ['Eerste alinea.', 'Tweede alinea.'],
  question: {
    q: 'De quizvraag?',
    options: ['Antwoord A', 'Antwoord B', 'Antwoord C'],
    answer: 1, // positie van het goede antwoord, geteld vanaf 0
    explain: 'Korte uitleg die na het antwoorden verschijnt.',
  },
},
```

De lijsten lopen rond (nu 15 weetjes en 8 verdiepingen); de app husselt de antwoorden per dag.
Voeg je een item toe, dan schuift de volgorde voor de dagen erna op.

Wie Node heeft, kan de inhoud laten controleren met `node scripts/check-content.mjs`: dat meldt
vormfouten en laat zien wat er de komende week aan de beurt is.

## Bestanden

| Bestand | Wat het doet |
| --- | --- |
| `index.html` | De hele app: opmaak, schermen, dagreeks, bewaren, quiz |
| `content/facts.js`, `content/deepdives.js` | Eigen weetjes en verdiepingen, met quizvraag |
| `news.json` | De nieuwspunten van vandaag (automatisch ververst) |
| `scripts/fetch-news.mjs` | Haalt de RSS-feeds op; de lijst met feeds staat bovenin |
| `scripts/check-content.mjs` | Controleert de eigen inhoud |
| `.github/workflows/nieuws.yml` | Draait het nieuws-script elke ochtend |
| `manifest.webmanifest`, `sw.js`, `icons/` | Installeren op je telefoon en gebruik zonder verbinding |

## Lokaal bekijken

Dubbelklikken op `index.html` werkt niet (de browser laadt dan de inhoudsbestanden niet).
Start in de map een eenvoudige server, bijvoorbeeld `python3 -m http.server`, en open
`http://localhost:8000`.
