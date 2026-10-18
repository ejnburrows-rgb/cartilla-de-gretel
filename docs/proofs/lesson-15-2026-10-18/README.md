# Lesson 15 (Bb) — browser proof, 2026-10-18

Branch `muse/lesson-15-wide-20261018`, base `main` @ c99ab4e.

Screenshots were captured from the real running app (local `pnpm dev`,
headless Chromium) at the two target viewports, after marking the lesson
complete in localStorage only to bypass the page-turn completion gate during
capture (the gate itself was verified working first — 2 locked nav controls
on an unfinished page 51).

## Captures

| File | Proof |
| --- | --- |
| `desktop-1366x900-p51.png` | Writing/tracing B b + drawing page, wide desktop |
| `desktop-1366x900-p52.png` | Syllable circling ba be bi bo bu, wide desktop |
| `desktop-1366x900-p53.png` | Letter/reading Bb page, wide desktop |
| `desktop-1366x900-p54.png` | Complete-the-word + sentence writing, wide desktop |
| `tablet-1280x800-p51..p54.png` | The same four pages, horizontal tablet |
| `desktop-1366x900-p52-pencil-drawing.png` | Tap on a syllable word: wooden pencil flies in from the right edge with the subtle zoom and draws the green circle |
| `desktop-1366x900-p52-pencil-done.png` | Green pencil circle stays on the correct syllable |

NOTE: the PNG binaries are delivered with the worker session report — the
connected GitHub text tools cannot push binary files. `capture-lesson-15.mjs`
in this folder reproduces every capture against local dev (`node
capture-lesson-15.mjs` with the dev server running).
