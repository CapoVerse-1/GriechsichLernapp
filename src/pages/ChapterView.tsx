import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { MODES, getChapter } from '../content/chapters'
import { getModeProgress, type ModeRow } from '../db/store'
import { ProgressBar, ScreenHeader, accent } from '../components/ui'
import { useApp } from '../state/AppContext'
import type { ModeId } from '../content/types'

export function ChapterView({
  chapterId, onBack, onMode, onRead,
}: {
  chapterId: string; onBack: () => void; onMode: (mode: ModeId) => void; onRead: () => void
}) {
  const app = useApp()
  const ch = getChapter(chapterId)
  const [modeProg, setModeProg] = useState<Record<string, ModeRow>>({})

  useEffect(() => {
    if (chapterId) { app.start(chapterId); setModeProg(getModeProgress(chapterId)) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId])

  if (!ch) return null
  const a = accent(ch.accent)
  const prog = app.chapters[chapterId]
  const status = prog?.status ?? 'new'
  const completedModes = ch.modes.filter((m) => (modeProg[m]?.best_score ?? 0) >= 0.6).length
  const overall = completedModes / ch.modes.length

  return (
    <div className="app-shell pb-28">
      <ScreenHeader title={ch.title} subtitle={ch.subtitle} onBack={onBack} />

      {/* Banner */}
      <div className="px-4">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${a.grad} p-5 text-white shadow-float`}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
              <span>Kapitel {ch.num}</span>
              {status === 'done' && <span className="rounded-full bg-white/20 px-2 py-0.5">✓ Abgeschlossen</span>}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/90">{ch.blurb}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ch.units.map((u) => <span key={u} className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">{u}</span>)}
            </div>
          </div>
          <div className="pointer-events-none absolute -right-4 -top-6 greek text-[140px] font-black opacity-10">{ch.icon}</div>
        </div>
      </div>

      {/* Progress + read */}
      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-ink">Fortschritt</span>
            <span className="text-ink-faint">{completedModes}/{ch.modes.length} Übungen gemeistert</span>
          </div>
          <ProgressBar pct={status === 'done' ? 1 : overall} accentKey={ch.accent} className="mt-2" />
        </div>
        <button onClick={onRead} className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-card tap">
          <span className="text-2xl">📖</span>
          <div className="flex-1"><p className="font-extrabold text-ink">Stoff lesen</p><p className="text-xs text-ink-faint">Den kompletten Inhalt durchgehen</p></div>
          <span className="text-ink-faint">→</span>
        </button>
      </div>

      {/* Modes */}
      <div className="px-4 pt-6">
        <h2 className="mb-3 px-1 text-sm font-black uppercase tracking-wide text-ink-faint">Übungen</h2>
        <div className="grid grid-cols-2 gap-3">
          {ch.modes.map((mId, idx) => {
            const m = MODES[mId]
            const ma = accent(m.accent)
            const best = modeProg[mId]?.best_score ?? 0
            const attempts = modeProg[mId]?.attempts ?? 0
            return (
              <motion.button
                key={mId} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.04 }}
                whileTap={{ scale: 0.97 }} onClick={() => onMode(mId)}
                className="flex flex-col items-start gap-2 rounded-3xl bg-white p-4 text-left shadow-card"
              >
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ${ma.soft} text-xl`}>{m.icon}</div>
                <div className="min-h-[44px]">
                  <p className="font-extrabold leading-tight text-ink">{m.title}</p>
                  <p className="text-[11px] leading-tight text-ink-faint">{m.subtitle}</p>
                </div>
                <div className="flex w-full items-center justify-between">
                  <span className={`rounded-full ${ma.soft} px-2 py-0.5 text-[10px] font-bold ${ma.text}`}>{m.examRef}</span>
                  {attempts > 0 && <span className="text-[11px] font-black text-teal-700">{Math.round(best * 100)}%</span>}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Complete */}
      {status !== 'done' && (
        <div className="px-4 pt-6">
          <button
            onClick={() => app.finishChapter(chapterId)}
            className="w-full rounded-2xl border-2 border-teal-600 bg-teal-50 py-3.5 font-bold text-teal-700 tap"
          >
            ✓ Kapitel als abgeschlossen markieren <span className="text-xs font-normal">(+50 XP)</span>
          </button>
        </div>
      )}
    </div>
  )
}
