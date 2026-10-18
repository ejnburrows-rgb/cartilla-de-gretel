# Landscape shared fix — full-page verification (2026-10-18)

Branch: `fix/landscape-shared` (from `shared/landscape-844x390-fix-20261018`, PR #962).
Fix under review: the single shared `@media (orientation: landscape) and (max-height: 500px)` block appended to `src/styles/lesson-fit.css`. No lesson-scoped rules, no component or content changes, no audio.

## What was verified

Every lesson page of all 24 lessons (88 pages) was loaded as a real anonymous student session in a real browser (Vite dev server of this branch, Chromium via Playwright) and screenshot-rendered at:

- Phone portrait **390x844**
- Phone landscape **844x390**
- Tablet portrait **820x1180**
- Tablet landscape **1180x820**

Each render was also checked programmatically for: horizontal overflow, collapsed interactive tiles (<30px), inner scroll traps (scrollable boxes inside the page body), clipped page content in fixed-height mode, and unreachable overflow in the shell. An extra pass at short-landscape phone **667x375** ran the same checks.

## Result

- **After (this branch): 88 pages x 4 viewports = 352 renders, 0 problems.** 667x375 pass: 0 problems.
- **Before (main 99f378ff, same harness, 844x390): 12 pages broken** — all in Lecciones 1-6:

| Lesson | Page (printed) | Archetype | Before (main) | After (this branch) |
| --- | --- | --- | --- | --- |
| 1 | p1 (1) | picture grid | 20 tiles collapsed to ~10px, page effectively empty | full grid, all pictures visible |
| 1 | p2 (2) | picture grid / match | 15 tiles collapsed to ~10px | full page |
| 2 | p1 (4) | picture grid | 16 tiles ~10px | full page |
| 2 | p2 (5) | line-match | board flattened, 9 targets 8-15px strips | square tappable tiles |
| 3 | p1 (7) | picture grid | 16 tiles ~10px | full page |
| 3 | p2 (8) | line-match | board flattened, 9 targets 8-15px strips | square tappable tiles |
| 4 | p1 (10) | picture grid | 16 tiles ~10px | full page |
| 4 | p2 (11) | line-match | board flattened, 9 targets 8-15px strips | square tappable tiles |
| 5 | p1 (13) | picture grid | 16 tiles ~10px | full page |
| 5 | p2 (14) | line-match | board flattened, 9 targets 8-15px strips | square tappable tiles |
| 6 | p1 (16) | picture grid | 16 tiles ~10px | full page |
| 6 | p2 (17) | line-match | board flattened, 9 targets 8-15px strips | square tappable tiles |

All other 76 pages render pixel-identically before/after (the fix is inside a landscape-only `max-height: 500px` media query that does not match phone portrait, tablet portrait or tablet landscape viewports). Spot-verified visually across every archetype: picture grids, vowel pick, line-match, syllable groups, letter pages, tracing/writing (archetype 5), fill-in-blank, and sentence writing.

## Notes

- Author words, art, page order and interactions unchanged; voice stays "pendiente" (no TTS anywhere).
- Screenshots: before/after pairs for all 88 pages were captured locally by the harness described above; before/after examples for the 12 affected pages accompany this PR in its description and in the session report to the owner.
- Nothing missing from `public/teacher/` was needed or invented for this change.
