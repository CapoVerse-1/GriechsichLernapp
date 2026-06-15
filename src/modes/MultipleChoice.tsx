import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { FeedbackBar, ModeShell, ResultScreen } from '../components/ModeShell'
import { mcFor } from '../lib/select'
import { sample, shuffle } from '../lib/text'
import { useApp } from '../state/AppContext'
import type { MCQuestion } from '../content/types'
import type { ModeProps } from './types'

interface Prepared extends MCQuestion { order: number[] }

export default function MultipleChoice({ chapterId, accentKey, onClose, onFinish }: ModeProps) {
  const app = useApp()
  const questions = useMemo<Prepared[]>(() => {
    const base = mcFor(chapterId)
    return sample(base, Math.min(10, base.length)).map((q) => ({ ...q, order: shuffle(q.options.map((_, i) => i)) }))
  }, [chapterId])

  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<Set<number>>(new Set())
  const [checked, setChecked] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)

  if (!questions.length) return <div className="grid min-h-screen place-items-center p-8 text-center text-ink-faint">Für dieses Kapitel gibt es keine Multiple-Choice-Fragen.</div>
  if (done) {
    return (
      <ResultScreen
        scorePct={correctCount / questions.length} correct={correctCount} total={questions.length} xp={correctCount * 10} accentKey={accentKey}
        onRetry={() => { setI(0); setPicked(new Set()); setChecked(false); setCorrectCount(0); setDone(false) }}
        onDone={() => onFinish(correctCount / questions.length)}
      />
    )
  }

  const q = questions[i]
  const multi = q.correct.length > 1
  const isCorrect = () => {
    const want = new Set(q.correct)
    if (picked.size !== want.size) return false
    for (const p of picked) if (!want.has(p)) return false
    return true
  }

  const toggle = (idx: number) => {
    if (checked) return
    setPicked((prev) => {
      const next = new Set(prev)
      if (multi) { next.has(idx) ? next.delete(idx) : next.add(idx) }
      else { next.clear(); next.add(idx) }
      return next
    })
  }

  const check = () => {
    const ok = isCorrect()
    setChecked(true)
    if (ok) setCorrectCount((c) => c + 1)
    app.award(ok, { itemId: q.id, xp: 10 })
  }
  const next = () => {
    if (i + 1 >= questions.length) setDone(true)
    else { setI(i + 1); setPicked(new Set()); setChecked(false) }
  }

  return (
    <ModeShell step={i} total={questions.length} accentKey={accentKey} onClose={onClose}>
      <div className="flex flex-1 flex-col pb-40">
        <div className="flex items-center gap-2 py-3">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-sun-600">
            {multi ? 'Mehrere Antworten möglich' : 'Eine Antwort'}
          </span>
        </div>
        <h2 className="mb-5 text-xl font-extrabold leading-snug">{q.q}</h2>
        <div className="flex flex-col gap-3">
          {q.order.map((idx) => {
            const opt = q.options[idx]
            const sel = picked.has(idx)
            const isAns = q.correct.includes(idx)
            let cls = 'border-ink/10 bg-white'
            if (checked) {
              if (isAns) cls = 'border-teal-500 bg-teal-50'
              else if (sel) cls = 'border-coral-400 bg-orange-50'
              else cls = 'border-ink/10 bg-white opacity-60'
            } else if (sel) cls = 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
            return (
              <motion.button
                key={idx} whileTap={{ scale: checked ? 1 : 0.98 }} onClick={() => toggle(idx)}
                className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left font-medium transition ${cls}`}
              >
                <span className={`grid h-6 w-6 shrink-0 place-items-center ${multi ? 'rounded-md' : 'rounded-full'} border-2 text-xs font-bold ${sel ? 'border-teal-500 bg-teal-500 text-white' : 'border-ink/20 text-transparent'}`}>
                  {checked ? (isAns ? '✓' : sel ? '✕' : '') : sel ? (multi ? '✓' : '●') : ''}
                </span>
                <span className="flex-1">{opt}</span>
              </motion.button>
            )
          })}
        </div>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-parchment-deep p-4 text-sm text-ink-soft">
            <span className="font-bold">Erklärung: </span>{q.explain}
          </motion.div>
        )}
      </div>

      {!checked ? (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 px-4 pt-3">
          <div className="mx-auto max-w-[460px]">
            <button onClick={check} disabled={picked.size === 0} className="w-full rounded-2xl bg-ink py-4 font-bold text-white tap shadow-float disabled:opacity-30">
              Prüfen
            </button>
          </div>
        </div>
      ) : (
        <FeedbackBar state={isCorrect() ? 'correct' : 'wrong'} onContinue={next} continueLabel={i + 1 >= questions.length ? 'Auswerten' : 'Weiter'} />
      )}
    </ModeShell>
  )
}
