import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FeedbackBar, ModeShell, ResultScreen } from '../components/ModeShell'
import { citationItems } from '../lib/select'
import { sample, shuffle } from '../lib/text'
import { useApp } from '../state/AppContext'
import type { ModeProps } from './types'

const SYS_LABEL: Record<string, string> = {
  vorsokratiker: 'Vorsokratiker · Diels-Kranz',
  platon: 'Platon · Stephanus',
  aristoteles: 'Aristoteles · Bekker',
}

export default function CitationAnalyzer({ chapterId, accentKey, onClose, onFinish }: ModeProps) {
  const app = useApp()
  const items = useMemo(() => sample(citationItems(chapterId), 8), [chapterId])
  const [i, setI] = useState(0)
  const [assign, setAssign] = useState<(number | null)[]>([])
  const [selTok, setSelTok] = useState<number | null>(null)
  const [labelOrder, setLabelOrder] = useState<number[]>([])
  const [state, setState] = useState<'input' | 'correct' | 'wrong'>('input')
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)
  const awardJobs = useRef<Promise<void>[]>([])

  const item = items[i]
  useEffect(() => {
    if (!item) return
    setAssign(new Array(item.parts.length).fill(null))
    setSelTok(null)
    setLabelOrder(shuffle(item.parts.map((_, k) => k)))
    setState('input')
  }, [item])

  if (!items.length) return <div className="grid min-h-screen place-items-center p-8 text-ink-faint">Keine Zitate.</div>
  if (done) {
    return (
      <ResultScreen
        scorePct={correct / items.length} correct={correct} total={items.length} xp={correct * 12} accentKey={accentKey}
        onRetry={() => {
          awardJobs.current = []
          setI(0)
          setCorrect(0)
          setDone(false)
        }}
        onDone={async () => {
          await Promise.allSettled(awardJobs.current)
          await onFinish(correct / items.length)
        }}
      />
    )
  }

  // `assign` is empty for one render before the effect populates it; normalise
  // it to the current item's length so indexing is always safe.
  const slots: (number | null)[] = item.parts.map((_, k) => (typeof assign[k] === 'number' ? assign[k] : null))
  const usedLabels = new Set(slots.filter((x): x is number => x !== null))
  const allAssigned = slots.every((x) => x !== null)

  const assignLabel = (labelIdx: number) => {
    if (state !== 'input' || selTok === null) return
    setAssign((prev) => {
      const next = item.parts.map((_, k) => (typeof prev[k] === 'number' ? prev[k] : null))
      // remove this label from any other slot
      for (let k = 0; k < next.length; k++) if (next[k] === labelIdx) next[k] = null
      next[selTok] = labelIdx
      return next
    })
    setSelTok(null)
  }

  const check = () => {
    const ok = slots.every((labelIdx, tokIdx) => labelIdx === tokIdx)
    setState(ok ? 'correct' : 'wrong')
    if (ok) setCorrect((c) => c + 1)
    const job = app.award(ok, { itemId: item.id, xp: 12 })
    awardJobs.current.push(job.catch((e) => {
      console.error(e)
    }))
  }
  const next = () => {
    if (i + 1 >= items.length) setDone(true)
    else setI(i + 1)
  }

  return (
    <ModeShell step={i} total={items.length} accentKey={accentKey} onClose={onClose}>
      <div className="flex flex-1 flex-col pb-40">
        <div className="py-3">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-sun-600">{SYS_LABEL[item.system]}</span>
        </div>
        <p className="mb-1 text-sm text-ink-faint">Tippe einen Bestandteil an, dann seine Bedeutung:</p>

        {/* The citation, token by token */}
        <div className="flex flex-wrap items-end gap-2 rounded-3xl bg-white p-5 shadow-card">
          {item.parts.map((p, k) => {
            const labelIdx = slots[k]
            const sel = selTok === k
            return (
              <button
                key={k} onClick={() => state === 'input' && setSelTok(sel ? null : k)}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-2 transition ${
                  sel ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                  : state === 'correct' ? 'border-teal-300 bg-teal-50'
                  : state === 'wrong' && labelIdx !== k ? 'border-coral-300 bg-orange-50'
                  : labelIdx !== null ? 'border-olive-300 bg-olive-50' : 'border-ink/15 bg-white'
                }`}
              >
                <span className="text-xl font-extrabold text-ink">{p.token}</span>
                <span className={`text-[11px] font-semibold ${labelIdx !== null ? 'text-ink-soft' : 'text-ink-faint/50'}`}>
                  {labelIdx !== null ? item.parts[labelIdx].label : '?'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Label bank */}
        <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-widest text-ink-faint">Bedeutungen</p>
        <div className="flex flex-wrap gap-2">
          {labelOrder.map((k) => {
            const used = usedLabels.has(k)
            return (
              <motion.button
                key={k} whileTap={{ scale: 0.96 }} disabled={state !== 'input'} onClick={() => assignLabel(k)}
                className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold tap ${used ? 'border-ink/5 bg-ink/5 text-ink-faint/40' : 'border-ink/10 bg-white text-ink'}`}
              >
                <span className="text-[10px] uppercase tracking-wide text-ink-faint">{item.parts[k].role}</span>
                <br />{item.parts[k].label}
              </motion.button>
            )
          })}
        </div>

        {state === 'wrong' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 rounded-2xl bg-parchment-deep p-4 text-sm text-ink-soft">
            <span className="font-bold text-ink">Lösung: </span>{item.explain}
          </motion.div>
        )}
      </div>

      {state === 'input' ? (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 px-4 pt-3">
          <div className="mx-auto max-w-[460px]">
            <button onClick={check} disabled={!allAssigned} className="w-full rounded-2xl bg-ink py-4 font-bold text-white tap shadow-float disabled:opacity-30">Prüfen</button>
          </div>
        </div>
      ) : (
        <FeedbackBar state={state} onContinue={next} continueLabel={i + 1 >= items.length ? 'Auswerten' : 'Weiter'} correctText={state === 'correct' ? item.explain : undefined} />
      )}
    </ModeShell>
  )
}
