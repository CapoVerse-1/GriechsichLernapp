import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { CHAPTERS } from '../content/chapters'
import { ProgressBar, accent } from '../components/ui'
import { getAllModeProgress, type ModeRow } from '../db/store'
import { useApp } from '../state/AppContext'

function StatChip({ icon, value, label, tone }: { icon: string; value: string | number; label: string; tone: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 glass">
      <span className="text-xl">{icon}</span>
      <div className="leading-tight">
        <div className={`text-base font-black ${tone}`}>{value}</div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{label}</div>
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
      <div className="safe-top px-4 pt-3">
        <div className="flex items-start justify-between">
          <button onClick={onStats} className="flex items-center gap-2 text-left tap">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-2xl shadow-card">{app.user?.avatar ?? '🦉'}</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Hallo</p>
              <h1 className="font-serif text-xl font-black leading-none text-ink">{app.user?.name}</h1>
            </div>
          </button>
          <div className="flex gap-2">
            <button onClick={onLeaderboard} className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-card tap text-xl">🏆</button>
            <button onClick={onStats} className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-card tap text-xl">📊</button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 p-5 text-white shadow-float">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Level {app.level}</p>
              <p className="text-xl font-black">{app.levelTitle}</p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-2xl font-black">{app.level}</div>
          </div>
          <div className="mt-3">
            <ProgressBar pct={app.levelPct} accentKey="sun" height="h-2.5" />
            <p className="mt-1 text-right text-[11px] text-white/70">{app.levelInto} / {app.levelNeed} XP</p>
          </div>
        </motion.div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatChip icon="🔥" value={app.game.streak_days} label="Tage Streak" tone="text-coral-500" />
          <StatChip icon="⭐" value={app.game.xp} label="XP gesamt" tone="text-sun-600" />
          <StatChip icon="📜" value={`${doneCount}/${CHAPTERS.length}`} label="Kapitel" tone="text-teal-700" />
        </div>
      </div>

      <div className="px-4 pt-5">
        <motion.button whileTap={{ scale: 0.98 }} onClick={onExam} className="relative w-full overflow-hidden rounded-3xl bg-ink p-5 text-left text-white shadow-float">
          <div className="relative z-10 flex items-center gap-4">
            <span className="text-4xl">🎓</span>
            <div className="flex-1">
              <p className="text-lg font-black">Klausur-Simulation</p>
              <p className="text-sm text-white/70">Volle Prüfung · 68 Punkte · mit Note</p>
            </div>
            <span className="text-2xl">→</span>
          </div>
          <div className="pointer-events-none absolute -right-6 -top-8 text-[120px] opacity-10">Σ</div>
        </motion.button>
      </div>

      <div className="px-4 pt-6">
        <h2 className="mb-3 px-1 text-sm font-black uppercase tracking-wide text-ink-faint">Kapitel</h2>
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
                className="flex w-full items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-card"
              >
                <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${a.grad} greek text-3xl font-bold text-white`}>{c.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-ink-faint">KAPITEL {c.num}</span>
                    {displayStatus === 'done' && <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-black text-teal-700">✓ FERTIG</span>}
                    {displayStatus === 'in_progress' && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-sun-600">LÄUFT</span>}
                  </div>
                  <p className="truncate font-extrabold text-ink">{c.title}</p>
                  <p className="truncate text-xs text-ink-faint">{c.subtitle}</p>
                  {displayStatus !== 'new' && <ProgressBar pct={pct} accentKey={c.accent} className="mt-2" height="h-1.5" />}
                </div>
                <span className="text-xl text-ink-faint">→</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <p className="px-6 pt-8 text-center text-[11px] leading-relaxed text-ink-faint">
        Stoff aus 16 Handouts der VO "Griechische Terminologie" (Univ. Wien).<br />Dein Fortschritt wird in Supabase gespeichert.
      </p>
    </div>
  )
}
