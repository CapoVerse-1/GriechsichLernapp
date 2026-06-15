import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'
// Let Vite resolve the wasm to a real served asset URL; we fetch the bytes and
// hand them to sql.js as `wasmBinary`, which bypasses emscripten's own fetch
// (whose path guessing breaks under the dev server's SPA fallback).
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

// SQLite in the browser via sql.js (WASM). The whole DB is exported to a
// Uint8Array and persisted in localStorage (base64). It's small (progress only).

// v2 adds multi-user support: a users table and a user_id on every progress row.
const STORAGE_KEY = 'graecia_db_v2'
let SQL: SqlJsStatic | null = null
let db: Database | null = null
let saveTimer: number | null = null

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  avatar     TEXT NOT NULL DEFAULT '🦉',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS chapter_progress (
  user_id      INTEGER NOT NULL,
  chapter_id   TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'new',   -- new | in_progress | done
  progress     REAL NOT NULL DEFAULT 0,        -- 0..1 saved checkpoint
  started_at   INTEGER,
  completed_at INTEGER,
  last_mode    TEXT,
  PRIMARY KEY (user_id, chapter_id)
);
CREATE TABLE IF NOT EXISTS mode_progress (
  user_id    INTEGER NOT NULL,
  chapter_id TEXT NOT NULL,
  mode_id    TEXT NOT NULL,
  best_score REAL NOT NULL DEFAULT 0,
  attempts   INTEGER NOT NULL DEFAULT 0,
  last_at    INTEGER,
  PRIMARY KEY (user_id, chapter_id, mode_id)
);
CREATE TABLE IF NOT EXISTS item_stats (
  user_id INTEGER NOT NULL,
  item_id TEXT NOT NULL,
  correct INTEGER NOT NULL DEFAULT 0,
  wrong   INTEGER NOT NULL DEFAULT 0,
  streak  INTEGER NOT NULL DEFAULT 0,
  last_at INTEGER,
  PRIMARY KEY (user_id, item_id)
);
CREATE TABLE IF NOT EXISTS game (
  user_id       INTEGER PRIMARY KEY,
  xp            INTEGER NOT NULL DEFAULT 0,
  streak_days   INTEGER NOT NULL DEFAULT 0,
  last_day      TEXT,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_answers INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS achievements (
  user_id     INTEGER NOT NULL,
  id          TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, id)
);
CREATE TABLE IF NOT EXISTS exam_results (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  points  INTEGER NOT NULL,
  total   INTEGER NOT NULL,
  grade   TEXT NOT NULL,
  at      INTEGER NOT NULL
);
`

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr
}

function toBase64(arr: Uint8Array): string {
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < arr.length; i += chunk) {
    bin += String.fromCharCode(...arr.subarray(i, i + chunk))
  }
  return btoa(bin)
}

export async function initDb(): Promise<Database> {
  if (db) return db
  const wasmBinary = await fetch(wasmUrl).then((r) => r.arrayBuffer())
  SQL = await initSqlJs({ wasmBinary })
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      db = new SQL.Database(fromBase64(stored))
      db.run(SCHEMA) // ensure new tables exist on upgrade
    } catch {
      db = new SQL.Database()
      db.run(SCHEMA)
    }
  } else {
    db = new SQL.Database()
    db.run(SCHEMA)
  }
  return db
}

export function getDb(): Database {
  if (!db) throw new Error('DB not initialised — call initDb() first')
  return db
}

export function persist() {
  if (!db) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    if (!db) return
    const data = db.export()
    localStorage.setItem(STORAGE_KEY, toBase64(data))
  }, 250)
}

export function persistNow() {
  if (!db) return
  if (saveTimer) clearTimeout(saveTimer)
  const data = db.export()
  localStorage.setItem(STORAGE_KEY, toBase64(data))
}

// Small query helpers ------------------------------------------------------
export function run(sql: string, params: Record<string, unknown> | unknown[] = []) {
  getDb().run(sql, params as never)
  persist()
}

export function all<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> | unknown[] = [],
): T[] {
  const stmt = getDb().prepare(sql)
  stmt.bind(params as never)
  const rows: T[] = []
  while (stmt.step()) rows.push(stmt.getAsObject() as T)
  stmt.free()
  return rows
}

export function one<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> | unknown[] = [],
): T | undefined {
  return all<T>(sql, params)[0]
}

export function resetAll() {
  localStorage.removeItem(STORAGE_KEY)
  if (db) {
    db.close()
    db = null
  }
}
