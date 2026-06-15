# Graecia — Lern-App für Griechische Terminologie

Eine mobile-first Lern-App für die Philosophie-Prüfung **„Griechische Terminologie"** (Univ. Wien, VO 180013). Der komplette Stoff stammt 1:1 aus den 16 Handouts im Ordner `../Handouts` (siehe `../STOFFUEBERSICHT.md`).

## Stack
- **React 18 + TypeScript + Vite**
- **Tailwind CSS** (cleanes, verspieltes Design) + **Framer Motion** (Animationen)
- **SQLite via sql.js (WASM)** für Fortschritt & Persistenz — die Datenbank wird als Base64 in `localStorage` gespeichert

## Starten
```bash
npm install
npm run dev      # Dev-Server (http://localhost:5173)
npm run build    # Production-Build nach dist/
npm run preview  # Build lokal ansehen
```
> Beim ersten `npm install` wird `sql.js` automatisch aufgelöst; die WASM-Datei wird über `?url` von Vite eingebunden. (Eine Kopie liegt zusätzlich in `public/sql-wasm.wasm`.)

## 7 Kapitel
1. Das Alphabet & Geschichte · 2. Transkription · 3. Diakritika · 4. Vokabular (~130 Begriffe) · 5. Zitierweisen · 6. Grammatik · 7. Die Fragmente.
Jedes Kapitel lässt sich **starten, zwischenspeichern und abschließen**.

## 9 Lernmodi
**Vom Nutzer gewünscht:** Karteikarten (Lernen), Selbsttest (Karteikarten zum Prüfen), Multiple Choice (1+ richtig), Buchstaben-Matching (Duolingo-Stil).
**5 zusätzliche:** Transkriptions-Tipptrainer, Fragment-Übersetzungs-Builder, Zitat-Analysator, Blitz-Runde (Timer), Klausur-Simulation (68 Punkte mit Notenschlüssel).

## Gamification
XP & Level (mit Titeln), Tagesstreak, Achievements, Kapitel-Fortschritt, Klausur-Verlauf — alles in SQLite persistiert.

## Projektstruktur
```
src/
  content/   # Stoff als typisierte Daten (alphabet, vocabulary, citations, fragments, grammar, mcQuestions, exam, chapters)
  db/        # sql.js Init (database.ts) + Fortschritt/Achievements (store.ts)
  modes/     # die 9 Lernmodi
  pages/     # Home, ChapterView, Reference (Stoff lesen), Stats
  components/ # UI-Primitive, ModeShell, ModeRouter, AchievementToast
  state/     # AppContext (reaktiver Zustand über der DB)
  lib/       # Text-Normalisierung & Content-Selektoren
```
