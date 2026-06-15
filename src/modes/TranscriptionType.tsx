import { motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { FeedbackBar, ModeShell, ResultScreen } from '../components/ModeShell'
import { typeItems } from '../lib/select'
import { answerMatches, sample } from '../lib/text'
import { useApp } from '../state/AppContext'
import type { ModeProps } from './types'

// On-screen helper keys for Greek input + macrons (mobile keyboards lack these).
const GREEK_KEYS = 'αβγδεζηθικλμνξοπρστυφχψω'.split('')
const SPECIAL = ['ē', 'ō', 'ᾳ', 'ῃ', 'ῷ', 'ῥ', '᾽', '῾']

export default function TranscriptionType({ chapterId, accentKey, onClose, onFinish }: ModeProps) {
  const app = useApp()
  const items = useMemo(() => sample(typeItems(chapterId), 12), [chapterId])
  const [i, setI] = useState(0)
  const [val, setVal] = useState('')
  const [state, setState] = useState<'input' | 'correct' | 'wrong'>('input')
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!items.length) return <div className="grid min-h-screen place-items-center p-8 text-ink-faint">Keine Wörter.</div>
  if (done) {
    return (
      <ResultScreen
        scorePct={correct / items.length} correct={correct} total={items.length} xp={correct * 10} accentKey={accentKey}
        onRetry={() => { setI(0); setVal(''); setState('input'); setCorrect(0); setDone(false) }}
        onDone={() => onFinish(correct / items.length)}
      />
    )
  }

  const item = items[i]
  const toGreek = item.direction === 'lat2gr'
  const check = () => {
    const ok = answerMatches(val, item.answer, item.alt, item.direction)
    setState(ok ? 'correct' : 'wrong')
    if (ok) setCorrect((c) => c + 1)
    app.award(ok, { itemId: item.id, xp: 10 })
  }
  const next = () => {
    if (i + 1 >= items.length) setDone(true)
    else { setI(i + 1); setVal(''); setState('input') }
  }
  const insert = (s: string) => { setVal((v) => v + s); inputRef.current?.focus() }

  return (
    <ModeShell step={i} total={items.length} accentKey={accentKey} onClose={onClose}>
      <div className="flex flex-1 flex-col pb-44">
        <div className="py-3">
          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700">
            {toGreek ? 'Schreibe in griechischen Buchstaben' : 'Transkribiere ins Lateinische'}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">{toGreek ? 'Transkription' : 'Griechisch'}</p>
            <p className={`mt-2 font-bold leading-tight ${toGreek ? 'text-4xl' : 'greek text-6xl'}`}>{item.prompt}</p>
            {item.hint && <p className="mt-3 text-sm text-ink-faint">≈ {item.hint}</p>}
          </motion.div>

          <input
            ref={inputRef} value={val} autoFocus autoCapitalize="none" autoCorrect="off" spellCheck={false}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && state === 'input' && val.trim()) check() }}
            disabled={state !== 'input'}
            placeholder={toGreek ? 'griechisch tippen…' : 'z.B. logos'}
            className={`w-full rounded-2xl border-2 bg-white px-5 py-4 text-center text-2xl font-semibold outline-none transition ${toGreek ? 'greek' : ''} ${
              state === 'correct' ? 'border-teal-400 text-teal-700' : state === 'wrong' ? 'border-coral-400 text-coral-600' : 'border-ink/15 focus:border-teal-400'
            }`}
          />

          {toGreek && (
            <div className="w-full">
              <div className="mb-2 flex flex-wrap justify-center gap-1.5">
                {SPECIAL.map((k) => (
                  <button key={k} onClick={() => insert(k)} className="greek h-9 min-w-9 rounded-lg bg-amber-100 px-2 text-lg font-semibold text-sun-600 tap">{k}</button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {GREEK_KEYS.map((k) => (
                  <button key={k} onClick={() => insert(k)} className="greek h-9 w-9 rounded-lg bg-white text-lg shadow-sm tap">{k}</button>
                ))}
                <button onClick={() => setVal((v) => v.slice(0, -1))} className="h-9 rounded-lg bg-ink/10 px-3 tap">⌫</button>
              </div>
            </div>
          )}
          {!toGreek && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {['ē', 'ō', 'á', 'í', 'ý', 'ô', 'â'].map((k) => (
                <button key={k} onClick={() => insert(k)} className="h-9 min-w-9 rounded-lg bg-amber-100 px-2 text-lg font-semibold text-sun-600 tap">{k}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {state === 'input' ? (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 px-4 pt-3">
          <div className="mx-auto max-w-[460px]">
            <button onClick={check} disabled={!val.trim()} className="w-full rounded-2xl bg-ink py-4 font-bold text-white tap shadow-float disabled:opacity-30">Prüfen</button>
          </div>
        </div>
      ) : (
        <FeedbackBar
          state={state} onContinue={next} continueLabel={i + 1 >= items.length ? 'Auswerten' : 'Weiter'}
          correctText={<span>Richtig: <span className={toGreek ? 'greek text-base' : ''}>{item.answer}</span></span>}
        />
      )}
    </ModeShell>
  )
}
