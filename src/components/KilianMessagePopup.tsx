import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  HANNAH_PROFILE_ID,
  KILIAN_MESSAGE_HEADING,
  KILIAN_MESSAGE_INTERVAL_MS,
  KILIAN_MESSAGES,
} from '../content/kilianMessages'
import { useApp } from '../state/AppContext'

const NEXT_MESSAGE_KEY = 'graecia_kilian_next_message'
type KilianMessage = (typeof KILIAN_MESSAGES)[number]

function nextMessage(): KilianMessage {
  const storedIndex = Number(localStorage.getItem(NEXT_MESSAGE_KEY))
  const index = Number.isInteger(storedIndex) && storedIndex >= 0
    ? storedIndex % KILIAN_MESSAGES.length
    : 0
  localStorage.setItem(NEXT_MESSAGE_KEY, String((index + 1) % KILIAN_MESSAGES.length))
  return KILIAN_MESSAGES[index]
}

export function KilianMessagePopup() {
  const { user } = useApp()
  const userId = user?.id ?? null
  const [message, setMessage] = useState<KilianMessage | null>(null)
  const isOpen = useRef(false)
  const closeButton = useRef<HTMLButtonElement>(null)

  const dismiss = useCallback(() => {
    isOpen.current = false
    setMessage(null)
  }, [])

  useEffect(() => {
    isOpen.current = false
    setMessage(null)
    if (userId !== HANNAH_PROFILE_ID) return

    const timer = window.setInterval(() => {
      if (isOpen.current) return
      isOpen.current = true
      setMessage(nextMessage())
    }, KILIAN_MESSAGE_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [userId])

  useEffect(() => {
    if (!message) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeButton.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault()
        closeButton.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus()
    }
  }, [message])

  return (
    <AnimatePresence>
      {userId === HANNAH_PROFILE_ID && message ? (
        <motion.div
          key="kilian-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-ink/50 px-5 py-8"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="kilian-message-heading"
            aria-describedby="kilian-message-body"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="w-full max-w-sm rounded-3xl border border-white/70 bg-parchment p-6 text-center shadow-float"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Persönliche Nachricht</p>
            <h2 id="kilian-message-heading" className="font-serif text-2xl font-bold text-ink">{KILIAN_MESSAGE_HEADING}</h2>
            <p id="kilian-message-body" className="mt-3 text-base leading-relaxed text-ink-soft">{message.text}</p>
            <button
              ref={closeButton}
              type="button"
              onClick={dismiss}
              className="mt-6 w-full rounded-2xl bg-teal-700 px-5 py-3.5 font-semibold text-white tap"
            >
              {message.reply}
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
