# Completion checkpoint — 2026-11-03

DONE but not live: the earlier work was saved at ab06a8b9 and pushed to the existing PR #1247. This checkpoint additionally improves available chart height, fits the page and corner controls to the original source aspect ratio, removes the empty paper frame, restores five more source scenes, corrects page 3/4 clipping, and removes the contrast/saturation filter. Binding height and page-turn hinge now agree so rings do not conceal top artwork.

## Source evidence and remaining originals

`La Cartilla de Gretel Flip Chart.pdf`: 62 pages, SHA256 `d7fb3dff4e63caf3443226e57a9ef700f8974acd4ad8f08f44e2792e13cc4930`. The Remaster PDF contains 92 Workbook pages, not separate clean Flip Chart illustration layers. Source-page contact sheets are included. Original RGB pixels in each of the five new scene crops are unchanged; only explicitly recorded neighbouring-label regions have transparent alpha. The source rectangles and output hashes are in `additional-source-repairs.json`.

WAITING: clean full illustrations for **page 35 (Bebo with bat, cloud/ball and ground), page 41 (mouse, rose, wheel, lizard and full flourish), page 47 (both cats, food dish, flowers and ground), page 53 (girl bathing the turtle, bee, tub and full ground)**. The complete scans exist, but printed captions occupy parts of their scene region. Available archive `flipchart-pNNN-hero.webp` candidates are also truncated and contain captions; they are not clean replacements. See `candidate-more.jpg` and `archive-heroes.jpg`. An unobscured owner original or source-specific placement decision is needed; no missing pixels were invented. This is not a claim that the owner never supplied an original elsewhere.

60/60 lesson sheets were opened and captured on `/cartilla/teacher/flipchart`; two front-matter pages are outside that selector. This is a screen-fit visual sweep, not 100% pixel/provenance or physical-projector acceptance. Other low-resolution files were not replaced merely because their dimensions are small.

## Per-page check

