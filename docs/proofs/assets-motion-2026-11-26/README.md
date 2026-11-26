# Assets, Games & Motion — evidence (`work/assets-motion`, draft PR #1326)

Captured with Playwright Chromium against `pnpm dev:worker` (demo mode, no real data), plus the
production preview https://cartilla-de-gretel-psi.vercel.app (main `3c559eea` / `5e1c837`) for
"before" captures. Recordings are silent browser recordings, not audio and not a physical device.

| Round | Tested head | Folder |
|---|---|---|
| 1 (first pass) | `65310d0` | this folder |
| 2 (owner "continue", items 1–5) | cow `d4f4cb8`, Chano `0b59012`, elephant `c925073` | `round2/` |

Correction to round 1: the elephant is on Flip Chart **sheet (lámina) 6**, shown in Lesson 4
(`/cartilla/presentar/4`), not "sheet 4".

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
- **Board game:** does not exist in main or in any branch. Marked missing; nothing was invented.

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
- Cow (13) and Butterfly Garden (9) browser suites pass.

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
| Butterfly Garden (protected) | `/cartilla/juego/mariposas-p` | phone, desktop + its own 9-test suite | Unchanged; own suite passes |

Fonética, Rima, Palabras por minuto, Dibujos, Sílabas and Completar have correct-move or mount evidence
only, not complete-round acceptance.

Cow bug: `cow-desktop-BEFORE-hidden.jpg` (walking cow hidden behind the herd) and
`cow-*-3-walking.jpg`, `cow-desktop-4-lean.jpg` (after: walks in front with its card, behind the fence).

Stale motion: `vocal-a-bee-old-motion-vs-current-still.jpg` (old vowel-A motion held the retired
yellowed scan), `motion-repaired.webm`, `motion-repaired-moving-parts.jpg` (red = pixels that change:
wings for the bees, trunk and ears for the elephant).
