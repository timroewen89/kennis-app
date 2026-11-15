# Kennis

Een dagelijkse kennisfeed tegen doomscrollen. Elke dag één eindige editie van 7 kaarten:
3 nieuwspunten, 1 "vandaag in de geschiedenis", 1 weetje, 1 verdieping en een mini-quiz
van 3 vragen. Daarna: klaar voor vandaag.

PWA met React + Vite. Geen account, geen betaalde diensten; alles staat lokaal in de browser.

## Starten

```bash
npm install
npm run news      # nieuws ophalen naar public/news.json (NOS, BBC, The Guardian)
npm run check     # eigen inhoud controleren en de komende week tonen
npm run dev       # ontwikkelen, http://localhost:5173
npm run build     # productiebuild in dist/
npm run preview   # de build bekijken, inclusief service worker (offline, installeren)
```

## Bronnen

Nederlands en Engels door elkaar; Engelse kaarten blijven in het Engels (geen vertaaldienst).
Alle bronnen staan in `src/data/sources.js`.

| Onderdeel | Bron | Hoe |
| --- | --- | --- |
| Nieuws | NOS (nl), BBC News (en), The Guardian (en) | `npm run news` schrijft `public/news.json`; de feeds staan geen directe browser-aanroep toe (CORS) |
| Geschiedenis | Engelse Wikipedia, On this day | Rechtstreeks vanuit de app; de Nederlandse variant van deze API bestaat niet |
| Weetje | `src/data/facts.js` (nl) | Elke dag het volgende uit de lijst |
| Verdieping | `src/data/deepdives.js` (nl) | Elke dag de volgende uit de lijst |
| Mini-quiz | De kaarten van de dag | Eén vraag bij het weetje, de geschiedenis en de verdieping |

Is een bron onbereikbaar, dan valt dat onderdeel terug op voorbeeldinhoud en meldt de app dat.
Een complete editie wordt per dag vastgelegd, zodat hij niet verspringt en offline werkt.

## Eigen inhoud toevoegen

Weetjes en verdiepingen staan als gewone lijsten in `src/data/facts.js` en `src/data/deepdives.js`.
Kopieer een bestaand blok, plak het onderaan en pas het aan:

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

Draai daarna `npm run check`: dat meldt vormfouten en laat zien wat er de komende week aan de beurt is.
De lijsten lopen rond (nu 15 weetjes en 8 verdiepingen); de app husselt de antwoorden per dag.
Voeg je een item toe, dan schuift de volgorde voor de dagen erna op.

## Opbouw

| Bestand | Wat het doet |
| --- | --- |
| `src/App.jsx` | De flow: kaart voor kaart, quiz, klaar-scherm, bewaard |
| `src/lib/edition.js` | Stelt de editie van de dag samen uit bronnen en terugval |
| `src/lib/history.js`, `src/lib/news.js` | Geschiedenis (Wikipedia) en nieuws (`news.json`) |
| `scripts/fetch-news.mjs` | Haalt de RSS-feeds op |
| `src/data/sources.js` | Lijst van bronnen |
| `src/data/facts.js`, `src/data/deepdives.js` | Eigen weetjes en verdiepingen, met quizvraag |
| `src/lib/rotation.js` | Kiest het item van de dag en husselt quizantwoorden |
| `scripts/check-content.mjs` | Controleert de eigen inhoud |
| `src/data/sampleEdition.js` | Terugval voor nieuws en geschiedenis |
| `src/lib/storage.js` | Dagreeks, voortgang en bewaarde kaarten in `localStorage` |
| `src/components/` | `Card`, `Quiz`, `Done`, `Saved` |
| `vite.config.js` | PWA-manifest en service worker (`vite-plugin-pwa`) |

## Stappenplan

1. **Skelet met voorbeeldinhoud** — klaar
2. **Vandaag in de geschiedenis via Wikipedia** — klaar
3. **Nieuws via RSS, Nederlands en Engels** — klaar (nog handmatig: `npm run news`)
4. **Weetjes en verdiepingen met dagelijkse rotatie** — klaar
5. **Quiz die aansluit op de editie van de dag** — klaar
6. Publiceren, nieuws dagelijks automatisch verversen, installeren op je telefoon
