import { useEffect, useState } from 'react'
import { ACHIEVEMENTS, getExams, getUnlocked, resetCurrentUser, type ExamRow } from '../db/store'
import { gradeFor } from '../content/exam'
import { Button, ProgressBar, ScreenHeader } from '../components/ui'
import { useApp } from '../state/AppContext'

export function Stats({ onBack, onLeaderboard }: { onBack: () => void; onLeaderboard: () => void }) {
  const app = useApp()
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set())
  const [exams, setExams] = useState<ExamRow[]>([])
  const acc = app.game.total_answers ? Math.round((app.game.total_correct / app.game.total_answers) * 100) : 0

  const refreshStats = async () => {
    const [nextUnlocked, nextExams] = await Promise.all([getUnlocked(), getExams()])
    setUnlocked(nextUnlocked)
    setExams(nextExams)
  }

  useEffect(() => {
    refreshStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.game, app.bestExam])

  const reset = async () => {
    if (confirm(`Wirklich den Fortschritt von ${app.user?.name} löschen? Das kann nicht rückgängig gemacht werden.`)) {
      await resetCurrentUser()
      await app.refresh()
      await refreshStats()
    }
  }

  return (
    <div className="app-shell pb-24">
      <ScreenHeader
        title={app.user?.name ?? 'Profil'} subtitle={`${app.levelTitle} · Level ${app.level}`} onBack={onBack}
        right={<button onClick={app.logout} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-ink-soft shadow-card tap">Profil wechseln</button>}
      />

      <div className="px-4 pt-2">
        <div className="rounded-3xl bg-teal-800 p-5 text-white shadow-float">
          <div className="flex items-center justify-between">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Dein Fortschritt</p><p className="mt-1 font-serif text-2xl font-bold">{app.levelTitle}</p></div>
            <div aria-label={`Level ${app.level}`} className="grid h-12 w-12 place-items-center rounded-xl border border-white/25 bg-white/10 text-xl font-bold">{app.level}</div>
          </div>
          <ProgressBar pct={app.levelPct} accentKey="sun" className="mt-3" />
          <p className="mt-1 text-right text-[11px] text-white/70">{app.levelInto} / {app.levelNeed} XP bis Level {app.level + 1}</p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-card"><p className="text-3xl font-semibold tabular-nums text-ink">{app.game.streak_days}</p><p className="mt-1 text-xs text-ink-faint">Tage in Folge</p></div>
          <div className="rounded-2xl bg-white p-4 shadow-card"><p className="text-3xl font-semibold tabular-nums text-ink">{app.game.xp}</p><p className="mt-1 text-xs text-ink-faint">XP gesamt</p></div>
          <div className="rounded-2xl bg-white p-4 shadow-card"><p className="text-3xl font-semibold tabular-nums text-ink">{acc}%</p><p className="mt-1 text-xs text-ink-faint">Trefferquote</p></div>
          <div className="rounded-2xl bg-white p-4 shadow-card"><p className="text-3xl font-semibold tabular-nums text-ink">{app.game.total_correct}</p><p className="mt-1 text-xs text-ink-faint">richtige Antworten</p></div>
        </div>
      </div>

      <div className="px-4 pt-6">
        <div className="mb-3 flex items-baseline justify-between px-1"><h2 className="font-serif text-xl font-bold text-ink">Erfolge</h2><span className="text-xs text-ink-faint">{unlocked.size}/{ACHIEVEMENTS.length} freigeschaltet</span></div>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const on = unlocked.has(a.id)
            return (
              <div key={a.id} className={`rounded-2xl p-4 shadow-card transition ${on ? 'bg-white' : 'bg-white/50'}`}>
                <div className={`text-2xl ${on ? '' : 'opacity-30 grayscale'}`}>{a.icon}</div>
                <p className={`mt-2 font-semibold leading-tight ${on ? 'text-ink' : 'text-ink-faint'}`}>{a.title}</p>
                <p className="text-[11px] leading-tight text-ink-faint">{a.desc}</p>
                {on && <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-teal-700">freigeschaltet</p>}
              </div>
            )
          })}
        </div>
      </div>

      {exams.length > 0 && (
        <div className="px-4 pt-6">
          <h2 className="mb-3 px-1 font-serif text-xl font-bold text-ink">Klausur-Verlauf</h2>
          <div className="overflow-hidden rounded-2xl bg-white shadow-card">
            {exams.map((e, idx) => {
              const band = gradeFor(e.points)
              return (
                <div key={e.id} className={`flex items-center gap-3 px-4 py-3 ${idx % 2 ? 'bg-parchment/40' : ''}`}>
                  <span className="text-2xl">{band.emoji}</span>
                  <div className="flex-1"><p className="font-bold text-ink">{band.grade}</p><p className="text-[11px] text-ink-faint">{new Date(e.at).toLocaleDateString('de-AT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p></div>
                  <span className="text-lg font-black tabular-nums text-teal-700">{e.points}<span className="text-xs text-ink-faint">/{e.total}</span></span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="px-4 pt-6">
        <Button onClick={onLeaderboard} className="w-full">Zur Bestenliste →</Button>
      </div>

      <div className="px-4 pt-4">
        <button onClick={reset} className="w-full rounded-2xl border border-coral-200 bg-white py-3 text-sm font-semibold text-coral-600 tap">Fortschritt zurücksetzen</button>
      </div>
    </div>
  )
}
