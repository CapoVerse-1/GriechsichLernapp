import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { ModeShell, ResultScreen } from '../components/ModeShell'
import { flashDeck } from '../lib/select'
import { sample } from '../lib/text'
import { useApp } from '../state/AppContext'
import type { ModeProps } from './types'

export default function FlashcardQuiz({ chapterId, accentKey, onClose, onFinish }: ModeProps) {
  const app = useApp()
  const deck = useMemo(() => sample(flashDeck(chapterId), Math.min(15, flashDeck(chapterId).length)), [chapterId])
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)

  if (!deck.length) return <div className="grid min-h-screen place-items-center p-8 text-ink-faint">Keine Inhalte.</div>
  if (done) {
    return (
      <ResultScreen
        scorePct={correct / deck.length} correct={correct} total={deck.length} xp={correct * 8} accentKey={accentKey}
        onRetry={() => { setI(0); setRevealed(false); setCorrect(0); setDone(false) }}
        onDone={() => onFinish(correct / deck.length)}
      />
    )
  }

  const card = deck[i]
  const grade = (got: boolean) => {
    if (got) setCorrect((c) => c + 1)
    app.award(got, { itemId: card.id, xp: 8 })
    if (i + 1 >= deck.length) setDone(true)
    else { setI(i + 1); setRevealed(false) }
  }

  return (
    <ModeShell step={i} total={deck.length} accentKey={accentKey} onClose={onClose}>
      <div className="flex flex-1 flex-col">
        <p className="py-3 text-center text-sm font-semibold text-ink-faint">Frag dich selbst ab — was steht auf der Rückseite?</p>
        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full rounded-3xl bg-white p-8 text-center shadow-card"
            >
              <span className={`font-bold leading-tight ${card.frontLang === 'gr' ? 'greek text-5xl' : 'text-2xl'}`}>{card.front}</span>
              {card.hint && <p className="mt-3 text-sm text-ink-faint">{card.hint}</p>}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="w-full overflow-hidden rounded-3xl bg-teal-50 p-6 text-center"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-teal-700/60">Antwort</span>
                <p className={`mt-1 whitespace-pre-line font-semibold text-teal-800 ${card.backLang === 'gr' ? 'greek text-3xl' : 'text-xl'}`}>{card.back}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pb-4 pt-3">
          {!revealed ? (
            <button onClick={() => setRevealed(true)} className="w-full rounded-2xl bg-ink py-4 font-bold text-white tap shadow-float">
              Antwort zeigen
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => grade(false)} className="rounded-2xl bg-orange-50 py-4 font-bold text-coral-600 tap border-2 border-orange-200">✕ Falsch</button>
              <button onClick={() => grade(true)} className="rounded-2xl bg-teal-600 py-4 font-bold text-white tap shadow-float">✓ Gewusst</button>
            </div>
          )}
        </div>
      </div>
    </ModeShell>
  )
}
