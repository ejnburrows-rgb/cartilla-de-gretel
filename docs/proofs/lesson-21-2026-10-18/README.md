# Lesson 21 (Jj) — browser proof, 2026-10-18

Branch `swarm/lesson-21-wide-20261018`, base `main` @ c99ab4e.

Screenshots were captured from the real running app (local `pnpm dev`,
headless Chromium) at the two target viewports, after marking the lesson
complete in localStorage only to bypass the page-turn completion gate during
capture (the gate itself was verified working first — 2 locked nav controls
on an unfinished page 75).

## Captures

| File | Proof |
| --- | --- |
| `desktop-1366x900-p75.png` | Writing/tracing J j + drawing page, wide desktop |
| `desktop-1366x900-p76.png` | Syllable circling page, wide desktop |
| `desktop-1366x900-p77.png` | Letter/reading page, wide desktop |
| `desktop-1366x900-p78.png` | Complete-the-word + sentence writing, wide desktop |
| `tablet-1280x800-p75..p78.png` | The same four pages, horizontal tablet |
| `desktop-1366x900-p76-pencil-drawing.png` | Tap on "jaba": wooden pencil flies in from the right edge with the subtle zoom and draws the green circle |
| `desktop-1366x900-p76-pencil-done.png` | Green pencil circle stays on the correct syllable |
| `phone-390x844-*-sanity.png` | Phone not broken (grows + scrolls per existing rule; redesign is a separate lane) |

NOTE: the PNG binaries are delivered with the worker session report — the
connected GitHub text tools cannot push binary files (verified: content is
UTF-8-encoded, which mangles PNG bytes). `capture-lesson-21.mjs` in this
folder reproduces every capture against local dev (`node
capture-lesson-21.mjs` with the dev server running).
