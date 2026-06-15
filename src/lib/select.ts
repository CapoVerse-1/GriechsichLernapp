import { ALPHABET, DIACRITICS, DIPHTHONGS, PUNCTUATION, TRANSCRIPTION_RULES } from '../content/alphabet'
import { CITATIONS, CITATION_INTRO, VORSOKRATIKER_NUMBERS } from '../content/citations'
import { FRAGMENTS } from '../content/fragments'
import { GRAMMAR } from '../content/grammar'
import { MC_QUESTIONS } from '../content/mcQuestions'
import { TRANS_WORDS, buildTypeItems } from '../content/transcription'
import { VOCAB } from '../content/vocabulary'
import type { CitationExample, FlashCard, Fragment, Group, MCQuestion, TypeItem } from '../content/types'
import { shuffle } from './text'

export interface Pair {
  id: string
  a: string
  b: string
  aLang: 'gr' | 'de' | 'normal'
  bLang: 'gr' | 'de' | 'normal'
}

const vocabBy = (groups: Group[]) => VOCAB.filter((v) => groups.includes(v.group))

// ---- Flashcards / Selbsttest decks ----
export function flashDeck(chapterId: string): FlashCard[] {
  switch (chapterId) {
    case 'alphabet':
      return [
        ...ALPHABET.map((l) => ({
          id: `fc-a-${l.name}`, front: `${l.upper} ${l.lower}`, back: `${l.name} · „${l.translit}"`,
          frontLang: 'gr' as const, backLang: 'normal' as const, hint: l.note,
        })),
        ...DIPHTHONGS.map((d) => ({
          id: `fc-d-${d.gr}`, front: d.gr, back: d.tr, frontLang: 'gr' as const, backLang: 'normal' as const,
          hint: d.note ? 'Ausnahme!' : 'Diphthong',
        })),
      ]
    case 'transkription':
      return [
        ...TRANSCRIPTION_RULES.map((r) => ({
          id: `fc-r-${r.id}`, front: r.title, back: `${r.rule}\n\nz.B. ${r.example}`, frontLang: 'normal' as const, backLang: 'normal' as const,
        })),
        ...TRANS_WORDS.map((w) => ({
          id: `fc-tw-${w.tr}`, front: w.gr, back: `${w.tr}${w.de ? `  ·  ${w.de}` : ''}`, frontLang: 'gr' as const, backLang: 'normal' as const,
        })),
      ]
    case 'diakritika':
      return [
        ...DIACRITICS.map((d) => ({
          id: `fc-di-${d.name}`, front: `${d.sign}  (${d.name})`, back: `${d.kind}: ${d.text}`, frontLang: 'normal' as const, backLang: 'normal' as const,
        })),
        ...PUNCTUATION.map((p) => ({
          id: `fc-pu-${p.name}`, front: `${p.sign}  (${p.name})`, back: p.text, frontLang: 'normal' as const, backLang: 'normal' as const,
        })),
      ]
    case 'vokabular':
      return vocabBy(['vorsokratiker', 'platon', 'aristoteles', 'allgemein']).map((v) => ({
        id: `fc-v-${v.id}`, front: v.gr, back: v.de, frontLang: 'gr' as const, backLang: 'de' as const, hint: v.tr,
      }))
    case 'zitierweise':
      return [
        { id: 'fc-z-vs', front: 'Vorsokratiker — wonach zitiert?', back: CITATION_INTRO.vorsokratiker.text, frontLang: 'normal', backLang: 'normal' },
        { id: 'fc-z-pl', front: 'Platon — wonach zitiert?', back: CITATION_INTRO.platon.text, frontLang: 'normal', backLang: 'normal' },
        { id: 'fc-z-ar', front: 'Aristoteles — wonach zitiert?', back: CITATION_INTRO.aristoteles.text, frontLang: 'normal', backLang: 'normal' },
        ...VORSOKRATIKER_NUMBERS.map((n) => ({
          id: `fc-z-n${n.n}`, front: `D-K ${n.n} = ?`, back: n.name, frontLang: 'normal' as const, backLang: 'normal' as const,
        })),
      ]
    case 'grammatik':
      return GRAMMAR.flatMap((t) =>
        t.body.map((b, i) => ({
          id: `fc-g-${t.id}-${i}`, front: `${t.icon} ${b.h}`, back: b.t, frontLang: 'normal' as const, backLang: 'normal' as const, hint: t.title,
        })),
      )
    case 'fragmente':
      return FRAGMENTS.map((f) => ({
        id: `fc-f-${f.id}`, front: f.gr, back: f.de, frontLang: 'gr' as const, backLang: 'de' as const, hint: `${f.author} · ${f.cite}`,
      }))
    default:
      return []
  }
}

// ---- Matching pairs ----
export function matchPairs(chapterId: string): Pair[] {
  if (chapterId === 'alphabet') {
    return ALPHABET.map((l) => ({ id: `m-${l.name}`, a: l.lower.split('/')[0], b: l.translit, aLang: 'gr', bLang: 'normal' }))
  }
  if (chapterId === 'transkription') {
    return TRANS_WORDS.map((w) => ({ id: `m-${w.tr}`, a: w.gr, b: w.tr, aLang: 'gr', bLang: 'normal' }))
  }
  // vocabulary + fallback: greek ↔ german
  return vocabBy(['vorsokratiker', 'platon', 'aristoteles', 'allgemein']).map((v) => ({
    id: `m-${v.id}`, a: v.gr, b: v.de, aLang: 'gr', bLang: 'de',
  }))
}

// ---- Multiple choice ----
export function mcFor(chapterId: string): MCQuestion[] {
  let chap = chapterId
  // grammatik chapter pulls the grammar MCs; others map 1:1
  const qs = MC_QUESTIONS.filter((q) => q.chapter === chap)
  if (qs.length) return qs
  // fallback for chapters without a dedicated MC bank: vocabulary-derived
  return []
}

// ---- Typing ----
export function typeItems(chapterId: string): TypeItem[] {
  const all = buildTypeItems()
  if (chapterId === 'vokabular') return all
  return all
}

// ---- Citations ----
export function citationItems(chapterId: string): CitationExample[] {
  if (chapterId === 'fragmente') {
    const cites = new Set(FRAGMENTS.map((f) => f.cite.replace('Platon, ', '')))
    return CITATIONS.filter((c) => cites.has(c.cite) || c.system === 'vorsokratiker')
  }
  return CITATIONS
}

// ---- Fragments (builder) ----
export function fragmentItems(_chapterId: string): Fragment[] {
  return shuffle(FRAGMENTS)
}

// ---- Vocab translate items (Selbsttest / exam) ----
export function vocabItems(groups: Group[]) {
  return vocabBy(groups)
}
