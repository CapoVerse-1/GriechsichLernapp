import type { TypeItem } from './types'

// Greek ↔ transcription pairs used in the typing trainer.
// Includes every word from the Muster-Prüfung Q1 / Q1a plus folien exercises.
export interface TransWord {
  gr: string
  tr: string
  de?: string
}

export const TRANS_WORDS: TransWord[] = [
  // Muster Q1 (griech → lat)
  { gr: 'ποιητική', tr: 'poiētikḗ', de: 'Dichtkunst' },
  { gr: 'ὥσπερ', tr: 'hṓsper', de: 'wie' },
  { gr: 'μῦθος', tr: 'mŷthos', de: 'Erzählung' },
  { gr: 'αὐλητική', tr: 'aulētikḗ', de: 'Flötenspielkunst' },
  { gr: 'σῦριγξ', tr: 'sûrinx', de: 'Panflöte' },
  { gr: 'διθύραμβος', tr: 'dithýrambos', de: 'Dithyrambus' },
  { gr: 'κνίζω', tr: 'knízō', de: 'kratzen, reizen' },
  { gr: 'ῥίνη', tr: 'rhínē', de: 'Feile' },
  { gr: 'ψυχή', tr: 'psychḗ', de: 'Seele' },
  { gr: 'φύσις', tr: 'phýsis', de: 'Natur' },
  // Muster Q1a (lat → griech)
  { gr: 'ὕμνος', tr: 'hýmnos', de: 'Hymne' },
  { gr: 'ψόγος', tr: 'psógos', de: 'Tadel, Schimpf' },
  { gr: 'αἴτιον', tr: 'aítion', de: 'Ursache' },
  { gr: 'τραγῳδία', tr: 'tragōdía', de: 'Tragödie' },
  { gr: 'ξουθός', tr: 'xuthós', de: 'goldgelb / flink' },
  { gr: 'μεταβαλεῖν', tr: 'metabaleîn', de: 'umwenden' },
  { gr: 'ὀρχήστρα', tr: 'orchḗstra', de: 'Tanzplatz im Theater' },
  { gr: 'βαίνω', tr: 'baínō', de: 'gehen' },
  { gr: 'ζάγκλον', tr: 'zánklon', de: 'Sichel' },
  { gr: 'δεκάπηχυς', tr: 'dekápēchys', de: 'zehn Ellen lang' },
  // Folien exercises (Einheit 1–10)
  { gr: 'σοφία', tr: 'sophía', de: 'Weisheit' },
  { gr: 'τέλος', tr: 'télos', de: 'Ziel, Zweck' },
  { gr: 'ἐπιστήμη', tr: 'epistḗmē', de: 'Wissen, Können' },
  { gr: 'δόξα', tr: 'dóxa', de: 'Meinung, Schein' },
  { gr: 'διαφωνία', tr: 'diaphōnía', de: 'Dissonanz' },
  { gr: 'κόσμος', tr: 'kósmos', de: 'Ordnung, Universum' },
  { gr: 'παράδειγμα', tr: 'parádeigma', de: 'Beispiel, Muster' },
  { gr: 'ζῷον', tr: 'zôon', de: 'Lebewesen, Tier' },
  { gr: 'δημιουργός', tr: 'dēmiourgós', de: 'Handwerker, Demiurg' },
  { gr: 'συνώνυμος', tr: 'synṓnymos', de: 'gleichnamig' },
  { gr: 'αἰτία', tr: 'aitía', de: 'Grund, Ursache' },
  { gr: 'ὑποκείμενον', tr: 'hypokeímenon', de: 'das Zugrundeliegende' },
  { gr: 'νόησις', tr: 'nóēsis', de: 'Denken' },
  { gr: 'διάνοια', tr: 'diánoia', de: 'Denkvermögen, Verstand' },
  { gr: 'ἀγαθός', tr: 'agathós', de: 'gut' },
  { gr: 'τέχνη', tr: 'téchnē', de: 'Kunstfertigkeit' },
  { gr: 'ῥήτωρ', tr: 'rhḗtōr', de: 'Redner' },
  { gr: 'ὕδωρ', tr: 'hýdōr', de: 'Wasser' },
  { gr: 'ἀρετή', tr: 'aretḗ', de: 'Tugend' },
  { gr: 'ἐλπίς', tr: 'elpís', de: 'Hoffnung' },
  { gr: 'ἀνάγκη', tr: 'anánkē', de: 'Notwendigkeit' },
  { gr: 'δικαιοσύνη', tr: 'dikaiosýnē', de: 'Gerechtigkeit' },
  { gr: 'ῥιζώματα', tr: 'rhizṓmata', de: 'Verwurzelungen' },
  { gr: 'σφαῖρα', tr: 'sphaîra', de: 'Kugel' },
  { gr: 'σύμβολον', tr: 'sýmbolon', de: 'Erkennungszeichen' },
  { gr: 'φθορά', tr: 'phthorá', de: 'Vergehen' },
  { gr: 'ἄνθρωπος', tr: 'ánthrōpos', de: 'Mensch' },
  { gr: 'διδάσκω', tr: 'didáskō', de: 'lehren' },
  { gr: 'εἶδος', tr: 'eîdos', de: 'Gestalt, Idee' },
  { gr: 'ῥυθμός', tr: 'rhythmós', de: 'Rhythmus' },
  { gr: 'πόλεμος', tr: 'pólemos', de: 'Krieg' },
  { gr: 'ἱστορία', tr: 'historía', de: 'Forschung' },
  { gr: 'κατηγορία', tr: 'katēgoría', de: 'Anklage, Aussage' },
  { gr: 'πάθημα', tr: 'páthēma', de: 'Erlebnis' },
  { gr: 'πρᾶγμα', tr: 'prâgma', de: 'Handlung, Sache' },
  { gr: 'οὐσία', tr: 'ousía', de: 'Seiendheit, Wesen' },
  { gr: 'ποιότης', tr: 'poiótēs', de: 'Qualität' },
  { gr: 'ὄνομα', tr: 'ónoma', de: 'Name' },
  { gr: 'χρεών', tr: 'chreṓn', de: 'Notwendigkeit' },
  { gr: 'πατήρ', tr: 'patḗr', de: 'Vater' },
  { gr: 'δίκη', tr: 'díkē', de: 'Recht' },
  { gr: 'ἄπειρον', tr: 'ápeiron', de: 'das Unendliche' },
  { gr: 'μέγας', tr: 'mégas', de: 'groß' },
  { gr: 'δέμας', tr: 'démas', de: 'Gestalt' },
  { gr: 'θνητός', tr: 'thnētós', de: 'sterblich' },
  { gr: 'μοῖρα', tr: 'moîra', de: 'Anteil, Schicksal' },
  { gr: 'μέθεξις', tr: 'méthexis', de: 'Teilhabe' },
  { gr: 'ὕλη', tr: 'hýlē', de: 'Materie' },
  { gr: 'αἴσθησις', tr: 'aísthēsis', de: 'Wahrnehmung' },
  { gr: 'ἀλήθεια', tr: 'alḗtheia', de: 'Wahrheit' },
  { gr: 'παιδιά', tr: 'paidiá', de: 'Spiel' },
  { gr: 'φαίνομαι', tr: 'phaínomai', de: 'erscheinen' },
  { gr: 'κοῦρος', tr: 'koûros', de: 'Jüngling' },
  { gr: 'ὕβρις', tr: 'hýbris', de: 'Übermaß, Hochmut' },
  { gr: 'διαίρεσις', tr: 'diaíresis', de: 'Begriffsbestimmung' },
  { gr: 'κατάληψις', tr: 'katálēpsis', de: 'Erfassung' },
  { gr: 'σύγγραμμα', tr: 'sýngramma', de: 'Schrift, Abhandlung' },
  { gr: 'ἵππος', tr: 'híppos', de: 'Pferd' },
  { gr: 'φιλόσοφος', tr: 'philósophos', de: 'Philosoph' },
  { gr: 'λανθάνω', tr: 'lanthánō', de: 'verborgen bleiben' },
  { gr: 'ἐντελέχεια', tr: 'entelécheia', de: '(vollendete) Wirklichkeit' },
  { gr: 'ἐγκράτεια', tr: 'enkráteia', de: 'Selbstbeherrschung' },
  { gr: 'τυγχάνω', tr: 'tynchánō', de: 'treffen' },
  { gr: 'στάσις', tr: 'stásis', de: 'Stand, Bürgerkrieg' },
]

// Build typing items (both directions) from the bank.
export function buildTypeItems(): TypeItem[] {
  const items: TypeItem[] = []
  for (const w of TRANS_WORDS) {
    items.push({
      id: `t-g2l-${w.tr}`,
      prompt: w.gr,
      answer: w.tr,
      direction: 'gr2lat',
      hint: w.de,
    })
    items.push({
      id: `t-l2g-${w.tr}`,
      prompt: w.tr,
      answer: w.gr,
      direction: 'lat2gr',
      hint: w.de,
    })
  }
  return items
}
