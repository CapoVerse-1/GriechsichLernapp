import { assertOk, supabase } from './database'
import { levelForXp } from './store'

// Simple shared profiles. The selected profile id is local to the browser,
// while profile and progress data live in Supabase.
const CURRENT_KEY = 'graecia_current_user'

export interface User {
  id: number
  name: string
  avatar: string
  created_at: number
}

export const AVATARS = ['🦉', '🏛️', '📜', '⚱️', '🗿', '🎭', '🔱', '🏺', '🦔', '🐢', '⭐', '🌿']

let currentUserId: number | null = null

function toUser(row: { id: number; name: string; avatar: string; created_at: string | number }): User {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    created_at: typeof row.created_at === 'number' ? row.created_at : new Date(row.created_at).getTime(),
  }
}

export async function loadSession(): Promise<number | null> {
  const raw = localStorage.getItem(CURRENT_KEY)
  currentUserId = raw ? Number(raw) : null
  if (currentUserId != null && !(await getUser(currentUserId))) {
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

export async function setSession(id: number) {
  currentUserId = id
  localStorage.setItem(CURRENT_KEY, String(id))
  await ensureGameRow(id)
}

export function clearSession() {
  currentUserId = null
  localStorage.removeItem(CURRENT_KEY)
}

export async function listUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true })
  assertOk(error)
  return (data ?? []).map(toUser)
}

export async function getUser(id: number): Promise<User | undefined> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle()
  assertOk(error)
  return data ? toUser(data) : undefined
}

export async function getUserByName(name: string): Promise<User | undefined> {
  const { data, error } = await supabase.from('users').select('*').ilike('name', name.trim()).maybeSingle()
  assertOk(error)
  return data ? toUser(data) : undefined
}

export async function ensureGameRow(userId: number) {
  const { error } = await supabase
    .from('game')
    .upsert({ user_id: userId, xp: 0, streak_days: 0, total_correct: 0, total_answers: 0 }, { onConflict: 'user_id', ignoreDuplicates: true })
  assertOk(error)
}

export async function createUser(name: string, avatar: string): Promise<User> {
  const clean = name.trim()
  if (!clean) throw new Error('Name darf nicht leer sein')
  if (await getUserByName(clean)) throw new Error('Dieser Name ist bereits vergeben')

  const { data, error } = await supabase
    .from('users')
    .insert({ name: clean, avatar })
    .select('*')
    .single()
  if (error && 'code' in error && error.code === '23505') throw new Error('Dieser Name ist bereits vergeben')
  assertOk(error)

  const user = toUser(data)
  await ensureGameRow(user.id)
  return user
}

export async function renameUser(id: number, name: string) {
  const { error } = await supabase.from('users').update({ name: name.trim() }).eq('id', id)
  assertOk(error)
}

export async function deleteUser(id: number) {
  const deletes = await Promise.all([
    supabase.from('chapter_progress').delete().eq('user_id', id),
    supabase.from('mode_progress').delete().eq('user_id', id),
    supabase.from('item_stats').delete().eq('user_id', id),
    supabase.from('game').delete().eq('user_id', id),
    supabase.from('achievements').delete().eq('user_id', id),
    supabase.from('exam_results').delete().eq('user_id', id),
  ])
  deletes.forEach(({ error }) => assertOk(error))
  const { error } = await supabase.from('users').delete().eq('id', id)
  assertOk(error)
}

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

export async function leaderboard(): Promise<LeaderRow[]> {
  const [{ data: users, error: usersError }, { data: games, error: gamesError }, { data: chapters, error: chaptersError }, { data: exams, error: examsError }] =
    await Promise.all([
      supabase.from('users').select('id, name, avatar'),
      supabase.from('game').select('user_id, xp, streak_days, total_correct'),
      supabase.from('chapter_progress').select('user_id, status').eq('status', 'done'),
      supabase.from('exam_results').select('user_id, points'),
    ])

  ;[usersError, gamesError, chaptersError, examsError].forEach(assertOk)

  const gameByUser = new Map((games ?? []).map((g) => [g.user_id, g]))
  const chaptersDone = new Map<number, number>()
  for (const c of chapters ?? []) chaptersDone.set(c.user_id, (chaptersDone.get(c.user_id) ?? 0) + 1)
  const bestExam = new Map<number, number>()
  for (const e of exams ?? []) bestExam.set(e.user_id, Math.max(bestExam.get(e.user_id) ?? 0, e.points))

  return (users ?? [])
    .map((u) => {
      const game = gameByUser.get(u.id)
      const xp = game?.xp ?? 0
      return {
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        xp,
        streak_days: game?.streak_days ?? 0,
        total_correct: game?.total_correct ?? 0,
        level: levelForXp(xp).level,
        chapters_done: chaptersDone.get(u.id) ?? 0,
        best_exam: bestExam.get(u.id) ?? 0,
      }
    })
    .sort((a, b) => b.xp - a.xp || b.total_correct - a.total_correct)
}
