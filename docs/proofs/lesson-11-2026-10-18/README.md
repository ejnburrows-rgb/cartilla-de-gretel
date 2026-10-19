# Lesson 11 (Dd) wide-screen design — proof (2026-10-18)

Branch: `muse/lesson-11-wide-20261018` (from main `99f378ff`).
Pattern: PR #927 (Lesson 21 wide design).

## What changed (all additive, scoped to `.lc-lesson-11`)

- `src/routes/cartilla/-leccion-view.tsx` — adds `lc-lesson-11` class on the
  lesson shell when `n === 11` (1 line, mirrors #927).
- `src/styles/lesson-fit.css` — new scoped block: cream paper `#faf2df`,
  slim teal spine (4.5%), teal glow boxes (`#167a72`, owner-approved Lesson 3
  design language), garden-palette instruction letters, teal instruction line
  `#0d9488` under every instruction, ambient float on illustration cells
  from page load. Lesson 11's purple catalog accent is replaced by the shared
  teal accent (same as #927).
- `src/components/cartilla/lesson11/Lesson11Text.tsx` — new: renders
  instruction text with rotating garden-palette letter colors (text unchanged).
- `src/components/cartilla/FaithfulPageRenderer.tsx` — uses
  `Lesson11GardenText` for lesson-11 instruction regions; teal accent override
  for lesson 11.
- `docs/proofs/lesson-11-2026-10-18/capture-lesson-11.mjs` — reproduces these
  screenshots (headless Chromium, dev server, route `/cartilla/leccion/11`).

Lesson 11's printed pages (35–38) have no picture-grid pages — writing (35),
syllable circling (36), letter/reading (37), complete-the-word + sentence
writing (38) — so the boxed-surface rules apply to its word/syllable tiles.
No artwork touched, no voice/music, no generated content. Lesson 3 untouched.
`tsc --noEmit --skipLibCheck` clean.

## Screenshots (all opened and visually verified)

| File | Viewport | Printed page | Verified |
|---|---|---|---|
| `lesson-11-390x844.png` (in `~/workspace/your_files/`) | 390×844 portrait phone | 35 | YES — cream paper, garden instruction letters, teal instruction line, slim teal spine |
| `lesson-11-844x390.png` (in `~/workspace/your_files/`) | 844×390 landscape phone | 35 | YES — same design holds in landscape |
| `lesson-11-1366x900.png` | 1366×900 desktop | 35 | YES — full page: tracing boxes with teal glow, teal underlines |
| `lesson-11-page-35.png` | 1366×900 | 35 | YES |
| `lesson-11-page-36.png` | 1366×900 | 36 | YES — syllable circling: garden instruction + teal line, teal syllable tiles, white word tiles |
| `lesson-11-page-37.png` | 1366×900 | 37 | YES — corrected capture: teal Dd card, cream syllable rows, garden chips, vocab tiles, reading card |

Page 38 capture: NOT DONE — the headless shell kept crashing/OOM on this
memory-constrained VM during repeated navigation runs; page 38 is the
fill-in-blank + writing-response family, same components as verified pages.

## Design notes for the reviewer

- The Dd title needed a 4-class selector
  (`.lc-lesson-11 .native-lesson-viewer__content .fp-native-letter-page .fp-native-title`)
  to beat the base "blush" rule's red (`#b51f3b`) at equal specificity —
  same fix as #927's title rule.
- Teal `#0d9488` is used ONLY for the instruction underline (as ordered);
  the rest of the design uses the owner-approved `#167a72` teal from #927.
