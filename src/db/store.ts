import { all, one, run } from './database'
import { getCurrentUserId } from './auth'

// ===== Leveling =====
// XP curve: level n requires 50*n cumulative-ish; simple thresholds.
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
]

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] ?? 'Meister:in'
}

const uid = () => getCurrentUserId()

// ===== Game state =====
export interface GameState {
  xp: number
  streak_days: number
  last_day: string | null
  total_correct: number
  total_answers: number
}

export function getGame(): GameState {
  return (
    one<GameState>('SELECT xp, streak_days, last_day, total_correct, total_answers FROM game WHERE user_id=:u', { ':u': uid() }) ?? {
      xp: 0, streak_days: 0, last_day: null, total_correct: 0, total_answers: 0,
    }
  )
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function dayDiff(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00').getTime()
  const db = new Date(b + 'T00:00:00').getTime()
  return Math.round((db - da) / 86400000)
}

/** Call at app start / first answer of a session to maintain the streak. */
export function touchStreak(): GameState {
  const g = getGame()
  const t = today()
  if (g.last_day === t) return g
  let streak = g.streak_days
  if (!g.last_day) streak = 1
  else {
    const d = dayDiff(g.last_day, t)
    if (d === 1) streak = g.streak_days + 1
    else if (d > 1) streak = 1
  }
  run('UPDATE game SET streak_days=:s, last_day=:d WHERE user_id=:u', { ':s': streak, ':d': t, ':u': uid() })
  return getGame()
}

export function addXp(amount: number): GameState {
  run('UPDATE game SET xp = xp + :a WHERE user_id=:u', { ':a': Math.max(0, Math.round(amount)), ':u': uid() })
  return getGame()
}

export function recordAnswer(correct: boolean, itemId?: string): void {
  run('UPDATE game SET total_answers = total_answers + 1, total_correct = total_correct + :c WHERE user_id=:u', {
    ':c': correct ? 1 : 0, ':u': uid(),
  })
  if (itemId) {
    run(
      `INSERT INTO item_stats (user_id, item_id, correct, wrong, streak, last_at)
       VALUES (:u, :id, :c, :w, :st, :at)
       ON CONFLICT(user_id, item_id) DO UPDATE SET
         correct = correct + :c,
         wrong   = wrong + :w,
         streak  = CASE WHEN :c=1 THEN streak + 1 ELSE 0 END,
         last_at = :at`,
      { ':u': uid(), ':id': itemId, ':c': correct ? 1 : 0, ':w': correct ? 0 : 1, ':st': correct ? 1 : 0, ':at': Date.now() },
    )
  }
}

export function itemKnown(itemId: string): boolean {
  const r = one<{ streak: number }>('SELECT streak FROM item_stats WHERE user_id=:u AND item_id=:id', { ':u': uid(), ':id': itemId })
  return (r?.streak ?? 0) >= 2
}

// ===== Chapter progress =====
export type ChapterStatus = 'new' | 'in_progress' | 'done'
export interface ChapterRow {
  chapter_id: string
  status: ChapterStatus
  progress: number
  started_at: number | null
  completed_at: number | null
  last_mode: string | null
}

export function getChapterProgress(): Record<string, ChapterRow> {
  const rows = all<ChapterRow>('SELECT chapter_id, status, progress, started_at, completed_at, last_mode FROM chapter_progress WHERE user_id=:u', { ':u': uid() })
  const map: Record<string, ChapterRow> = {}
  for (const r of rows) map[r.chapter_id] = r
  return map
}

export function startChapter(id: string, mode?: string): void {
  run(
    `INSERT INTO chapter_progress (user_id, chapter_id, status, started_at, last_mode)
     VALUES (:u, :id, 'in_progress', :at, :m)
     ON CONFLICT(user_id, chapter_id) DO UPDATE SET
       status = CASE WHEN status='done' THEN 'done' ELSE 'in_progress' END,
       started_at = COALESCE(started_at, :at),
       last_mode = COALESCE(:m, last_mode)`,
    { ':u': uid(), ':id': id, ':at': Date.now(), ':m': mode ?? null },
  )
}

export function saveCheckpoint(id: string, progress: number, mode?: string): void {
  run(
    `INSERT INTO chapter_progress (user_id, chapter_id, status, progress, started_at, last_mode)
     VALUES (:u, :id, 'in_progress', :p, :at, :m)
     ON CONFLICT(user_id, chapter_id) DO UPDATE SET
       progress = MAX(progress, :p),
       status = CASE WHEN status='done' THEN 'done' ELSE 'in_progress' END,
       last_mode = COALESCE(:m, last_mode)`,
    { ':u': uid(), ':id': id, ':p': progress, ':at': Date.now(), ':m': mode ?? null },
  )
}

export function completeChapter(id: string): void {
  run(
    `INSERT INTO chapter_progress (user_id, chapter_id, status, progress, started_at, completed_at)
     VALUES (:u, :id, 'done', 1, :at, :at)
     ON CONFLICT(user_id, chapter_id) DO UPDATE SET status='done', progress=1, completed_at=:at`,
    { ':u': uid(), ':id': id, ':at': Date.now() },
  )
}

// ===== Mode progress =====
export interface ModeRow { chapter_id: string; mode_id: string; best_score: number; attempts: number; last_at: number | null }

export function recordMode(chapterId: string, modeId: string, score: number): void {
  run(
    `INSERT INTO mode_progress (user_id, chapter_id, mode_id, best_score, attempts, last_at)
     VALUES (:u, :c, :m, :s, 1, :at)
     ON CONFLICT(user_id, chapter_id, mode_id) DO UPDATE SET
       best_score = MAX(best_score, :s),
       attempts = attempts + 1,
       last_at = :at`,
    { ':u': uid(), ':c': chapterId, ':m': modeId, ':s': score, ':at': Date.now() },
  )
}

export function getModeProgress(chapterId: string): Record<string, ModeRow> {
  const rows = all<ModeRow>('SELECT chapter_id, mode_id, best_score, attempts, last_at FROM mode_progress WHERE user_id=:u AND chapter_id=:c', { ':u': uid(), ':c': chapterId })
  const map: Record<string, ModeRow> = {}
  for (const r of rows) map[r.mode_id] = r
  return map
}

export function getAllModeProgress(): ModeRow[] {
  return all<ModeRow>('SELECT chapter_id, mode_id, best_score, attempts, last_at FROM mode_progress WHERE user_id=:u', { ':u': uid() })
}

// ===== Exam =====
export interface ExamRow { id: number; points: number; total: number; grade: string; at: number }
export function recordExam(points: number, total: number, grade: string): void {
  run('INSERT INTO exam_results (user_id, points, total, grade, at) VALUES (:u, :p, :t, :g, :at)', {
    ':u': uid(), ':p': points, ':t': total, ':g': grade, ':at': Date.now(),
  })
}
export function getExams(): ExamRow[] {
  return all<ExamRow>('SELECT id, points, total, grade, at FROM exam_results WHERE user_id=:u ORDER BY at DESC LIMIT 20', { ':u': uid() })
}

// ===== Achievements =====
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
  bestExam: number
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-steps', title: 'Erste Schritte', desc: 'Beantworte deine erste Frage', icon: '👣', check: (c) => c.game.total_answers >= 1 },
  { id: 'ten-correct', title: 'Aufgewärmt', desc: '10 richtige Antworten', icon: '🔥', check: (c) => c.game.total_correct >= 10 },
  { id: 'hundred-correct', title: 'Hundertschaft', desc: '100 richtige Antworten', icon: '💯', check: (c) => c.game.total_correct >= 100 },
  { id: 'streak-3', title: 'Dranbleiben', desc: '3 Tage Streak', icon: '📅', check: (c) => c.game.streak_days >= 3 },
  { id: 'streak-7', title: 'Eine Woche!', desc: '7 Tage Streak', icon: '🗓️', check: (c) => c.game.streak_days >= 7 },
  { id: 'level-5', title: 'Dialektiker:in', desc: 'Erreiche Level 5', icon: '⭐', check: (c) => levelForXp(c.game.xp).level >= 5 },
  { id: 'chapter-1', title: 'Kapitel-Meister:in', desc: 'Schließe ein Kapitel ab', icon: '🏅', check: (c) => Object.values(c.chapters).some((r) => r.status === 'done') },
  { id: 'all-chapters', title: 'Vollendung', desc: 'Alle 7 Kapitel abgeschlossen', icon: '👑', check: (c) => Object.values(c.chapters).filter((r) => r.status === 'done').length >= 7 },
  { id: 'exam-pass', title: 'Bestanden', desc: 'Klausur mit ≥ 37 Punkten', icon: '🎓', check: (c) => c.bestExam >= 37 },
  { id: 'exam-ace', title: 'Sehr gut', desc: 'Klausur mit ≥ 61 Punkten', icon: '🏆', check: (c) => c.bestExam >= 61 },
]

/** Wipe just the current user's progress, keeping the account. */
export function resetCurrentUser(): void {
  const u = uid()
  for (const t of ['chapter_progress', 'mode_progress', 'item_stats', 'achievements', 'exam_results']) {
    run(`DELETE FROM ${t} WHERE user_id=:u`, { ':u': u })
  }
  run('UPDATE game SET xp=0, streak_days=0, last_day=NULL, total_correct=0, total_answers=0 WHERE user_id=:u', { ':u': u })
}

export function getUnlocked(): Set<string> {
  return new Set(all<{ id: string }>('SELECT id FROM achievements WHERE user_id=:u', { ':u': uid() }).map((r) => r.id))
}

/** Re-evaluate achievements; returns newly unlocked defs. */
export function syncAchievements(ctx: AchievementCtx): AchievementDef[] {
  const unlocked = getUnlocked()
  const fresh: AchievementDef[] = []
  for (const a of ACHIEVEMENTS) {
    if (!unlocked.has(a.id) && a.check(ctx)) {
      run('INSERT OR IGNORE INTO achievements (user_id, id, unlocked_at) VALUES (:u, :id, :at)', { ':u': uid(), ':id': a.id, ':at': Date.now() })
      fresh.push(a)
    }
  }
  return fresh
}
