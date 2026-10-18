# Lesson 18 (rr) — browser proof, 2026-10-18

Branch `muse/lesson-18-wide-20261018`, base `main` @ c99ab4e.

Screenshots were captured from the real running app (local `pnpm dev`,
headless Chromium) at the two target viewports, after marking the lesson
complete in localStorage only to bypass the page-turn completion gate during
capture (the gate itself is unchanged from main).

## Captures

| File | Proof |
| --- | --- |
| `desktop-1440x900-p63.png` | Writing/tracing rr + drawing page, wide desktop |
| `desktop-1440x900-p64.png` | Syllable circling page (rra rre rri rro rru), wide desktop |
| `desktop-1440x900-p65.png` | Letter/reading page rr, wide desktop |
| `desktop-1440x900-p66.png` | Complete-the-word + sentence writing, wide desktop |
| `tablet-1280x800-p63..p66.png` | The same four pages, horizontal tablet |
| `desktop-1440x900-p64-pencil-drawing.png` | Tap on a syllable word: wooden pencil draws the green circle |
| `desktop-1440x900-p64-pencil-done.png` | Green pencil circle stays on the correct syllable |
| `phone-390x844-*-sanity.png` | Phone not broken (grows + scrolls per existing rule; redesign is a separate lane) |

NOTE: the PNG binaries are delivered with the worker session report — the
connected GitHub text tools cannot push binary files (verified: content is
UTF-8-encoded, which mangles PNG bytes). `capture-lesson-18.mjs` in this
folder reproduces every capture against local dev (`node
capture-lesson-18.mjs` with the dev server running).
