import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initDb } from '../db/database'
import {
  clearSession, createUser, hasSession, listUsers, loadSession, setSession, type User,
} from '../db/auth'
import {
  addXp, completeChapter, getChapterProgress, getExams, getGame, levelForXp, levelTitle,
  recordAnswer, recordExam, recordMode, saveCheckpoint, startChapter, syncAchievements,
  touchStreak, type AchievementDef, type ChapterRow, type GameState,
} from '../db/store'

const EMPTY_GAME: GameState = { xp: 0, streak_days: 0, last_day: null, total_correct: 0, total_answers: 0 }

interface AppState {
  ready: boolean
  // session
  user: User | null
  users: User[]
  login: (id: number) => void
  createAccount: (name: string, avatar: string) => User
  logout: () => void
  refreshUsers: () => void
  // game (current user)
  game: GameState
  level: number
  levelTitle: string
  levelPct: number
  levelInto: number
  levelNeed: number
  chapters: Record<string, ChapterRow>
  bestExam: number
  toast: AchievementDef | null
  // actions
  award: (correct: boolean, opts?: { itemId?: string; xp?: number }) => void
  start: (chapterId: string, mode?: string) => void
  checkpoint: (chapterId: string, progress: number, mode?: string) => void
  finishMode: (chapterId: string, modeId: string, score: number) => void
  finishChapter: (chapterId: string) => void
  saveExam: (points: number, total: number, grade: string) => void
  dismissToast: () => void
  refresh: () => void
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [game, setGame] = useState<GameState>(EMPTY_GAME)
  const [chapters, setChapters] = useState<Record<string, ChapterRow>>({})
  const [bestExam, setBestExam] = useState(0)
  const [queue, setQueue] = useState<AchievementDef[]>([])
  const [toast, setToast] = useState<AchievementDef | null>(null)

  const refreshUsers = useCallback(() => setUsers(listUsers()), [])

  const refresh = useCallback(() => {
    if (!hasSession()) { setGame(EMPTY_GAME); setChapters({}); setBestExam(0); return }
    setGame(getGame())
    setChapters(getChapterProgress())
    setBestExam(getExams().reduce((m, e) => Math.max(m, e.points), 0))
  }, [])

  useEffect(() => {
    let alive = true
    initDb().then(() => {
      if (!alive) return
      const id = loadSession()
      refreshUsers()
      if (id != null) {
        const u = listUsers().find((x) => x.id === id) ?? null
        setUser(u)
        if (u) { touchStreak(); refresh() }
      }
      setReady(true)
    })
    return () => { alive = false }
  }, [refresh, refreshUsers])

  // achievement toast pump
  useEffect(() => {
    if (!toast && queue.length) {
      setToast(queue[0])
      setQueue((q) => q.slice(1))
    }
  }, [toast, queue])

  const runAchievements = useCallback(() => {
    if (!hasSession()) return
    const fresh = syncAchievements({ game: getGame(), chapters: getChapterProgress(), bestExam: getExams().reduce((m, e) => Math.max(m, e.points), 0) })
    if (fresh.length) setQueue((q) => [...q, ...fresh])
  }, [])

  // ----- session actions -----
  const applyUser = useCallback((u: User) => {
    setSession(u.id)
    setUser(u)
    touchStreak()
    refresh()
    refreshUsers()
  }, [refresh, refreshUsers])

  const login = useCallback((id: number) => {
    const u = listUsers().find((x) => x.id === id)
    if (u) applyUser(u)
  }, [applyUser])

  const createAccount = useCallback((name: string, avatar: string) => {
    const u = createUser(name, avatar)
    applyUser(u)
    return u
  }, [applyUser])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    setGame(EMPTY_GAME)
    setChapters({})
    setBestExam(0)
    refreshUsers()
  }, [refreshUsers])

  // ----- game actions -----
  const award = useCallback<AppState['award']>((correct, opts) => {
    touchStreak()
    recordAnswer(correct, opts?.itemId)
    if (correct) addXp(opts?.xp ?? 10)
    setGame(getGame())
    runAchievements()
  }, [runAchievements])

  const start = useCallback<AppState['start']>((id, mode) => { startChapter(id, mode); setChapters(getChapterProgress()) }, [])
  const checkpoint = useCallback<AppState['checkpoint']>((id, p, mode) => { saveCheckpoint(id, p, mode); setChapters(getChapterProgress()) }, [])
  const finishMode = useCallback<AppState['finishMode']>((c, m, s) => { recordMode(c, m, s); runAchievements() }, [runAchievements])
  const finishChapter = useCallback<AppState['finishChapter']>((id) => {
    completeChapter(id); addXp(50); setChapters(getChapterProgress()); setGame(getGame()); runAchievements()
  }, [runAchievements])
  const saveExam = useCallback<AppState['saveExam']>((p, t, g) => {
    recordExam(p, t, g); addXp(Math.round(p / 2)); refresh(); runAchievements()
  }, [refresh, runAchievements])

  const dismissToast = useCallback(() => setToast(null), [])

  const lv = levelForXp(game.xp)

  const value = useMemo<AppState>(() => ({
    ready, user, users, login, createAccount, logout, refreshUsers,
    game,
    level: lv.level, levelTitle: levelTitle(lv.level), levelPct: lv.pct, levelInto: lv.into, levelNeed: lv.need,
    chapters, bestExam, toast,
    award, start, checkpoint, finishMode, finishChapter, saveExam, dismissToast, refresh,
  }), [ready, user, users, login, createAccount, logout, refreshUsers, game, lv.level, lv.pct, lv.into, lv.need, chapters, bestExam, toast, award, start, checkpoint, finishMode, finishChapter, saveExam, dismissToast, refresh])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside <AppProvider>')
  return v
}
