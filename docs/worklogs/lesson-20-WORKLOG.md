# Lesson 20 (Ff) wide-screen design — muse swarm lane worklog

Date: 2026-10-18
Branch: `muse/lesson-20-wide-20261018` (from main `c99ab4e`)
Scope: Lesson 20 "La consonante Ff" only — printed workbook pages 71–74
(confirmed in `src/content/lesson-meta.ts` n:20 → pages [71, 74] and
`src/data/page-layouts.json` / `src/data/workbook-archetypes.ts`).

## What was built

The owner-approved Lesson 3 wide-screen design language, applied to all four
Lesson 20 pages, additively and lesson-scoped (`.lc-lesson-20`). Pattern
copied from the finished Lesson 21 wide-screen lane
(`origin/swarm/lesson-21-wide-20261018`, PR #927) — identical page
structure, only the letter/syllable content differs:

- Classic cream paper page on a deeper cream surround; slimmer teal spine
  (sidebar 7% → 4.5%); teal page marker.
- Stronger teal glow on every boxed work surface (syllable word tiles,
  syllable group cards, vocabulary tiles, syllable chips, fill-in-blank
  word boxes and choices, tracing/drawing/sentence-writing surfaces).
- Garden-palette instruction letters (leaf, rose, sun, sky, lavender),
  rendered by the new `Lesson20GardenText` component — letter colors only,
  wording unchanged.
- Teal accent for the lesson (was the dark-teal catalog accent #264653) so
  tracing, fill-in and marks match the approved palette.
- Empty sight-word box skipped instead of rendering a blank frame (page 73
  has the sight word "hay"; the guard is kept for pattern consistency with
  Lesson 21).
- Shared pencil mechanics untouched: `PencilConnector`,
  `WorkbookPencilMark`, `SyllableWordCircle` used as-is. No rope/lasso.
- No corner leaves added (optional per owner direction).

## Page inventory (from page-layouts.json)

- Page 71 — writing/tracing F f + open drawing ("Haz un dibujo que
  represente una palabra") — archetype 5
- Page 72 — syllable circling fa fe fi fo fu (fama/familia/faro,
  famoso/fatiga/afanado, …) — archetype 6
- Page 73 — letter/reading page Ff + syllables + vocabulary (familia · fino ·
  fila · Fígaro · fusta · falso · fama · fumiga · fortuna · famoso · teléfono ·
  Ofelia · foto · feo · foca) + sight word "hay" + reading sentences —
  archetype 7
- Page 74 — complete-the-word (fama/fila/teléfono/foca/fecha) + sentence
  writing — archetype 8

Because the source pages contain no picture grids, "boxed pictures",
"pictures move on page load" and "connect page" rules have no Lesson 20
target; the box/glow treatment was applied to the word and syllable tiles
instead. Owner artwork untouched (no art files changed).

## Files changed

- `src/components/cartilla/lesson20/Lesson20Text.tsx` (new, lesson-scoped)
- `src/components/cartilla/FaithfulPageRenderer.tsx` (additive lesson-20
  conditionals: garden instruction text, teal accent, skip empty sight word)
- `src/routes/cartilla/-leccion-view.tsx` (additive `lc-lesson-20` class)
- `src/styles/lesson-fit.css` (appended `.lc-lesson-20` section only)

## Verification

- `tsc --noEmit`: pass.
- Focused vitest (`src/components/cartilla`, `src/data/__tests__`):
  27 files / 255 tests pass.
- Real browser (local dev server, headless Chromium) screenshots of every
  page at wide desktop 1440×900: `docs/proofs/lesson-20-2026-10-18/`. All
  pages fit one screen, no clipping, no nested scroll-trap.
- Interaction proof: tap on a correct word (page 72) → wooden pencil draws
  the green circle; circle stays.
- Completion gating still works: on an unfinished page the Next control is
  locked before the capture bypass.

## Not done / out of scope

- Vertical phone redesign (separate later job per swarm brief).
- No audio/voice work (other lanes own it; AGENTS.md audio directives
  respected — nothing touched).
