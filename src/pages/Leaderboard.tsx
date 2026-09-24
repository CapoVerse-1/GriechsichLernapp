import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { leaderboard, type LeaderRow } from '../db/auth'
import { levelTitle } from '../db/store'
import { ScreenHeader } from '../components/ui'
import { useApp } from '../state/AppContext'
import { CHAPTERS } from '../content/chapters'

type Metric = 'xp' | 'streak_days' | 'best_exam' | 'chapters_done'
const METRICS: { id: Metric; label: string; icon: string; fmt: (r: LeaderRow) => string }[] = [
  { id: 'xp', label: 'XP', icon: '⭐', fmt: (r) => `${r.xp}` },
  { id: 'streak_days', label: 'Streak', icon: '🔥', fmt: (r) => `${r.streak_days}d` },
  { id: 'best_exam', label: 'Klausur', icon: '🎓', fmt: (r) => `${r.best_exam}/68` },
  { id: 'chapters_done', label: 'Kapitel', icon: '📜', fmt: (r) => `${r.chapters_done}/${CHAPTERS.length}` },
]

const RANK = ['01', '02', '03']

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
        <div className="grid grid-cols-4 gap-1.5">
          {METRICS.map((m) => (
            <button key={m.id} onClick={() => setMetric(m.id)}
              className={`flex min-w-0 items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-[11px] font-semibold tap transition min-[360px]:text-xs ${metric === m.id ? 'bg-teal-800 text-white' : 'bg-white text-ink-soft shadow-card'}`}>
              <span className="text-[11px]" aria-hidden="true">{m.icon}</span>{m.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 && <p className="px-6 pt-16 text-center text-ink-faint">Noch keine Profile.</p>}

      {/* podium */}
      {rows.length > 0 && (
        <div className="px-4 pt-6">
          <div className="rounded-2xl bg-white px-4 pt-5 shadow-card">
            <div className="flex items-end justify-center gap-2">
              {podiumOrder.map((r) => {
                const rank = rows.indexOf(r)
                const h = rank === 0 ? 'h-20' : rank === 1 ? 'h-14' : 'h-12'
                const isMe = r.id === app.user?.id
                return (
                  <motion.div key={r.id} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-1 flex-col items-center">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-parchment text-2xl">{r.avatar}</span>
                    <span className={`mt-2 max-w-full truncate text-xs font-semibold ${isMe ? 'text-teal-700' : 'text-ink'}`}>{r.name}</span>
                    <span className="text-[11px] font-medium tabular-nums text-ink-faint">{active.fmt(r)}</span>
                    <div className={`mt-2 w-full ${h} grid place-items-start justify-center rounded-t-2xl border-x border-t ${rank === 0 ? 'border-teal-700 bg-teal-800 text-white' : 'border-teal-200 bg-teal-100 text-teal-800'} pt-3 font-serif text-xl font-bold`}>
                      {RANK[rank]}
                    </div>
                  </motion.div>
                )
              })}
            </div>
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
                className={`flex items-center gap-3 rounded-2xl p-3 shadow-card ${isMe ? 'bg-teal-50 border-teal-300' : 'bg-white'}`}>
                <span className="w-6 text-center font-serif text-sm font-bold tabular-nums text-ink-faint">{idx < 3 ? RANK[idx] : String(idx + 1).padStart(2, '0')}</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-parchment-deep text-2xl">{r.avatar}</span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-semibold ${isMe ? 'text-teal-700' : 'text-ink'}`}>{r.name}{isMe && <span className="ml-1 text-xs font-medium text-teal-600">(du)</span>}</p>
                  <p className="text-[11px] text-ink-faint">Level {r.level} · {levelTitle(r.level)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums text-teal-700">{active.fmt(r)}</p>
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
