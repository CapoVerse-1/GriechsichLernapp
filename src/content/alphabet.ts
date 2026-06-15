import type { AlphabetLetter } from './types'

// Exact transcription table from "Handout: Transkription" (page 1 image).
export const ALPHABET: AlphabetLetter[] = [
  { upper: 'Α', lower: 'α', name: 'Alpha', translit: 'a' },
  { upper: 'Β', lower: 'β', name: 'Beta', translit: 'b' },
  { upper: 'Γ', lower: 'γ', name: 'Gamma', translit: 'g', note: 'vor γ κ ξ χ → n (nasaliert)' },
  { upper: 'Δ', lower: 'δ', name: 'Delta', translit: 'd' },
  { upper: 'Ε', lower: 'ε', name: 'Epsilon', translit: 'e', note: 'kurzes e' },
  { upper: 'Ζ', lower: 'ζ', name: 'Zeta', translit: 'z' },
  { upper: 'Η', lower: 'η', name: 'Eta', translit: 'ē', note: 'langes e (Makron)' },
  { upper: 'Θ', lower: 'θ', name: 'Theta', translit: 'th' },
  { upper: 'Ι', lower: 'ι', name: 'Iota', translit: 'i' },
  { upper: 'Κ', lower: 'κ', name: 'Kappa', translit: 'k' },
  { upper: 'Λ', lower: 'λ', name: 'Lambda', translit: 'l' },
  { upper: 'Μ', lower: 'μ', name: 'My', translit: 'm' },
  { upper: 'Ν', lower: 'ν', name: 'Ny', translit: 'n' },
  { upper: 'Ξ', lower: 'ξ', name: 'Xi', translit: 'x' },
  { upper: 'Ο', lower: 'ο', name: 'Omikron', translit: 'o', note: 'kurzes o' },
  { upper: 'Π', lower: 'π', name: 'Pi', translit: 'p' },
  { upper: 'Ρ', lower: 'ρ', name: 'Rho', translit: 'r(h)', note: 'am Wortanfang → rh' },
  { upper: 'Σ', lower: 'σ/ς', name: 'Sigma', translit: 's', note: 'ς am Wortende' },
  { upper: 'Τ', lower: 'τ', name: 'Tau', translit: 't' },
  { upper: 'Υ', lower: 'υ', name: 'Ypsilon', translit: 'y', note: 'in Diphthong αυ ευ ου → u' },
  { upper: 'Φ', lower: 'φ', name: 'Phi', translit: 'ph' },
  { upper: 'Χ', lower: 'χ', name: 'Chi', translit: 'ch' },
  { upper: 'Ψ', lower: 'ψ', name: 'Psi', translit: 'ps' },
  { upper: 'Ω', lower: 'ω', name: 'Omega', translit: 'ō', note: 'langes o (Makron)' },
]

export interface HistoryEvent {
  era: string
  time: string
  text: string
}

export const ALPHABET_HISTORY: HistoryEvent[] = [
  {
    era: 'Linearschrift A',
    time: 'ca. 1800–1450 v. Chr.',
    text: 'Von der kretisch-minoischen Kultur entwickelt. Bis heute nicht vollständig entziffert.',
  },
  {
    era: 'Linearschrift B',
    time: 'ca. 1450–1200 v. Chr.',
    text: 'Von den Mykenern aus Linear A entwickelt. Silbenschrift mit ~80 Zeichen, v.a. für ökonomische Buchführung auf Tontafeln. Verschwindet ~1200 → "Dunkle Jahrhunderte".',
  },
  {
    era: 'Griechisches Alphabet',
    time: 'ca. 900–800 v. Chr.',
    text: 'Über Handelskontakte von den Phöniziern übernommen (22 Konsonanten). Die Griechen führten Vokalzeichen ein (α ε ι ο υ η ω) → 24 Buchstaben (7 Vokale, 17 Konsonanten). Ermöglicht die Verschriftlichung (Homer, Hesiod).',
  },
  {
    era: 'Standardisierung',
    time: '403 v. Chr.',
    text: 'In Athen unter dem Archon Eukleides für die Aufzeichnung von Gesetzestexten vereinheitlicht.',
  },
]

