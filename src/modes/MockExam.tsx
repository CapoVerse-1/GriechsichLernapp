import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { EXAM_BLUEPRINT, GRADE_SCALE, TOTAL_POINTS, gradeFor, type ExamSectionSpec } from '../content/exam'
import { FRAGMENTS } from '../content/fragments'
import { mcFor, vocabItems } from '../lib/select'
import { TRANS_WORDS } from '../content/transcription'
import { Celebrate } from '../components/ModeShell'
import { answerMatches, germanMatches, sample, shuffle } from '../lib/text'
import { useApp } from '../state/AppContext'
import type { MCQuestion } from '../content/types'

type Step =
  | { kind: 'type'; sec: ExamSectionSpec; pts: number; prompt: string; answer: string; toGreek: boolean; hint?: string }
  | { kind: 'vocab'; sec: ExamSectionSpec; pts: number; gr: string; de: string; tr: string }
  | { kind: 'mc'; sec: ExamSectionSpec; pts: number; q: MCQuestion; order: number[] }
  | { kind: 'self'; sec: ExamSectionSpec; pts: number; prompt: string; promptGreek?: boolean; model: string }

function buildExam(): Step[] {
  const steps: Step[] = []
  for (const sec of EXAM_BLUEPRINT) {
    const per = sec.points / sec.count
    if (sec.kind === 'type-g2l') {
      for (const w of sample(TRANS_WORDS, sec.count)) steps.push({ kind: 'type', sec, pts: per, prompt: w.gr, answer: w.tr, toGreek: false, hint: w.de })
    } else if (sec.kind === 'type-l2g') {
      for (const w of sample(TRANS_WORDS, sec.count)) steps.push({ kind: 'type', sec, pts: per, prompt: w.tr, answer: w.gr, toGreek: true, hint: w.de })
    } else if (sec.kind === 'vocab') {
      for (const v of sample(vocabItems([sec.group!]), sec.count)) steps.push({ kind: 'vocab', sec, pts: per, gr: v.gr, de: v.de, tr: v.tr })
    } else if (sec.kind === 'mc') {
      for (const q of sample(mcFor(sec.mcChapter!), sec.count)) steps.push({ kind: 'mc', sec, pts: per, q, order: shuffle(q.options.map((_, i) => i)) })
    } else if (sec.kind === 'compare') {
      steps.push({ kind: 'self', sec, pts: sec.points, prompt: 'Erkläre den Unterschied der Formen εἶναι, ὄν, οὐσία.', model: 'εἶναι = Infinitiv „(zu) sein" (das Verb). · ὄν = Partizip Präsens „seiend / das Seiende". · οὐσία = Substantiv „Seiendheit, Wesen".' })
    } else if (sec.kind === 'fragment') {
      const f = sample(FRAGMENTS, 1)[0]
      steps.push({ kind: 'self', sec, pts: sec.points, prompt: f.gr, promptGreek: true, model: `${f.de}  (${f.author}, ${f.cite})` })
    }
  }
  return steps
}

const GREEK_KEYS = 'αβγδεζηθικλμνξοπρστυφχψω'.split('')
const SPECIAL = ['ē', 'ō', 'ῥ', '᾽', '῾']

