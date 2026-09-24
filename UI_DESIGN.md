# Graecia UI — living design notes

Status: **approved for production** (24 September 2026). This document records the reviewed UI direction and release scope. Update it whenever a screen or shared UI rule changes.

## Product direction

Graecia should feel like a focused study companion for a university course: clear, warm, and encouraging without looking like a game screen at every step. Keep the existing phone-first layout, navigation, screen order, learning content, and recognizable Greek type and deep teal identity.

The interface has two visual speeds. Reading and answering are quiet and highly legible. Progress, achievements, and personal messages supply brief moments of warmth. Color indicates meaning; decoration does not compete with the question or reference text.

## What remains structurally stable

- The centered phone-width shell stays at 460 px maximum.
- Home still moves from profile/header to level, summary, exam, and chapters.
- Chapter still moves from overview to progress, reading, exercises, and completion.
- Exercises still use the same questions, answer actions, progress, feedback, and result flows.
- Statistics, leaderboard, reference material, and the Hannah-only Kilian message retain their current behavior.

## Visual system

| Element | Rule |
| --- | --- |
| Canvas | Warm off-white `#f8f7f2`; no decorative page gradient. |
| Primary surface | White, thin `#e5e9e1` outline, low shadow. |
| Primary color | Deep teal `#1b493b` for major panels; `#286e58` for controls and progress. |
| Supporting colors | Olive for some course categories, amber for caution or time, coral for incorrect answers or destructive actions. Text variants are dark enough to read on light backgrounds. |
| Display type | GFS Didot for page and section headings and selected Greek identity moments. |
| Working type | Inter for actions, descriptions, labels, scores, and long explanations. Gentium Plus remains the Greek reading face. |
| Type hierarchy | Page title 20–24 px, section title 20 px, body 14–16 px, labels 10–12 px with limited tracking. Avoid 900 weight. |
| Shape | 15 px ordinary cards/controls; 21 px feature panels. Chips remain fully rounded. |
| Depth | Borders and spacing define groups; shadows only lift interactive surfaces slightly. |
| Motion | Short entry and answer feedback motion remain. Reduced-motion preferences suppress animation. |

## Shared component rules

- **Headers:** back control on the left, one clear serif title, supporting subtitle, optional quiet action on the right.
- **Primary action:** solid teal or ink, full width at the bottom of a task; 44 px or taller, with a visible keyboard focus ring. Fixed exercise actions sit on an opaque, app-width footer so scrolling answer choices never show through the controls.
- **Cards:** use a single quiet border and consistent padding. Hover can strengthen the teal border, while selected answer states use a tinted fill and a stronger border.
- **Progress:** thin solid-colored bars with numeric context nearby. Use tabular digits for scores, time, XP, and rankings.
- **Icons:** line icons lead navigation and utilities. Course-specific symbols and achievement emoji can remain, but should be small and secondary to labels.
- **Feedback:** one compact bottom panel, with clear success/error text and an obvious next action. Color is paired with words and marks.
- **Empty and loading states:** keep the same hierarchy and palette as the main screens; no large celebratory art.
- **Connection errors:** explain the problem in user language, offer a retry action, and keep technical details behind an expandable control.
- **Screen changes:** return the document to the top when opening another app view, so a long reading page cannot leave the next screen halfway down.

## Screen inventory and current decisions

