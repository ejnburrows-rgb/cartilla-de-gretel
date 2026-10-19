# Lesson 16 (Vv) wide-screen design — swarm lane worklog

Date: 2026-10-18
Branch: `muse/lesson-16-wide-20261018` (from main `c99ab4e`)
Scope: Lesson 16 "La consonante Vv" only — printed workbook pages 55–58
(confirmed in `src/content/lesson-meta.ts` n:16 → pages [55, 58] and
`src/data/page-layouts.json`).

## What was built

The owner-approved Lesson 3 wide-screen design language, applied to all four
Lesson 16 pages, additively and lesson-scoped (`.lc-lesson-16`), following
the Lesson 21 template (`swarm/lesson-21-wide-20261018`, PR #927):

- Classic cream paper page on a deeper cream surround; slimmer teal spine
  (sidebar → 4.5%, min 24px); teal page marker.
- Stronger teal glow on every boxed work surface (syllable word tiles,
  syllable group cards, vocabulary tiles, syllable chips, fill-in-blank
  word boxes, blanks and choices).
- Garden-palette instruction letters (leaf, rose, sun, sky, lavender),
  rendered by the new `Lesson16GardenText` component — letter colors only,
  wording unchanged.
- Teal accent for the lesson (was the blue catalog accent #356fbd) so
  tracing, fill-in and marks match the approved palette.
- Page 57's empty sight-word box (source page has no sight word — verified
  empty `sentence-line` text in page-layouts.json) is skipped instead of
  rendering a blank frame.
- Shared pencil mechanics untouched: `PencilConnector`,
  `WorkbookPencilMark`, `SyllableWordCircle` used as-is. No rope/lasso.
- No corner leaves added (optional per owner direction).

## Page inventory (from page-layouts.json — no picture-grid pages)

- Page 55 — writing/tracing V v + open drawing (writing-line ×4, draw-box)
- Page 56 — syllable circling va ve vi vo vu (syllable-match ×5)
- Page 57 — letter/reading page Vv + syllables + vocabulary + sentences
  (title, syllable-bubble ×2, vocab-grid, sentence-line [empty], reading-sentences)
- Page 58 — complete-the-word + sentence writing (fill-in-blank, writing-response)

Because the source pages contain no picture grids, the "boxed pictures /
pictures move on page load" rules have no Lesson 16 target; the box/glow
treatment was applied to the syllable, word and fill-in tiles instead.
Owner artwork untouched (no art files changed).

## Files changed

- `src/components/cartilla/lesson16/Lesson16Text.tsx` (new, lesson-scoped)
- `src/components/cartilla/FaithfulPageRenderer.tsx` (additive lesson-16
  conditionals: garden instruction text, teal accent, skip empty sight word)
- `src/routes/cartilla/-leccion-view.tsx` (additive `lc-lesson-16` class)
- `src/styles/lesson-fit.css` (appended `.lc-lesson-16` section only)
- `docs/proofs/lesson-16-2026-10-18/` (README + capture script)
- `docs/worklogs/lesson-16-WORKLOG.md` (this file)

## Verification

- `tsc --noEmit`: pass.
- Real browser (local dev server, headless Chromium) screenshots of every
  page at wide desktop 1440×900 and horizontal tablet 1280×800:
  `docs/proofs/lesson-16-2026-10-18/`. All pages fit one screen, no
  clipping, no nested scroll-trap.
- Interaction proof: tap on a syllable word (page 56) → wooden pencil flies
  in with the subtle close-up zoom, draws the green circle, circle stays
  (`desktop-1440x900-p56-pencil-drawing.png`,
  `desktop-1440x900-p56-pencil-done.png`).
- Completion gating still works: on an unfinished page 55 the Next control
  is locked before the capture bypass.

## Not done / out of scope

- Vertical phone redesign (separate later job per swarm brief).
- No picture/connect pages exist in Lesson 16, so those layout rules are
  not applicable here.
- No audio/voice work (other lanes own it).
