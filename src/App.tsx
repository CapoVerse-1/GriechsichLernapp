import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useState } from 'react'
import { AchievementToast } from './components/AchievementToast'
import { ModeRouter } from './components/ModeRouter'
import { getChapter, MODES } from './content/chapters'
import MockExam from './modes/MockExam'
import { ChapterView } from './pages/ChapterView'
import { Home } from './pages/Home'
import { Leaderboard } from './pages/Leaderboard'
import { Login } from './pages/Login'
import { Reference } from './pages/Reference'
import { Stats } from './pages/Stats'
import { useApp } from './state/AppContext'
import type { ModeId } from './content/types'

type View =
  | { v: 'home' }
  | { v: 'chapter'; chapterId: string }
  | { v: 'reference'; chapterId: string }
  | { v: 'mode'; chapterId: string; mode: ModeId }
  | { v: 'exam' }
  | { v: 'stats' }
  | { v: 'leaderboard' }

function Loader() {
  return (
    <div role="status" aria-live="polite" className="app-shell grid min-h-screen place-items-center px-5">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-teal-800 font-serif text-4xl font-bold text-white">Σ</div>
        <p className="mt-5 font-serif text-xl font-bold text-ink">Graecia</p>
        <p className="mt-1 text-sm text-ink-faint">Lernstand wird geladen …</p>
      </div>
    </div>
  )
}

function SetupError({ message }: { message: string }) {
  const missingConfig = message.includes('VITE_SUPABASE')
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="max-w-md rounded-3xl bg-white p-6 text-center shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-coral-50 font-serif text-3xl font-bold text-coral-600">Σ</div>
        <h1 className="mt-4 font-serif text-xl font-bold text-ink">{missingConfig ? 'Einrichtung unvollständig' : 'Verbindung unterbrochen'}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-faint">{missingConfig ? 'Die App benötigt ihre Datenbank-Konfiguration.' : 'Dein Lernstand konnte gerade nicht geladen werden. Bitte versuche es erneut.'}</p>
        <button onClick={() => window.location.reload()} className="mt-5 w-full rounded-2xl bg-teal-700 px-5 py-3.5 font-semibold text-white tap">Erneut versuchen</button>
        <details className="mt-4 text-left text-xs text-ink-faint">
          <summary className="cursor-pointer text-center">Fehlerdetails</summary>
          <p className="mt-2 break-words rounded-xl bg-parchment p-3 font-mono">{message}</p>
        </details>
      </div>
    </div>
  )
}

export default function App() {
  const app = useApp()
  const [view, setView] = useState<View>({ v: 'home' })

  // Whenever the active profile changes (login / switch), start at Home.
  const userId = app.user?.id ?? null
  useEffect(() => { setView({ v: 'home' }) }, [userId])
  useLayoutEffect(() => { window.scrollTo(0, 0) }, [view])

  if (!app.ready) return <Loader />
  if (app.error) return <SetupError message={app.error} />
  if (!app.user) return <Login />

  const fade = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2 },
  }

  // Mode + exam render full-screen (no app-shell padding rules conflict)
  if (view.v === 'mode') {
    const ch = getChapter(view.chapterId)!
    return (
      <div className="app-shell">
        <AchievementToast />
        <ModeRouter
          mode={view.mode}
          chapterId={view.chapterId}
          accentKey={MODES[view.mode].accent}
          onClose={() => setView({ v: 'chapter', chapterId: view.chapterId })}
          onFinish={async (score) => {
            await app.finishMode(view.chapterId, view.mode, score)
            await app.checkpoint(view.chapterId, Math.max(score, app.chapters[view.chapterId]?.progress ?? 0), view.mode)
            setView({ v: 'chapter', chapterId: ch.id })
          }}
        />
      </div>
    )
  }

  if (view.v === 'exam') {
    return (
      <div className="app-shell">
        <AchievementToast />
        <MockExam onClose={() => setView({ v: 'home' })} onFinish={() => setView({ v: 'home' })} />
      </div>
    )
  }

  return (
    <>
      <AchievementToast />
      <AnimatePresence mode="wait">
        {view.v === 'home' && (
          <motion.div key="home" {...fade}>
            <Home
              onChapter={(id) => setView({ v: 'chapter', chapterId: id })}
              onExam={() => setView({ v: 'exam' })}
              onStats={() => setView({ v: 'stats' })}
              onLeaderboard={() => setView({ v: 'leaderboard' })}
            />
          </motion.div>
        )}
        {view.v === 'chapter' && (
          <motion.div key={`ch-${view.chapterId}`} {...fade}>
            <ChapterView
              chapterId={view.chapterId}
              onBack={() => setView({ v: 'home' })}
              onMode={(mode) => setView({ v: 'mode', chapterId: view.chapterId, mode })}
              onRead={() => setView({ v: 'reference', chapterId: view.chapterId })}
            />
          </motion.div>
        )}
        {view.v === 'reference' && (
          <motion.div key={`ref-${view.chapterId}`} {...fade}>
            <Reference chapterId={view.chapterId} onBack={() => setView({ v: 'chapter', chapterId: view.chapterId })} />
          </motion.div>
        )}
        {view.v === 'stats' && (
          <motion.div key="stats" {...fade}>
            <Stats onBack={() => setView({ v: 'home' })} onLeaderboard={() => setView({ v: 'leaderboard' })} />
          </motion.div>
        )}
        {view.v === 'leaderboard' && (
          <motion.div key="leaderboard" {...fade}>
            <Leaderboard onBack={() => setView({ v: 'home' })} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
