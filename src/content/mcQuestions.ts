import type { MCQuestion } from './types'

// Multiple-choice bank (1 or more correct). Tagged by chapter via the `chapter` map below.
// correct = array of indices.

export interface TaggedMC extends MCQuestion {
  chapter: string
}

export const MC_QUESTIONS: TaggedMC[] = [
  // ——— Alphabet & Geschichte ———
  {
    id: 'mc-alpha-1', chapter: 'alphabet',
    q: 'Wie viele Buchstaben hat das griechische Alphabet?',
    options: ['22 Buchstaben', '24 Buchstaben', '27 Buchstaben', '26 Buchstaben'],
    correct: [1],
    explain: '24 Buchstaben: 7 Vokale und 17 Konsonanten.',
  },
  {
    id: 'mc-alpha-2', chapter: 'alphabet',
    q: 'Welche Aussagen zur Entstehung des griechischen Alphabets sind richtig?',
    options: [
      'Es wurde von den Phöniziern übernommen (22 Konsonanten).',
      'Die Griechen führten Vokalzeichen ein.',
      'Es entstand direkt aus Linear A.',
      'Standardisierung 403 v. Chr. in Athen unter Eukleides.',
    ],
    correct: [0, 1, 3],
    explain: 'Das Alphabet kam über die Phönizier; die Griechen ergänzten Vokale. Standardisiert 403 v. Chr. unter Eukleides. Es stammt NICHT direkt aus Linear A (das war eine minoische Silben-/Schriftform).',
  },
  {
    id: 'mc-alpha-3', chapter: 'alphabet',
    q: 'Was war Linearschrift B?',
    options: [
      'Eine mykenische Silbenschrift mit ~80 Zeichen',
      'Hauptsächlich für ökonomische Buchführung genutzt',
      'Das fertige griechische Alphabet',
      'Bis heute nicht entziffert',
    ],
    correct: [0, 1],
    explain: 'Linear B = mykenische Silbenschrift (~80 Zeichen), v.a. Buchführung. Nicht entziffert ist Linear A. Linear B ist kein Alphabet.',
  },
  {
    id: 'mc-alpha-4', chapter: 'alphabet',
    q: 'Ordne die Epochen zeitlich richtig zu: Welche kam zuerst?',
    options: ['Klassische Zeit', 'Dunkle Jahrhunderte', 'Hellenistische Zeit', 'Archaische Zeit'],
    correct: [1],
    explain: 'Reihenfolge: Mykenisch → Dunkle Jahrhunderte (1200–800) → Archaisch → Klassisch → Hellenistisch.',
  },

  // ——— Transkription ———
  {
    id: 'mc-tr-1', chapter: 'transkription',
    q: 'Wie wird η (Eta) transkribiert?',
    options: ['e', 'ē (langes e)', 'h', 'ä'],
    correct: [1],
    explain: 'η = ē. Das Makron kennzeichnet den langen Vokal (Gegensatz: ε = e).',
  },
  {
    id: 'mc-tr-2', chapter: 'transkription',
    q: 'Welche Transkriptionen sind korrekt?',
    options: ['ω = ō', 'θ = th', 'χ = ch', 'φ = f'],
    correct: [0, 1, 2],
    explain: 'ω = ō, θ = th, χ = ch. φ wird als „ph" transkribiert, nicht „f".',
  },
  {
    id: 'mc-tr-3', chapter: 'transkription',
    q: 'Was bewirkt ein Spiritus asper (῾)?',
    options: [
      'Er wird mit „h" transkribiert',
      'Er steht am Wortanfang über dem ersten Vokal',
      'Er zeigt an, dass keine Behauchung vorliegt',
      'Bei Diphthongen steht er über dem zweiten Vokal',
    ],
    correct: [0, 1, 3],
    explain: 'Der asper = Behauchung → „h", am Wortanfang über dem 1. Vokal (bei Diphthongen über dem 2.). „Keine Behauchung" ist der Spiritus lenis.',
  },
  {
    id: 'mc-tr-4', chapter: 'transkription',
    q: 'Wie wird das υ in den Diphthongen αυ, ευ, ου transkribiert?',
    options: ['als y', 'als u', 'als v', 'als ü'],
    correct: [1],
    explain: 'υ-Diphthonge: αυ→au, ευ→eu, ου→ou. Ausnahme: υι → yi.',
  },
  {
    id: 'mc-tr-5', chapter: 'transkription',
    q: 'Wie wird ἀνάγκη korrekt transkribiert?',
    options: ['anágkē', 'anánkē', 'anánkä', 'ananke'],
    correct: [1],
    explain: 'γ vor Guttural (hier κ) wird nasaliert → „n": anánkē. Außerdem η = ē.',
  },
  {
    id: 'mc-tr-6', chapter: 'transkription',
    q: 'Warum wird ῥυθμός als „rhythmós" transkribiert?',
    options: [
      'ρ am Wortanfang ist immer behaucht → rh',
      'υ wird hier zu y',
      'Wegen γ vor Guttural',
      'Weil das Wort einen Akut trägt',
    ],
    correct: [0, 1],
    explain: 'ρ am Wortanfang → „rh"; das υ (kein Diphthong) bleibt „y" → rhythmós.',
  },
  {
    id: 'mc-tr-7', chapter: 'transkription',
    q: 'Für welche Transkriptionsrichtung müssen Akzente gesetzt werden?',
    options: [
      'griechisch → lateinisch (Akzente nötig)',
      'lateinisch → griechisch (Akzente nötig)',
      'für beide Richtungen',
      'für keine Richtung',
    ],
    correct: [1],
    explain: 'lat. → griech.: Akzente notwendig. griech. → lat.: Akzente nicht notwendig.',
  },

  // ——— Diakritika ———
  {
    id: 'mc-dia-1', chapter: 'diakritika',
    q: 'Welche Zeichen sind Akzente?',
    options: ['Akut ´', 'Gravis `', 'Spiritus asper ῾', 'Zirkumflex ῀'],
    correct: [0, 1, 3],
    explain: 'Akzente: Akut, Gravis, Zirkumflex. Der Spiritus (asper/lenis) ist kein Akzent.',
  },
  {
    id: 'mc-dia-2', chapter: 'diakritika',
    q: 'Was bedeutet ein „;" in einem griechischen Text?',
    options: ['Einen Strichpunkt', 'Ein Fragezeichen', 'Einen Doppelpunkt', 'Ein Ausrufezeichen'],
    correct: [1],
    explain: 'Das griechische „;" entspricht dem deutschen Fragezeichen.',
  },
  {
    id: 'mc-dia-3', chapter: 'diakritika',
    q: 'Wofür steht ein Punkt in der Zeilenmitte (·)?',
    options: ['Komma', 'Doppelpunkt oder Strichpunkt', 'Fragezeichen', 'Punkt am Satzende'],
    correct: [1],
    explain: 'Der Hochpunkt · steht für einen Doppelpunkt oder Strichpunkt.',
  },

  // ——— Zitierweisen ———
  {
    id: 'mc-cit-1', chapter: 'zitierweise',
    q: 'Nach welcher Ausgabe werden die Vorsokratiker zitiert?',
    options: ['Stephanus', 'Diels-Kranz', 'Bekker', 'Burnet'],
    correct: [1],
    explain: 'Vorsokratiker → Diels-Kranz (D-K), maßgeblich 5. Aufl. 1935.',
  },
  {
    id: 'mc-cit-2', chapter: 'zitierweise',
    q: 'In „D-K 22 B 3": Was bedeutet „B"?',
    options: ['Testimonium (Bericht)', 'Fragment (Originalzitat)', 'Buch 2', 'unecht zugeschrieben'],
    correct: [1],
    explain: 'B = Fragment (Originalzitat). A = Testimonium. C = unecht.',
  },
  {
    id: 'mc-cit-3', chapter: 'zitierweise',
    q: 'Welche Philosophen-Nummern stimmen?',
    options: ['22 = Heraklit', '28 = Parmenides', '11 = Thales', '59 = Pythagoras'],
    correct: [0, 1, 2],
    explain: '22 Heraklit, 28 Parmenides, 11 Thales. Pythagoras = 14; 59 = Anaxagoras.',
  },
  {
    id: 'mc-cit-4', chapter: 'zitierweise',
    q: 'Warum muss bei Platon (Stephanus) immer der Werktitel angegeben werden?',
    options: [
      'Weil die drei Bände eigens paginiert sind',
      'Weil die Seitenzahl allein nicht eindeutig ist',
      'Weil Burnet es vorschreibt',
      'Weil es drei Bände gibt',
    ],
    correct: [0, 1],
    explain: 'Die Stephanus-Ausgabe ist dreibändig und jeder Band eigens paginiert → bloße Seitenzahl genügt nicht.',
  },
  {
    id: 'mc-cit-5', chapter: 'zitierweise',
    q: 'Was bezeichnet die Zeilenangabe bei einem Platon-Zitat?',
    options: ['Die Stephanus-Zeilen', 'Die Burnet-Oxford-Zeilen', 'Die Bekker-Zeilen', 'Die Diels-Kranz-Zeilen'],
    correct: [1],
    explain: 'Zeilenangaben folgen der wissenschaftlichen Standardausgabe von John Burnet (Oxford).',
  },
  {
    id: 'mc-cit-6', chapter: 'zitierweise',
    q: 'Nach welcher Ausgabe wird Aristoteles zitiert, und was bedeutet „a"?',
    options: [
      'Bekker-Ausgabe',
      '„a" = linke Spalte',
      '„a" = erstes Buch',
      'Stephanus-Ausgabe',
    ],
    correct: [0, 1],
    explain: 'Aristoteles → Bekker-Ausgabe. „a" = linke Spalte, „b" = rechte Spalte.',
  },
  {
    id: 'mc-cit-7', chapter: 'zitierweise',
    q: 'In „Phys. I 1 184a10": Was ist „184"?',
    options: ['Das Kapitel', 'Die Bekker-Seite', 'Die Zeile', 'Das Buch'],
    correct: [1],
    explain: '184 = Bekker-Seite, a = Spalte, 10 = Zeile; I = Buch, 1 = Kapitel.',
  },

  // ——— Grammatik ———
  {
    id: 'mc-gr-1', chapter: 'grammatik',
    q: 'Was besagt die grammatische Kategorie „Medium"?',
    options: [
      'Das Subjekt tut die Handlung für sich selbst (im eigenen Interesse)',
      'Das Subjekt ist zugleich das direkte Objekt',
      'Es hat oft reflexive Bedeutung',
      'Es bezeichnet immer eine Vergangenheit',
    ],
    correct: [0, 1, 2],
    explain: 'Medium = reflexiv / im eigenen Interesse; Subjekt ist zugleich Objekt. Es ist keine Zeitangabe.',
  },
  {
    id: 'mc-gr-2', chapter: 'grammatik',
    q: 'Welche sind die vier griechischen Verbalsysteme?',
    options: ['Präsens', 'Futur', 'Perfekt', 'Aorist'],
    correct: [0, 1, 2, 3],
    explain: 'Alle vier: Präsens, Futur, Perfekt, Aorist — unterschieden durch den Aspekt.',
  },
  {
    id: 'mc-gr-3', chapter: 'grammatik',
    q: 'Was kennzeichnet den Indikativ des Aorists stets?',
    options: ['Ein Augment (ἐ-)', 'Der Optativ', 'Ein Spiritus asper', 'Das Partikel ἂν'],
    correct: [0],
    explain: 'Der Indikativ Aorist trägt stets ein Augment (ἐ-) als Zeichen der Vergangenheit.',
  },
  {
    id: 'mc-gr-4', chapter: 'grammatik',
    q: 'Woher leitet sich „Aorist" ab?',
    options: [
      'Von ἀόριστος „unbegrenzt, unbestimmt"',
      'Aus ὅρος „Grenze" + α privativum',
      'Von ἀρχή „Anfang"',
      'Von einem lateinischen Wort',
    ],
    correct: [0, 1],
    explain: 'ἀόριστος = „unbegrenzt" — aus ὅρος „Grenze" und dem verneinenden α privativum.',
  },
  {
    id: 'mc-gr-5', chapter: 'grammatik',
    q: 'Welchen zusätzlichen Modus hat das Griechische gegenüber dem Deutschen?',
    options: ['Den Konjunktiv', 'Den Optativ', 'Den Imperativ', 'Den Indikativ'],
    correct: [1],
    explain: 'Zusätzlich der Optativ (Wunsch; mit ἂν → Potentialis).',
  },
  {
    id: 'mc-gr-6', chapter: 'grammatik',
    q: 'Was drückt der Optativ mit dem Partikel ἂν im Hauptsatz aus?',
    options: ['Einen Befehl', 'Einen Potentialis (Möglichkeitsform)', 'Eine Vergangenheit', 'Eine Frage'],
    correct: [1],
    explain: 'Optativ + ἂν ohne Wirklichkeitsbezug = Potentialis / Möglichkeitsform.',
  },
  {
    id: 'mc-gr-7', chapter: 'grammatik',
    q: 'Ordne richtig zu — was drücken die Stämme aus?',
    options: [
      'Präsensstamm → Andauerndes',
      'Aoriststamm → Vollzug',
      'Perfektstamm → Ergebnis',
      'Futurstamm → Vergangenheit',
    ],
    correct: [0, 1, 2],
    explain: 'Präsens = Andauerndes, Aorist = Vollzug, Perfekt = Ergebnis.',
  },
  {
    id: 'mc-gr-8', chapter: 'grammatik',
    q: 'Unterscheide εἶναι, ὄν und οὐσία:',
    options: [
      'εἶναι = Infinitiv „(zu) sein"',
      'ὄν = Partizip „seiend / das Seiende"',
      'οὐσία = Substantiv „Seiendheit, Wesen"',
      'οὐσία = Infinitiv',
    ],
    correct: [0, 1, 2],
    explain: 'εἶναι (Inf.), ὄν (Partizip), οὐσία (Substantiv „Seiendheit, Wesen").',
  },
  {
    id: 'mc-gr-9', chapter: 'grammatik',
    q: 'Was ist ein ACI (Accusativus cum Infinitivo)?',
    options: [
      'Eine Konstruktion aus Akkusativ + Infinitiv',
      'Im Deutschen oft mit „dass" übersetzt',
      'Der Akkusativ wird zum Subjekt, der Infinitiv zum Prädikat',
      'Eine Form des Optativs',
    ],
    correct: [0, 1, 2],
    explain: 'ACI: Akk. + Inf. → „dass"-Satz; Akk. wird Subjekt, Inf. wird Prädikat.',
  },
]
