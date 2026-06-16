import { getCurrentUserId } from './auth'
import { assertOk, supabase } from './database'
import { CHAPTERS } from '../content/chapters'

export function levelForXp(xp: number): { level: number; into: number; need: number; pct: number } {
  let level = 1
  let need = 100
  let acc = 0
  while (xp >= acc + need) {
    acc += need
    level++
    need = Math.round(need * 1.35)
  }
  const into = xp - acc
  return { level, into, need, pct: Math.min(1, into / need) }
}

export const LEVEL_TITLES = [
  'Anfänger:in', 'Schüler:in', 'Lehrling', 'Kenner:in', 'Stoiker:in',
  'Peripatetiker:in', 'Dialektiker:in', 'Sophist:in', 'Philosoph:in', 'Sokrates-Niveau',
  'Platoniker:in', 'Aristoteliker:in', 'Philolog:in', 'Meister:in', 'Olymp-Niveau',
]

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] ?? 'Meister:in'
}

const uid = () => getCurrentUserId()

export interface GameState {
  xp: number
  streak_days: number
  last_day: string | null
  total_correct: number
  total_answers: number
}

const EMPTY_GAME: GameState = { xp: 0, streak_days: 0, last_day: null, total_correct: 0, total_answers: 0 }

export async function getGame(): Promise<GameState> {
  const { data, error } = await supabase
    .from('game')
    .select('xp, streak_days, last_day, total_correct, total_answers')
    .eq('user_id', uid())
    .maybeSingle()
  assertOk(error)
  return data ?? EMPTY_GAME
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function dayDiff(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00').getTime()
  const db = new Date(b + 'T00:00:00').getTime()
  return Math.round((db - da) / 86400000)
}

export async function touchStreak(): Promise<GameState> {
  const g = await getGame()
  const t = today()
  if (g.last_day === t) return g
  let streak = g.streak_days
  if (!g.last_day) streak = 1
  else {
    const d = dayDiff(g.last_day, t)
    if (d === 1) streak = g.streak_days + 1
    else if (d > 1) streak = 1
  }
  const { error } = await supabase.from('game').update({ streak_days: streak, last_day: t }).eq('user_id', uid())
  assertOk(error)
  return getGame()
}

export async function addXp(amount: number): Promise<GameState> {
  const g = await getGame()
  const { error } = await supabase
    .from('game')
    .update({ xp: g.xp + Math.max(0, Math.round(amount)) })
    .eq('user_id', uid())
  assertOk(error)
  return getGame()
}

export async function recordAnswer(correct: boolean, itemId?: string): Promise<void> {
  const g = await getGame()
  const { error } = await supabase
    .from('game')
    .update({
      total_answers: g.total_answers + 1,
      total_correct: g.total_correct + (correct ? 1 : 0),
    })
    .eq('user_id', uid())
  assertOk(error)

  if (itemId) {
    const { data: row, error: readError } = await supabase
      .from('item_stats')
      .select('correct, wrong, streak')
      .eq('user_id', uid())
      .eq('item_id', itemId)
      .maybeSingle()
    assertOk(readError)

    const { error: upsertError } = await supabase.from('item_stats').upsert({
      user_id: uid(),
      item_id: itemId,
      correct: (row?.correct ?? 0) + (correct ? 1 : 0),
      wrong: (row?.wrong ?? 0) + (correct ? 0 : 1),
      streak: correct ? (row?.streak ?? 0) + 1 : 0,
      last_at: Date.now(),
    })
    assertOk(upsertError)
  }
}

export async function itemKnown(itemId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('item_stats')
    .select('streak')
    .eq('user_id', uid())
    .eq('item_id', itemId)
    .maybeSingle()
  assertOk(error)
  return (data?.streak ?? 0) >= 2
}

export type ChapterStatus = 'new' | 'in_progress' | 'done'
export interface ChapterRow {
  chapter_id: string
  status: ChapterStatus
  progress: number
  started_at: number | null
  completed_at: number | null
  last_mode: string | null
}

function toChapterRow(row: ChapterRow): ChapterRow {
  return row
}

export async function getChapterProgress(): Promise<Record<string, ChapterRow>> {
  const { data, error } = await supabase
    .from('chapter_progress')
    .select('chapter_id, status, progress, started_at, completed_at, last_mode')
    .eq('user_id', uid())
  assertOk(error)
  const map: Record<string, ChapterRow> = {}
  for (const r of data ?? []) map[r.chapter_id] = toChapterRow(r as ChapterRow)
  return map
}

export async function startChapter(id: string, mode?: string): Promise<void> {
  const { data: row, error: readError } = await supabase
    .from('chapter_progress')
    .select('*')
    .eq('user_id', uid())
    .eq('chapter_id', id)
    .maybeSingle()
  assertOk(readError)

  const now = Date.now()
  const { error } = await supabase.from('chapter_progress').upsert({
    user_id: uid(),
    chapter_id: id,
    status: row?.status === 'done' ? 'done' : 'in_progress',
    progress: row?.progress ?? 0,
    started_at: row?.started_at ?? now,
    completed_at: row?.completed_at ?? null,
    last_mode: mode ?? row?.last_mode ?? null,
  })
  assertOk(error)
}

export async function saveCheckpoint(id: string, progress: number, mode?: string): Promise<void> {
  const { data: row, error: readError } = await supabase
    .from('chapter_progress')
    .select('*')
    .eq('user_id', uid())
    .eq('chapter_id', id)
    .maybeSingle()
  assertOk(readError)

  const { error } = await supabase.from('chapter_progress').upsert({
    user_id: uid(),
    chapter_id: id,
    status: row?.status === 'done' ? 'done' : 'in_progress',
    progress: Math.max(row?.progress ?? 0, progress),
    started_at: row?.started_at ?? Date.now(),
    completed_at: row?.completed_at ?? null,
    last_mode: mode ?? row?.last_mode ?? null,
  })
  assertOk(error)
}

export async function completeChapter(id: string): Promise<void> {
  const { data: row, error: readError } = await supabase
    .from('chapter_progress')
    .select('*')
    .eq('user_id', uid())
    .eq('chapter_id', id)
    .maybeSingle()
  assertOk(readError)

  const now = Date.now()
  const { error } = await supabase.from('chapter_progress').upsert({
    user_id: uid(),
    chapter_id: id,
    status: 'done',
    progress: 1,
    started_at: row?.started_at ?? now,
    completed_at: now,
    last_mode: row?.last_mode ?? null,
  })
  assertOk(error)
}

export interface ModeRow { chapter_id: string; mode_id: string; best_score: number; attempts: number; last_at: number | null }

export async function recordMode(chapterId: string, modeId: string, score: number): Promise<void> {
  const { data: row, error: readError } = await supabase
    .from('mode_progress')
    .select('best_score, attempts')
    .eq('user_id', uid())
    .eq('chapter_id', chapterId)
    .eq('mode_id', modeId)
    .maybeSingle()
  assertOk(readError)

  const { error } = await supabase.from('mode_progress').upsert({
    user_id: uid(),
    chapter_id: chapterId,
    mode_id: modeId,
    best_score: Math.max(row?.best_score ?? 0, score),
    attempts: (row?.attempts ?? 0) + 1,
    last_at: Date.now(),
  })
  assertOk(error)
}

export async function getModeProgress(chapterId: string): Promise<Record<string, ModeRow>> {
  const { data, error } = await supabase
    .from('mode_progress')
    .select('chapter_id, mode_id, best_score, attempts, last_at')
    .eq('user_id', uid())
    .eq('chapter_id', chapterId)
  assertOk(error)
  const map: Record<string, ModeRow> = {}
  for (const r of data ?? []) map[r.mode_id] = r
  return map
}

export async function getAllModeProgress(): Promise<ModeRow[]> {
  const { data, error } = await supabase
    .from('mode_progress')
    .select('chapter_id, mode_id, best_score, attempts, last_at')
    .eq('user_id', uid())
  assertOk(error)
  return data ?? []
}

export interface ExamRow { id: number; points: number; total: number; grade: string; at: number }

export async function recordExam(points: number, total: number, grade: string): Promise<void> {
  const { error } = await supabase.from('exam_results').insert({
    user_id: uid(),
    points,
    total,
    grade,
    at: Date.now(),
  })
  assertOk(error)
}

export async function getExams(): Promise<ExamRow[]> {
  const { data, error } = await supabase
    .from('exam_results')
    .select('id, points, total, grade, at')
    .eq('user_id', uid())
    .order('at', { ascending: false })
    .limit(20)
  assertOk(error)
  return data ?? []
}

export interface AchievementDef {
  id: string
  title: string
  desc: string
  icon: string
  check: (ctx: AchievementCtx) => boolean
}
export interface AchievementCtx {
  game: GameState
  chapters: Record<string, ChapterRow>
  modes: ModeRow[]
  bestExam: number
}

const TOTAL_CHAPTERS = CHAPTERS.length
const TOTAL_MODES = CHAPTERS.reduce((sum, chapter) => sum + chapter.modes.length, 0)
const MODE_MASTERED_SCORE = 0.6

function allChaptersDone(chapters: Record<string, ChapterRow>): boolean {
  return CHAPTERS.every((chapter) => chapters[chapter.id]?.status === 'done')
}

function allModesMastered(modes: ModeRow[]): boolean {
  const best = new Map(modes.map((row) => [`${row.chapter_id}:${row.mode_id}`, row.best_score]))
  return CHAPTERS.every((chapter) =>
    chapter.modes.every((mode) => (best.get(`${chapter.id}:${mode}`) ?? 0) >= MODE_MASTERED_SCORE),
  )
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-steps', title: 'Erste Schritte', desc: 'Beantworte deine erste Frage', icon: '👣', check: (c) => c.game.total_answers >= 1 },
  { id: 'ten-correct', title: 'Aufgewärmt', desc: '10 richtige Antworten', icon: '🔥', check: (c) => c.game.total_correct >= 10 },
  { id: 'hundred-correct', title: 'Hundertschaft', desc: '100 richtige Antworten', icon: '💯', check: (c) => c.game.total_correct >= 100 },
  { id: 'streak-3', title: 'Dranbleiben', desc: '3 Tage Streak', icon: '📅', check: (c) => c.game.streak_days >= 3 },
  { id: 'streak-7', title: 'Eine Woche!', desc: '7 Tage Streak', icon: '🗓️', check: (c) => c.game.streak_days >= 7 },
  { id: 'level-5', title: 'Dialektiker:in', desc: 'Erreiche Level 5', icon: '⭐', check: (c) => levelForXp(c.game.xp).level >= 5 },
  { id: 'level-10', title: 'Sokrates-Niveau', desc: 'Erreiche Level 10', icon: '🌟', check: (c) => levelForXp(c.game.xp).level >= 10 },
  { id: 'chapter-1', title: 'Kapitel-Meister:in', desc: 'Schließe ein Kapitel ab', icon: '🏅', check: (c) => Object.values(c.chapters).some((r) => r.status === 'done') },
  { id: 'all-chapters', title: 'Vollendung', desc: `Alle ${TOTAL_CHAPTERS} Kapitel abgeschlossen`, icon: '👑', check: (c) => allChaptersDone(c.chapters) },
  { id: 'all-modes', title: 'Alles gemeistert', desc: `Alle ${TOTAL_MODES} Übungen mit mindestens 60%`, icon: '🏛️', check: (c) => allModesMastered(c.modes) },
  { id: 'exam-pass', title: 'Bestanden', desc: 'Klausur mit ≥ 37 Punkten', icon: '🎓', check: (c) => c.bestExam >= 37 },
  { id: 'exam-ace', title: 'Sehr gut', desc: 'Klausur mit ≥ 61 Punkten', icon: '🏆', check: (c) => c.bestExam >= 61 },
]

export async function resetCurrentUser(): Promise<void> {
  const u = uid()
  const deletes = await Promise.all([
    supabase.from('chapter_progress').delete().eq('user_id', u),
    supabase.from('mode_progress').delete().eq('user_id', u),
    supabase.from('item_stats').delete().eq('user_id', u),
    supabase.from('achievements').delete().eq('user_id', u),
    supabase.from('exam_results').delete().eq('user_id', u),
  ])
  deletes.forEach(({ error }) => assertOk(error))
  const { error } = await supabase
    .from('game')
    .update({ xp: 0, streak_days: 0, last_day: null, total_correct: 0, total_answers: 0 })
    .eq('user_id', u)
  assertOk(error)
}

export async function getUnlocked(): Promise<Set<string>> {
  const { data, error } = await supabase.from('achievements').select('id').eq('user_id', uid())
  assertOk(error)
  return new Set((data ?? []).map((r) => r.id))
}

export async function syncAchievements(ctx: AchievementCtx): Promise<AchievementDef[]> {
  const unlocked = await getUnlocked()
  const fresh: AchievementDef[] = []
  for (const a of ACHIEVEMENTS) {
    if (!unlocked.has(a.id) && a.check(ctx)) {
      const { error } = await supabase.from('achievements').upsert({
        user_id: uid(),
        id: a.id,
        unlocked_at: Date.now(),
      })
      assertOk(error)
      fresh.push(a)
    }
  }
  return fresh
}
