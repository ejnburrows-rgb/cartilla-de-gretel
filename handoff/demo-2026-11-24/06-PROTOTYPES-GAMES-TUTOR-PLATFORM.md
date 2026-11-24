# Prototypes, games, Tutor and Teacher Platform — status from source and GitHub records

Labels: **DONE and live** only where #877 records a live check (Nov 21). Everything else is NOT TESTED in this session.

## Prototypes
| Item | Source | Current state | Evidence | Status |
|---|---|---|---|---|
| Workbook Lesson 3, pp. 7–9 A/B | Production `/cartilla/leccion/3` (`src/routes/cartilla/-leccion-view.tsx` → `NativeLessonViewer.tsx`); prototype route `/prototype/lesson-3-a` (`src/components/prototype/LessonThreePrototype.tsx`) | Option A (curl A + locked pencil) is the production default per AGENTS §8a. **Conflict:** `public/review/owner-decisions-locked-b.json` still says `"lockedDefault": "B"` and `workbook-lesson-3: approve-b … curl B`. The ledger was not updated after the Nov 20/21 “A” lock | #877 Nov 21: live 1366×768 + 390×844, 16/16 p.7 pictures, 0 errors | DONE and live (record); ledger out of date |
| Flip Chart A/B | `/cartilla/presentar/3`, `/cartilla/teacher/flipchart?lesson=3`; review-only `?flip=b&sheets=4,5,6,7` (`FlipchartHdPanel.tsx`) | A (2.0 s top spiral) locked “A for all” (Nov 20). The B review compares **4** sheets (4–7), not 3 | #877 Nov 21 live check of `/cartilla/presentar/3` | DONE and live (record) |
| Nov 14 isolated A/B pencil prototypes | Closed PR #1306 commits (`handoff/pencil-eraser-prototypes/`) | Replaced by the locked pencil (#1312/#1316/#1317). Do not integrate | Silent browser-frame videos (historical) | Superseded |

## Games (`src/content/games/*`, route `/cartilla/juego/$gameId`)
| Game | Source | State | Audio | Status / next |
|---|---|---|---|---|
| Mariposas / Butterfly (`mariposas-p`) | `core-games.ts`, `components/cartilla/games/ButterflyGarden.tsx` | Protected (AGENTS §8). Do not edit | Words papi/papá/pomo: papi missing | Live per OWNER-VISUAL-STATUS (11/12 games) |
| Cow (`cow-game-m`) | `cow-game.ts`, `CowGame.tsx`, `cow-game-audio-gaps.ts` | Premium upgrade #1313 merged, then **reverted** in #1315 for your visual review. Variants `?cow=free` / `?cow=guided`. Draft #1049 is stale | All 9 clips null (silent) | WAITING: your review of the reverted upgrade |
| Payaso Chano (`payaso-chano-ss`) | `payaso-chano-ss.ts`, `PayasoChano.tsx` | Upgrade #1314 merged, then **reverted** in #1315. No Chano art in `public/cartilla/art/payaso-chano/`. Draft #1015 is stale | 6 of 8 words missing | WAITING: review + art decision |
| Apple | — | **No Apple game exists in the source.** `manzana`/`pera` crops are in `_needs-recrop` | — | Missing: needs your definition before anyone builds it |
| vocal-a, fonetica-p, rima-p, palabras-minuto-p, dibujos-o, silabas-o/m/p | `core-games.ts`, `syllable-builder-pilot.ts` | Nov 17 premium styling (GAMES-REVIEW.md) | Instructions all silent; some words missing | Live per record; NOT TESTED here |
| completar-palabras | `completar-palabras.ts` | Answer keys `null` (“pendiente”) | Silent | WAITING: teacher answer keys from you |

## Offline Gretel Tutor — [PR #1073](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1073) (draft, open, head `305f176c`, frozen since Nov 4)
- Built (per `docs/tutor/REMAINING-WORK.md` on the branch): Lessons 1–3, on-device speech recognition (Vosk), offline pack with hash checks, 43 approved word-model lines, 77 pending lines that stay silent, layout at 4 sizes.
- Missing: 77 recordings (65 still need your wording OK), approved character layers, physical-device speech/offline tests, your decision on retention/contact rules before any real student uses it.
- **Status: WAITING.** Do not change Tutor files outside the Tutor owner’s scope.

## Teacher Platform — `src/routes/cartilla/teacher/*`
- Routes exist: lecciones, flipchart, guia (24 lesson guides in `src/content/guia/`), roster, CRM/student reports, progreso, reportes, recursos, admin, gretel, ayuda. Demo/seed data only.
- No Gretel voice lines are used here.
- **Status: NOT TESTED** (no live teacher-route recording in #877 since Nov 4). Real student data stays unauthorized.

## Missing audio coverage (summary — full lists in 03/04)
- Workbook instructions: 109/109 regions covered by owner recordings **in unmerged #1058** (need your listening approval, plus reconciling the AGENTS §8 source rule).
- Picture words: 161 approved; 38 Flip Chart names missing.
- Games: 40 instruction clips + 28 word/syllable clips missing.
- Feedback 19, cinematics 31, Tutor 77: all missing.
