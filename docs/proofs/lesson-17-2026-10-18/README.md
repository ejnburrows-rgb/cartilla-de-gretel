# Lesson 17 (Rr) wide-screen redesign — proof

Branch: `muse/lesson-17-wide-20261018` (base: main @ c99ab4e).
Pattern: Lesson 21 wide-screen PR #927.

## What changed

- `src/components/cartilla/lesson17/Lesson17Text.tsx` (new): garden-palette
  instruction letters (leaf/rose/sun/sky/lavender rotation; text unchanged).
- `src/components/cartilla/FaithfulPageRenderer.tsx`: 3 edits, all gated on
  `lessonNumber === 17` (garden-text instructions, empty sight-word skip,
  shared teal accent `#167A72`).
- `src/routes/cartilla/-leccion-view.tsx`: `lc-lesson-17` scoping class when
  `n === 17`.
- `src/styles/lesson-fit.css`: 119-line `.lc-lesson-17`-scoped section
  (cream paper, slimmer teal spine, teal glow on work boxes).

No owner art touched. No audio. Draft only.

## Screenshots

Captured with headless Chromium via `capture-lesson-17.mjs`
(`CHROME_PATH` + `BASE_URL=http://127.0.0.1:5173`):

| File | Viewport | Page | Content |
|---|---|---|---|
| desktop-1440x900-p59.png | 1440x900 | 59 | Writing/tracing R r + drawing |
| desktop-1440x900-p60.png | 1440x900 | 60 | Syllable circling ra/re/ri/ro/ru |
| desktop-1440x900-p60-pencil-drawing.png | 1440x900 | 60 | Pencil tap-and-X, mid-draw |
| desktop-1440x900-p60-pencil-done.png | 1440x900 | 60 | Pencil tap-and-X, after |
| desktop-1440x900-p61.png | 1440x900 | 61 | Rr card + word grid + "bien" + reading |
| desktop-1440x900-p62.png | 1440x900 | 62 | Complete-the-word + sentence writing |
| tablet-1280x800-p59.png | 1280x800 | 59 | Tablet sanity |

The completion gate was bypassed via test-only localStorage seed for
captures; the gate itself was verified working separately (locked nav on
an unfinished page).
