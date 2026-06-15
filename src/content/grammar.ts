// Grammar & Formenlehre reference content (Einheit 4–9 + Handout Formenlehre).

export interface GrammarTopic {
  id: string
  title: string
  icon: string
  body: { h: string; t: string }[]
}

export const GRAMMAR: GrammarTopic[] = [
  {
    id: 'g-diathese',
    title: 'Diathese / Genus Verbi',
    icon: '🔁',
    body: [
      { h: 'Drei Diathesen', t: 'Aktiv, Medium und Passiv geben die Handlungsrichtung an. Das Medium ist die griechische Zusatzform neben Aktiv und Passiv.' },
      { h: 'Aktiv', t: 'Ich wasche. — λύω τὸν αἰχμάλωτον = „Ich befreie den Gefangenen."' },
      { h: 'Passiv', t: 'Ich werde gewaschen. — λύομαι ὑπὸ Ἀχιλλέως = „Ich werde von Achill befreit."' },
      { h: 'Medium', t: 'Reflexiv / im eigenen Interesse. λύομαι = „Ich befreie mich selbst." In der Übersetzung oft am Reflexivpronomen („mich") erkennbar.' },
      { h: 'Bornemann-Risch §204', t: '(1) Das Subjekt tut die Handlung für sich selbst. (2) Das Subjekt ist zugleich das direkte Objekt der Verbalhandlung.' },
      { h: 'Achtung', t: 'In vielen Tempora hat das Medium keine eigene Form (Präsens Medium/Passiv identisch) → mediale oder passive Bedeutung aus dem Kontext. Prüfungsbeispiel: φαινόμενον ist Partizip Medium von φαίνομαι.' },
    ],
  },
  {
    id: 'g-aspekt',
    title: 'Tempus & Aspekt (Aktionsart)',
    icon: '⏳',
    body: [
      { h: 'Vier Verbalsysteme', t: 'Präsens, Futur, Perfekt, Aorist — nahezu gleichberechtigt.' },
      { h: 'Aspekt statt Zeitstufe', t: 'Sie unterscheiden sich nicht primär durch ein zeitliches Verhältnis, sondern durch den Aspekt (lat. aspicere „ansehen") / die Aktionsart — die Art, wie eine Verbalhandlung betrachtet wird.' },
      { h: 'Die drei Stämme', t: 'Präsensstamm → Andauerndes · Perfektstamm → Ergebnis · Aoriststamm → Vollzug.' },
      { h: 'Beispielpaare', t: '„suchen/finden", „werfen/treffen" (βάλλειν/βαλεῖν): „Ich habe zwei Stunden gesucht" (Dauer) vs. „Ich habe etwas gefunden" (keine Dauer).' },
    ],
  },
  {
    id: 'g-aorist',
    title: 'Aorist & Augment',
    icon: '⚡',
    body: [
      { h: 'Herkunft', t: 'ἀόριστος = „unbegrenzt, unbestimmt" — aus ὅρος „Grenze" + α privativum (verneinendes α).' },
      { h: 'Bedeutung', t: 'Der Indikativ Aorist ist ein Vergangenheitstempus (dt. Präteritum) und betont den punktuellen Aspekt (Vollzug).' },
      { h: 'Augment', t: 'Der Indikativ des Aorists trägt stets ein Augment (ἐ-) als Zeichen der Vergangenheitsbedeutung. Auch Imperfekt und Perfekt-Präteritum bilden es.' },
      { h: 'σα-Aorist (schwach)', t: 'Tempuszeichen -σ-, Kennvokal α (z.B. ἔδειξε, ἐποίησε).' },
      { h: 'Gnomischer Aorist', t: 'Drückt etwas Allgemeingültiges oder Erfahrungstatsachen aus — wird dann nicht mit einer Vergangenheitsform übersetzt.' },
    ],
  },
  {
    id: 'g-modus',
    title: 'Modus & Optativ',
    icon: '🌙',
    body: [
      { h: 'Deutsche Modi', t: 'Indikativ (Ich gehe), Konjunktiv (Wenn … wären), Imperativ (Sei ruhig!).' },
      { h: 'Optativ', t: 'Das Griechische hat zusätzlich den Optativ. Im Hauptsatz zeigt er einen Wunsch an.' },
      { h: 'Potentialis', t: 'In Verbindung mit dem Partikel ἂν (ohne direkten Wirklichkeitsbezug) drückt der Optativ ein Potentialis / eine Möglichkeitsform aus.' },
    ],
  },
  {
    id: 'g-kasus',
    title: 'Kasus & ACI',
    icon: '🧩',
    body: [
      { h: 'Die vier Fälle', t: '1. Fall Nominativ · 2. Fall Genitiv · 3. Fall Dativ · 4. Fall Akkusativ.' },
      { h: 'Spezialfälle', t: 'dativus possessoris (Besitz), accusativus respectus („an" + Wort), genitivus objectivus/subjectivus.' },
      { h: 'ACI', t: 'Accusativus cum Infinitivo: Akkusativ + Infinitiv → dt. „dass"-Satz. Der Akkusativ wird zum Subjekt, der Infinitiv zum Prädikat (z.B. εἴρηκε … = „hat gesagt, dass …").' },
    ],
  },
  {
    id: 'g-einai',
    title: 'εἶναι · ὄν · οὐσία',
    icon: '🜔',
    body: [
      { h: 'εἶναι', t: 'Infinitiv „(zu) sein" — das Verb selbst.' },
      { h: 'ὄν', t: 'Partizip Präsens „seiend / das Seiende".' },
      { h: 'οὐσία', t: 'Substantiv „Seiendheit, Wesen".' },
      { h: 'Wortfamilie νοεῖν', t: 'τὸ νοεῖν „das Denken" · νόησις „Denken (Tätigkeit)" · νόημα „Gedanke (Ergebnis)" · νούμενα „das Gedachte (Inhalt)".' },
    ],
  },
  {
    id: 'g-formen',
    title: 'Verbformen (Indikativ Präsens)',
    icon: '📖',
    body: [
      { h: 'εἰμί „sein" (-μι)', t: 'Sg.: εἰμί · εἶ · ἐστί(ν) — Pl.: ἐσμέν · ἐστέ · εἰσί(ν). Infinitiv: εἶναι.' },
      { h: 'λέγω „sagen" (-ω)', t: 'Sg.: λέγω · λέγεις · λέγει — Pl.: λέγομεν · λέγετε · λέγουσι(ν). Infinitiv: λέγειν.' },
      { h: 'χωρέω „weichen" (contracta)', t: 'Sg.: χωρῶ · χωρεῖς · χωρεῖ — Pl.: χωροῦμεν · χωρεῖτε · χωροῦσι(ν). Infinitiv: χωρεῖν.' },
      { h: 'γίγνομαι „werden" (Medium/Passiv, Deponens)', t: 'Sg.: γίγνομαι · γίγνῃ · γίγνεται — Pl.: γιγνόμεθα · γίγνεσθε · γίγνονται. Infinitiv: γίγνεσθαι.' },
    ],
  },
  {
    id: 'g-methode',
    title: 'Übersetzungsmethode',
    icon: '🎯',
    body: [
      { h: 'Schritt 1', t: 'Verbales Prädikat suchen (Achtung: das verbale, nicht das logische Prädikat).' },
      { h: 'Schritt 2', t: 'Subjekt suchen (Nominativ).' },
      { h: 'Schritt 3', t: 'Prädikativum / Objekte / Attribute bestimmen.' },
      { h: 'Valenzformel', t: 'Mit Platzhaltern arbeiten: „Irgendwer/was … Irgendwen/was" und dann die Wörter einsetzen.' },
    ],
  },
]
