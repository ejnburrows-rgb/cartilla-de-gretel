# Lesson 19 (Gg) wide-screen design — swarm lane worklog

Date: 2026-10-18
Branch: `muse/lesson-19-wide-20261018` (from main `c99ab4e`)
Scope: Lesson 19 "La consonante Gg" only — printed workbook pages 67–70
(confirmed in `src/content/lesson-meta.ts` n:19 → pages [67, 70] and
`src/data/page-layouts.json`).

## What was built

The owner-approved Lesson 3 wide-screen design language, applied to all four
Lesson 19 pages, additively and lesson-scoped (`.lc-lesson-19`):

- Classic cream paper page on a deeper cream surround; slimmer teal spine
  (sidebar → 4.5%); teal diamond page marker kept.
- Stronger teal glow on every boxed work surface (syllable-match tiles and
  target syllable, vocabulary tiles, syllable chips, fill-in-blank word
  boxes/choices, tracing/drawing/sentence-writing surfaces).
- Garden-palette instruction letters (leaf, rose, sun, sky, lavender),
  rendered by the new `Lesson19GardenText` component — letter colors only,
  wording unchanged.
- Teal accent for the lesson (was the #2A9D8F catalog accent) so tracing,
  fill-in and marks match the approved palette.
- Page 69's empty sight-word box (source page has no sight word) is skipped
  instead of rendering a blank frame.
- Shared pencil mechanics untouched: `PencilConnector`,
  `WorkbookPencilMark`, `SyllableWordCircle` used as-is. No rope/lasso.
- No corner leaves added (optional per owner direction).

## Page inventory (from page-layouts.json — the lesson has no
## picture-grid or connect pages)

- Page 67 — writing/tracing Gg + open drawing
- Page 68 — syllable circling ga go gu (`syllable-match` regions)
- Page 69 — letter/reading page Gg + syllables + vocabulary + sentences
- Page 70 — complete-the-word + sentence writing

Because the source pages contain no picture grids, "boxed pictures",
"pictures move on page load" and "connect page" rules have no Lesson 19
target; the box/glow treatment was applied to the syllable and word tiles
instead. Owner artwork untouched (no art files changed).

## Files changed

- `src/components/cartilla/lesson19/Lesson19Text.tsx` (new, lesson-scoped)
- `src/components/cartilla/FaithfulPageRenderer.tsx` (additive lesson-19
  conditionals: garden instruction text, teal accent, skip empty sight word)
- `src/routes/cartilla/-leccion-view.tsx` (additive `lc-lesson-19` class)
- `src/styles/lesson-fit.css` (appended `.lc-lesson-19` section only)
- `docs/proofs/lesson-19-2026-10-18/` (README + capture script)
- `docs/worklogs/lesson-19-WORKLOG.md` (this file)

## Verification

- `tsc --noEmit`: pass.
- Focused vitest (`src/components/cartilla`, `src/data/__tests__`): pass.
- Real browser (local dev server, headless Chromium) screenshots of every
  page at wide desktop 1366×900 and horizontal tablet 1280×800:
  `docs/proofs/lesson-19-2026-10-18/`. All pages fit one screen, no
  clipping, no nested scroll-trap.
- Interaction proof: tap on "gato" (page 68) → wooden pencil draws the
  green circle, circle stays
  (`desktop-1366x900-p68-pencil-drawing.png`,
  `desktop-1366x900-p68-pencil-done.png`).
- Completion gating still works: on an unfinished page 67 the Next control
  is locked before the capture bypass.
- Phone 390×844 sanity shots confirm no breakage (page grows and scrolls
  per the existing narrow-screen rule; phone redesign is a separate lane).

## Not done / out of scope

- Vertical phone redesign (separate later job per swarm brief).
- No picture/connect pages exist in Lesson 19, so those layout rules are
  not applicable here.
- No audio/voice work (other lanes own it).
