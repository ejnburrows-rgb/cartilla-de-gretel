# Final demo action plan: five lanes

Agent = the next coding agent with repo, browser and test access, working on the **existing** PR #1321 / #877 (no new branches, controllers or duplicate assignments). Owner = Emilio. “Unknown” = no verified assignee in #877.

## Art
| Item | Source ref | Responsible | Depends on | Current evidence | Exact next action | Bucket |
|---|---|---|---|---|---|---|
| p.1 avión/escalera/uno/oreja/ojos, p.3 ocho/araña, p.4 uña, p.7 abeja/alas, p.11 abrigo: recrop or pad | 02 §A1 | Agent | — | `workbook-artwork-audit.json`, ART flags | Recrop from `public/cartilla/art/source/workbook/page-NNN.jpg` with padding, keeping the same file names, and show them on `/revision#art`. Ask the owner for an HD original only if the scan is too small | Agent can do now → owner approves |
| p.7 airplane | WB-007-14 | Agent → Owner | Owner yes | WORKBOOK-ARTWORK-COVERAGE.md | Show current / `pez.webp` / new crop side by side. If approved, swap the still **and** the `avion-alive.svg` motion mapping | Owner must approve |
| p.7 eyes (1 vs 2) | WB-007-17 | Agent → Owner | Owner yes | same | Show `ojo.png` / `leccion-1/ojos.webp` / new crop. Do not overwrite `approved/lesson-3/ojo.png` without a yes | Owner must approve |
| 12 shared picture files (igual, invierno, arco, espejo, mamá, papá, niño, torre, barril, Catalina, yema, zorro) | 02 §A2 | Agent | — | ART flags | Recrop the files only. **Do not add them to pages 4, 13 or 16** | Agent can do now |
| p.16 pez/traje/arco | 02 §A3 | Agent | — | Already placed | Regenerate the audit so it matches by caption; no page change | Agent can do now |
| 12 lesson crops + 112 Flip Chart layers without a confirmed source | 02 §B–C | Agent → Owner | Owner’s Nov 19 art folder | `production-art-classification-audit.json` | Compare with the HD sheets and mark PASS; ask the owner for originals only for real failures | Owner must provide (originals) |
| 3 stale motion files | 02 §D | Agent | — | `stale-motion-art.json` | Rebuild with `scripts/living-motion/` | Agent can do now |
| Payaso Chano art | 06 | Owner | — | none in repo | Supply the art, or keep the version without art | Owner must provide |

## Curriculum
| Item | Source | Exact next action | Bucket |
|---|---|---|---|
| Decision ledger says B | `public/review/owner-decisions-locked-b.json` | **Append** (do not rewrite history) two entries: `{"itemId":"student-page-curl","decision":"approve-a","comment":"Option A curl=a locked as sole production default (AGENTS.md §8a, #1316 f4ce72c2)","at":"2026-11-21T12:00:00.000Z","revision":"main"}` and the same for `"workbook-lesson-3"` (“Pages 7–9, contract pencil + curl A”). Set `"lockedDefault": "A"`. Keep the file name (`review-data.ts:173` links to it) | Agent can do now (needs the owner’s yes to commit, AGENTS §5) |
| `completar-palabras` answer keys | `completar-palabras.ts` | Owner supplies the keys | Owner must provide |
| Apple activity definition | none in source | Owner describes it, or drops it | Owner must provide |
| Pages 86–87 | — | Permanent exception. No action | — |

## Activities
| Item | Source | Exact next action | Bucket |
|---|---|---|---|
| Corner-drag gate | `NativeLessonViewer.tsx:418` | **No fix needed** (#1321 was wrong). Optional regression test (05) | Agent can do now |
| Cow + Chano upgrades | #1313/#1314, reverted in #1315 | Show the owner before/after recordings; re-apply only with a yes | Owner must approve |
| Stale draft PRs (#1298–#1304 Bolt/Jules, #1015, #1049, …) | open PRs | List them for the owner. Close only with a yes | Owner must approve |

## Audio / Tutor
| Item | Source | Exact next action | Bucket |
|---|---|---|---|
| Owner-recorded audio vs AGENTS §8 rule (“only `Gretel_558674_Original.m4a`”) | AGENTS.md §8 | Owner decides whether owner-supplied clips (#1058 and new recordings) may be wired | **Owner must approve: blocks all audio wiring** |
| 40 + 5 instruction clips | PR #1058 | Owner listens. If approved, rebase on main and verify page by page | Owner must approve |
| 168 ready clips + `home-hello` | 04 | Owner records them with the existing generator and delivers files using the exact file names | Owner must provide |
| 86 draft wording lines | 04 “Waiting” + rows 238–254 | Owner approves or edits the words | Owner must approve |
| Retry phrase (“Intentémoslo / Inténtalo / Vamos a intentarlo otra vez.”) | 03 §5 | Owner picks one | Owner must approve |
| 38 Flip Chart spoken names | 04 §1 | Owner confirms each name | Owner must approve |
| Wire Gretel feedback on the Workbook route | 05 Audio row | After the approvals above: fill `gretel-approved-clips.json`, play mapped clips in the `recorded-audio` provider, mount one listener on `-leccion-view.tsx` | Agent (after owner) |
| Unused `PageTurnSound.tsx` + `/audio/page-turn.mp3` stub | 05 | Remove (owner yes for deletion, AGENTS §4) | Agent can do now (with yes) |
| Tutor #1073 | draft | Stays frozen until the owner unfreezes it | Owner must approve |

## QA / Release
| Item | Exact next action | Bucket |
|---|---|---|
| Flip Chart 2.0 s (locked) vs 2.6 s (requested) | Owner chooses. 2.6 s needs an explicit unlock of §8a (05 Timing row) | Owner must approve |
| Motion proof | Continuous recordings at 390×844 and 1366×768 on `/cartilla/leccion/3` pp. 7–9 and `/cartilla/presentar/3`: tip alignment, single cursor, wrong → erase → retry, correct → save → one side turn ≈3.0 s with one rustle, Flip Chart top turn, corner drag on an incomplete page, reduced motion, mute | Requires testing later |
| Audio playback | Hear it on a phone and a laptop; one sound per turn; no overlap with Gretel | Requires testing later |
| Maestra suplente offline | Airplane-mode reload on a real phone | Requires testing later |
| Teacher Platform | Walk through every teacher route at both sizes | Requires testing later |
| Release | Any release needs the owner to say exactly “deploy it”; then verify live and record it in #877 | Requires testing later |

## Critical path to the demo
1. **Agent, now:** art recrops on `/revision#art` (A1/A2), audit regeneration, ledger append (after yes), stale motion rebuild, optional drag test, fold this package into #1321.
2. **Owner:** (a) allow or refuse owner-supplied audio under §8; (b) listen to #1058; (c) pick the p.7 airplane and eyes; (d) Flip Chart 2.0 vs 2.6 s; (e) retry phrase; (f) record 169 clips and approve 86 wordings; (g) Cow/Chano review, Apple definition, answer keys, Chano art.
3. **Test later:** everything in QA, then offer “A. Approve and publish — deploy it / B. Request changes”.