| Screen | Design decision |
| --- | --- |
| Profile selection and creation | Smaller teal Greek mark, prominent title, direct profile list, quiet create action, labeled input, and explicit avatar selection state. The avatar grid changes from six to four columns below 360 px for larger touch targets. |
| Home | Keep placements. Level becomes a solid deep teal panel; summary figures become simple bordered tiles. Exam uses a restrained document icon and dark panel. Chapter rows use smaller tinted Greek marks and clear status labels. Footer copy is short and avoids exposing storage details. |
| Chapter overview | Keep banner, progress, reading link, exercise grid, and completion action. Banner typography and unit chips are calmer; exercise icons stay recognizable but no longer dominate each card. The completion action keeps its label and `+50 XP` on one readable row. |
| Reference | Long content uses editorial section headings, thin dividers, and table-like rows for the alphabet and vocabulary. Greek text keeps generous line height. Grammar headings use text without decorative emoji. |
| Flashcards and recall | Preserve flip/reveal interactions. The back face is solid teal, and results use a quiet score display instead of a large emoji. |
| Matching, typing, multiple choice, fragments, and citation analysis | Preserve their distinct interaction patterns. Shared progress and feedback are quieter. Answer choices favor simple borders, readable text, and strong selected/error states. |
| Blitz round | Preserve the countdown and scoring. The ready state presents the 60-second challenge plainly; series feedback is text-based. |
| Mock exam | Preserve all sections, point scoring, self-assessment, and results. Use the same task header and result hierarchy as exercises. |
| Statistics | Keep level, figures, achievements, exam history, and actions. Figures are plain numeric tiles; earned achievement icons remain a small reward. |
| Leaderboard | Keep metric tabs, podium, and full ranked list. All four metric tabs fit on one row at 320 px and wider. Numeric ranks and muted podium blocks replace medal-heavy visuals. |
| Overlays | Achievement toast and Hannah's Kilian message use the shared typography and restrained teal surfaces. Message cadence, target account, wording, and reply buttons are unchanged. |
| Loading and connection error | Static Greek mark and calm loading copy; the error screen offers retry and expandable technical details. |

## Exercise detail audit

| Mode | Prompt area | Answer area and actions | Browser review |
| --- | --- | --- | --- |
| Karteikarten | One large, quiet reading card; deep teal back face. | Flip remains the central action. Repeat and known buttons use one outlined and one filled treatment. | Front inspected at 390 px. |
| Selbsttest | Centered recall card with space to think. | Revealed answer is a pale teal panel; self-assessment actions stay in the same bottom position. | Hidden and revealed states inspected at 390 px. |
| Zuordnen | Short instruction above two equal columns. | Matched, selected, and incorrect tiles retain distinct states with thinner borders. | Initial pair grid inspected at 390 px. |
| Tipp-Trainer | Direction chip, Greek or Latin prompt, then answer field. | Helper keys use a consistent outlined style. Spacing and key size compress below 360 px to keep the bottom action clear. | Latin-input and Greek-key layouts inspected; 320 px crowding prompted the spacing change. |
| Multiple Choice | Serif question, compact answer-type chip. | Full-width answer rows use a thin border, clear selection state, and fixed check action. | Initial question inspected at 390 px. |
| Zitat-Analysator | Citation tokens sit together in one white reading surface. | Meaning options remain separate, with lighter borders and strong selection feedback. | Initial analysis inspected at 390 px. |
| Übersetzungs-Builder | Greek source keeps generous line spacing. | Translation tray and word bank remain in their original order; the reset control now has an accessible name. The footer covers only the app shell, and scrolling reveals the complete word bank above it. | Initial long-fragment layout inspected at 390 and 320 px, including the bottom of the page. |
| Blitz-Runde | The ready state presents the 60-second task in plain language. The live prompt is centered and prominent. | Score and countdown remain visible; answer rows match the rest of the exercise system. | Ready and active round inspected at 390 px. |
| Klausur-Simulation | Sticky progress, section, points, and Greek prompt remain in place. | Typing keys, multiple-choice rows, self-grading controls, and result actions follow the shared control styles. | Typing state inspected at 390 and 320 px; the section badge was kept on one line. |

The Hannah-only message was visually inspected with a **locally accelerated timer** so its dialog could be reviewed immediately. The production 3.5-minute interval and account filter were not changed.

## Accessibility and responsive checks

