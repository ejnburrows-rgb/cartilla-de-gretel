# Prototypes, games, Tutor and Teacher Platform: status from source and GitHub records

Labels follow AGENTS.md. **DONE and live** is used only where #877 records a live check (Nov 21, `3c559eea`). Nothing was run in this session.

## Prototypes
| Item | Source | State in source | Evidence | Status |
|---|---|---|---|---|
| Student Workbook Lesson 3, pp. 7–9 (A/B) | Production [`/cartilla/leccion/3`](https://cartilla-de-gretel-psi.vercel.app/cartilla/leccion/3) → [`-leccion-view.tsx`](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/src/routes/cartilla/-leccion-view.tsx) → [`NativeLessonViewer.tsx`](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/src/components/StudentBook/NativeLessonViewer.tsx). Review route `/prototype/lesson-3-a` ([`LessonThreePrototype.tsx`](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/src/components/prototype/LessonThreePrototype.tsx)) | Option A selected (curl A + locked pencil and eraser). Full 4×4 p.7 (#1318). | #877 Nov 21: live at 1366×768 and 390×844, 16/16 pictures, 0 errors | **DONE and live** (layout, pencil, default). Turn timing, audio and the corner drag are **NOT TESTED**. Decision ledger is out of date (still says B) |
| p.7 artwork fidelity | `page-layouts.json` p.7 | The airplane is a different drawing from the printed page. The eyes show 1 instead of 2. The bee is opaque and touches its edges. | 02 §A1 | **WAITING**: owner picks the replacement pictures |
| Teacher Flip Chart A/B | [`/cartilla/presentar/3`](https://cartilla-de-gretel-psi.vercel.app/cartilla/presentar/3), `/cartilla/teacher/flipchart?lesson=3`. Review only: `?flip=b&sheets=4,5,6,7` ([`FlipchartHdPanel.tsx`](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/src/components/cartilla/FlipchartHdPanel.tsx)) | Candidate A (2.0 s top spiral) locked “A for all” on Nov 20. The B review compares **4** sheets (4–7), not 3. Lesson 3 has only one mapped sheet (5) | #877 Nov 21 live check | **DONE and live** (A default). **WAITING**: owner decision on 2.0 s vs 2.6 s |
| Nov 14 isolated pencil/eraser prototypes | Closed #1306 (`handoff/pencil-eraser-prototypes/`) | Replaced by the locked pencil (#1312/#1316/#1317) | — | Retired. Do not reuse |

## Games (`src/content/games/*`, route `/cartilla/juego/$gameId`)
| Game | Source | State | Audio | Status / next |
|---|---|---|---|---|
| Mariposas / Butterfly (`mariposas-p`) | `core-games.ts`, [`ButterflyGarden.tsx`](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/src/components/cartilla/games/ButterflyGarden.tsx) | Protected (AGENTS §8). Do not edit | Words pomo/Pepe/puma exist; the instruction is silent | **DONE and live** per OWNER-VISUAL-STATUS (11/12 games) |
| Cow (`cow-game-m`) | `cow-game.ts`, [`CowGame.tsx`](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/src/components/cartilla/games/CowGame.tsx), `cow-game-audio-gaps.ts` | Upgrade #1313 was merged, then **reverted** in #1315 so you can review it. Review handoff: `docs/review-2026-11-16/COW-GAME-HANDOFF.md` | Gretel clips are silent; the “wrong” clip is a moo sound effect | **WAITING**: you approve or reject the reverted upgrade |
| Payaso Chano (`payaso-chano-ss`) | `payaso-chano-ss.ts`, [`PayasoChano.tsx`](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/main/src/components/cartilla/games/PayasoChano.tsx) | Upgrade #1314 was merged, then reverted in #1315. **No Chano character art** exists in the repo | Words partly missing (04 §2) | **WAITING**: upgrade review and an art decision |
| Apple / “Reto de la Manzana” | — | **Not found anywhere in source.** `manzana.webp` exists only as a picture (02 §B) | — | **WAITING**: you need to say what this activity is. No one may make it up |
| vocal-a, fonetica-p, rima-p, palabras-minuto-p, dibujos-o, silabas-o/m/p | `core-games.ts`, `syllable-builder-pilot.ts` | Nov 17 premium styling (`docs/review-2026-11-17/GAMES-REVIEW.md`) | Instructions silent; on-screen Gretel lines are text only | **DONE and live** per record. Audio missing (04 §2–3) |
| completar-palabras | `completar-palabras.ts` | Answer keys are `null` (“pendiente”) | Silent | **WAITING**: you supply the teacher answer keys |

## Offline Gretel Tutor
| Piece | Source | State | Status |
|---|---|---|---|
| **Maestra suplente** (offline substitute teacher, 24 lessons) | Merged [#1295](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1295) → `/cartilla/suplente`, `src/lib/offline-substitute-teacher.ts` | Touch activities built only from canonical lesson words, local resume, Workbook completion gate, local-only anonymous summary. **No voice and no speech recognition** (`NOT_CONFIGURED`). PR proof: typecheck, 6/6 Vitest, 2/2 Playwright at 390/320/1366 px. Full offline-after-restart check was pending | **DONE but not live-verified.** No #877 live check of `/cartilla/suplente` was found. **NOT TESTED** offline |
| **Voice Tutor (Lessons 1–3)** | [PR #1073](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1073), draft, head `305f176c`, frozen since Nov 4 | On-device speech recognition, offline pack, 43 approved word lines, 77 pending lines (03 §6) | **WAITING**: 77 recordings (65 need your wording OK), character layers, device tests, your rules for keeping data. AGENTS §8: do not touch the #1073 files |

## Teacher Platform: `src/routes/cartilla/teacher/*`
Routes present: `index`, `lecciones`, `flipchart`, `guia` / `guia.$n` (24 guides in `src/content/guia/`), `guide`, `paginas.$n`, `roster`, `crm.*` (class/student/lesson/report, artwork), `progreso`, `reportes`, `recursos`, `admin`, `gretel`, `ayuda`. They use demo or local data only. No Gretel voice lines. **Status: NOT TESTED** (no live teacher-route proof in #877 since Nov 4, except the Flip Chart). Real student data is still not authorized (AGENTS §7).

## Audio coverage (full lists in 03/04)
- Workbook instructions: 109/109 covered by owner clips **only in unmerged #1058**. They need you to listen and approve, plus a decision on the AGENTS §8 source rule.
- Picture words: 161 recorded. 38 Flip Chart names are missing, and you must confirm the spoken name for each.
- Games: 40 instruction clips and 28 word/syllable clips missing.
- Feedback 19, cinematics 31, Tutor 77, new supplement 18 (17 need wording approval first).
- **There is no Gretel feedback voice on the Workbook route at all** (05, Audio row).
