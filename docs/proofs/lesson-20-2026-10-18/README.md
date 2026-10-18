# Lesson 20 (Ff) — browser proof, 2026-10-18

Branch `muse/lesson-20-wide-20261018`, base `main` @ c99ab4e.

Screenshots were captured from the real running app (local `pnpm dev`,
headless Chromium) at the two target viewports, after marking the lesson
complete in localStorage only to bypass the page-turn completion gate during
capture (the gate itself was verified working first — locked Next control
on an unfinished page 71).

## Captures

| File | Proof |
| --- | --- |
| `desktop-1440x900-p71.png` | Writing/tracing F f + drawing page, wide desktop |
| `desktop-1440x900-p72.png` | Syllable circling page, wide desktop |
| `desktop-1440x900-p73.png` | Letter/reading page, wide desktop |
| `desktop-1440x900-p74.png` | Complete-the-word + sentence writing, wide desktop |
| `tablet-1280x800-p71..p74.png` | The same four pages, horizontal tablet |
| `desktop-1440x900-p72-pencil-drawing.png` | Tap on a syllable tile: wooden pencil draws the green circle |
| `desktop-1440x900-p72-pencil-done.png` | Green pencil circle stays on the correct syllable |

NOTE: the PNG binaries are delivered with the worker session report — the
connected GitHub text tools cannot push binary files (verified: content is
UTF-8-encoded, which mangles PNG bytes). `capture-lesson-20.mjs` in this
folder reproduces every capture against local dev (`node
capture-lesson-20.mjs` with the dev server running).
