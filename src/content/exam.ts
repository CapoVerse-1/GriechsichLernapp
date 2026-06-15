// Mock-exam blueprint — mirrors the "Muster Prüfungsfragen" (68 points total).

export interface GradeBand {
  min: number
  max: number
  grade: string
  emoji: string
}

export const GRADE_SCALE: GradeBand[] = [
  { min: 61, max: 68, grade: 'Sehr gut', emoji: '🏆' },
  { min: 53, max: 60, grade: 'Gut', emoji: '🥈' },
  { min: 45, max: 52, grade: 'Befriedigend', emoji: '🥉' },
  { min: 37, max: 44, grade: 'Genügend', emoji: '✅' },
  { min: 0, max: 36, grade: 'Nicht genügend', emoji: '📚' },
]

export function gradeFor(points: number): GradeBand {
  return GRADE_SCALE.find((b) => points >= b.min && points <= b.max) ?? GRADE_SCALE[GRADE_SCALE.length - 1]
}

export const TOTAL_POINTS = 68

export type ExamSectionKind =
  | 'type-g2l' // Q1: transcribe greek -> latin
  | 'type-l2g' // Q1a: write latin -> greek
  | 'vocab' // Q3/Q5/Q7: translate terms
  | 'mc' // Q2/Q4/Q6/Q8: knowledge MC
  | 'fragment' // Q10: translate a fragment (self-graded)
  | 'compare' // Q9: einai/on/ousia (self-graded)

export interface ExamSectionSpec {
  id: string
  no: string
  kind: ExamSectionKind
  title: string
  points: number
  count: number // number of items
  group?: 'vorsokratiker' | 'platon' | 'aristoteles'
  mcChapter?: string
}

export const EXAM_BLUEPRINT: ExamSectionSpec[] = [
  { id: 'q1', no: '1', kind: 'type-g2l', title: 'Transkribieren Sie folgende Wörter mit dem lateinischen Alphabet', points: 10, count: 5 },
  { id: 'q1a', no: '1a', kind: 'type-l2g', title: 'Schreiben Sie folgende Ausdrücke mit griechischen Buchstaben', points: 10, count: 5 },
  { id: 'q2', no: '2', kind: 'mc', title: 'Wie werden die Fragmente der Vorsokratiker zitiert?', points: 4, count: 2, mcChapter: 'zitierweise' },
  { id: 'q3', no: '3', kind: 'vocab', title: 'Übersetzen Sie folgende frühgriechische Termini ins Deutsche', points: 8, count: 4, group: 'vorsokratiker' },
  { id: 'q4', no: '4', kind: 'mc', title: 'Worauf verweist ein Zitat wie „Plat., Apol. 23 a"?', points: 4, count: 2, mcChapter: 'zitierweise' },
  { id: 'q5', no: '5', kind: 'vocab', title: 'Geben Sie deutsche Wörter für folgende platonische Begriffe an', points: 8, count: 4, group: 'platon' },
  { id: 'q6', no: '6', kind: 'mc', title: 'Nach welcher Ausgabe wird Aristoteles zitiert?', points: 4, count: 2, mcChapter: 'zitierweise' },
  { id: 'q7', no: '7', kind: 'vocab', title: 'Was können folgende aristotelische Ausdrücke bezeichnen?', points: 8, count: 4, group: 'aristoteles' },
  { id: 'q8', no: '8', kind: 'mc', title: 'Was besagt die grammatische Kategorie „Medium"?', points: 4, count: 2, mcChapter: 'grammatik' },
  { id: 'q9', no: '9', kind: 'compare', title: 'Erklären Sie den Unterschied der Formen εἶναι, ὄν, οὐσία', points: 4, count: 1 },
  { id: 'q10', no: '10', kind: 'fragment', title: 'Versuchen Sie, folgendes Fragment zu übersetzen', points: 4, count: 1 },
]
