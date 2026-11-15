# Kennis

Een dagelijkse kennisfeed tegen doomscrollen. Elke dag één eindige editie van 7 kaarten:
3 nieuwspunten, 1 "vandaag in de geschiedenis", 1 weetje, 1 verdieping en een mini-quiz
van 3 vragen. Daarna: klaar voor vandaag.

PWA met React + Vite. Geen account, geen betaalde diensten; alles staat lokaal in de browser.

## Starten

```bash
npm install
npm run news      # nieuws ophalen naar public/news.json (NOS, BBC, The Guardian)
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
| Weetje, verdieping | Voorbeeldinhoud | Volgt in stap 4 |

Is een bron onbereikbaar, dan valt dat onderdeel terug op voorbeeldinhoud en meldt de app dat.
Een complete editie wordt per dag vastgelegd, zodat hij niet verspringt en offline werkt.

## Opbouw

| Bestand | Wat het doet |
| --- | --- |
| `src/App.jsx` | De flow: kaart voor kaart, quiz, klaar-scherm, bewaard |
| `src/lib/edition.js` | Stelt de editie van de dag samen uit bronnen en terugval |
| `src/lib/history.js`, `src/lib/news.js` | Geschiedenis (Wikipedia) en nieuws (`news.json`) |
| `scripts/fetch-news.mjs` | Haalt de RSS-feeds op |
| `src/data/sources.js` | Lijst van bronnen |
| `src/data/sampleEdition.js` | Voorbeeldinhoud en terugval |
| `src/lib/storage.js` | Dagreeks, voortgang en bewaarde kaarten in `localStorage` |
| `src/components/` | `Card`, `Quiz`, `Done`, `Saved` |
| `vite.config.js` | PWA-manifest en service worker (`vite-plugin-pwa`) |

## Stappenplan

1. **Skelet met voorbeeldinhoud** — klaar
2. **Vandaag in de geschiedenis via Wikipedia** — klaar
3. **Nieuws via RSS, Nederlands en Engels** — klaar (nog handmatig: `npm run news`)
4. Weetjes en verdiepingen: eigen inhoudsbestand met dagelijkse rotatie
5. Quiz die volledig aansluit op de editie van de dag
6. Publiceren, nieuws dagelijks automatisch verversen, installeren op je telefoon