export default function MockExam({ onClose, onFinish }: { onClose: () => void; onFinish: () => void }) {
  const app = useApp()
  const steps = useMemo(buildExam, [])
  const [i, setI] = useState(0)
  const [earned, setEarned] = useState(0)
  const [val, setVal] = useState('')
  const [picked, setPicked] = useState<Set<number>>(new Set())
  const [phase, setPhase] = useState<'answer' | 'review'>('answer')
  const [gotPts, setGotPts] = useState(0)
  const [done, setDone] = useState(false)

  if (done) {
    const total = Math.round(earned)
    const band = gradeFor(total)
    const passed = total >= 37
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
        <Celebrate show={total >= 61} />
        <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }} className="text-7xl">{band.emoji}</motion.div>
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-ink-faint">Klausur-Ergebnis</p>
          <h2 className="text-5xl font-black tabular-nums">{total}<span className="text-2xl text-ink-faint">/{TOTAL_POINTS}</span></h2>
          <p className={`mt-1 text-xl font-extrabold ${passed ? 'text-teal-700' : 'text-coral-600'}`}>{band.grade}</p>
        </div>
        <div className="w-full max-w-xs space-y-1.5 rounded-2xl bg-white p-4 text-left text-sm shadow-card">
          {GRADE_SCALE.map((b) => (
            <div key={b.grade} className={`flex justify-between rounded-lg px-3 py-1.5 ${b.grade === band.grade ? 'bg-teal-50 font-bold text-teal-700' : 'text-ink-soft'}`}>
              <span>{b.emoji} {b.grade}</span><span className="tabular-nums">{b.min}–{b.max}</span>
            </div>
          ))}
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <button onClick={() => { setI(0); setEarned(0); setVal(''); setPicked(new Set()); setPhase('answer'); setDone(false) }} className="w-full rounded-2xl bg-teal-600 py-4 font-bold text-white tap shadow-float">Neue Klausur</button>
          <button onClick={onFinish} className="w-full rounded-2xl border-2 border-ink/10 bg-white py-4 font-bold text-ink/70 tap">Fertig</button>
        </div>
      </div>
    )
  }

  const step = steps[i]
  const next = (pts: number) => {
    const ne = earned + pts
    setEarned(ne)
    if (i + 1 >= steps.length) {
      const total = Math.round(ne)
      app.saveExam(total, TOTAL_POINTS, gradeFor(total).grade)
      setDone(true)
    } else { setI(i + 1); setVal(''); setPicked(new Set()); setPhase('answer') }
  }

  // ----- graders per kind -----
  const submitType = () => {
    const ok = answerMatches(val, step.kind === 'type' ? step.answer : '', [], (step as any).toGreek ? 'lat2gr' : 'gr2lat')
    const pts = ok ? step.pts : 0
    setGotPts(pts); app.award(ok, { xp: 6 }); setPhase('review')
  }
  const submitVocab = () => {
    const ok = step.kind === 'vocab' && germanMatches(val, step.de)
    const pts = ok ? step.pts : 0
    setGotPts(pts); app.award(ok, { xp: 6 }); setPhase('review')
  }
  const submitMc = () => {
    if (step.kind !== 'mc') return
    const want = new Set(step.q.correct)
    let ok = picked.size === want.size
    for (const p of picked) if (!want.has(p)) ok = false
    const pts = ok ? step.pts : 0
    setGotPts(pts); app.award(ok, { xp: 6 }); setPhase('review')
  }

  const sec = step.sec
  const insert = (s: string) => setVal((v) => v + s)

  return (
    <div className="flex min-h-screen flex-col">
      {/* header */}
      <div className="safe-top sticky top-0 z-10 glass px-4 pb-2 pt-2 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} aria-label="Abbrechen" className="grid h-9 w-9 place-items-center rounded-full text-ink/50 tap text-xl">✕</button>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-700" animate={{ width: `${(i / steps.length) * 100}%` }} />
          </div>
          <span className="text-sm font-black tabular-nums text-teal-700">{Math.round(earned)} P</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-black text-white">Aufgabe {sec.no}</span>
          <span className="truncate text-xs font-semibold text-ink-soft">{sec.title}</span>
          <span className="ml-auto shrink-0 text-xs font-bold text-ink-faint">{sec.points} P</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-44 pt-4">
        {/* ---- TYPE ---- */}
        {step.kind === 'type' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">{step.toGreek ? 'In griechische Buchstaben' : 'Ins Lateinische transkribieren'}</p>
            <p className={`text-center font-bold ${step.toGreek ? 'text-4xl' : 'greek text-6xl'}`}>{step.prompt}</p>
            <input value={val} autoFocus autoCapitalize="none" autoCorrect="off" spellCheck={false} disabled={phase === 'review'}
              onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && val.trim() && phase === 'answer') submitType() }}
              className={`w-full rounded-2xl border-2 bg-white px-5 py-4 text-center text-2xl font-semibold outline-none ${step.toGreek ? 'greek' : ''} ${phase === 'review' ? (gotPts > 0 ? 'border-teal-400 text-teal-700' : 'border-coral-400 text-coral-600') : 'border-ink/15 focus:border-teal-400'}`} />
            {step.toGreek && (
              <div className="w-full">
                <div className="mb-1.5 flex flex-wrap justify-center gap-1.5">{SPECIAL.map((k) => <button key={k} onClick={() => insert(k)} className="greek h-9 min-w-9 rounded-lg bg-amber-100 px-2 text-lg tap">{k}</button>)}</div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {GREEK_KEYS.map((k) => <button key={k} onClick={() => insert(k)} className="greek h-9 w-9 rounded-lg bg-white text-lg shadow-sm tap">{k}</button>)}
                  <button onClick={() => setVal((v) => v.slice(0, -1))} className="h-9 rounded-lg bg-ink/10 px-3 tap">⌫</button>
                </div>
              </div>
            )}
            {!step.toGreek && <div className="flex flex-wrap justify-center gap-1.5">{['ē', 'ō', 'á', 'í', 'ý', 'ô'].map((k) => <button key={k} onClick={() => insert(k)} className="h-9 min-w-9 rounded-lg bg-amber-100 px-2 text-lg tap">{k}</button>)}</div>}
          </div>
        )}

        {/* ---- VOCAB ---- */}
        {step.kind === 'vocab' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">Ins Deutsche übersetzen</p>
            <p className="greek text-center text-6xl font-bold">{step.gr}</p>
            <input value={val} autoFocus disabled={phase === 'review'} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && val.trim() && phase === 'answer') submitVocab() }}
              placeholder="deutsche Bedeutung…"
              className={`w-full rounded-2xl border-2 bg-white px-5 py-4 text-center text-2xl font-semibold outline-none ${phase === 'review' ? (gotPts > 0 ? 'border-teal-400 text-teal-700' : 'border-coral-400 text-coral-600') : 'border-ink/15 focus:border-teal-400'}`} />
          </div>
        )}

        {/* ---- MC ---- */}
        {step.kind === 'mc' && (
          <div className="flex flex-1 flex-col">
            <h3 className="mb-4 text-lg font-extrabold leading-snug">{step.q.q}</h3>
            <div className="flex flex-col gap-3">
              {step.order.map((idx) => {
                const opt = step.q.options[idx]; const sel = picked.has(idx); const isAns = step.q.correct.includes(idx)
                let cls = 'border-ink/10 bg-white'
                if (phase === 'review') { if (isAns) cls = 'border-teal-500 bg-teal-50'; else if (sel) cls = 'border-coral-400 bg-orange-50'; else cls = 'opacity-60 border-ink/10 bg-white' }
                else if (sel) cls = 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                return (
                  <button key={idx} onClick={() => phase === 'answer' && setPicked((p) => { const n = new Set(p); n.has(idx) ? n.delete(idx) : n.add(idx); return n })}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left font-medium ${cls}`}>
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 text-xs font-bold ${sel ? 'border-teal-500 bg-teal-500 text-white' : 'border-ink/20'}`}>{phase === 'review' ? (isAns ? '✓' : sel ? '✕' : '') : sel ? '✓' : ''}</span>
                    {opt}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-ink-faint">Mehrere Antworten können richtig sein.</p>
            {phase === 'review' && <div className="mt-3 rounded-2xl bg-parchment-deep p-4 text-sm text-ink-soft"><b>Erklärung:</b> {step.q.explain}</div>}
          </div>
        )}

        {/* ---- SELF (compare / fragment) ---- */}
        {step.kind === 'self' && (
          <div className="flex flex-1 flex-col gap-4">
            <div className="rounded-3xl bg-white p-6 shadow-card">
              <p className={`leading-relaxed ${step.promptGreek ? 'greek text-2xl' : 'text-lg font-semibold'}`}>{step.prompt}</p>
            </div>
            {phase === 'answer' ? (
              <p className="px-2 text-sm text-ink-faint">Formuliere deine Antwort (im Kopf oder auf Papier) und tippe dann auf „Lösung zeigen", um dich selbst zu bewerten.</p>
            ) : (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-teal-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-700/60">Musterlösung</p>
                <p className="mt-1 text-teal-800">{step.model}</p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* footer actions */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 px-4 pt-3">
        <div className="mx-auto max-w-[460px]">
          {phase === 'answer' && step.kind === 'type' && <button onClick={submitType} disabled={!val.trim()} className="w-full rounded-2xl bg-ink py-4 font-bold text-white tap shadow-float disabled:opacity-30">Abgeben</button>}
          {phase === 'answer' && step.kind === 'vocab' && <button onClick={submitVocab} disabled={!val.trim()} className="w-full rounded-2xl bg-ink py-4 font-bold text-white tap shadow-float disabled:opacity-30">Abgeben</button>}
          {phase === 'answer' && step.kind === 'mc' && <button onClick={submitMc} disabled={picked.size === 0} className="w-full rounded-2xl bg-ink py-4 font-bold text-white tap shadow-float disabled:opacity-30">Abgeben</button>}
          {phase === 'answer' && step.kind === 'self' && <button onClick={() => setPhase('review')} className="w-full rounded-2xl bg-ink py-4 font-bold text-white tap shadow-float">Lösung zeigen</button>}

          {phase === 'review' && step.kind === 'self' && (
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => { app.award(false); next(0) }} className="rounded-2xl bg-orange-50 py-3 text-sm font-bold text-coral-600 tap border-2 border-orange-200">Nicht<br />0 P</button>
              <button onClick={() => { app.award(true, { xp: 4 }); next(step.pts / 2) }} className="rounded-2xl bg-amber-50 py-3 text-sm font-bold text-sun-600 tap border-2 border-amber-200">Teilweise<br />{Math.round(step.pts / 2)} P</button>
              <button onClick={() => { app.award(true, { xp: 8 }); next(step.pts) }} className="rounded-2xl bg-teal-600 py-3 text-sm font-bold text-white tap shadow-float">Voll<br />{step.pts} P</button>
            </div>
          )}
          {phase === 'review' && step.kind !== 'self' && (
            <button onClick={() => next(gotPts)} className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white tap shadow-float ${gotPts > 0 ? 'bg-teal-600' : 'bg-coral-500'}`}>
              {gotPts > 0 ? `✓ +${gotPts % 1 === 0 ? gotPts : gotPts.toFixed(1)} Punkte` : '✕ 0 Punkte'} · {i + 1 >= steps.length ? 'Auswerten' : 'Weiter'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
