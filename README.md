# Kennis

Een dagelijkse kennisfeed tegen doomscrollen. Elke dag één eindige editie van 7 kaarten:
3 nieuwspunten, 1 "vandaag in de geschiedenis", 1 weetje, 1 verdieping en een mini-quiz
van 3 vragen. Daarna: klaar voor vandaag.

PWA met React + Vite. Geen account, geen betaalde diensten; alles staat lokaal in de browser.

## Starten

```bash
npm install
npm run dev       # ontwikkelen, http://localhost:5173
npm run build     # productiebuild in dist/
npm run preview   # de build bekijken, inclusief service worker (offline, installeren)
```

## Opbouw

| Bestand | Wat het doet |
| --- | --- |
| `src/App.jsx` | De flow: kaart voor kaart, quiz, klaar-scherm, bewaard |
| `src/lib/edition.js` | Levert de editie van de dag — hier sluiten we de echte bronnen aan |
| `src/data/sampleEdition.js` | Voorbeeldinhoud (nieuwskaarten zijn plaatshouders) |
| `src/lib/storage.js` | Dagreeks, voortgang en bewaarde kaarten in `localStorage` |
| `src/components/` | `Card`, `Quiz`, `Done`, `Saved` |
| `vite.config.js` | PWA-manifest en service worker (`vite-plugin-pwa`) |

## Stappenplan

1. **Skelet met voorbeeldinhoud** — klaar
2. Vandaag in de geschiedenis via de Wikipedia On this day-API
3. Nieuws via RSS (NOS)
4. Weetjes en verdiepingen: eigen inhoudsbestand met dagelijkse rotatie
5. Quiz die aansluit op de editie van de dag
6. Publiceren en installeren op je telefoon
