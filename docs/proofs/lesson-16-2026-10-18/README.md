# Lesson 16 (Vv) — browser proof, 2026-10-18

Branch `muse/lesson-16-wide-20261018`, base `main` @ c99ab4e.

Screenshots were captured from the real running app (local `pnpm dev`,
headless Chromium) at the target viewports, after marking the lesson
complete in localStorage only to bypass the page-turn completion gate during
capture (the gate itself was verified working first — locked nav controls
on an unfinished page 55).

## Captures

| File | Proof |
| --- | --- |
| `desktop-1440x900-p55.png` | Writing/tracing V v + drawing page, wide desktop |
| `desktop-1440x900-p56.png` | Syllable circling page (va ve vi vo vu), wide desktop |
| `desktop-1440x900-p57.png` | Letter/reading page Vv + syllables + vocabulary, wide desktop |
| `desktop-1440x900-p58.png` | Complete-the-word + sentence writing, wide desktop |
| `tablet-1280x800-p55..p58.png` | The same four pages, horizontal tablet |
| `desktop-1440x900-p56-pencil-drawing.png` | Tap on a syllable word: wooden pencil flies in with the subtle zoom and draws the green circle |
| `desktop-1440x900-p56-pencil-done.png` | Green pencil circle stays on the correct syllable |

NOTE: the PNG binaries are delivered with the worker session report — the
connected GitHub text tools cannot push binary files. `capture-lesson-16.mjs`
in this folder reproduces every capture against local dev (`node
capture-lesson-16.mjs` with the dev server running).
