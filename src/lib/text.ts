// Answer normalisation helpers for the typing trainer & vocab checks.

// Strip accents/macrons for a lenient compare, keep base latin/greek letters.
export function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ͂̓̈́ͅ]/g, '')
}

export function normLatin(s: string): string {
  return stripDiacritics(s.trim().toLowerCase())
    .replace(/[·.,;:!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Greek: drop accents/breathings, final sigma → sigma, lowercase.
export function normGreek(s: string): string {
  return stripDiacritics(s.trim().toLowerCase())
    .replace(/ς/g, 'σ')
    .replace(/[·.,;:!?]/g, '')
    .replace(/\s+/g, '')
    .trim()
}

/** Lenient check used by the type trainer. */
export function answerMatches(input: string, answer: string, alts: string[] = [], direction?: string): boolean {
  const isGreek = direction === 'lat2gr' || /[Ͱ-Ͽ]/.test(answer)
  const norm = isGreek ? normGreek : normLatin
  const target = [answer, ...alts].map(norm)
  return target.includes(norm(input))
}

/** For German meaning checks: accept if the input matches any comma/slash-separated sense. */
export function germanMatches(input: string, answer: string): boolean {
  const i = normLatin(input)
  if (!i) return false
  const senses = answer
    .split(/[,/;]|\bund\b|\boder\b/)
    .map((x) => normLatin(x.replace(/[„"”()]/g, '')))
    .filter(Boolean)
  return senses.some((sense) => sense === i || (i.length >= 4 && (sense.includes(i) || i.includes(sense))))
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}
