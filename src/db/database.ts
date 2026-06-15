import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(
  supabaseUrl || 'https://missing-project.supabase.co',
  supabaseAnonKey || 'missing-anon-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
)

export async function initDb(): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase fehlt: VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY muessen gesetzt sein.')
  }
}

export function requireSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase fehlt: VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY muessen gesetzt sein.')
  }
}

export function assertOk(error: unknown) {
  if (!error) return
  if (typeof error === 'object' && error && 'message' in error) {
    throw new Error(String((error as { message: unknown }).message))
  }
  throw new Error('Supabase request failed')
}

export function persistNow() {
  // Supabase writes are persisted immediately.
}

export function resetAll() {
  localStorage.removeItem('graecia_current_user')
}
