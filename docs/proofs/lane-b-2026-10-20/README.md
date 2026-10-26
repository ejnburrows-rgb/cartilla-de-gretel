# Lane B — current evidence status

Draft branch: `draft/lane-b-workbook-lessons-8-18`
Base: `ba4e6ff3d4e62c56b6c0d6f4ee5384abc3629e16`
Current runtime source: `80a6eab178ffaa46029b16ac7c4f8acc41ccc743`
Draft PR: https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1022

All 44 native Workbook pages in Lessons 8–18 have been built together and refined against their matching original scans. Existing PageFrame, pencil, eraser, tracing, drawing, completion, sentence-writing, persistence and navigation components remain in use. No subject pictures, new buttons, stars or points were added.

| Lesson | Printed pages |
|---|---|
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

## REAL

- Authentic scan SHA-256 bindings for all 44 pages; source-measured waves, writing models, ruling, drawing outlines, 330 circle words, 168 vocabulary words, 70 story lines, 66 completion items and 55 instructions.
- Canonical text and answer order remain unchanged.
- Original print geometry and partial source-derived fonts are bundled; source PDFs/JPGs are unchanged.
- Before the execution environment disconnected, 15 focused Vitest files / 211 tests, typecheck and worker build passed. All 44 phone routes were captured at 390×844 with zero uncaught page errors, horizontal overflow or subject images.
- Earlier browser rounds passed 20 checks, including real touch on all 11 circle pages and all 66 completion items, normal pencil/eraser, drawing erase/undo/save/reload, guided tracing, typed and freehand sentence persistence, completion gating, navigation, adjacent-page isolation, landscape and desktop.
- The latest data-only correction restores original printed ink inside faded reading frames, including “también” on page 41. Direct source-data checks verified all 44 scan bindings and that circle, fill, vocabulary, story, writing-model and ruling data were unchanged.

## NOT REAL / not yet verified

- The latest faded-frame correction has NOT been rerun through Vitest, typecheck, build or browser captures. An additional regression test was added but has not been executed.
- The latest full phone comparison package could not be finalized or saved. Do not present older comparison images as proof of this runtime source.
- Existing committed `verification.json` and `comparisons/` are older evidence for the commits they name. They are not current-head proof.
- No claim of a publisher-original font binary, raster pixel identity, physical-device/Safari testing, full release validation, live backend verification, merge or deployment.

## Concrete continuation

The execution tool returned `409 Conflict, environment_offline: Environment is not connected` after workspace recovery. Source was preserved using the authenticated GitHub connector. No deployment, main commit or merge was made.

1. Check out this existing draft branch, preserving its current source.
2. Use the repository lockfile dependencies. Run the same focused suites plus `src/lib/__tests__/workbook-middle-source.test.ts`, typecheck and worker build.
3. Start the worker Vite server and Playwright scripts in the same command/session. Run `scripts/capture-lane-b.mjs 23 66` and `scripts/verify-lane-b.mjs` with a working Chromium executable.
4. Inspect every new matched-scale comparison, particularly page 41’s sight word, page 34’s final “pi”, helper-word sizes, and reading-panel print.
5. Run `scripts/package-lane-b-proof.py` only after all checks pass. Replace the existing Library artifact `libfile_6ffd6f55bbd88191be039c08ed185871` with the completed ZIP, preserving its identity.
6. Keep the PR draft. Do not merge or deploy.

This is a blocked verification handoff, not a completion claim.
