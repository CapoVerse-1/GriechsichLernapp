import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export const ACCENTS: Record<string, { bg: string; text: string; soft: string; ring: string; grad: string }> = {
  teal: { bg: 'bg-teal-600', text: 'text-teal-700', soft: 'bg-teal-50', ring: 'ring-teal-200', grad: 'from-teal-500 to-teal-700' },
  olive: { bg: 'bg-olive-600', text: 'text-olive-700', soft: 'bg-olive-50', ring: 'ring-olive-200', grad: 'from-olive-400 to-olive-600' },
  sun: { bg: 'bg-sun-500', text: 'text-sun-600', soft: 'bg-amber-50', ring: 'ring-amber-200', grad: 'from-sun-400 to-sun-600' },
  coral: { bg: 'bg-coral-500', text: 'text-coral-600', soft: 'bg-orange-50', ring: 'ring-orange-200', grad: 'from-coral-400 to-coral-600' },
}

export function accent(key: string) {
  return ACCENTS[key] ?? ACCENTS.teal
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`rounded-3xl bg-white shadow-card ${onClick ? 'cursor-pointer tap' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function Button({
  children, onClick, variant = 'primary', accentKey = 'teal', className = '', disabled, type = 'button',
}: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'soft' | 'ghost' | 'outline'
  accentKey?: string; className?: string; disabled?: boolean; type?: 'button' | 'submit'
}) {
  const a = accent(accentKey)
  const base = 'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-semibold tap disabled:opacity-40 disabled:active:scale-100 transition'
  const styles =
    variant === 'primary' ? `${a.bg} text-white shadow-float`
    : variant === 'soft' ? `${a.soft} ${a.text}`
    : variant === 'outline' ? `bg-white border-2 border-ink/10 text-ink`
    : `text-ink/70`
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  )
}

export function ProgressBar({ pct, accentKey = 'teal', className = '', height = 'h-2.5' }: { pct: number; accentKey?: string; className?: string; height?: string }) {
  const a = accent(accentKey)
  return (
    <div className={`w-full ${height} rounded-full bg-ink/10 overflow-hidden ${className}`}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${a.grad}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.round(Math.min(1, Math.max(0, pct)) * 100)}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  )
}

export function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span>
}

export function IconButton({ children, onClick, label }: { children: ReactNode; onClick?: () => void; label?: string }) {
  return (
    <button aria-label={label} onClick={onClick} className="grid h-10 w-10 place-items-center rounded-full glass shadow-card tap text-ink/70">
      {children}
    </button>
  )
}

export function ChevronLeft() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
}

export function ScreenHeader({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-3 pb-2">
      {onBack && <IconButton onClick={onBack} label="Zurück"><ChevronLeft /></IconButton>}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-extrabold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-ink-faint">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="grid place-items-center gap-2 py-16 text-center text-ink-faint">
      <div className="text-4xl">{icon}</div>
      <p className="px-10 text-sm">{text}</p>
    </div>
  )
}
