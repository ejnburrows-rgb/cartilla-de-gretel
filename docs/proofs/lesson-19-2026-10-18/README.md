# Lesson 19 (Gg) — browser proof, 2026-10-18

Branch `muse/lesson-19-wide-20261018`, base `main` @ c99ab4e.

Screenshots were captured from the real running app (local `pnpm dev`,
headless Chromium) at the two target viewports, after marking the lesson
complete in localStorage only to bypass the page-turn completion gate during
capture (the gate itself was verified working first — locked nav controls
on an unfinished page 67).

## Captures

| File | Proof |
| --- | --- |
| `desktop-1366x900-p67.png` | Writing/tracing Gg + drawing page, wide desktop |
| `desktop-1366x900-p68.png` | Syllable circling ga go gu page, wide desktop |
| `desktop-1366x900-p69.png` | Letter/reading page, wide desktop |
| `desktop-1366x900-p70.png` | Complete-the-word + sentence writing, wide desktop |
| `tablet-1280x800-p67..p70.png` | The same four pages, horizontal tablet |
| `desktop-1366x900-p68-pencil-drawing.png` | Tap on "gato": wooden pencil draws the green circle |
| `desktop-1366x900-p68-pencil-done.png` | Green pencil circle stays on the correct syllable |
| `phone-390x844-*-sanity.png` | Phone not broken (grows + scrolls per existing rule; redesign is a separate lane) |

All PNGs are committed in this branch under the same folder.
`capture-lesson-19.mjs` reproduces every capture against a local dev server
(`node capture-lesson-19.mjs` with the dev server running, BASE_URL env
override supported). Environment notes: use Playwright's bundled Chromium
(the full Chrome binary enforces Local Network Access checks that block
localhost navigation in sandboxes); lesson progress is seeded via
addInitScript before first load (a reload-based approach is flaky under
load); the interactive syllable page renders word tiles as
`button.native-syllable__word`, not `.fp-syllable-match__word`.
