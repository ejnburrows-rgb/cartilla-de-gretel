# Assets, Games & Motion — evidence (`work/assets-motion`, draft PR #1326)

Captured with Playwright Chromium against `pnpm dev:worker` (demo mode, no real data), plus the
production preview https://cartilla-de-gretel-psi.vercel.app (main `3c559eea` / `5e1c837`) for
"before" captures. Recordings are silent browser recordings, not audio and not a physical device.

| Round | Tested head | Folder |
|---|---|---|
| 1 (first pass) | `65310d0` | this folder |
| 2 (owner "continue", items 1–5) | cow `d4f4cb8`, Chano `0b59012`, elephant `c925073` | `round2/` |
| 3 (complete rounds of every game) | `1471c828` | `round3-1471c828/` |
| **4 (Chano touch drag / wrong / clear / restart / reduced motion, cow measurements, raw test output)** | **`64c3c312`** | **`round4-64c3c312/`** |

Each round's evidence was executed at the head named in its row. Commits that only add proof files
do not re-test anything; a later head does not inherit earlier recordings. App code changed after
`1471c828` only in `31a4c615` (Chano: one line in the ball press handler, below), so round 3 still
covers the other games, whose files have not changed since.

Correction to round 1: the elephant is on Flip Chart **sheet (lámina) 6**, shown in Lesson 4
(`/cartilla/presentar/4`), not "sheet 4".

---

## Round 4 at `64c3c312`

### Chano complete rounds (owner #1015: words 2–5, touch drag)

Script: `scripts/chano-full-rounds.mjs` (fixed paths, records the head it ran at). Raw results:
`round4-64c3c312/chano-full-rounds.json`. Recordings `chano-full-{phone,phone-land,desktop,phone-reduced,desktop-reduced}.webm`.

Every run goes through the five book words in order and checks each step:

| Step | What happens | Checked |
|---|---|---|
| mima | **drag** "mi" into slot 1 (real touch events on phone, mouse on desktop), tap "ma" | slot 1 = mi after the drag; both balls `on-board`; "¡Muy bien!" |
| mamá | **wrong** first: me + mi → "Intenta otra vez." → clears after 1.1 s, balls back in the juggle; then ma + ma | "¡Muy bien!" |
| Meme | tap "mu", **Borrar** → both slots empty, ball back in the juggle; then me + me | "¡Muy bien!" |
| Mumi | **drag** "mi" into slot 2, tap "mu" (fills slot 1) | slots = mu, mi; "¡Muy bien!" |
| mami | ma + mu, **tap slot 2 to take "mu" off**, then "mi" | "¡Muy bien!" |
| end | Siguiente | "¡Terminaste!", "5 de 5 aciertos" |
| **restart** | Siguiente again | "Palabra 1 de 5", both slots empty, all balls juggling |

5 balls on screen at every check. Results:

| Run | Input | Motion | Juggle moving | Result |
|---|---|---|---|---|
| phone 390×844 | touch | normal | yes | pass |
| phone landscape 844×390 | touch | normal | yes | pass |
| desktop 1366×768 | mouse | normal | yes | pass |
| phone 390×844 | touch | **reduced** | no (painted positions) | pass |
| desktop 1366×768 | mouse | **reduced** | no | pass |

**Bug found and fixed (`31a4c615`).** The first run failed on phone: after a touch drag, the next
tap on any ball did nothing. A touch drag ends without a click, so the "skip the click that follows
a drag" flag stayed set and swallowed the child's next tap. Mouse drags were not affected. The flag
now resets on every new press. Regression test: `tests/e2e/chano-touch-drag.spec.ts` (real touch
events, then a tap). This bug was already in the recovered #1015 code. The failing first run is not
kept as a file; this paragraph is its record.

### Cow measurements and raw test output

