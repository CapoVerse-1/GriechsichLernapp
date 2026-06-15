import { all, one, run } from './database'
import { levelForXp } from './store'

// ===== Simple, unsecured multi-user "accounts" (username only) =====
// The "logged-in" user id is kept in localStorage; every progress query is
// scoped to it. No passwords — this is a shared study app for ~4 people.

const CURRENT_KEY = 'graecia_current_user'

export interface User {
  id: number
  name: string
  avatar: string
  created_at: number
}

export const AVATARS = ['🦉', '🏛️', '📜', '⚱️', '🗿', '🎭', '🔱', '🏺', '🦔', '🐢', '⭐', '🌿']

let currentUserId: number | null = null

export function loadSession(): number | null {
  const raw = localStorage.getItem(CURRENT_KEY)
  currentUserId = raw ? Number(raw) : null
  // validate the stored user still exists
  if (currentUserId != null && !getUser(currentUserId)) {
    currentUserId = null
    localStorage.removeItem(CURRENT_KEY)
  }
  return currentUserId
}

export function getCurrentUserId(): number {
  if (currentUserId == null) throw new Error('No user logged in')
  return currentUserId
}

export function hasSession(): boolean {
  return currentUserId != null
}

export function setSession(id: number) {
  currentUserId = id
  localStorage.setItem(CURRENT_KEY, String(id))
  ensureGameRow(id)
}

export function clearSession() {
  currentUserId = null
  localStorage.removeItem(CURRENT_KEY)
}

export function listUsers(): User[] {
  return all<User>('SELECT * FROM users ORDER BY created_at ASC')
}

export function getUser(id: number): User | undefined {
  return one<User>('SELECT * FROM users WHERE id=:id', { ':id': id })
}

export function getUserByName(name: string): User | undefined {
  return one<User>('SELECT * FROM users WHERE lower(name)=lower(:n)', { ':n': name.trim() })
}

export function ensureGameRow(userId: number) {
  run('INSERT OR IGNORE INTO game (user_id, xp, streak_days, total_correct, total_answers) VALUES (:u, 0, 0, 0, 0)', { ':u': userId })
}

/** Create a new account. Throws if the name is taken. Returns the new user. */
export function createUser(name: string, avatar: string): User {
  const clean = name.trim()
  if (!clean) throw new Error('Name darf nicht leer sein')
  if (getUserByName(clean)) throw new Error('Dieser Name ist bereits vergeben')
  run('INSERT INTO users (name, avatar, created_at) VALUES (:n, :a, :t)', { ':n': clean, ':a': avatar, ':t': Date.now() })
  const u = getUserByName(clean)!
  ensureGameRow(u.id)
  return u
}

export function renameUser(id: number, name: string) {
  run('UPDATE users SET name=:n WHERE id=:id', { ':n': name.trim(), ':id': id })
}

export function deleteUser(id: number) {
  for (const t of ['chapter_progress', 'mode_progress', 'item_stats', 'game', 'achievements', 'exam_results']) {
    run(`DELETE FROM ${t} WHERE user_id=:u`, { ':u': id })
  }
  run('DELETE FROM users WHERE id=:id', { ':id': id })
}

// ===== Leaderboard =====
export interface LeaderRow {
  id: number
  name: string
  avatar: string
  xp: number
  streak_days: number
  total_correct: number
  level: number
  chapters_done: number
  best_exam: number
}

export function leaderboard(): LeaderRow[] {
  const rows = all<Omit<LeaderRow, 'level'>>(
    `SELECT u.id, u.name, u.avatar,
            COALESCE(g.xp,0) AS xp,
            COALESCE(g.streak_days,0) AS streak_days,
            COALESCE(g.total_correct,0) AS total_correct,
            (SELECT COUNT(*) FROM chapter_progress c WHERE c.user_id=u.id AND c.status='done') AS chapters_done,
            COALESCE((SELECT MAX(e.points) FROM exam_results e WHERE e.user_id=u.id),0) AS best_exam
     FROM users u
     LEFT JOIN game g ON g.user_id = u.id`,
  )
  return rows
    .map((r) => ({ ...r, level: levelForXp(r.xp).level }))
    .sort((a, b) => b.xp - a.xp || b.total_correct - a.total_correct)
}
