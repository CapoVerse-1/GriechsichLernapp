// ===== Content type definitions =====
// All learning content is encoded as typed data, sourced 1:1 from the
// course handouts (see /STOFFUEBERSICHT.md).

export type Group = 'vorsokratiker' | 'platon' | 'aristoteles' | 'allgemein'

export interface Vocab {
  id: string
  gr: string // Greek (with accents)
  tr: string // scholarly transcription
  de: string // German meaning
  group: Group
  note?: string
}

export interface AlphabetLetter {
  upper: string
  lower: string
  name: string
  translit: string // latin equivalent per course table
  note?: string
}

export interface Fragment {
  id: string
  cite: string // e.g. "DK 22 B 53"
  author: string
  gr: string // the Greek text
  de: string // full German translation
  // ordered German "building blocks" used by the translation builder
  blocks: string[]
}

export interface CitationPart {
  token: string // the visible token in the citation, e.g. "22"
  label: string // what it means, e.g. "Heraklit"
  role: string // category, e.g. "Philosophen-Nr"
}

export interface CitationExample {
  id: string
  system: 'vorsokratiker' | 'platon' | 'aristoteles'
  cite: string
  parts: CitationPart[]
  explain: string
}

export interface FlashCard {
  id: string
  front: string
  back: string
  frontLang?: 'gr' | 'de' | 'normal'
  backLang?: 'gr' | 'de' | 'normal'
  hint?: string
}

export interface MCQuestion {
  id: string
  q: string
  options: string[]
  correct: number[] // indices of correct answers (1 or more)
  explain: string
}

export interface TypeItem {
  id: string
  prompt: string // shown to the user
  answer: string // accepted answer (normalised on compare)
  alt?: string[] // alternative accepted answers
  direction: 'gr2lat' | 'lat2gr'
  hint?: string
}

export type ModeId =
  | 'flashcards'
  | 'flashquiz'
  | 'mc'
  | 'match'
  | 'type'
  | 'builder'
  | 'citation'
  | 'blitz'
  | 'exam'

export interface ModeMeta {
  id: ModeId
  title: string
  subtitle: string
  icon: string // emoji
  accent: string // tailwind color key, e.g. 'teal'
  examRef: string // which exam question this trains
}

export interface Chapter {
  id: string
  num: number
  title: string
  subtitle: string
  icon: string
  accent: string
  blurb: string
  // which modes are available for this chapter
  modes: ModeId[]
  // content selectors
  vocabGroups?: Group[]
  units: string[] // human-readable source unit references
}
