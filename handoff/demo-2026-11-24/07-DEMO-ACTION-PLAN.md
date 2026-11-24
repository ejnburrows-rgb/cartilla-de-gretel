# Final demo action plan — five lanes

“Agent” = the next coding agent with repo + browser access. The owners of existing PRs are listed where #877 records them; otherwise “unknown”. No new branches, controllers or duplicate assignments.

## Art
| Item | Source ref | Owner of work | Depends on | Current evidence | Exact next action | Bucket |
|---|---|---|---|---|---|---|
| 25 flagged Workbook crops | `02-MISSING-ARTWORK.md` §A, `ARTWORK-ISSUES.csv` | Agent | — | `workbook-artwork-audit.json` | Recrop from `source/workbook/page-NNN.jpg`; show on `/revision#art` | Agent can do now |
| p.7 plane swap | WB-007-14 | Agent → owner | Owner yes | `WORKBOOK-ARTWORK-COVERAGE.md` | Show `pez.webp` beside the scan; owner approves | Owner must approve |
| p.7 two eyes | WB-007-17 | Agent → owner | Owner yes | same | Crop the two eyes from the scan; owner approves | Agent now, then owner |
| p.16 pez/traje/arco | WB-016-17..19 | Agent | Owner yes | NOT_INTEGRATED | Wire into `page-layouts.json` after approval | Agent now, then owner |
| 3 stale motion files | `stale-motion-art.json` | Agent | — | OWNER-VISUAL-STATUS | Rebuild with `scripts/living-motion/` | Agent can do now |
| 112 Flip Chart + 12 crop provenance | §B/§C | Agent → owner | Owner Nov 19 folder | `production-art-classification-audit.json` | Compare to HD sheets; mark PASS or request the original | Owner must provide (originals) |
| Payaso Chano art | GAMES-REVIEW.md | Owner | — | none in repo | Decide: supply art or keep the no-art version | Owner must provide |

## Curriculum
| Item | Source | Next action | Bucket |
|---|---|---|---|
| Decision ledger out of date (says B) | `public/review/owner-decisions-locked-b.json` | Add a new entry recording the Nov 20/21 “A” lock (append, do not overwrite history) | Agent can do now (needs yes to commit) |
| completar-palabras answer keys | `completar-palabras.ts` | Owner supplies the teacher answer keys | Owner must provide |
| Pages 86–87 | — | Permanent exception. No action | — |

## Activities
| Item | Source | Next action | Bucket |
|---|---|---|---|
| Corner-drag gate defect | `NativeLessonViewer.tsx` `handlePointerDown` | Add the completion check + test (see 05) | Agent can do now (needs yes) |
| Cow + Chano upgrades | #1313/#1314 reverted by #1315 | Show the owner both versions; re-apply only after approval | Owner must approve |
| Apple game | none | Owner says what the Apple activity is | Owner must provide |
| Stale draft PRs (#1015, #1049, #1010, #960…) | open PRs | Report as stale; close only with the owner’s yes | Owner must approve |

## Audio / Tutor
| Item | Source | Next action | Bucket |
|---|---|---|---|
| 40 + 5 instruction clips | PR #1058 | Owner listens, then reconcile the AGENTS §8 source rule, then rebase and verify | Owner must approve |
| 168 missing clips | `04-MISSING-RECORDINGS-ONLY.md` | Owner records with his own generator, delivers files by the names given | Owner must provide |
| 69 draft lines | 04, last table | Owner approves the wording | Owner must approve |
| Retry phrase | 03 §5 | Owner picks one wording | Owner must approve |
| Tutor #1073 | draft | Stays frozen until the owner unfreezes it | Owner must approve |

## QA / Release
| Item | Next action | Bucket |
|---|---|---|
| Motion runtime proof | Recordings at 390×844 / 1366×768 on `/cartilla/leccion/3`, `/cartilla/presentar/3` | Requires testing later |
| Audio playback | Listen on device; mute, one rustle per turn, no overlap | Requires testing later |
| Mobile touch/stylus | Physical phone + tablet | Requires testing later |
| Live revision check | Confirm production still serves `3c559eea`; any release needs “deploy it” | Requires testing later |

## Critical path
1. **Now (agent):** corner-drag fix PR, art recrops on `/revision#art`, motion rebuilds, ledger entry.
2. **Owner:** listen to #1058; record the 168 clips; approve the 69 wordings; Flip Chart 2.0 vs 2.6 s; Cow/Chano review; Nov 19 art folder.
3. **Test later:** all motion, audio, mobile and live checks above, then “A. Approve and publish — deploy it” / “B. Request changes”.
