import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { ModeShell, ResultScreen } from '../components/ModeShell'
import { flashDeck } from '../lib/select'
import { shuffle } from '../lib/text'
import { useApp } from '../state/AppContext'
import type { ModeProps } from './types'

export default function Flashcards({ chapterId, accentKey, onClose, onFinish }: ModeProps) {
  const app = useApp()
  const deck = useMemo(() => shuffle(flashDeck(chapterId)), [chapterId])
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [done, setDone] = useState(false)

  if (!deck.length) {
    return <div className="grid min-h-screen place-items-center p-8 text-center text-ink-faint">Keine Karten in diesem Kapitel.</div>
  }
  if (done) {
    return (
      <ResultScreen
        scorePct={known / deck.length} correct={known} total={deck.length} xp={known * 4} accentKey={accentKey}
        onRetry={() => { setI(0); setFlipped(false); setKnown(0); setDone(false) }}
        onDone={() => onFinish(known / deck.length)}
      />
    )
  }

  const card = deck[i]
  const advance = (wasKnown: boolean) => {
    if (wasKnown) { setKnown((k) => k + 1); app.award(true, { itemId: card.id, xp: 4 }) }
    if (i + 1 >= deck.length) setDone(true)
    else { setI(i + 1); setFlipped(false) }
  }

  return (
    <ModeShell step={i} total={deck.length} accentKey={accentKey} onClose={onClose}>
      <div className="flex flex-1 flex-col">
        <p className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Tippe zum Umdrehen · Karte {i + 1}/{deck.length}
        </p>
        <div className="flex flex-1 items-center justify-center py-2" style={{ perspective: 1200 }}>
          <AnimatePresence mode="wait">
            <motion.button
              key={card.id}
              onClick={() => setFlipped((f) => !f)}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.96 }}
              className="relative h-[58vh] w-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl bg-white p-6 shadow-card"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-ink-faint">Vorderseite</span>
                  <span className={`text-center font-bold leading-tight ${card.frontLang === 'gr' ? 'greek text-5xl' : 'text-3xl'}`}>{card.front}</span>
                  {card.hint && <span className="text-sm text-ink-faint">{card.hint}</span>}
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 p-6 text-white shadow-card"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">Rückseite</span>
                  <span className={`whitespace-pre-line text-center font-semibold leading-snug ${card.backLang === 'gr' ? 'greek text-4xl' : 'text-2xl'}`}>{card.back}</span>
                </div>
              </motion.div>
            </motion.button>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4 pt-2">
          <button onClick={() => advance(false)} className="rounded-2xl border-2 border-ink/10 bg-white py-4 font-bold text-ink/60 tap">
            ↻ Nochmal üben
          </button>
          <button onClick={() => advance(true)} className="rounded-2xl bg-teal-600 py-4 font-bold text-white tap shadow-float">
            ✓ Gewusst
          </button>
        </div>
      </div>
    </ModeShell>
  )
}
