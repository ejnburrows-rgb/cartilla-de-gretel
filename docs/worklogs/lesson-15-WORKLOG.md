# Lesson 15 (Bb) wide-screen design — swarm lane worklog

Date: 2026-10-18
Branch: `muse/lesson-15-wide-20261018` (from main `c99ab4e`)
Scope: Lesson 15 "La consonante Bb" only — printed workbook pages 51–54
(confirmed in `src/content/lesson-meta.ts` n:15 → pages [51, 54]).

## What was built

The owner-approved Lesson 3 wide-screen design language, applied to all four
Lesson 15 pages, additively and lesson-scoped (`.lc-lesson-15`), following
the Lesson 21 template (PR #927) exactly:

- Classic cream paper page on a deeper cream surround; slimmer teal spine
  (sidebar → 4.5%); teal page-number marker.
- Stronger teal glow on every boxed work surface (syllable word tiles,
  syllable group cards, vocabulary tiles, fill-in-blank word boxes and
  choices, tracing/drawing surfaces).
- Garden-palette instruction letters (leaf, rose, sun, sky, lavender),
  rendered by the new `Lesson15GardenText` component — letter colors only,
  wording unchanged.
- Teal accent for the lesson (was the dark-teal `#264653` catalog accent) so
  tracing, fill-in and marks match the approved palette.
- Shared pencil mechanics untouched: `PencilConnector`,
  `WorkbookPencilMark`, `SyllableWordCircle` used as-is. No rope/lasso.
- No corner leaves added (optional per owner direction).

## Page inventory

- Page 51 — writing/tracing B b + open drawing (archetype 5)
- Page 52 — syllable circling ba be bi bo bu (archetype 6)
- Page 53 — letter/reading page Bb + syllables + vocabulary + sentences
  (archetype 7)
- Page 54 — complete-the-word + sentence writing (archetype 8)

Because the source pages contain no picture grids, "boxed pictures",
"pictures move on page load", "connect page" and "circle page 4×2" rules
have no Lesson 15 target; the box/glow treatment was applied to the word
and syllable tiles instead. Owner artwork untouched (no art files changed).

## Files changed

- `src/components/cartilla/lesson15/Lesson15Text.tsx` (new, lesson-scoped)
- `src/components/cartilla/FaithfulPageRenderer.tsx` (additive lesson-15
  conditionals: garden instruction text, teal accent)
- `src/routes/cartilla/-leccion-view.tsx` (additive `lc-lesson-15` class)
- `src/styles/lesson-fit.css` (appended `.lc-lesson-15` section only)
- `docs/proofs/lesson-15-2026-10-18/` (proof README + capture script)
- `docs/worklogs/lesson-15-WORKLOG.md` (this file)

## Verification

- `tsc --noEmit`: pass.
- Focused vitest (`src/components/cartilla`, `src/data/__tests__`):
  27 files / 255 tests pass (same scope as the Lesson 21 lane).
- Real browser (local dev server, headless Chromium) screenshots of every
  page at wide desktop 1366×900 and horizontal tablet 1280×800:
  `docs/proofs/lesson-15-2026-10-18/`. All pages fit one screen, no
  clipping, no nested scroll-trap.
- Interaction proof: tap on a page-52 syllable word → wooden pencil flies in
  from the right edge with the subtle close-up zoom, draws the green circle,
  circle stays (`desktop-1366x900-p52-pencil-drawing.png`,
  `desktop-1366x900-p52-pencil-done.png`).
- Completion gating still works: on an unfinished page 51 the Next control
  is locked (2 locked nav controls observed) before the capture bypass.

## Not done / out of scope

- Vertical phone redesign (separate later job per swarm brief).
- No picture/connect pages exist in Lesson 15, so those layout rules are
  not applicable here.
