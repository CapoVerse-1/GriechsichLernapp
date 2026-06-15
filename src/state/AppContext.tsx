import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initDb } from '../db/database'
import {
  clearSession, createUser, getUser, hasSession, listUsers, loadSession, setSession, type User,
} from '../db/auth'
import {
  addXp, completeChapter, getChapterProgress, getExams, getGame, levelForXp, levelTitle,
  recordAnswer, recordExam, recordMode, saveCheckpoint, startChapter, syncAchievements,
  touchStreak, type AchievementDef, type ChapterRow, type GameState,
} from '../db/store'

const EMPTY_GAME: GameState = { xp: 0, streak_days: 0, last_day: null, total_correct: 0, total_answers: 0 }

interface AppState {
  ready: boolean
  error: string | null
  user: User | null
  users: User[]
  login: (id: number) => Promise<void>
  createAccount: (name: string, avatar: string) => Promise<User>
  logout: () => Promise<void>
  refreshUsers: () => Promise<void>
  game: GameState
  level: number
  levelTitle: string
  levelPct: number
  levelInto: number
  levelNeed: number
  chapters: Record<string, ChapterRow>
  bestExam: number
  toast: AchievementDef | null
  award: (correct: boolean, opts?: { itemId?: string; xp?: number }) => Promise<void>
  start: (chapterId: string, mode?: string) => Promise<void>
  checkpoint: (chapterId: string, progress: number, mode?: string) => Promise<void>
  finishMode: (chapterId: string, modeId: string, score: number) => Promise<void>
  finishChapter: (chapterId: string) => Promise<void>
  saveExam: (points: number, total: number, grade: string) => Promise<void>
  dismissToast: () => void
  refresh: () => Promise<void>
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [game, setGame] = useState<GameState>(EMPTY_GAME)
  const [chapters, setChapters] = useState<Record<string, ChapterRow>>({})
  const [bestExam, setBestExam] = useState(0)
  const [queue, setQueue] = useState<AchievementDef[]>([])
  const [toast, setToast] = useState<AchievementDef | null>(null)

  const handleError = useCallback((e: unknown) => {
    const message = e instanceof Error ? e.message : 'Unerwarteter Supabase-Fehler'
    setError(message)
    throw e
  }, [])

  const refreshUsers = useCallback(async () => {
    try { setUsers(await listUsers()) }
    catch (e) { handleError(e) }
  }, [handleError])

  const refresh = useCallback(async () => {
    try {
      if (!hasSession()) {
        setGame(EMPTY_GAME)
        setChapters({})
        setBestExam(0)
        return
      }
      const [nextGame, nextChapters, exams] = await Promise.all([getGame(), getChapterProgress(), getExams()])
      setGame(nextGame)
      setChapters(nextChapters)
      setBestExam(exams.reduce((m, e) => Math.max(m, e.points), 0))
    } catch (e) {
      handleError(e)
    }
  }, [handleError])

  useEffect(() => {
    let alive = true
    initDb()
      .then(async () => {
        if (!alive) return
        const id = await loadSession()
        const nextUsers = await listUsers()
        if (!alive) return
        setUsers(nextUsers)
        if (id != null) {
          const u = await getUser(id)
          if (!alive) return
          setUser(u ?? null)
          if (u) {
            await touchStreak()
            await refresh()
          }
        }
        setReady(true)
      })
      .catch((e) => {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Supabase konnte nicht geladen werden')
        setReady(true)
      })
    return () => { alive = false }
  }, [refresh])

  useEffect(() => {
    if (!toast && queue.length) {
      setToast(queue[0])
      setQueue((q) => q.slice(1))
    }
  }, [toast, queue])

  const runAchievements = useCallback(async () => {
    if (!hasSession()) return
    const [nextGame, nextChapters, exams] = await Promise.all([getGame(), getChapterProgress(), getExams()])
    const fresh = await syncAchievements({
      game: nextGame,
      chapters: nextChapters,
      bestExam: exams.reduce((m, e) => Math.max(m, e.points), 0),
    })
    if (fresh.length) setQueue((q) => [...q, ...fresh])
  }, [])

  const applyUser = useCallback(async (u: User) => {
    await setSession(u.id)
    setUser(u)
    await touchStreak()
    await refresh()
    await refreshUsers()
  }, [refresh, refreshUsers])

  const login = useCallback(async (id: number) => {
    try {
      const u = await getUser(id)
      if (u) await applyUser(u)
    } catch (e) {
      handleError(e)
    }
  }, [applyUser, handleError])

  const createAccount = useCallback(async (name: string, avatar: string) => {
    try {
      const u = await createUser(name, avatar)
      await applyUser(u)
      return u
    } catch (e) {
      handleError(e)
      throw e
    }
  }, [applyUser, handleError])

  const logout = useCallback(async () => {
    clearSession()
    setUser(null)
    setGame(EMPTY_GAME)
    setChapters({})
    setBestExam(0)
    await refreshUsers()
  }, [refreshUsers])

  const award = useCallback<AppState['award']>(async (correct, opts) => {
    try {
      await touchStreak()
      await recordAnswer(correct, opts?.itemId)
      if (correct) await addXp(opts?.xp ?? 10)
      setGame(await getGame())
      await runAchievements()
    } catch (e) {
      handleError(e)
    }
  }, [handleError, runAchievements])

  const start = useCallback<AppState['start']>(async (id, mode) => {
    try {
      await startChapter(id, mode)
      setChapters(await getChapterProgress())
    } catch (e) { handleError(e) }
  }, [handleError])

  const checkpoint = useCallback<AppState['checkpoint']>(async (id, p, mode) => {
    try {
      await saveCheckpoint(id, p, mode)
      setChapters(await getChapterProgress())
    } catch (e) { handleError(e) }
  }, [handleError])

  const finishMode = useCallback<AppState['finishMode']>(async (c, m, s) => {
    try {
      await recordMode(c, m, s)
      await runAchievements()
    } catch (e) { handleError(e) }
  }, [handleError, runAchievements])

  const finishChapter = useCallback<AppState['finishChapter']>(async (id) => {
    try {
      await completeChapter(id)
      await addXp(50)
      setChapters(await getChapterProgress())
      setGame(await getGame())
      await runAchievements()
    } catch (e) { handleError(e) }
  }, [handleError, runAchievements])

  const saveExam = useCallback<AppState['saveExam']>(async (p, t, g) => {
    try {
      await recordExam(p, t, g)
      await addXp(Math.round(p / 2))
      await refresh()
      await runAchievements()
    } catch (e) { handleError(e) }
  }, [handleError, refresh, runAchievements])

  const dismissToast = useCallback(() => setToast(null), [])

  const lv = levelForXp(game.xp)

  const value = useMemo<AppState>(() => ({
    ready, error, user, users, login, createAccount, logout, refreshUsers,
    game,
    level: lv.level, levelTitle: levelTitle(lv.level), levelPct: lv.pct, levelInto: lv.into, levelNeed: lv.need,
    chapters, bestExam, toast,
    award, start, checkpoint, finishMode, finishChapter, saveExam, dismissToast, refresh,
  }), [ready, error, user, users, login, createAccount, logout, refreshUsers, game, lv.level, lv.pct, lv.into, lv.need, chapters, bestExam, toast, award, start, checkpoint, finishMode, finishChapter, saveExam, dismissToast, refresh])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside <AppProvider>')
  return v
}