| PDF page | Lesson | Observation / source status | Real-route proof |
|---|---|---|---|
| 1 | 0 | NOT TESTED on a real route: front matter is not in the lesson selector. | Source PDF contact sheet only |
| 2 | 0 | NOT TESTED on a real route: front matter is not in the lesson selector. | Source PDF contact sheet only |
| 3 | 1 | Scene edges clipped by inaccurate content bounds; corrected without changing source pixels. | [render](audit-lesson-1-sheet-1.png) |
| 4 | 2 | Oto hair/head clipped by inaccurate content bounds; corrected without changing source pixels. | [render](audit-lesson-2-sheet-1.png) |
| 5 | 3 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-3-sheet-1.png) |
| 6 | 4 | Existing handoff repair retained: seven uncropped PDF assets. | [render](audit-lesson-4-sheet-1.png) |
| 7 | 5 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-5-sheet-1.png) |
| 8 | 6 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-6-sheet-1.png) |
| 9 | 7 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-7-sheet-1.png) |
| 10 | 7 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-7-sheet-2.png) |
| 11 | 7 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-7-sheet-3.png) |
| 12 | 8 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-8-sheet-1.png) |
| 13 | 8 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-8-sheet-2.png) |
| 14 | 8 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-8-sheet-3.png) |
| 15 | 9 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-9-sheet-1.png) |
| 16 | 9 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-9-sheet-2.png) |
| 17 | 9 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-9-sheet-3.png) |
| 18 | 10 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-10-sheet-1.png) |
| 19 | 10 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-10-sheet-2.png) |
| 20 | 10 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-10-sheet-3.png) |
| 21 | 11 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-11-sheet-1.png) |
| 22 | 11 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-11-sheet-2.png) |
| 23 | 11 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-11-sheet-3.png) |
| 24 | 12 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-12-sheet-1.png) |
| 25 | 12 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-12-sheet-2.png) |
| 26 | 12 | Missing lower Gretel/stool/flowers restored from original PDF raster. | [render](audit-lesson-12-sheet-3.png) |
| 27 | 13 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-13-sheet-1.png) |
| 28 | 13 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-13-sheet-2.png) |
| 29 | 13 | Missing bow, feet, shoes, duck and ground restored from original PDF raster. | [render](audit-lesson-13-sheet-3.png) |
| 30 | 14 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-14-sheet-1.png) |
| 31 | 14 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-14-sheet-2.png) |
| 32 | 14 | Missing lower bed/flourishes restored from original PDF raster. | [render](audit-lesson-14-sheet-3.png) |
| 33 | 15 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-15-sheet-1.png) |
| 34 | 15 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-15-sheet-2.png) |
| 35 | 15 | WAITING: lower boy/ground cut. PDF contains full boy, but printed caption touches/overlaps surrounding scene; clean unobscured master not located. | [render](audit-lesson-15-sheet-3.png) |
| 36 | 16 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-16-sheet-1.png) |
| 37 | 16 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-16-sheet-2.png) |
| 38 | 16 | Missing lower boat/hull/waves restored from original PDF raster. | [render](audit-lesson-16-sheet-3.png) |
| 39 | 17 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-17-sheet-1.png) |
| 40 | 17 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-17-sheet-2.png) |
| 41 | 17 | WAITING: lower wheel/lizard/ground cut. Printed caption overlaps original scene; clean unobscured master not located. | [render](audit-lesson-17-sheet-3.png) |
| 42 | 18 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-18-sheet-1.png) |
| 43 | 18 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-18-sheet-2.png) |
| 44 | 18 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-18-sheet-3.png) |
| 45 | 19 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-19-sheet-1.png) |
| 46 | 19 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-19-sheet-2.png) |
| 47 | 19 | WAITING: lower cat/food dish/ground cut. Printed caption overlaps original scene; clean unobscured master not located. | [render](audit-lesson-19-sheet-3.png) |
| 48 | 20 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-20-sheet-1.png) |
| 49 | 20 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-20-sheet-2.png) |
| 50 | 20 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-20-sheet-3.png) |
| 51 | 21 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-21-sheet-1.png) |
| 52 | 21 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-21-sheet-2.png) |
| 53 | 21 | WAITING: lower bath/grass cut. Printed caption overlaps original scene; clean unobscured master not located. | [render](audit-lesson-21-sheet-3.png) |
| 54 | 22 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-22-sheet-1.png) |
| 55 | 22 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-22-sheet-2.png) |
| 56 | 22 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-22-sheet-3.png) |
| 57 | 23 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-23-sheet-1.png) |
| 58 | 23 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-23-sheet-2.png) |
| 59 | 23 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-23-sheet-3.png) |
| 60 | 24 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-24-sheet-1.png) |
| 61 | 24 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-24-sheet-2.png) |
| 62 | 24 | No additional obvious cut/person split at the captured desktop fit. Source scan exists; pixel-level color/provenance and projector enlargement remain NOT TESTED. | [render](audit-lesson-24-sheet-3.png) |

## Verification and gates

- Typecheck passed; six focused suites / 59 tests passed.
- Full-suite run: 2,154 passed / 30 failed / 7 skipped; 11 result files failed, including untracked historical proof/stress tests. Full results are retained separately; the suite is not green. A performance test auto-started a build while the separate requested build was running and hit a dist file lock; do not call this a product regression without an isolated rerun.
- The separate production build passed with existing CSS/chunk warnings. Final-revision built-route proof and rerun results are appended below when complete.
- WAITING: independent exact-head formal GitHub review and owner's specific merge yes. Recommendation: hold merge while source and test failures remain.
- WAITING: owner yes/no for CC0 Freesound OwlStorm #151221 page-turn sound.
- Deployment not authorized; `vercel.json` remains `git.deploymentEnabled:false`.
- NOT TESTED: physical-phone cover performance, full artwork pixel matching and classroom projector enlargement. Authentic Gretel recording inventory and smoother student activities remain separate tasks.
