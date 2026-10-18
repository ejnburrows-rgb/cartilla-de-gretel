# Lesson 23 (Yy) wide-screen design — proof (2026-10-18)

Owner-approved Lesson 3 design language applied to Lesson 23, pages 83–85.
Printed page 86 is SOURCE_BLOCKED (scan absent from the Rescan PDF) — no
content invented for it.

## What changed (all on branch `muse/lesson-23-wide-20261018`, draft only)

- `src/components/cartilla/lesson23/Lesson23Text.tsx` (new): instruction text
  in rotating garden-palette colors (leaf, rose, sun, sky, lavender). Text
  content unchanged — only letter colors.
- `src/components/cartilla/FaithfulPageRenderer.tsx`: three `lessonNumber === 23`
  gated changes only — garden text for instructions, skip of the empty sight-word
  box on page 85 (none on the source page), shared teal accent `#167A72`.
- `src/routes/cartilla/-leccion-view.tsx`: one `n === 23` gated class
  (`lc-lesson-23`).
- `src/styles/lesson-fit.css`: lesson-23-scoped section (cream paper, slimmer
  teal spine, teal glow on work boxes/tiles, garden-colored syllable chips).
- Pencil mechanics untouched. No art replaced, regenerated, or recolored.

## Screenshots

Captured with `capture-lesson-23.mjs` (Playwright, headless Chromium):

| File | Viewport | Page |
|---|---|---|
| `desktop-1440x900-p83.png` | 1440×900 | 83 — tracing / drawing / sentence writing |
| `desktop-1440x900-p84.png` | 1440×900 | 84 — syllable circling |
| `desktop-1440x900-p85.png` | 1440×900 | 85 — letter Yy / syllables / reading |
| `tablet-1280x800-p83.png` … `p85.png` | 1280×800 | same three pages, horizontal tablet |
| `desktop-1440x900-p84-pencil-drawing.png` | 1440×900 | tap feedback (pencil X drawing, ash gray) |
| `desktop-1440x900-p84-pencil-done.png` | 1440×900 | tap feedback settled (green correct / red erase) |

## Verification checklist

- [x] Cream paper background, slimmer teal spine visible on all three pages
- [x] Teal glow around boxed work surfaces (word tiles, syllable cards, blanks)
- [x] Garden-palette instruction letters (5 rotating colors)
- [x] Pages fill the wide screen without scrolling or crowding
- [x] Pencil tap-and-X works on page 84 (ash → green/red)
- [x] Shared-file edits are all `lessonNumber === 23` gated
- [x] No art files touched (`git diff --stat` shows zero art changes)
