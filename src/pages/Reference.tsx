import { ALPHABET, ALPHABET_HISTORY, DIACRITICS, DIPHTHONGS, EPOCHS, PUNCTUATION, TRANSCRIPTION_RULES } from '../content/alphabet'
import { CITATION_INTRO, VORSOKRATIKER_NUMBERS } from '../content/citations'
import { FRAGMENTS } from '../content/fragments'
import { GRAMMAR } from '../content/grammar'
import { VOCAB } from '../content/vocabulary'
import { getChapter } from '../content/chapters'
import { ScreenHeader } from '../components/ui'
import type { Group } from '../content/types'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="mb-2 px-1 text-sm font-black uppercase tracking-wide text-teal-700">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-white p-4 text-sm leading-relaxed text-ink-soft shadow-card">{children}</div>
}

const GROUP_LABEL: Record<Group, string> = {
  vorsokratiker: 'Frühgriechisch / Vorsokratiker',
  platon: 'Platonisch',
  aristoteles: 'Aristotelisch',
  allgemein: 'Allgemeine Terminologie',
}

export function Reference({ chapterId, onBack }: { chapterId: string; onBack: () => void }) {
  const ch = getChapter(chapterId)
  return (
    <div className="app-shell pb-20">
      <ScreenHeader title={`${ch?.title ?? 'Stoff'} — lesen`} subtitle="Der komplette Stoff aus den Handouts" onBack={onBack} />
      <div className="px-4 pt-2">
        {chapterId === 'alphabet' && (
          <>
            <Section title="Das Alphabet · 24 Buchstaben">
              <div className="overflow-hidden rounded-2xl bg-white shadow-card">
                {ALPHABET.map((l, idx) => (
                  <div key={l.name} className={`flex items-center gap-3 px-4 py-2 ${idx % 2 ? 'bg-parchment/40' : ''}`}>
                    <span className="greek w-16 text-2xl font-bold">{l.upper} {l.lower}</span>
                    <span className="w-24 text-sm font-semibold text-ink">{l.name}</span>
                    <span className="font-mono text-teal-700">{l.translit}</span>
                    {l.note && <span className="ml-auto text-right text-[11px] text-ink-faint">{l.note}</span>}
                  </div>
                ))}
              </div>
            </Section>
            <Section title="Diphthonge">
              <div className="flex flex-wrap gap-2">
                {DIPHTHONGS.map((d) => (
                  <span key={d.gr} className="rounded-xl bg-white px-3 py-2 shadow-card"><b className="greek text-xl">{d.gr}</b> → {d.tr}{d.note && <em className="ml-1 text-coral-500">({d.note})</em>}</span>
                ))}
              </div>
            </Section>
            <Section title="Historische Entwicklung">
              {ALPHABET_HISTORY.map((h) => (
                <InfoCard key={h.era}><b className="text-ink">{h.era}</b> <span className="text-ink-faint">· {h.time}</span><br />{h.text}</InfoCard>
              ))}
            </Section>
            <Section title="Epochen">
              <div className="overflow-hidden rounded-2xl bg-white shadow-card">
                {EPOCHS.map((e, idx) => (
                  <div key={e.name} className={`flex justify-between px-4 py-2.5 text-sm ${idx % 2 ? 'bg-parchment/40' : ''}`}><span className="font-semibold text-ink">{e.name}</span><span className="text-ink-faint">{e.time}</span></div>
                ))}
              </div>
            </Section>
          </>
        )}

        {chapterId === 'transkription' && (
          <Section title="Die 6 Sonderregeln">
            {TRANSCRIPTION_RULES.map((r) => (
              <InfoCard key={r.id}><b className="text-ink">{r.title}</b><br />{r.rule}<br /><span className="mt-1 inline-block rounded-lg bg-parchment-deep px-2 py-1 text-xs text-ink">{r.example}</span></InfoCard>
            ))}
            <InfoCard><b className="text-ink">Richtung merken:</b> griechisch → lateinisch <b>ohne</b> Akzente nötig · lateinisch → griechisch <b>mit</b> Akzenten.</InfoCard>
          </Section>
        )}

        {chapterId === 'diakritika' && (
          <>
            <Section title="Diakritische Zeichen">
              {DIACRITICS.map((d) => (
                <InfoCard key={d.name}><span className="greek text-2xl">{d.sign}</span> <b className="text-ink">{d.name}</b> <span className="text-ink-faint">· {d.kind}</span><br />{d.text}</InfoCard>
              ))}
            </Section>
            <Section title="Interpunktion">
              {PUNCTUATION.map((p) => (
                <InfoCard key={p.name}><span className="text-2xl font-bold">{p.sign}</span> <b className="text-ink">{p.name}</b><br />{p.text}</InfoCard>
              ))}
            </Section>
          </>
        )}

        {chapterId === 'vokabular' && (
          (['vorsokratiker', 'platon', 'aristoteles', 'allgemein'] as Group[]).map((g) => (
            <Section key={g} title={GROUP_LABEL[g]}>
              <div className="overflow-hidden rounded-2xl bg-white shadow-card">
                {VOCAB.filter((v) => v.group === g).map((v, idx) => (
                  <div key={v.id} className={`px-4 py-2 ${idx % 2 ? 'bg-parchment/40' : ''}`}>
                    <div className="flex items-baseline gap-2">
                      <span className="greek text-xl font-bold text-ink">{v.gr}</span>
                      <span className="text-xs text-ink-faint">{v.tr}</span>
                    </div>
                    <div className="text-sm text-ink-soft">{v.de}</div>
                  </div>
                ))}
              </div>
            </Section>
          ))
        )}

        {chapterId === 'zitierweise' && (
          <>
            {(['vorsokratiker', 'platon', 'aristoteles'] as const).map((s) => (
              <Section key={s} title={CITATION_INTRO[s].title}>
                <InfoCard>{CITATION_INTRO[s].text}<br /><span className="mt-2 inline-block rounded-lg bg-teal-50 px-2 py-1 font-mono text-xs text-teal-700">{CITATION_INTRO[s].forms}</span></InfoCard>
              </Section>
            ))}
            <Section title="Philosophen-Nummern (D-K)">
              <div className="flex flex-wrap gap-2">
                {VORSOKRATIKER_NUMBERS.map((n) => (
                  <span key={n.n} className="rounded-xl bg-white px-3 py-2 text-sm shadow-card"><b className="text-teal-700">{n.n}</b> {n.name}</span>
                ))}
              </div>
            </Section>
          </>
        )}

        {chapterId === 'grammatik' && (
          GRAMMAR.map((t) => (
            <Section key={t.id} title={`${t.icon} ${t.title}`}>
              {t.body.map((b, idx) => (
                <InfoCard key={idx}><b className="text-ink">{b.h}</b><br />{b.t}</InfoCard>
              ))}
            </Section>
          ))
        )}

        {chapterId === 'fragmente' && (
          <Section title="Die Fragmente">
            {FRAGMENTS.map((f) => (
              <div key={f.id} className="rounded-2xl bg-white p-4 shadow-card">
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-olive-700">{f.author} · {f.cite}</div>
                <p className="greek text-lg leading-relaxed text-ink">{f.gr}</p>
                <p className="mt-2 border-t border-ink/5 pt-2 text-sm text-ink-soft">{f.de}</p>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}
