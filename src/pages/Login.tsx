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
      <div className={`${mode === 'create' ? 'pt-10' : 'pt-14'} text-center`}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-teal-800 font-serif text-4xl font-bold text-white shadow-float"
        >
          Σ
        </motion.div>
        <h1 className="mt-5 font-serif text-4xl font-bold text-ink">Graecia</h1>
        <p className="mt-1 text-sm text-ink-faint">Griechische Terminologie lernen</p>
      </div>

      <div className={`${mode === 'create' ? 'mt-8' : 'mt-12'} flex-1`}>
        {mode === 'pick' && (
          <div className="space-y-3">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">Profil auswählen</p>
            {app.users.map((u, idx) => (
              <motion.button
                key={u.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => { void app.login(u.id) }}
                className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-card tap transition-colors hover:border-teal-300"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-parchment-deep text-2xl">{u.avatar}</span>
                <div className="flex-1">
                  <p className="font-semibold text-ink">{u.name}</p>
                  <p className="text-xs text-ink-faint">Profil öffnen</p>
                </div>
                <span className="text-lg text-ink-faint">→</span>
              </motion.button>
            ))}
            <button onClick={() => { setMode('create'); setErr('') }} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/20 bg-white/50 p-4 font-semibold text-ink-soft tap">
              + Neues Profil anlegen
            </button>
          </div>
        )}

        {mode === 'create' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div>
              <label htmlFor="profile-name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">Dein Name</label>
              <input
                id="profile-name"
                value={name}
                autoFocus
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) void create() }}
                placeholder="z.B. Hannah"
                className="w-full rounded-2xl border border-ink/15 bg-white px-5 py-4 text-lg font-medium outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">Avatar</label>
              <div className="grid grid-cols-4 gap-2 min-[360px]:grid-cols-6">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    aria-label={`Avatar ${a}`}
                    aria-pressed={avatar === a}
                    className={`grid aspect-square place-items-center rounded-xl text-2xl tap transition ${avatar === a ? 'bg-teal-50 ring-2 ring-teal-500' : 'bg-white shadow-card'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            {err && <p className="rounded-xl bg-orange-50 px-4 py-2 text-sm font-semibold text-coral-600">{err}</p>}
            <button onClick={create} disabled={!name.trim()} className="w-full rounded-2xl bg-teal-700 py-4 font-semibold text-white tap shadow-float disabled:opacity-30">
              Profil erstellen & loslegen
            </button>
            {app.users.length > 0 && (
              <button onClick={() => { setMode('pick'); setErr('') }} className="w-full py-2 text-sm font-semibold text-ink-faint tap">← Zurück zur Auswahl</button>
            )}
          </motion.div>
        )}
      </div>

      <p className="pt-6 text-center text-[11px] text-ink-faint">Dein Lernstand ist auf allen Geräten verfügbar.</p>
    </div>
  )
}