- All icon-only controls need an accessible name. Home ranking and statistics controls now have explicit labels.
- The keyboard focus ring is visible on buttons and text fields. Selected states are still distinguished by shape, text, and border in addition to color.
- Verify every screen at 390 × 844 and at a narrow 320 px width. Long Greek words, answer choices, and navigation labels must wrap without clipping.
- Honor `prefers-reduced-motion` for transitions and animations.
- Treat the fixed exercise action area as a safe-area surface so it never covers the active question or explanation.

## Review and release checklist

- [x] Review all route types and learning modes in source.
- [x] Apply shared palette, typography, radius, shadow, focus, and motion rules.
- [x] Update profile, home, chapter, reference, statistics, leaderboard, feedback, results, exam, and overlays.
- [x] `npm run build` passes.
- [x] Visual review at 390 × 844 for profile, home, chapter, multiple choice, reference, statistics, and leaderboard.
- [x] Visual review of the main state for each exercise mode, plus the active Blitz round, revealed recall answer, and Hannah's message dialog.
- [x] Review 320 px home, chapter, reference, statistics, leaderboard, and exam; correct the exam badge and narrow alphabet rows. No horizontal page overflow in the checked views.
- [x] Tighten the Greek helper-key layout below 360 px after inspecting the cramped 320 px typing screen.
- [x] Replace the rotating loading mark and technical Home footer copy; inspect the missing-configuration error screen at 390 px.
- [x] Inspect profile creation at 390 and 320 px; enlarge narrow-phone avatar targets and keep the primary action visible.
- [x] Inspect the complete Home, chapter, statistics, and long reference pages. Shorten wrapping footer and completion copy; verify that all content remains readable through the bottom of each page.
- [x] Verify navigation from a scrolled Home and chapter page returns the next view to the top. The alphabet, vocabulary, citation, and fragment reading pages have no horizontal overflow at the reviewed width.
- [x] Review the leaderboard at 390 and 320 px; keep all four metric choices fully visible with no horizontal overflow.
- [x] Inspect flashcards, matching, multiple choice, self-test, citation analysis, and fragment building at 320 px. Give fixed answer actions an opaque app-width footer and verify that the fragment word bank remains fully reachable by scrolling.
- [x] Prepare local working captures of all seven chapter overviews and all seven complete reading pages at 390 px. These remain internal until the first design-review set is approved.
- [x] Prepare local working captures of every distinct exercise mode in its initial state, plus flipped flashcards, revealed self-test answers, selected choices, the active Blitz round, and the exam typing screen at 390 and 320 px. Fred's XP remained unchanged during capture.
- [x] User reviewed the initial screenshots and explicitly requested the production push on 24 September 2026.
- [x] Assemble the complete screenshot set after design approval in `../ui-previews/full-review/GALLERY.md`.
- [x] Production push was explicitly authorized before deployment.

Representative local screenshots are stored outside the app repository in `../ui-previews/` so generated images do not become production assets. The complete gallery is in `../ui-previews/full-review/`. Later exam question types and results, exercise feedback/results, the achievement toast, and loading were captured using temporary local preview states that were removed after capture. No answer or exam result was submitted to the database during this review.

### Full screenshot set after design approval

Capture at 390 × 844, with narrow-width evidence where a screen has different behavior:

1. Profile picker and create-profile form; Home top and chapter list; statistics and leaderboard.
2. All seven chapter overviews and all seven reading pages, including a lower-page content sample for long references.
3. Each exercise mode in its initial state; flashcard back, recall reveal, selected answer, feedback, and result examples.
4. Blitz ready and active states; the exam typing, multiple-choice, self-assessment, and result states.
5. Hannah's message dialog and the achievement toast; loading and connection error states using local simulation.

The first design-review images are `01-login.png` through `07-reference.png` in the local preview folder. Mode-specific QA captures use the `review-` prefix. The complete set covers every main screen and distinct exercise mode, all seven chapter overviews and reading pages, key answer and result states, all leaderboard tabs, Hannah's message, the achievement toast, loading, and connection error. Open `../ui-previews/full-review/GALLERY.md` for the index.
