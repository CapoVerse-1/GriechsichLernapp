import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { CHAPTERS } from '../content/chapters'
import { LineIcon, ProgressBar, accent } from '../components/ui'
import { getAllModeProgress, type ModeRow } from '../db/store'
import { useApp } from '../state/AppContext'

function StatChip({ icon, value, label, tone }: { icon: string; value: string | number; label: string; tone: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white px-3 py-3 shadow-card">
      <span className="text-sm" aria-hidden="true">{icon}</span>
      <div className="leading-tight">
        <div className={`mt-1 text-xl font-bold tabular-nums ${tone}`}>{value}</div>
        <div className="text-[10px] font-semibold uppercase text-ink-faint">{label}</div>
      </div>
    </div>
  )
}

export function Home({ onChapter, onExam, onStats, onLeaderboard }: { onChapter: (id: string) => void; onExam: () => void; onStats: () => void; onLeaderboard: () => void }) {
  const app = useApp()
  const [modeRows, setModeRows] = useState<ModeRow[]>([])
  const [modeRowsLoaded, setModeRowsLoaded] = useState(false)
  const doneCount = Object.values(app.chapters).filter((c) => c.status === 'done').length

  const modesByChapter = useMemo(() => {
    const map: Record<string, Record<string, ModeRow>> = {}
    for (const row of modeRows) {
      map[row.chapter_id] ??= {}
      map[row.chapter_id][row.mode_id] = row
    }
    return map
  }, [modeRows])

  useEffect(() => {
    let alive = true
    setModeRowsLoaded(false)
    getAllModeProgress()
      .then((rows) => {
        if (!alive) return
        setModeRows(rows)
        setModeRowsLoaded(true)
      })
      .catch(() => {
        if (!alive) return
        setModeRowsLoaded(true)
      })
    return () => { alive = false }
  }, [app.user?.id, app.chapters])

  return (
    <div className="app-shell pb-24">
      <div className="safe-top px-4 pt-4">
        <div className="flex items-start justify-between">
          <button onClick={onStats} className="flex items-center gap-2 text-left tap">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-2xl shadow-card">{app.user?.avatar ?? '🦉'}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Graecia</p>
              <h1 className="font-serif text-xl font-bold leading-tight text-ink">Hallo, {app.user?.name}</h1>
            </div>
          </button>
          <div className="flex gap-2">
            <button onClick={onLeaderboard} aria-label="Bestenliste" className="grid h-11 w-11 place-items-center rounded-xl bg-white text-ink-soft shadow-card tap"><LineIcon name="trophy" /></button>
            <button onClick={onStats} aria-label="Statistik" className="grid h-11 w-11 place-items-center rounded-xl bg-white text-ink-soft shadow-card tap"><LineIcon name="chart" /></button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-3xl bg-teal-800 p-5 text-white shadow-float">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Dein Fortschritt</p>
              <p className="mt-1 font-serif text-2xl font-bold">{app.levelTitle}</p>
            </div>
            <div aria-label={`Level ${app.level}`} className="grid h-12 w-12 place-items-center rounded-xl border border-white/25 bg-white/10 text-xl font-bold">{app.level}</div>
          </div>
          <div className="mt-3">
            <ProgressBar pct={app.levelPct} accentKey="sun" height="h-2.5" />
            <p className="mt-1 text-right text-[11px] text-white/70">{app.levelInto} / {app.levelNeed} XP</p>
          </div>
        </motion.div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatChip icon="↗" value={app.game.streak_days} label="Tage" tone="text-ink" />
          <StatChip icon="✦" value={app.game.xp} label="XP" tone="text-ink" />
          <StatChip icon="Σ" value={`${doneCount}/${CHAPTERS.length}`} label="Kapitel" tone="text-ink" />
        </div>
      </div>

      <div className="px-4 pt-5">
        <motion.button whileTap={{ scale: 0.98 }} onClick={onExam} className="relative w-full overflow-hidden rounded-3xl border border-ink/10 bg-ink p-5 text-left text-white shadow-float">
          <div className="relative z-10 flex items-center gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/20 text-white/90"><LineIcon name="exam" size={20} /></span>
            <div className="flex-1">
              <p className="font-serif text-base font-bold">Klausur-Simulation</p>
              <p className="text-xs leading-relaxed text-white/70">68 Punkte · mit Note · in deinem Tempo</p>
            </div>
            <LineIcon name="arrow" />
          </div>
          <div className="pointer-events-none absolute -right-5 -top-12 font-serif text-[120px] opacity-[0.06]">Σ</div>
        </motion.button>
      </div>

      <div className="px-4 pt-6">
        <div className="mb-3 flex items-baseline justify-between px-1"><h2 className="font-serif text-xl font-bold text-ink">Kapitel</h2><span className="text-xs text-ink-faint">{CHAPTERS.length} Einheiten</span></div>
        <div className="space-y-3">
          {CHAPTERS.map((c, idx) => {
            const prog = app.chapters[c.id]
            const a = accent(c.accent)
            const status = prog?.status ?? 'new'
            const completedModes = c.modes.filter((m) => (modesByChapter[c.id]?.[m]?.best_score ?? 0) >= 0.6).length
            const modePct = completedModes / c.modes.length
            const displayStatus = status !== 'new' ? status : completedModes > 0 ? 'in_progress' : 'new'
            const pct = displayStatus === 'done' ? 1 : modeRowsLoaded ? modePct : prog?.progress ?? 0

            return (
              <motion.button
                key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                whileTap={{ scale: 0.98 }} onClick={() => onChapter(c.id)}
                className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-card transition-colors hover:border-teal-300"
              >
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${a.soft} greek text-2xl font-bold ${a.text}`}>{c.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-faint">Kapitel {c.num}</span>
                    {displayStatus === 'done' && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">Fertig</span>}
                    {displayStatus === 'in_progress' && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-sun-600">In Arbeit</span>}
                  </div>
                  <p className="truncate font-semibold text-ink">{c.title}</p>
                  <p className="truncate text-xs text-ink-faint">{c.subtitle}</p>
                  {displayStatus !== 'new' && <ProgressBar pct={pct} accentKey={c.accent} className="mt-2" height="h-1.5" />}
                </div>
                <span className="text-ink-faint"><LineIcon name="arrow" size={18} /></span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <p className="px-6 pt-8 text-center text-[11px] leading-relaxed text-ink-faint">
        Aus 16 Handouts der Universität Wien.<br />Dein Fortschritt wird automatisch gespeichert.
      </p>
    </div>
  )
}