- `scripts/cow-measure.mjs` measures every cow's drawn box at 7 screen sizes on this branch and on
  production, and the input lock. Raw: `round4-64c3c312/cow-measure.json`; screenshots `cow-*.jpg`.
  - Drawing: 453×518 = 0.875 wide-to-tall.
  - Production: all 5 cows 16.4–19.7% too wide (1.018 desktop/tablet/projector/ultrawide and phone
    landscape, 1.046–1.047 portrait phone/tablet).
  - Branch: all 5 cows 0.870, within 0.5% of the drawing at every size (the gap is the breathing loop).
  - Lock: production 4.74 s correct / 4.16 s wrong; branch 3.15 s / 2.53 s.
- `round4-64c3c312/e2e-raw-output.txt`: raw Playwright output at `64c3c312`. 20 passed: the 13 cow
  tests (visibility 2, full rounds and resets 5, hub 2, variants 4), the Chano touch-drag test, and
  Butterfly Garden's 6 tests.

### Still product questions (not technical blockers)

- **Repeated syllable ("mamá", "Meme").** With one physical ball per syllable the second slot shows
  chalk writing (`chano-phone-2-mama-repeat-syllable.jpg`). That is a presentation choice for the
  owner, not proof that the "two balls" wording is met.
- **Landscape.** The full-height layout with the softened scene beside it is a **candidate**. It is not
  proof that the owner's edge-to-edge reference is matched. Sources inspected for a landscape
  composition: the 14 recovered scene files (both scenes are 1086×1448 portrait), every remote Chano
  branch (`feature/payaso-chano-carnival-*`, `fix/payaso-chano-verified-followup-*`,
  `rescue-chano-proof-*`, `docs/chano-proof-pack-*`, `game/chano-scene-*`; their other scene files are
  older standalone HTML builds or the same portrait scene), and the owner reference
  `docs/reference/chano-owner-spec-2026-10-19.png` on `activity/chano-rebuild-20261019` (400×850,
  portrait). No approved landscape source was found. This is a record of what was checked, not a
  request for new art.

---

## Round 3: complete rounds of every game at `1471c828`

Round 1 and 2 recordings were made at earlier heads and do not test the current cow geometry or
the Chano catch. Round 3 replays everything at the exact head the PR now carries. One script,
one run per game and screen size, raw results in `round3-1471c828/full-rounds-*.json`. No page
errors and no sideways scroll in any run.

| Game | Screens | Complete round at `1471c828` | Recording |
|---|---|---|---|
| Cow | phone, tablet, desktop, ultrawide | 1 wrong try, then 5/5 placed, "Juego completado", 5 cards on the fence, "Jugar otra vez" resets | `cow-phone.webm`, `cow-ultrawide.webm` |
| Payaso Chano | phone (touch), phone landscape (touch), desktop | All 5 words (mima, mamá, Meme, Mumi, mami): every picked ball caught and landed `on-board`, "¡Muy bien!" each time, 5 balls throughout, ends "¡Terminaste!" | `chano-phone.webm`, `chano-phone-land.webm`, `chano-desktop.webm` |
| Vocal A | phone, desktop | phone 5/5 all green; desktop "oso" answered wrongly on purpose → red, "4 de 5 correctas"; "Repetir" resets | `vocal-a-desktop.webm` |
| Fonética P | phone, desktop | 1 wrong try, then papi, papá, pomo → "3 de 3 palabras completadas" | `fonetica-p-phone.webm` |
| Rima P | phone, desktop | 1 wrong try, then papi→Pepi, Pipo→mapo → "2 de 2 rimas encontradas" | `rima-p-phone.webm` |
| Palabras por minuto | phone, desktop | Timer started, all 18 words read in order, "Terminé la lista" → "Leíste 18 palabras." | `palabras-minuto-p-phone.webm` |
| Dibujos O | phone, desktop | 1 wrong try, then oso, ola, oveja → "3 de 3 dibujos correctos" | `dibujos-o-phone.webm` |
| Sílabas O / M / P | phone, desktop | Every word built and checked "¡Muy bien!" (o·so, o·la, o·ve·ja; ma·má, mo·no; pa·pá, so·pa), then "Terminar" | `silabas-o-phone.webm`, `silabas-m-desktop.webm`, `silabas-p-desktop.webm` |
| Completar palabras | phone, desktop | **Cannot be completed:** the answers are not in the teacher file yet, so all 15 blanks show "pendiente" by design. Nothing invented. | screenshots |
| Butterfly Garden | — | Protected, not touched; its own 6 browser tests pass (raw output in `round4-64c3c312/`) | — |
| Piano Hablador | — | **NOT TESTED** (needs a microphone) | — |
| Board game | — | **Missing in the sources inspected** (current main source and the names of all remote branches); not a repository-wide content or history inventory | — |

