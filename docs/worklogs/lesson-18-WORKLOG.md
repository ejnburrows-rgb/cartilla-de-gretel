# Lesson 18 (rr) wide-screen design — swarm lane worklog

Date: 2026-10-18
Branch: `muse/lesson-18-wide-20261018` (from main `c99ab4e`)
Scope: Lesson 18 "La consonante rr" only — printed workbook pages 63–66
(confirmed in `src/content/lesson-meta.ts` n:18 → pages [63, 66],
syllables rra rre rri rro rru, keywords burro/carrusel/torre/barril/Tierra).

## What was built

The owner-approved Lesson 3 wide-screen design language, applied to all four
Lesson 18 pages, additively and lesson-scoped (`.lc-lesson-18`):

- Classic cream paper page on a deeper cream surround; slimmer teal spine
  (sidebar → 4.5%); teal page-number marker.
- Stronger teal glow on every boxed work surface (syllable-match word tiles,
  syllable group cards, fill-in-blank word boxes and choices, tracing/drawing/
  sentence-writing surfaces).
- Garden-palette instruction letters (leaf, rose, sun, sky, lavender),
  rendered by the new `Lesson18GardenText` component — letter colors only,
  wording unchanged. Syllable chips on the reading page also rotate the
  garden palette.
- Teal accent for the lesson (was the orange catalog accent `#F4A261`) so
  tracing, fill-in and marks match the approved palette.
- Page 65's empty sight-word box (source page has no sight word) is skipped
  instead of rendering a blank frame — same treatment as Lesson 21's page 77.
- Shared pencil mechanics untouched: `PencilConnector`,
  `WorkbookPencilMark`, `SyllableWordCircle` used as-is. No rope/lasso.
- No corner leaves added (optional per owner direction).

## Page inventory (from page-layouts.json — the lesson has no
## picture-grid or connect pages)

- Page 63 — writing/tracing rr + open drawing (archetype 5)
- Page 64 — syllable circling rra rre rri rro rru (archetype 6)
- Page 65 — letter/reading page rr + syllables + vocabulary + sentences
  (archetype 7)
- Page 66 — complete-the-word + sentence writing (archetype 8)

Because the source pages contain no picture grids, the "boxed pictures" and
"pictures move on page load" rules apply to the lesson's interactive tiles
and work surfaces instead; the always-moving rule for illustrations is
covered by the motion lanes (PR #921 stack) on pages that carry art.

## Files changed

- `src/components/cartilla/lesson18/Lesson18Text.tsx` (new) — garden-palette
  instruction letters component.
- `src/components/cartilla/FaithfulPageRenderer.tsx` — 3 conditionals, all
  strictly gated on `lessonNumber === 18` (garden instruction text, skip
  empty sight-word box, teal accent).
- `src/routes/cartilla/-leccion-view.tsx` — 1 className conditional,
  `n === 18 ? "lc-lesson-18"`.
- `src/styles/lesson-fit.css` — lesson-18-scoped section (119 lines).
- `docs/proofs/lesson-18-2026-10-18/` — README + capture script.
- `docs/worklogs/lesson-18-WORKLOG.md` — this file.

## Verification

- Screenshots captured at 1440×900 (wide desktop) and 1280×800 (horizontal
  tablet) for all four pages, plus pencil tap/circle interaction on page 64
  and phone sanity shots — see `docs/proofs/lesson-18-2026-10-18/README.md`.
- No owner art touched (no art files in the diff). Typecheck/lint run on
  changed files. A dedicated verifier reviews this commit read-only before
  it is pushed anywhere.
