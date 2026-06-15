import { ACHIEVEMENTS, getExams, getUnlocked, resetCurrentUser } from '../db/store'
import { persistNow } from '../db/database'
import { gradeFor } from '../content/exam'
import { Button, ProgressBar, ScreenHeader } from '../components/ui'
import { useApp } from '../state/AppContext'

export function Stats({ onBack, onLeaderboard }: { onBack: () => void; onLeaderboard: () => void }) {
  const app = useApp()
  const unlocked = getUnlocked()
  const exams = getExams()
  const acc = app.game.total_answers ? Math.round((app.game.total_correct / app.game.total_answers) * 100) : 0

  const reset = () => {
    if (confirm(`Wirklich den Fortschritt von ${app.user?.name} löschen? Das kann nicht rückgängig gemacht werden.`)) {
      resetCurrentUser()
      persistNow()
      app.refresh()
    }
  }

  return (
    <div className="app-shell pb-24">
      <ScreenHeader
        title={app.user?.name ?? 'Profil'} subtitle={`${app.levelTitle} · Level ${app.level}`} onBack={onBack}
        right={<button onClick={app.logout} className="rounded-full bg-white px-3 py-2 text-xs font-bold text-ink/60 shadow-card tap">Profil wechseln</button>}
      />

      <div className="px-4 pt-2">
        <div className="rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 p-5 text-white shadow-float">
          <div className="flex items-center justify-between">
            <div><p className="text-xs uppercase tracking-wider text-white/70">Level {app.level}</p><p className="text-2xl font-black">{app.levelTitle}</p></div>
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-3xl font-black">{app.level}</div>
          </div>
          <ProgressBar pct={app.levelPct} accentKey="sun" className="mt-3" />
          <p className="mt-1 text-right text-[11px] text-white/70">{app.levelInto} / {app.levelNeed} XP bis Level {app.level + 1}</p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-card"><p className="text-3xl font-black text-coral-500">🔥 {app.game.streak_days}</p><p className="text-xs text-ink-faint">Tage in Folge</p></div>
          <div className="rounded-2xl bg-white p-4 shadow-card"><p className="text-3xl font-black text-sun-600">⭐ {app.game.xp}</p><p className="text-xs text-ink-faint">XP gesamt</p></div>
          <div className="rounded-2xl bg-white p-4 shadow-card"><p className="text-3xl font-black text-teal-700">{acc}%</p><p className="text-xs text-ink-faint">Trefferquote</p></div>
          <div className="rounded-2xl bg-white p-4 shadow-card"><p className="text-3xl font-black text-ink">{app.game.total_correct}</p><p className="text-xs text-ink-faint">richtige Antworten</p></div>
        </div>
      </div>

      {/* Achievements */}
      <div className="px-4 pt-6">
        <h2 className="mb-3 px-1 text-sm font-black uppercase tracking-wide text-ink-faint">Erfolge · {unlocked.size}/{ACHIEVEMENTS.length}</h2>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const on = unlocked.has(a.id)
            return (
              <div key={a.id} className={`rounded-2xl p-4 shadow-card transition ${on ? 'bg-white' : 'bg-white/50'}`}>
                <div className={`text-3xl ${on ? '' : 'opacity-30 grayscale'}`}>{a.icon}</div>
                <p className={`mt-1 font-extrabold leading-tight ${on ? 'text-ink' : 'text-ink-faint'}`}>{a.title}</p>
                <p className="text-[11px] leading-tight text-ink-faint">{a.desc}</p>
                {on && <p className="mt-1 text-[10px] font-black uppercase text-teal-700">freigeschaltet</p>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Exam history */}
      {exams.length > 0 && (
        <div className="px-4 pt-6">
          <h2 className="mb-3 px-1 text-sm font-black uppercase tracking-wide text-ink-faint">Klausur-Verlauf</h2>
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
        <Button onClick={onLeaderboard} accentKey="sun" className="w-full">🏆 Zur Bestenliste</Button>
      </div>

      <div className="px-4 pt-4">
        <button onClick={reset} className="w-full rounded-2xl border-2 border-coral-200 bg-orange-50 py-3 text-sm font-bold text-coral-600 tap">Fortschritt zurücksetzen</button>
      </div>
    </div>
  )
}