**First-pass timeouts kept on record.** In the first pass, Fonética (phone, desktop), Rima (phone,
desktop) and Dibujos (phone) timed out (`*-first-pass-script-timeout.jpg`,
`full-rounds-first-pass.json`). Cause: my script. Each of these games shows its "try again" message
for 0.65 s and ignores taps while it shows; the script tapped the right answer inside that window.
The rerun waits for the message to clear and all five pass (`full-rounds-rerun-fonetica-rima-dibujos.json`).
The earlier Vocal A timeouts are kept the same way in `results.json` (round 1) with corrected reruns
in `round2/` and here.

**Findings for the owner (not changed here):**
- Sílabas O/M/P: after "Terminar" the game records the completion and goes straight back to word 1,
  with no "you finished" screen.
- Fonética, Rima, Dibujos: a tap during the 0.65 s "try again" message is silently ignored.

**Elephant, Flip Chart sheet 6 through the real presenter (`/cartilla/presentar/4`) at `1471c828`**
(`round3-1471c828/elephant-results.json`, `elephant-sheet6-*.jpg`):

| Screen | Motion | Picture served | Frames change |
|---|---|---|---|
| phone 390×844 | normal | `p006-elefante-alive.svg` | yes |
| phone 390×844 | reduced | `p006-elefante.png` | no |
| projector 1920×1080 | normal | `p006-elefante-alive.svg` | yes |
| projector 1920×1080 | reduced | `p006-elefante.png` | no |

Only `p006-elefante` changed; the other six sheet-6 entries still carry `"motionDisabled": true`
(checked in `src/data/flipchart-native-assets.json`: 6 held, elephant released).

---

## Round 2

### 1. Cow game: true proportions, no seams, shorter lock

The cow layers are 453×518 cuts of the owner drawing (0.875 wide-to-tall). The mockup boxes were
210×205 (landscape) and 200×190 (portrait), so every cow was drawn 17% / 20% too wide. The fix keeps
each box's height and centre and takes the width from the drawing. **No art file changed.**

| Size | Production (before) wide-to-tall | Branch (after) |
|---|---|---|
| phone 390×844 | 1.045 | 0.868 |
| phone landscape 844×390 | 1.018 | 0.868 |
| tablet 1024×768 | 1.019 | 0.868 |
| tablet portrait 768×1024 | 1.047 | 0.868 |
| desktop 1366×768 | 1.018 | 0.868 |
| projector 1920×1080 | 1.018 | 0.868 |
| ultrawide 2560×1080 | 1.018 | 0.868 |

