import { motion } from 'framer-motion'
import { useState } from 'react'
import { AVATARS } from '../db/auth'
import { useApp } from '../state/AppContext'

export function Login() {
  const app = useApp()
  const [mode, setMode] = useState<'pick' | 'create'>(app.users.length ? 'pick' : 'create')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [err, setErr] = useState('')

  const create = async () => {
    try {
      setErr('')
      await app.createAccount(name, avatar)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Fehler')
    }
  }

  return (
    <div className="app-shell flex min-h-screen flex-col px-5 pb-10 safe-top">
      <div className="pt-10 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 font-serif text-5xl font-black text-white shadow-float"
        >
          Σ
        </motion.div>
        <h1 className="mt-4 font-serif text-3xl font-black text-ink">Graecia</h1>
        <p className="mt-1 text-sm text-ink-faint">Wähle dein Profil oder leg ein neues an</p>
      </div>

      <div className="mt-8 flex-1">
        {mode === 'pick' && (
          <div className="space-y-3">
            {app.users.map((u, idx) => (
              <motion.button
                key={u.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => { void app.login(u.id) }}
                className="flex w-full items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-card tap"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-parchment-deep text-3xl">{u.avatar}</span>
                <div className="flex-1">
                  <p className="text-lg font-extrabold text-ink">{u.name}</p>
                  <p className="text-xs text-ink-faint">Profil öffnen</p>
                </div>
                <span className="text-xl text-ink-faint">→</span>
              </motion.button>
            ))}
            <button onClick={() => { setMode('create'); setErr('') }} className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-ink/15 bg-white/40 p-4 font-bold text-ink/60 tap">
              + Neues Profil anlegen
            </button>
          </div>
        )}

        {mode === 'create' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-ink-faint">Dein Name</label>
              <input
                value={name}
                autoFocus
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) void create() }}
                placeholder="z.B. Hannah"
                className="w-full rounded-2xl border-2 border-ink/15 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-ink-faint">Avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`grid aspect-square place-items-center rounded-2xl text-2xl tap transition ${avatar === a ? 'bg-teal-600 ring-2 ring-teal-300 scale-105' : 'bg-white shadow-card'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            {err && <p className="rounded-xl bg-orange-50 px-4 py-2 text-sm font-semibold text-coral-600">{err}</p>}
            <button onClick={create} disabled={!name.trim()} className="w-full rounded-2xl bg-teal-600 py-4 font-bold text-white tap shadow-float disabled:opacity-30">
              Profil erstellen & loslegen
            </button>
            {app.users.length > 0 && (
              <button onClick={() => { setMode('pick'); setErr('') }} className="w-full py-2 text-sm font-semibold text-ink-faint tap">← Zurück zur Auswahl</button>
            )}
          </motion.div>
        )}
      </div>

      <p className="pt-6 text-center text-[11px] text-ink-faint">Kein Passwort nötig · bis zu mehreren Profilen · Fortschritt in Supabase</p>
    </div>
  )
}
