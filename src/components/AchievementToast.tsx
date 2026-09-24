import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useApp } from '../state/AppContext'

export function AchievementToast() {
  const { toast, dismissToast } = useApp()
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(dismissToast, 3200)
    return () => clearTimeout(t)
  }, [toast, dismissToast])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ y: -90, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          onClick={dismissToast}
          className="safe-top fixed inset-x-0 top-0 z-50 mx-auto flex max-w-[440px] items-center gap-3 px-4 pt-2"
        >
          <div className="flex w-full items-center gap-3 rounded-2xl border border-teal-700 bg-teal-800 px-4 py-3 text-white shadow-float">
            <span className="text-3xl">{toast.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Erfolg freigeschaltet</p>
              <p className="truncate font-semibold">{toast.title}</p>
              <p className="truncate text-sm text-white/90">{toast.desc}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