(0.868 vs 0.875 is the cow's breathing animation and pixel rounding.)

Seams: on wide screens production tiled two extra copies of the scene beside the stage, which left
hard joins and duplicated, empty fence slots at both edges. The branch shows one softened copy of
the same scene behind the stage instead. Captures: `round2/cow-{phone,phone-land,tablet,desktop,ultrawide}-before-production.jpg`
and `…-after.jpg`.

Input lock (time from tapping a slot until the next cow can be chosen), measured in the browser:

| | Production | Branch |
|---|---|---|
| Correct move | 4.76 s | 3.13 s |
| Wrong move | 4.13 s | 2.53 s |

The lock was walk out 1.6 s + lean 0.6 s + drop 0.9 s + walk home 1.6 s. The walk home no longer
blocks: the cow returns on its own while the child picks the next one. Shortening further would mean
speeding up the walk, lean or drop animations themselves; that is a feel decision, not a safety one,
so it was left as is. All 13 cow browser tests pass (wrong try, full round, completion, replay,
reset during every phase, guided and free variants, phone and desktop).

### 2. Payaso Chano: exact-ball catch and edge-to-edge landscape

Owner notes on #1015 (2026-10-20): Chano catches *that* ball from the juggle and places it in the next
slot where it stays; the others keep juggling; no copies or teleporting; and landscape fills the
screen instead of a centred card on blue.

- **Catch:** the picked ball glows and keeps juggling until it next rests in one of Chano's hands, then
  arcs onto the next empty slot and stays. Clearing a slot, a wrong answer or "Siguiente" tosses the
  same ball back into the juggle.
- Browser check on phone and phone landscape (`round2/chano-catch-results.json`): each picked ball
  went `chosen → placing → on-board`, landed inside the right slot, there were always exactly 5
  balls, the 3 unpicked balls kept moving, the 2 placed balls stayed put, and after "Siguiente"
  both were `tossing` then `juggling`. Tap to landing: about 1.0–2.8 s, depending on where the ball is
  in the juggle.
- **Repeated syllable ("mamá", "Meme"):** one ball per syllable, so the first slot gets the ball and
  the second shows chalk writing. No copy is made. (Owner decision listed below.)
- **Landscape:** the approved portrait scene keeps its proportions at full height, the four buttons
  stand in a column beside it, and the same scene softened fills the rest of the screen. At 844×390
  the scene is 284×378 (was 237×316 inside a blue frame). Portrait keeps the reference layout.
  This landscape layout is a candidate; see round 4 for what was checked.
- Captures: `round2/chano-phone-land-{before,after}.jpg`, `round2/chano-desktop-{before,after}.jpg`,
  `round2/chano-catch-*.jpg`. Recordings of two full words each: `round2/chano-catch-phone.webm`,
  `round2/chano-catch-phone-land.webm`.
- Unit tests: `src/components/cartilla/games/chano/__tests__/catch.test.ts` (catch timing, no jump at
  the catch, stays on the slot, others keep their path, toss back, one ball per syllable).

### 3. Vocal A: the two timeouts

Cause: the round-1 evidence script, not the game. It waited for a success message ("¡Correcto!",
"¡Muy bien!"). Vocal A shows no per-answer message: each picture card turns green or red, and
"N de 5 correctas" appears at the end. The repository's own Vocal A test (`all-games.spec.ts`) checks
the green card and passed on main and on this branch. No game change.

Corrected full rounds (`round2/vocal-a-results.json`, `round2/vocal-a-desktop.webm`,
`round2/vocal-a-phone-complete.jpg`):

- phone: all 5 answered correctly, all green, "5 de 5 correctas", "Repetir" resets.
- desktop: "oso" answered wrongly on purpose, turns red, the rest green, "4 de 5 correctas", reset works.

### 4. Elephant motion switch

Handoff landed in the Images lane's draft #1327 (`work/images` `65d3361e`,
`docs/proofs/image-inspection-2026-11-26/HANDOFF-assets-motion.md`). It confirms the rebuilt motion is
pixel-identical to the approved still with motion off and only head, ears and trunk move, and hands
the one-line switch to #1326 so the file keeps one writer.

