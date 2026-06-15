# Graecia - Lern-App fuer Griechische Terminologie

Mobile-first Lern-App fuer die Philosophie-Pruefung "Griechische Terminologie" mit geteilten Profilen, Fortschritt, XP, Achievements, Klausur-Verlauf und Bestenliste.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + Framer Motion
- Supabase Postgres fuer persistente, geraeteuebergreifende Daten

## Supabase Setup

1. Erstelle ein Supabase-Projekt.
2. Oeffne den Supabase SQL Editor.
3. Fuehre den kompletten Inhalt aus `supabase/schema.sql` aus.
4. Kopiere `.env.example` zu `.env.local` und setze:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

In Vercel dieselben Variablen unter Project Settings -> Environment Variables setzen.

> Hinweis: Die App nutzt einfache geteilte Profile ohne Passwort. Die Supabase-RLS-Policies erlauben Lesen und Schreiben mit dem public anon key, damit die Profile auf allen Geraeten funktionieren. Fuer eine oeffentliche App sollte spaeter Supabase Auth ergaenzt und die RLS-Policies pro Nutzer eingeschraenkt werden.

## Starten

```bash
npm install
npm run dev
npm run build
```

## Vercel

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
