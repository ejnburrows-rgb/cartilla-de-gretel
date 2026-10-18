# Lesson 17 (Rr) wide-screen redesign — WORKLOG

Branch: `muse/lesson-17-wide-20261018` (base: main @ c99ab4e).
Pattern: Lesson 21 wide-screen PR #927 (`swarm/lesson-21-wide-20261018`).

## What was built

Owner-approved Lesson 3 design language applied to Lesson 17 (pages 59–62):

1. **`src/components/cartilla/lesson17/Lesson17Text.tsx`** (new) —
   garden-palette instruction letters component. Each letter rendered in a
   rotating color (leaf, rose, sun, sky, lavender); text content unchanged.
2. **`src/components/cartilla/FaithfulPageRenderer.tsx`** — 3 edits, all
   gated on `lessonNumber === 17`: garden-text instruction rendering,
   skip empty sight-word box (page 61 carries the real sight word "bien",
   so the guard never triggers; kept symmetric with the other
   wide-screen lessons), shared teal accent `#167A72` instead of the
   lesson's red catalog accent.
3. **`src/routes/cartilla/-leccion-view.tsx`** — 1 edit: adds
   `lc-lesson-17` class when `n === 17`.
4. **`src/styles/lesson-fit.css`** — 119-line lesson-17-scoped section
   (all selectors under `.lc-lesson-17`): cream paper, slimmer teal
   spine, teal glow on work boxes, garden-letter color classes.
5. **Proof docs** — `docs/proofs/lesson-17-2026-10-18/` (README +
   capture script + screenshots at 1440px desktop and 1280px tablet).

## Verification

- `tsc --noEmit`: no errors in changed files.
- All 4 pages rendered in headless Chromium at 1440x900 and inspected:
  p.59 writing/tracing R r + drawing; p.60 syllable circling ra/re/ri/ro/ru;
  p.61 Rr card + word grid + sight word "bien" + reading passage;
  p.62 complete-the-word + sentence writing. No overlap, no crowding,
  teal glow visible, garden letters on instructions, cream paper,
  teal spine.
- Pencil proof captured on p.60 (drawing + done states).
- Completion gate confirmed working; bypassed via test-only localStorage
  seed for captures.
- No owner art touched (no art files in diff). No audio (none exists
  for this lesson). Draft only — never merged, never pushed.

## Handoff notes

- A previous worker died in a runtime restart after making the code
  edits and most screenshots; this session verified the partial work,
  finished the remaining captures, proof docs, and the commit.
- Scratch files `dbg17.mjs` and `shot17d.mjs` removed before committing.
