# Verification of the open demo handoff, PR #1321 (2026-11-26)

On Nov 24, open PR [#1321](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1321) (Devin, branch `devin/1795540156-demo-handoff-20261124`, docs only, not merged) delivered most of this assignment. I did not start a second audit. I checked #1321 against `main` `5e1c8378` and against the GitHub records, kept what was right, and fixed what was wrong. **Source and file review only. No browser, device, audio or test run. Nothing was merged or deployed.**

## Confirmed facts
| Claim | Evidence |
|---|---|
| Nov 14 handoff commit `09fdd24` was **not merged** | `09fdd242` is commit 13 of 15 on PR #1306 (state CLOSED, `mergedAt: null`). It is not an ancestor of `origin/main` (`git merge-base --is-ancestor` → false). The branch has been deleted. Its files can still be read through the PR’s commits. |
| `main` = `5e1c8378` (#1320, docs only, on top of live `3c559eea`) | `git log origin/main`. #877 records the live Playwright check of `3c559eea` on Nov 21. |
| Workbook curl Option A is the default | `PageCurl.tsx:43` `curlVariant = curlParam === "b" ? "b" : "a"`. Enforced by `scripts/check-merge-policy.mjs:237`. |
| Flip Chart Candidate A is 2000 ms | `living-motion.ts:20` `FLIPCHART_FLIP_MS = 2000`. `FlipchartHdPanel.tsx:110` `flipVariant === "b" ? 1200 : FLIPCHART_FLIP_MS`. Locked by AGENTS.md §8a and `check-merge-policy.mjs:239`. |
| Workbook curl is 2600 ms + 300 ms lift + 100 ms settle | `living-motion.ts:13–17`. `NativeLessonViewer.tsx` `executeTurn`. |
| 109 Workbook instruction lines | All 109 rows of `AUDIO-SCRIPTS-WORKBOOK.csv` (from `09fdd24`) match `page-layouts.json` text on `main` exactly (0 differences). |
| 161 approved picture words / 38 missing Flip Chart names | All 161 files exist under `public/audio/voz/vocabulario/`. None of the 38 suggested files exists. |
| PR #1058 holds 40 + 5 owner instruction clips | OPEN, not draft, last updated 2026-10-21. 63 files, including `public/audio/instrucciones/line-01…40.mp3` and `public/audio/leccion3/{muy-bien,p7-instr,p8-instr,p9-instr1,p9-instr2}.mp3`. |
| Tutor #1073 is a frozen draft | OPEN, draft, head `305f176c`, last updated 2026-11-04. |
| No Apple game | No `apple`/`manzana` game in `src/content/games` or `src/components/cartilla/games`. #877 records that searches for “Reto de la Manzana” found nothing. |
| Payaso Chano has no character art | `public/cartilla/art/payaso-chano/` does not exist. |

## Errors in #1321, corrected in this package
| # | #1321 said | What the source shows | Effect |
|---|---|---|---|
| 1 | **Defect:** a corner drag can turn an unfinished Workbook page forward, so a code fix is needed | **False.** `NativeLessonViewer.tsx:418–423` (`handlePointerMove`) stops the drag the moment it passes the 6 px threshold when `direction === "next" && !completion.complete`. It calls `showRemaining()`, sets `active = false` and `suppressCornerClickRef = true`. `isDragging` never becomes true, so `handlePointerUp` neither commits a turn nor plays a sound. | **No code change needed.** What is actually missing is a test: no unit test drags an *incomplete* page past 50 % (`NativeLessonViewer.turn.test.tsx:143` covers only a completed page). A regression test is optional (see 07). |
| 2 | Art: p.3 ocho/araña, p.4 uña, p.7 abeja/alas/avión, p.11 abrigo are “not wired in page-layouts.json” | All 7 are wired (cell positions are in 02). | Correct inventory |
| 3 | Art: “Wire p.16 pez/traje/arco into page-layouts.json” | Already on p.16 as avión (cell 3, `pez.webp`), uña (cell 4, `arco.webp`) and uniforme (cells 7 and 14, `traje.webp`). The audit matched file names, not captions. | **That action would have added wrong or duplicate pictures.** Removed. |
| 4 | Art: place igual/invierno/arco on p.4 and espejo on p.13 | Printed pp.4 and 13 have 16 cells each, all already placed. These are audit rows 17–19, past the end of the page. | That action would have added pictures that are not in the book. Reclassified as file-quality items only. |
| 5 | p.7 eyes = `optimized/…/ojos.png` | The p.7 cell 13 picture is `approved/lesson-3/ojo.png` (one eye, opaque 1254×608). | Correct asset named |
| 6 | Audio: “`PageTurnSound` could double-play” | `PageTurnSound.tsx` is not mounted anywhere, and nothing dispatches `cartilla:page-flip`. It is unused code, so it cannot double-play. | Risk removed; it can be cleaned up |
| 7 | Master script complete | 17 Gretel lines in `main` source were missing (GretelActivity hints, GretelPresence, useGretelEvents). Also, **no Gretel feedback voice is mounted on the Workbook lesson route**, because `useGretelEvents()` is never called. | Added in 03 §9 and 04 rows 238–255. New wiring task added to 05 and 07. |
| 8 | Tutor status mentions only #1073 | The merged #1295 **Maestra suplente** (`/cartilla/suplente`, offline, silent, 24 lessons) is the offline substitute that is already in `main`. | Added to 06 |
| 9 | Ledger: `owner-decisions-locked-b.json` is out of date | Confirmed: `lockedDefault: "B"`, and `student-page-curl` and `workbook-lesson-3` say “approve-b … curl B”, while AGENTS §8a and the code say A. The file is only displayed by `review-data.ts:173`; no policy check reads it. | Exact entries to append are in 07 |

Everything else in #1321 matched the source when I checked it, including sections B–D of the artwork inventory and sections 1–8 of the script.

**Recommendation:** fold this package into #1321 rather than opening another PR (AGENTS.md: “Reuse original branches, PRs”). I did not push anything to that branch, because doing so is a change on GitHub that you have not asked for.