- **Flag owner:** this lane (Assets, Games & Motion, #1326) for the `p006-elefante.png` entry in
  `src/data/flipchart-native-assets.json`, by that handoff. The other six sheet-6 holds stay as they
  are; Images keeps provenance review.
- Done in `c925073`. Rebuilding the motion file in that commit produced byte-identical output.
- Lesson 4 Flip Chart (`round2/elephant-results.json`): phone and projector play
  `p006-elefante-alive.svg` and successive frames differ (`round2/elephant-projector-4-frames.jpg`);
  reduced motion shows the still `p006-elefante.png` with no change between frames.
- `flipchart-vowel-motion.spec.ts` sheet-4 route now passes on projector and laptop (failed on main).

### 5. Not tested / missing

- **Piano Hablador:** microphone rounds are **NOT TESTED**. They need a real microphone; this
  environment has none. Its 3 microphone browser tests fail the same way on main (audio lane).
- **Board game:** not found in current main source or in any remote branch name. That is a bounded check, not a full content or history inventory (Gitar's inventory is still needed for a repository-wide claim). Nothing was invented.

---

## Checks on head `c925073`

- Typecheck, `verify:worker`, `verify:policy`: pass. Unit tests: 246 files, 2,336 tests pass (2 expected failures), run in two shards.
- Browser tests, same six spec files that fail on main (`round2/e2e-failures-main-5e1c837.txt` vs
  `round2/e2e-failures-branch-c925073.txt`): **24 failures on main, 22 on this branch, 2 fixed
  (Flip Chart sheet 6 elephant, laptop and projector), 0 new.** The 22 that remain fail the same way on main:
  - 2 Mariposas tests and the game-hub count (expects 12 games, finds 14): stale tests for screens
    that changed on main; Mariposas is protected and was not touched.
  - 3 Piano Hablador microphone tests: audio lane.
  - 15 Workbook/Flip Chart vowel-motion "stays still" checks + 1 Lesson 1 discipline check: these
    conflict with the shimmer added to still pictures on 2 Nov (`8280dc6c`). Left unchanged by
    coordinator instruction until dated owner authority is reconciled.
- Cow (13) and Butterfly Garden (6) browser suites pass (an earlier draft said 9 for Butterfly Garden; the suite has 6 tests).

---

## Round 1 (head `65310d0`)

| Game | Route | Screens | Result |
|---|---|---|---|
| Cow (vacas) | `/cartilla/juego/cow-game-m` | phone 390×844, tablet 1024×768, desktop 1366×768, projector 1920×1080 | One wrong try, then 5/5 placed, completion dialog. No page errors, no sideways scroll. Recordings: `cow-phone.webm`, `cow-desktop.webm` |
| Payaso Chano (recovered #1015 + #1045) | `/cartilla/juego/payaso-chano-ss` | phone, desktop, projector | All 5 words built and checked, ends "¡Terminaste!". Recording: `chano-phone.webm` |
| Vocal A | `/cartilla/juego/vocal-a` | phone, desktop | Round 1 script timed out (wrong success check); see round 2 item 3 |
| Fonética P | `/cartilla/juego/fonetica-p` | phone, desktop | Correct move only: "¡Correcto!" |
| Rima P | `/cartilla/juego/rima-p` | phone, desktop | Correct move only: "¡Riman!" |
| Palabras por minuto | `/cartilla/juego/palabras-minuto-p` | phone, desktop | Timer starts |
| Dibujos O | `/cartilla/juego/dibujos-o` | phone, desktop | Correct move only: "¡Ese es el dibujo!" |
| Sílabas O/P/M, Completar palabras | `/cartilla/juego/…` | phone, desktop | Mount without errors (Completar answers still `pendiente`, waiting for teacher mappings) |
| Butterfly Garden (protected) | `/cartilla/juego/mariposas-p` | phone, desktop + its own 6-test suite | Unchanged; own suite passes |

Fonética, Rima, Palabras por minuto, Dibujos, Sílabas and Completar have correct-move or mount evidence
only, not complete-round acceptance.

Cow bug: `cow-desktop-BEFORE-hidden.jpg` (walking cow hidden behind the herd) and
`cow-*-3-walking.jpg`, `cow-desktop-4-lean.jpg` (after: walks in front with its card, behind the fence).

Stale motion: `vocal-a-bee-old-motion-vs-current-still.jpg` (old vowel-A motion held the retired
yellowed scan), `motion-repaired.webm`, `motion-repaired-moving-parts.jpg` (red = pixels that change:
wings for the bees, trunk and ears for the elephant).
