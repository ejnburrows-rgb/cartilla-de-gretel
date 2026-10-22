# Delivery plan: Cartilla de Gretel review candidate

**Updated:** 2026-10-19 (rebuilt from verified GitHub state at `main` 85ba286). **Owner review deadline: Tuesday 2026-10-20, 9:00 a.m. Eastern.**
Previous plan (2026-10-16) was stale and has been replaced, not appended. Sonar stays advisory and non-blocking (owner policy); true regressions block.

## Core rules
1. Follow `AGENTS.md`. Every merge into `main` needs the owner's own explicit yes tied to the exact PR head SHA. No agent merges.
2. Never duplicate work: check open PRs, branches and reservations first (`scripts/dispatch-gate.mjs`, status in `docs/EXECUTION_CONTROL.md`).
3. Show real rendered proof for visual changes. Do not invent artwork, recordings, answers or teacher content. Pages 86-87 are absent from the authoritative scan: do not fabricate them. The rope/lasso mechanic stays rejected. Do not reopen the voice-provider question; use the existing audio recovery and mapping requirements.
4. Lesson 3 needs the owner's visual approval before its design is rolled out across lessons.

## Review candidate: finished-state contract (owner, 2026-10-19)
Interactive Student Workbook with all 24 lessons; Teacher functionality and authentic Flip Chart; six games (Mariposas, Payaso Chano, Vaca, Vamos a rimar, Palabras por minuto, Completar palabras); source-faithful approved art; recovered and mapped approved voice recordings; **welcome/splash video (required for this review)**; responsive phone/tablet/desktop; animation, pencil/eraser, page turning, audio, activity responses, progress save/resume; accessibility and functional checks; demo data only.

## Verified state (GitHub, read-only, 2026-10-19 ~08:30 ET)
* `main` = 85ba286. 84 open PRs, 81 of them drafts (read at 08:22 ET). Live site is still the old Oct 16 build (Vercel git deploys off, per the 7:00am read-back; not re-read here).
* Merged today: #996 (red-thread aguja), #997 (AGENTS.md merge rule). Merged earlier: #944 (Payaso Chano game), #902, #901.
* Provider session state (Jules lanes, ChatGPT, Notion agents): UNVERIFIED from here. All PRs show the shared author `ejnburrows-rgb`, so no lane can be counted as producing from GitHub alone.

## Existing PR reconciliation (changed-file lists read from GitHub)
| Group | PRs | Overlap | What can proceed independently | Missing |
|---|---|---|---|---|
| Pencil / shared interaction | #930 (37 files), #921 (16), #922 (9) | #921/#930 share `PencilConnector.tsx` + test + living-motion README; #922/#930 share `living-motion` scripts and estrella art; #921/#922 share `living-actor-registry.ts` (#921 and #922 also share a base) | Art/motion files of #922 apart from shared scripts | Owner decision on which pencil implementation is the base; one integrated head with tests |
| Landscape / layout | #962 (1 file), #965 (6), #975 (2), #977 (1); issue #986 | all touch `src/styles/lesson-fit.css`; #959 also touches it | Per-lesson fit PRs (#977) after the shared fix is chosen | #965 was shown not to fix landscape (watcher, 7:00am); proof screenshots required (#986) |
| Lesson 24 | #946 (4), #959 (15), #978 (4) | #946/#959/#978 share `-leccion-view.tsx`, capture script, proof README | #959 phone-fit CSS separate from the redesign | One chosen Lesson 24 head; owner approval of redesign |
| Games | #960 Mariposas (41), #973 Completar (11), #974 Vaca (5), #979 Rima (6), #980 Palabras (7), merged #944 Chano | `juego.$gameId.tsx`, `gameContent.ts`, `taught-order.test.ts`, `CoreGames.tsx` shared by several | Game components themselves | Owner game corrections in issues #991-#995 (no Gretel mascot, owner images + motion spec) not yet reflected |
| Page-number diamond / overflow | issues #987-#990 (PRs #939, #937, #938, #933) | shared lesson CSS | per-lesson fixes | owner visual check |
| Artwork reconciliation | #751 (evidence only) | none | n/a | reuse as source map; no duplicate audit |
| Branch conflicts | L15/L16/L22/L23 branches conflict in `FaithfulPageRenderer.tsx`, lesson view, `lesson-fit.css` (7:00am read) | yes | the 8 other branches merge clean | integration order |

## Order of work to the 9:00 a.m. review
1. Owner approves the control-gate PR (this one) and the GitHub settings in `docs/EXECUTION_CONTROL.md`. Muse routes new assignments through the gate.
2. Merge candidates, one at a time, each with owner Yes on the exact head: the 5 small fixes verified earlier (all currently unmerged).
3. Choose one head per overlapping group above (pencil, landscape, Lesson 24, games). Do not start new competing implementations.
4. Lesson 3 owner visual approval, then roll out.
5. Welcome video, audio mapping, flip chart: no PR evidence found for these in the groups above. Status UNPROVEN until a PR with real proof exists.
6. Assembled review package: one list of PRs with exact head SHA, what changed, rendered proof, test counts, known defects, a Yes/No per PR.

## Complete only when
Every requirement in `PROJECT_FINISH_DEFINITION.md` has objective proof. Merged PRs, completed Jules sessions, a green build or an empty issue list do not prove it.
