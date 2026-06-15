import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { FeedbackBar, ModeShell, ResultScreen } from '../components/ModeShell'
import { fragmentItems } from '../lib/select'
import { shuffle } from '../lib/text'
import { useApp } from '../state/AppContext'
import type { ModeProps } from './types'

export default function FragmentBuilder({ chapterId, accentKey, onClose, onFinish }: ModeProps) {
  const app = useApp()
  const frags = useMemo(() => fragmentItems(chapterId).slice(0, 8), [chapterId])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number[]>([])
  const [state, setState] = useState<'input' | 'correct' | 'wrong'>('input')
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)
  const [bank] = useState<Map<number, number[]>>(new Map())

  if (!frags.length) return <div className="grid min-h-screen place-items-center p-8 text-ink-faint">Keine Fragmente.</div>
  if (done) {
    return (
      <ResultScreen
        scorePct={correct / frags.length} correct={correct} total={frags.length} xp={correct * 14} accentKey={accentKey}
        onRetry={() => { setI(0); setPicked([]); setState('input'); setCorrect(0); setDone(false) }}
        onDone={() => onFinish(correct / frags.length)}
      />
    )
  }

  const frag = frags[i]
  // stable shuffled order of block indices for this fragment
  if (!bank.has(i)) bank.set(i, shuffle(frag.blocks.map((_, k) => k)))
  const order = bank.get(i)!
  const available = order.filter((k) => !picked.includes(k))

  const check = () => {
    const ok = picked.length === frag.blocks.length && picked.every((k, idx) => k === idx)
    setState(ok ? 'correct' : 'wrong')
    if (ok) setCorrect((c) => c + 1)
    app.award(ok, { itemId: frag.id, xp: 14 })
  }
  const next = () => {
    if (i + 1 >= frags.length) setDone(true)
    else { setI(i + 1); setPicked([]); setState('input') }
  }

  return (
    <ModeShell step={i} total={frags.length} accentKey={accentKey} onClose={onClose}>
      <div className="flex flex-1 flex-col pb-40">
        <div className="py-3">
          <span className="rounded-full bg-olive-100 px-3 py-1 text-xs font-bold text-olive-700">{frag.author} · {frag.cite}</span>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-card">
          <p className="greek text-2xl leading-relaxed text-ink">{frag.gr}</p>
        </div>

        <p className="mt-5 mb-2 text-xs font-bold uppercase tracking-widest text-ink-faint">Deine Übersetzung</p>
        <div className={`min-h-[88px] rounded-2xl border-2 border-dashed p-3 transition ${
          state === 'correct' ? 'border-teal-300 bg-teal-50' : state === 'wrong' ? 'border-coral-300 bg-orange-50' : 'border-ink/15 bg-white/50'
        }`}>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {picked.map((k, idx) => (
                <motion.button
                  key={`${k}-${idx}`} layout initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
                  onClick={() => state === 'input' && setPicked((p) => p.filter((_, j) => j !== idx))}
                  className="rounded-xl bg-olive-600 px-3 py-2 text-sm font-semibold text-white tap"
                >
                  {frag.blocks[k]}
                </motion.button>
              ))}
            </AnimatePresence>
            {picked.length === 0 && <span className="py-2 text-sm text-ink-faint">Tippe die Bausteine in der richtigen Reihenfolge an…</span>}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {available.map((k) => (
            <motion.button
              key={k} layout whileTap={{ scale: 0.95 }} onClick={() => state === 'input' && setPicked((p) => [...p, k])}
              className="rounded-xl border-2 border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink tap"
            >
              {frag.blocks[k]}
            </motion.button>
          ))}
        </div>

        {state === 'wrong' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 rounded-2xl bg-parchment-deep p-4 text-sm">
            <span className="font-bold text-ink">Richtige Übersetzung: </span><span className="text-ink-soft">{frag.de}</span>
          </motion.div>
        )}
      </div>

      {state === 'input' ? (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 px-4 pt-3">
          <div className="mx-auto flex max-w-[460px] gap-2">
            <button onClick={() => setPicked([])} className="rounded-2xl border-2 border-ink/10 bg-white px-5 py-4 font-bold text-ink/50 tap">↺</button>
            <button onClick={check} disabled={picked.length !== frag.blocks.length} className="flex-1 rounded-2xl bg-ink py-4 font-bold text-white tap shadow-float disabled:opacity-30">Prüfen</button>
          </div>
        </div>
      ) : (
        <FeedbackBar state={state} onContinue={next} continueLabel={i + 1 >= frags.length ? 'Auswerten' : 'Weiter'} correctText={state === 'correct' ? frag.de : undefined} />
      )}
    </ModeShell>
  )
}
