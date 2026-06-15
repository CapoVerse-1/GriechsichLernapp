import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { leaderboard, type LeaderRow } from '../db/auth'
import { levelTitle } from '../db/store'
import { ScreenHeader } from '../components/ui'
import { useApp } from '../state/AppContext'

type Metric = 'xp' | 'streak_days' | 'best_exam' | 'chapters_done'
const METRICS: { id: Metric; label: string; icon: string; fmt: (r: LeaderRow) => string }[] = [
  { id: 'xp', label: 'XP', icon: '⭐', fmt: (r) => `${r.xp}` },
  { id: 'streak_days', label: 'Streak', icon: '🔥', fmt: (r) => `${r.streak_days}d` },
  { id: 'best_exam', label: 'Klausur', icon: '🎓', fmt: (r) => `${r.best_exam}/68` },
  { id: 'chapters_done', label: 'Kapitel', icon: '📜', fmt: (r) => `${r.chapters_done}/7` },
]

const MEDAL = ['🥇', '🥈', '🥉']

export function Leaderboard({ onBack }: { onBack: () => void }) {
  const app = useApp()
  const [metric, setMetric] = useState<Metric>('xp')
  const [data, setData] = useState<LeaderRow[]>([])

  useEffect(() => {
    let alive = true
    leaderboard().then((rows) => { if (alive) setData(rows) })
    return () => { alive = false }
  }, [app.game, app.user?.id])

  const rows = useMemo(() => {
    return [...data].sort((a, b) => (b[metric] as number) - (a[metric] as number) || b.xp - a.xp)
  }, [metric, data])

  const active = METRICS.find((m) => m.id === metric)!
  const top = rows.slice(0, 3)
  const podiumOrder = [top[1], top[0], top[2]].filter(Boolean) // 2nd, 1st, 3rd

  return (
    <div className="app-shell pb-24">
      <ScreenHeader title="Bestenliste" subtitle="Vergleicht euch miteinander" onBack={onBack} />

      {/* metric tabs */}
      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {METRICS.map((m) => (
            <button key={m.id} onClick={() => setMetric(m.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold tap transition ${metric === m.id ? 'bg-teal-600 text-white shadow-float' : 'bg-white text-ink/60 shadow-card'}`}>
              <span>{m.icon}</span>{m.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 && <p className="px-6 pt-16 text-center text-ink-faint">Noch keine Profile.</p>}

      {/* podium */}
      {rows.length > 0 && (
        <div className="px-4 pt-6">
          <div className="flex items-end justify-center gap-2">
            {podiumOrder.map((r) => {
              const rank = rows.indexOf(r)
              const h = rank === 0 ? 'h-28' : rank === 1 ? 'h-20' : 'h-16'
              const isMe = r.id === app.user?.id
              return (
                <motion.div key={r.id} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-1 flex-col items-center">
                  <span className="text-3xl">{r.avatar}</span>
                  <span className={`mt-1 max-w-full truncate text-xs font-bold ${isMe ? 'text-teal-700' : 'text-ink'}`}>{r.name}</span>
                  <span className="text-[11px] font-black text-ink-faint">{active.icon} {active.fmt(r)}</span>
                  <div className={`mt-1 w-full ${h} rounded-t-2xl bg-gradient-to-b ${rank === 0 ? 'from-sun-400 to-sun-600' : 'from-teal-400 to-teal-600'} grid place-items-start justify-center pt-1 text-xl`}>
                    {MEDAL[rank]}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* full list */}
      <div className="px-4 pt-6">
        <div className="space-y-2">
          {rows.map((r, idx) => {
            const isMe = r.id === app.user?.id
            return (
              <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                className={`flex items-center gap-3 rounded-2xl p-3 shadow-card ${isMe ? 'bg-teal-50 ring-2 ring-teal-200' : 'bg-white'}`}>
                <span className="w-6 text-center text-sm font-black text-ink-faint">{idx < 3 ? MEDAL[idx] : idx + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-parchment-deep text-2xl">{r.avatar}</span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-extrabold ${isMe ? 'text-teal-700' : 'text-ink'}`}>{r.name}{isMe && <span className="ml-1 text-xs font-bold text-teal-600">(du)</span>}</p>
                  <p className="text-[11px] text-ink-faint">Level {r.level} · {levelTitle(r.level)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black tabular-nums text-teal-700">{active.fmt(r)}</p>
                  <p className="text-[10px] uppercase tracking-wide text-ink-faint">{active.label}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
