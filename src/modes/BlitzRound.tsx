import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ResultScreen } from '../components/ModeShell'
import { VOCAB } from '../content/vocabulary'
import { TRANS_WORDS } from '../content/transcription'
import { sample, shuffle } from '../lib/text'
import { useApp } from '../state/AppContext'
import type { ModeProps } from './types'

const DURATION = 60

interface Q { id: string; prompt: string; promptGreek: boolean; options: string[]; correct: number }

function buildQuestions(chapterId: string): Q[] {
  const out: Q[] = []
  const vocab = chapterId === 'transkription' || chapterId === 'alphabet'
    ? TRANS_WORDS.map((w) => ({ id: w.tr, gr: w.gr, de: w.tr, label: 'Transkription' }))
    : VOCAB.map((v) => ({ id: v.id, gr: v.gr, de: v.de, label: 'Deutsch' }))
  for (const v of shuffle(vocab)) {
    const distractors = sample(vocab.filter((x) => x.de !== v.de), 3).map((x) => x.de)
    const opts = shuffle([v.de, ...distractors])
    out.push({ id: `blitz-${v.id}`, prompt: v.gr, promptGreek: true, options: opts, correct: opts.indexOf(v.de) })
  }
  return out
}

export default function BlitzRound({ chapterId, accentKey, onClose, onFinish }: ModeProps) {
  const app = useApp()
  const questions = useMemo(() => buildQuestions(chapterId), [chapterId])
  const [qi, setQi] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [correctTotal, setCorrectTotal] = useState(0)
  const [time, setTime] = useState(DURATION)
  const [flash, setFlash] = useState<{ idx: number; ok: boolean } | null>(null)
  const [phase, setPhase] = useState<'ready' | 'play' | 'done'>('ready')
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (phase !== 'play') return
    timer.current = window.setInterval(() => {
      setTime((t) => {
        if (t <= 1) { window.clearInterval(timer.current!); setPhase('done'); return 0 }
        return t - 1
      })
    }, 1000)
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [phase])

  if (phase === 'ready') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-8 text-center">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} className="text-7xl">⚡</motion.div>
        <div>
          <h2 className="text-2xl font-black">Blitz-Runde</h2>
          <p className="mt-2 text-ink-faint">60 Sekunden. So viele richtige Antworten wie möglich. Combos geben Extra-Punkte!</p>
        </div>
        <button onClick={() => setPhase('play')} className="w-full max-w-xs rounded-2xl bg-coral-500 py-4 font-black text-white tap shadow-float">Los geht's!</button>
        <button onClick={onClose} className="text-sm font-semibold text-ink-faint tap">Abbrechen</button>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <ResultScreen
        scorePct={answered ? correctTotal / answered : 0} correct={correctTotal} total={answered} xp={score} accentKey="coral"
        onRetry={() => { setQi(0); setScore(0); setCombo(0); setAnswered(0); setCorrectTotal(0); setTime(DURATION); setPhase('play') }}
        onDone={() => onFinish(answered ? correctTotal / answered : 0)}
        extra={<div className="rounded-2xl bg-coral-50 px-6 py-3 font-bold text-coral-600">Blitz-Score: {score} ⚡</div>}
      />
    )
  }

  const q = questions[qi % questions.length]
  const pick = (idx: number) => {
    if (flash) return
    const ok = idx === q.correct
    setFlash({ idx, ok })
    setAnswered((a) => a + 1)
    if (ok) {
      const newCombo = combo + 1
      setCombo(newCombo); setCorrectTotal((c) => c + 1)
      setScore((s) => s + 10 + Math.min(newCombo, 5) * 2)
      setTime((t) => Math.min(DURATION, t + 1))
      app.award(true, { itemId: q.id, xp: 4 })
    } else {
      setCombo(0); app.award(false)
    }
    setTimeout(() => { setFlash(null); setQi((n) => n + 1) }, 350)
  }

  return (
    <div className="flex min-h-screen flex-col px-4">
      <div className="safe-top flex items-center gap-3 pb-2 pt-2">
        <button onClick={() => setPhase('done')} aria-label="Stop" className="grid h-9 w-9 place-items-center rounded-full text-ink/50 tap text-xl">✕</button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink/10">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-coral-400 to-coral-600" animate={{ width: `${(time / DURATION) * 100}%` }} transition={{ ease: 'linear', duration: 1 }} />
        </div>
        <span className={`w-10 text-right font-black tabular-nums ${time <= 10 ? 'text-coral-500' : 'text-ink'}`}>{time}</span>
      </div>

      <div className="flex items-center justify-between py-1">
        <span className="text-sm font-bold text-coral-500">⚡ {score}</span>
        <AnimatePresence>
          {combo >= 2 && (
            <motion.span key={combo} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="rounded-full bg-sun-500 px-3 py-0.5 text-xs font-black text-white">
              {combo}× COMBO 🔥
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-6">
        <AnimatePresence mode="wait">
          <motion.div key={qi} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="rounded-3xl bg-white p-8 text-center shadow-card">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">Was bedeutet …</p>
            <p className="greek mt-2 text-5xl font-bold">{q.prompt}</p>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-3 pb-6">
          {q.options.map((opt, idx) => {
            let cls = 'border-ink/10 bg-white'
            if (flash) {
              if (idx === q.correct) cls = 'border-teal-500 bg-teal-50'
              else if (idx === flash.idx) cls = 'border-coral-400 bg-orange-50'
              else cls = 'opacity-50 border-ink/10 bg-white'
            }
            return (
              <motion.button key={idx} whileTap={{ scale: 0.97 }} onClick={() => pick(idx)} className={`rounded-2xl border-2 p-4 text-left font-semibold transition ${cls}`}>
                {opt}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
