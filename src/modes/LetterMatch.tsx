import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { ModeShell, ResultScreen } from '../components/ModeShell'
import { matchPairs, type Pair } from '../lib/select'
import { sample, shuffle } from '../lib/text'
import { useApp } from '../state/AppContext'
import type { ModeProps } from './types'

const BATCH = 5

interface Tile { key: string; pairId: string; text: string; lang: 'gr' | 'de' | 'normal'; side: 'a' | 'b' }

function makeRounds(pairs: Pair[]): Pair[][] {
  const picked = sample(pairs, Math.min(20, pairs.length))
  const rounds: Pair[][] = []
  for (let i = 0; i < picked.length; i += BATCH) rounds.push(picked.slice(i, i + BATCH))
  return rounds
}

export default function LetterMatch({ chapterId, accentKey, onClose, onFinish }: ModeProps) {
  const app = useApp()
  const rounds = useMemo(() => makeRounds(matchPairs(chapterId)), [chapterId])
  const [round, setRound] = useState(0)
  const [done, setDone] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [matched, setMatched] = useState(0)

  // per-round tile state
  const [left, setLeft] = useState<Tile[]>([])
  const [right, setRight] = useState<Tile[]>([])
  const [selL, setSelL] = useState<string | null>(null)
  const [selR, setSelR] = useState<string | null>(null)
  const [gonePairs, setGonePairs] = useState<Set<string>>(new Set())
  const [wrongFlash, setWrongFlash] = useState<string | null>(null)
  const [roundReady, setRoundReady] = useState(false)

  // initialise round
  useEffect(() => {
    const cur = rounds[round] ?? []
    setLeft(shuffle(cur.map((p) => ({ key: `${p.id}-a`, pairId: p.id, text: p.a, lang: p.aLang, side: 'a' as const }))))
    setRight(shuffle(cur.map((p) => ({ key: `${p.id}-b`, pairId: p.id, text: p.b, lang: p.bLang, side: 'b' as const }))))
    setSelL(null); setSelR(null); setGonePairs(new Set()); setRoundReady(true)
  }, [round, rounds])

  if (!rounds.length) return <div className="grid min-h-screen place-items-center p-8 text-ink-faint">Keine Paare.</div>
  if (done) {
    const total = matched + mistakes
    return (
      <ResultScreen
        scorePct={total ? matched / total : 1} correct={matched} total={total || matched} xp={matched * 6} accentKey={accentKey}
        onRetry={() => { setRound(0); setDone(false); setMistakes(0); setMatched(0) }}
        onDone={() => onFinish(total ? matched / total : 1)}
      />
    )
  }

  const tryMatch = (l: string | null, r: string | null) => {
    if (!l || !r) return
    const lt = left.find((t) => t.key === l)!
    const rt = right.find((t) => t.key === r)!
    if (lt.pairId === rt.pairId) {
      const ng = new Set(gonePairs); ng.add(lt.pairId); setGonePairs(ng)
      setMatched((m) => m + 1); app.award(true, { itemId: `match-${lt.pairId}`, xp: 6 })
      setSelL(null); setSelR(null)
      if (ng.size >= (rounds[round]?.length ?? 0)) {
        setTimeout(() => {
          if (round + 1 >= rounds.length) setDone(true)
          else { setRoundReady(false); setRound(round + 1) }
        }, 350)
      }
    } else {
      setMistakes((m) => m + 1); app.award(false)
      setWrongFlash(`${l}|${r}`)
      setTimeout(() => { setWrongFlash(null); setSelL(null); setSelR(null) }, 500)
    }
  }

  const pick = (side: 'a' | 'b', key: string) => {
    if (side === 'a') { const nl = selL === key ? null : key; setSelL(nl); tryMatch(nl, selR) }
    else { const nr = selR === key ? null : key; setSelR(nr); tryMatch(selL, nr) }
  }

  const tileCls = (t: Tile, sel: boolean) => {
    const gone = gonePairs.has(t.pairId)
    const wrong = wrongFlash?.includes(t.key)
    if (gone) return 'border-teal-300 bg-teal-50 opacity-0 pointer-events-none'
    if (wrong) return 'border-coral-400 bg-orange-50 animate-pulse'
    if (sel) return 'border-teal-500 bg-teal-50 ring-2 ring-teal-200 scale-[1.02]'
    return 'border-ink/10 bg-white'
  }

  return (
    <ModeShell step={round} total={rounds.length} accentKey={accentKey} onClose={onClose}>
      <p className="py-3 text-center text-sm font-semibold text-ink-faint">Tippe zusammengehörende Paare an · Runde {round + 1}/{rounds.length}</p>
      <div className="grid flex-1 grid-cols-2 gap-3 pb-6">
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {roundReady && left.map((t) => (
              <motion.button
                key={t.key} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: gonePairs.has(t.pairId) ? 0 : 1, x: 0 }}
                onClick={() => pick('a', t.key)}
                className={`flex min-h-[64px] items-center justify-center rounded-2xl border-2 p-3 text-center font-bold transition-all ${tileCls(t, selL === t.key)} ${t.lang === 'gr' ? 'greek text-3xl' : 'text-base'}`}
              >
                {t.text}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {roundReady && right.map((t) => (
              <motion.button
                key={t.key} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: gonePairs.has(t.pairId) ? 0 : 1, x: 0 }}
                onClick={() => pick('b', t.key)}
                className={`flex min-h-[64px] items-center justify-center rounded-2xl border-2 p-3 text-center font-semibold transition-all ${tileCls(t, selR === t.key)} ${t.lang === 'gr' ? 'greek text-3xl' : 'text-base'}`}
              >
                {t.text}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ModeShell>
  )
}
