export interface ModeProps {
  chapterId: string
  accentKey: string
  onClose: () => void
  onFinish: (scorePct: number) => void
}
