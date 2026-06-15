import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AchievementToast } from './components/AchievementToast'
import { ModeRouter } from './components/ModeRouter'
import { getChapter, MODES } from './content/chapters'
import { accent } from './components/ui'
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
    <div className="grid min-h-screen place-items-center">
      <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 6, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-center">
        <div className="font-serif text-6xl font-black text-teal-700">Σ</div>
        <p className="mt-2 text-sm font-semibold text-ink-faint">Graecia wird geladen…</p>
      </motion.div>
    </div>
  )
}

function SetupError({ message }: { message: string }) {
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="max-w-md rounded-3xl bg-white p-6 text-center shadow-card">
        <div className="font-serif text-5xl font-black text-coral-500">Σ</div>
        <h1 className="mt-3 text-xl font-black text-ink">Supabase fehlt</h1>
        <p className="mt-2 text-sm text-ink-faint">{message}</p>
        <p className="mt-4 rounded-2xl bg-parchment px-4 py-3 text-left font-mono text-xs text-ink/70">
          VITE_SUPABASE_URL<br />
          VITE_SUPABASE_ANON_KEY
        </p>
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
    const acc = accent(MODES[view.mode].accent).text // unused but keeps intent
    void acc
    return (
      <div className="app-shell">
        <AchievementToast />
        <ModeRouter
          mode={view.mode}
          chapterId={view.chapterId}
          accentKey={MODES[view.mode].accent}
          onClose={() => setView({ v: 'chapter', chapterId: view.chapterId })}
          onFinish={(score) => {
            app.finishMode(view.chapterId, view.mode, score)
            app.checkpoint(view.chapterId, Math.max(score, app.chapters[view.chapterId]?.progress ?? 0), view.mode)
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
