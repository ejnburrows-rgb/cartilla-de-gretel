# Lane B — real browser proof, draft only

Code: https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1022
Runtime source commit: 1bb08d96a090b052073d48255eaf115d6351b417
Base: ba4e6ff3d4e62c56b6c0d6f4ee5384abc3629e16
Branch: draft/lane-b-workbook-lessons-8-18

Open index.html for all 44 matched-scale comparisons. Each image places the original scan on the left and the actual live page on the right. originals/ contains all authentic scans; phone/ contains both full-screen and paper-only browser captures. tests/ contains unedited logs, per-page measurements, interaction outcomes, and supporting screenshots. scripts/ contains the reproduction tools. All implementation changes stay on the draft branch.

## All pages reviewed in one source pass

| Lesson | Printed pages |
| --- | --- |
| 8 | 23, 24, 25, 26 |
| 9 | 27, 28, 29, 30 |
| 10 | 31, 32, 33, 34 |
| 11 | 35, 36, 37, 38 |
| 12 | 39, 40, 41, 42 |
| 13 | 43, 44, 45, 46 |
| 14 | 47, 48, 49, 50 |
| 15 | 51, 52, 53, 54 |
| 16 | 55, 56, 57, 58 |
| 17 | 59, 60, 61, 62 |
| 18 | 63, 64, 65, 66 |

No source pages were missing. Four page families were built together, then corrected across the whole set: writing/drawing, syllable circling, reading, and word/sentence completion.

## REAL

- 44 actual lesson-route pages rendered in Chromium 153 at a 390 × 844 touch viewport. These are live HTML/components and canvases, not scans as backgrounds or generated mockups.
- 44 pages: no uncaught runtime errors, no horizontal overflow, source font loaded, and zero subject pictures.
- TypeScript check: PASS. Eight focused Vitest files: 175 tests PASS, including measured-letter hit testing with wide button margins.
- Vite worker production build: PASS. Build warnings remain in the original logs.
- 17 real-browser checks PASS: incorrect syllable retry/erasure, correct mark persistence, normal-motion pencil and eraser, canvas drawing/erasing/undo/save/reload, sentence persistence, guided uppercase trace/save/reload, all six completion choices plus sentence gating, existing next control, neighboring Lessons 7/19 excluded from Lane B styling, and four page families at landscape and desktop sizes.
- The existing page, pencil, eraser, trace, drawing, completion, persistence, and page-turn components remain in use. No new reward system or subject pictures.
- Blank practice areas retain actual writable canvases. Existing controls appear on focus/hover. The sentence control no longer collides with the page-turn corner.

## NOT REAL / not established by this evidence

- This is browser phone emulation, not a physical iPhone/Android or Safari test.
- The 17 interaction cases are representative; they do not mean every answer and every saved activity on all 44 pages was manually completed.
- The reconstructed typeface, wave contour, and printed letter models are not pixel-identical to the scan. Original small stroke-order arrows/numbers are not fully reproduced at rest. Exact visual acceptance remains open; do not call this source-exact or finished.
- The build result is the Vite worker build, not the repository's complete release command, asset gate, entire test suite, or production deployment.
- The test backend URL/key are deliberately nonfunctional local placeholders. No real child record, production login, microphone/audio recording, or backend synchronization was tested.
- Unit-test logs include jsdom canvas/media warnings. The real-browser checks separately exercise actual canvas drawing and persistence.

## Reproduce

Install the frozen lockfile with pnpm 10.33.0. Run the existing Vite worker dev server on 127.0.0.1:5173 with local placeholder Supabase settings. Set PLAYWRIGHT_CHROMIUM_PATH to an available Chromium executable. From repository root run:

    node scripts/verify-lane-b.mjs
    node scripts/capture-lane-b.mjs 23 66
    python scripts/package-lane-b-proof.py

Proof tools write only to their fixed repository proof folder; output-directory CLI paths are not accepted. Keep server and browser in the same network namespace. No merge, deployment, or main commit is part of this delivery.