export const EPOCHS = [
  { name: 'Mykenische Zeit (späte Bronzezeit)', time: 'ca. 1600–1200 v. Chr.' },
  { name: 'Dunkle Jahrhunderte', time: 'ca. 1200–800 v. Chr.' },
  { name: 'Archaische Zeit', time: '8.–6. Jh. v. Chr.' },
  { name: 'Klassische Zeit', time: '5.–4. Jh. v. Chr.' },
  { name: 'Hellenistische Zeit', time: '4.–1. Jh. v. Chr.' },
]

export const DIPHTHONGS = [
  { gr: 'αι', tr: 'ai' },
  { gr: 'ει', tr: 'ei' },
  { gr: 'οι', tr: 'oi' },
  { gr: 'υι', tr: 'yi', note: 'Ausnahme!' },
  { gr: 'αυ', tr: 'au' },
  { gr: 'ευ', tr: 'eu' },
  { gr: 'ου', tr: 'ou' },
]

export const TRANSCRIPTION_RULES = [
  {
    id: 'r-length',
    title: 'Vokallänge',
    rule: 'η = ē und ω = ō. Das Makron (Strich) kennzeichnet den langen Vokal und macht die Rückführung auf das Original möglich.',
    example: 'ἐπιστήμη → epistḗmē · λόγος bleibt o',
  },
  {
    id: 'r-asper',
    title: 'Spiritus asper (῾)',
    rule: 'Die Behauchung wird in der Transkription mit "h" wiedergegeben. Steht am Wortanfang über dem ersten Vokal.',
    example: 'ἁμαρτία → hamartía · Ἑλλάς → Hellás · αἵρεσις → haíresis',
  },
  {
    id: 'r-lenis',
    title: 'Spiritus lenis (᾽)',
    rule: 'Zeigt an, dass keine Behauchung vorliegt → kein "h".',
    example: 'ἀρχή → archḗ',
  },
  {
    id: 'r-diph-u',
    title: 'Diphthonge mit Ypsilon',
    rule: 'υ in αυ, ευ, ου wird zu "u" (nicht "y"). Ausnahme: υι → "yi".',
    example: 'οὐσία → ousía · εὐδαιμονία → eudaimonía · υἱός → hyios',
  },
  {
    id: 'r-gamma',
    title: 'γ vor Guttural',
    rule: 'γ vor γ, κ, ξ, χ wird nasaliert → "n". Doppelgamma γγ → "ng".',
    example: 'ἀνάγκη → anánkē · ἀγγέλλω → angélō',
  },
  {
    id: 'r-rho',
    title: 'ρ am Wortanfang',
    rule: 'Rho am Wortanfang ist immer behaucht → "rh".',
    example: 'ῥυθμός → rhythmós · ῥήτωρ → rhḗtōr',
  },
]

export const DIACRITICS = [
  { sign: '´', name: 'Akut', kind: 'Akzent', text: 'Betonungszeichen.' },
  { sign: '`', name: 'Gravis', kind: 'Akzent', text: 'Betonungszeichen.' },
  { sign: '῀', name: 'Zirkumflex', kind: 'Akzent', text: 'Betonungszeichen (Dehnung).' },
  { sign: '῾', name: 'Spiritus asper', kind: 'Spiritus', text: 'Behauchung → "h" in der Transkription.' },
  { sign: '᾽', name: 'Spiritus lenis', kind: 'Spiritus', text: 'Keine Behauchung.' },
]

export const PUNCTUATION = [
  { sign: '·', name: 'Hochpunkt', text: 'Punkt in Zeilenmitte = Doppelpunkt oder Strichpunkt.' },
  { sign: ';', name: 'Strichpunkt-Zeichen', text: 'Griechisches ";" = deutsches Fragezeichen.' },
]
