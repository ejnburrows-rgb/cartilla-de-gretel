# Lesson 21 (Jj) wide-screen design — swarm lane worklog

Date: 2026-10-18
Branch: `swarm/lesson-21-wide-20261018` (from main `c99ab4e`)
Scope: Lesson 21 "La consonante Jj" only — printed workbook pages 75–78
(confirmed in `src/content/lesson-meta.ts` n:21 → pages [75, 78] and
`src/data/page-layouts.json` / `src/data/workbook-archetypes.ts`).

## What was built

The owner-approved Lesson 3 wide-screen design language, applied to all four
Lesson 21 pages, additively and lesson-scoped (`.lc-lesson-21`):

- Classic cream paper page on a deeper cream surround; slimmer teal spine
  (sidebar 7% → 4.5%); teal diamond page marker kept.
- Stronger teal glow on every boxed work surface (syllable word tiles,
  syllable group cards, vocabulary tiles, syllable chips, fill-in-blank
  word boxes and choices, tracing/drawing/sentence-writing surfaces).
- Garden-palette instruction letters (leaf, rose, sun, sky, lavender),
  rendered by the new `Lesson21GardenText` component — letter colors only,
  wording unchanged.
- Teal accent for the lesson (was the purple catalog accent) so tracing,
  fill-in and marks match the approved palette.
- Page 77's empty sight-word box (source page has no sight word) is skipped
  instead of rendering a blank frame.
- Shared pencil mechanics untouched: `PencilConnector`,
  `WorkbookPencilMark`, `SyllableWordCircle` used as-is. No rope/lasso.
- No corner leaves added (optional per owner direction).

## Page inventory (from page-layouts.json — the lesson has no
## picture-grid or connect pages)

- Page 75 — writing/tracing J j + open drawing (archetype 5)
- Page 76 — syllable circling ja je ji jo ju (archetype 6)
- Page 77 — letter/reading page Jj + syllables + vocabulary + sentences
  (archetype 7)
- Page 78 — complete-the-word + sentence writing (archetype 8)

Because the source pages contain no picture grids, "boxed pictures",
"pictures move on page load", "connect page" and "circle page 4×2" rules
have no Lesson 21 target; the box/glow treatment was applied to the word
and syllable tiles instead. Owner artwork untouched (no art files changed).

## Files changed

- `src/components/cartilla/lesson21/Lesson21Text.tsx` (new, lesson-scoped)
- `src/components/cartilla/FaithfulPageRenderer.tsx` (additive lesson-21
  conditionals: garden instruction text, teal accent, skip empty sight word)
- `src/routes/cartilla/-leccion-view.tsx` (additive `lc-lesson-21` class)
- `src/styles/lesson-fit.css` (appended `.lc-lesson-21` section only)

## Verification

- `tsc --noEmit`: pass.
- Focused vitest (`src/components/cartilla`, `src/data/__tests__`):
  27 files / 255 tests pass.
- Real browser (local dev server, headless Chromium) screenshots of every
  page at wide desktop 1366×900 and horizontal tablet 1280×800:
  `docs/proofs/lesson-21-2026-10-18/`. All pages fit one screen, no
  clipping, no nested scroll-trap.
- Interaction proof: tap on "jaba" (page 76) → wooden pencil flies in from
  the right edge with the subtle close-up zoom, draws the green circle,
  circle stays (`desktop-1366x900-p76-pencil-drawing.png`,
  `desktop-1366x900-p76-pencil-done.png`).
- Completion gating still works: on an unfinished page 75 the Next control
  is locked (2 locked nav controls observed) before the capture bypass.
- Phone 390×844 sanity shots confirm no breakage (page grows and scrolls
  per the existing narrow-screen rule; phone redesign is a separate lane).

## Not done / out of scope

- Vertical phone redesign (separate later job per swarm brief).
- No picture/connect pages exist in Lesson 21, so those layout rules are
  not applicable here.
- No audio/voice work (other lanes own it).
