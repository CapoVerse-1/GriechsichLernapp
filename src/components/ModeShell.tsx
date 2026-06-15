import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { ProgressBar, accent } from './ui'

export function ModeShell({
  step, total, accentKey = 'teal', onClose, lives, children,
}: {
  step: number
  total: number
  accentKey?: string
  onClose: () => void
  lives?: number
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="safe-top flex items-center gap-3 px-4 pb-1 pt-2">
        <button onClick={onClose} aria-label="Schließen" className="grid h-9 w-9 place-items-center rounded-full text-ink/50 tap text-xl">×</button>
        <ProgressBar pct={total ? step / total : 0} accentKey={accentKey} className="flex-1" height="h-3" />
        {lives !== undefined && (
          <div className="flex items-center gap-0.5 text-sm font-bold text-coral-500">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={i < lives ? '' : 'opacity-20 grayscale'}>♥</span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4">{children}</div>
    </div>
  )
}

export function FeedbackBar({
  state, correctText, onContinue, continueLabel = 'Weiter',
}: {
  state: 'correct' | 'wrong'
  correctText?: ReactNode
  onContinue: () => void
  continueLabel?: string
}) {
  const ok = state === 'correct'
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`safe-bottom fixed inset-x-0 bottom-0 z-30 px-4 pt-4 ${ok ? 'bg-teal-50' : 'bg-orange-50'} border-t ${ok ? 'border-teal-200' : 'border-orange-200'}`}
    >
      <div className="mx-auto max-w-[460px]">
        <div className="mb-3 flex items-center gap-2">
          <span className={`grid h-9 w-9 place-items-center rounded-full text-white ${ok ? 'bg-teal-600' : 'bg-coral-500'}`}>{ok ? '✓' : '×'}</span>
          <div className="min-w-0">
            <p className={`font-extrabold ${ok ? 'text-teal-700' : 'text-coral-600'}`}>{ok ? 'Richtig!' : 'Nicht ganz.'}</p>
            {correctText && <p className="truncate text-sm text-ink-soft">{correctText}</p>}
          </div>
        </div>
        <button
          onClick={onContinue}
          className={`w-full rounded-2xl py-3.5 font-bold text-white tap shadow-float ${ok ? 'bg-teal-600' : 'bg-coral-500'}`}
        >
          {continueLabel}
        </button>
      </div>
    </motion.div>
  )
}

export function Celebrate({ show }: { show: boolean }) {
  const bits = ['🎉', '✨', '🏛️', '⭐', '🌿', '📜']
  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          {Array.from({ length: 26 }).map((_, i) => {
            const left = Math.random() * 100
            const delay = Math.random() * 0.3
            const dur = 1.6 + Math.random() * 1.2
            return (
              <motion.span
                key={i}
                className="absolute text-2xl"
                style={{ left: `${left}%`, top: '-8%' }}
                initial={{ y: -40, opacity: 0, rotate: 0 }}
                animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: 360 }}
                transition={{ duration: dur, delay, ease: 'easeIn' }}
              >
                {bits[i % bits.length]}
              </motion.span>
            )
          })}
        </div>
      )}
    </AnimatePresence>
  )
}

export function ResultScreen({
  scorePct, correct, total, xp, accentKey = 'teal', onRetry, onDone, extra,
}: {
  scorePct: number
  correct: number
  total: number
  xp: number
  accentKey?: string
  onRetry: () => void
  onDone: () => void | Promise<void>
  extra?: ReactNode
}) {
  const [saving, setSaving] = useState(false)
  const a = accent(accentKey)
  const great = scorePct >= 0.8
  const ok = scorePct >= 0.5
  const emoji = great ? '🏆' : ok ? '🌿' : '📚'
  const msg = great ? 'Hervorragend!' : ok ? 'Gut gemacht!' : 'Weiter üben!'

  const done = async () => {
    if (saving) return
    setSaving(true)
    try { await onDone() }
    catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Celebrate show={great} />
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} className="text-7xl">
        {emoji}
      </motion.div>
      <div>
        <h2 className="text-2xl font-black">{msg}</h2>
        <p className="mt-1 text-ink-faint">{correct} von {total} richtig</p>
      </div>
      <div className="grid w-full max-w-xs grid-cols-2 gap-3">
        <div className={`rounded-2xl ${a.soft} p-4`}>
          <p className={`text-3xl font-black ${a.text}`}>{Math.round(scorePct * 100)}%</p>
          <p className="text-xs text-ink-faint">Trefferquote</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="text-3xl font-black text-sun-600">+{xp}</p>
          <p className="text-xs text-ink-faint">XP verdient</p>
        </div>
      </div>
      {extra}
      <div className="flex w-full max-w-xs flex-col gap-2 pt-2">
        <button onClick={onRetry} disabled={saving} className={`w-full rounded-2xl ${a.bg} py-3.5 font-bold text-white tap shadow-float disabled:opacity-50`}>Nochmal</button>
        <button onClick={done} disabled={saving} className="w-full rounded-2xl bg-white py-3.5 font-bold text-ink/70 tap border-2 border-ink/10 disabled:opacity-50">{saving ? 'Speichert...' : 'Fertig'}</button>
      </div>
    </div>
  )
}
