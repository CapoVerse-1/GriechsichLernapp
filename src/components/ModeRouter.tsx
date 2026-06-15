import { lazy, Suspense } from 'react'
import type { ModeId } from '../content/types'
import type { ModeProps } from '../modes/types'

const Flashcards = lazy(() => import('../modes/Flashcards'))
const FlashcardQuiz = lazy(() => import('../modes/FlashcardQuiz'))
const MultipleChoice = lazy(() => import('../modes/MultipleChoice'))
const LetterMatch = lazy(() => import('../modes/LetterMatch'))
const TranscriptionType = lazy(() => import('../modes/TranscriptionType'))
const FragmentBuilder = lazy(() => import('../modes/FragmentBuilder'))
const CitationAnalyzer = lazy(() => import('../modes/CitationAnalyzer'))
const BlitzRound = lazy(() => import('../modes/BlitzRound'))

const MAP: Partial<Record<ModeId, React.ComponentType<ModeProps>>> = {
  flashcards: Flashcards,
  flashquiz: FlashcardQuiz,
  mc: MultipleChoice,
  match: LetterMatch,
  type: TranscriptionType,
  builder: FragmentBuilder,
  citation: CitationAnalyzer,
  blitz: BlitzRound,
}

export function ModeRouter({ mode, ...props }: { mode: ModeId } & ModeProps) {
  const Cmp = MAP[mode]
  if (!Cmp) return <div className="grid min-h-screen place-items-center text-ink-faint">Unbekannter Modus.</div>
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-ink-faint">Lädt…</div>}>
      <Cmp {...props} />
    </Suspense>
  )
}
