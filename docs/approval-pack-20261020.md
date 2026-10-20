# Owner Visual Approval Pack

This document outlines the current state of candidates awaiting visual review.

## Chano: rainbow juggle with his own five painted balls (draft, owner order 2026-10-20)
**Status:** ❌ NOT READY

**Missing:** Required real UI/browser proof is absent (missing screenshot), Missing video for motion changes, Missing side-by-side comparison for artwork claims

### Description
Owner order 2026-10-20 (EJN, Notion chat) — supersedes the  / 3-ball / no-arm-motion parts of . Owner chose the **rainbow** pattern after the geometry check showed a two-way crisscross makes balls overlap beside the hands at painted size.
Stacked on draft  (``). **DRAFT — do not merge without the owner's explicit yes.** Replaces the approach in  (which added new balls on top of the frozen painted ones).
## What changed
1. **His own five painted balls** (ma, mi, mo, mu, me) are cut out of the approved scene (`juggle-ball-*.svg`). The background (`scene-juggle-bg.svg`) is the original scene with pixels changed **only under those five balls** (reassembled scene vs original: mean difference 0.2/255).
2. **Rainbow arc**: left hand → the painted arch over the hat → right hand; the right hand passes it back low, in front of the chest, below the chin. Never across the face (unit-tested against face and hat boxes).
3. **Hands catch and throw**: each arm dips on the catch and lifts on the throw, driven by the same clock as the balls.
4. **Rest + spacing**: every ball rests 408 ms in a hand before each throw; balls are one beat apart; minimum distance between any two balls is larger than a ball (tested).
5. **Calm, one rhythm, plain styling**: 680 ms beat, 3.4 s loop; one requestAnimationFrame clock writing transforms; breathing on the same clock. No new library.
6. **Reduced motion**: no clock runs; every layer stays in the original painted position.
Gameplay (hear → drag/tap ball → board → check) untouched.
## Proof (local dev build, this exact commit)
- Phone-size recording (iPhone 13 viewport, 19 s) — continuous juggling; shared with owner in Notion chat.
- Smoothness: 60 fps, 0 frames over 34 ms at CPU slowdown ×1, ×4 and ×6.
- Reduced-motion: all five juggle balls at painted positions across six samples.
- Drag `ma` to slot 1 and tap `mi` both fill the board.
- `juggle.test.ts` 6/6 pass; typecheck and eslint clean. Full suite: 1898 pass, 1 fail (`production-art-audit.test.ts`) — fails identically on base ``, not caused by this change.
Still needed: the owner's recording on a real phone.

---

## feat: implement chano juggling physics
**Status:** ❌ NOT READY

**Missing:** Stale proof (head moved since verification)

### Description
Implements the requested juggling physics per the specification (issue #1027). Uses GSAP for 4-ball cascade management, handles juggling logic independently in juggle.ts, and adds required data-testids for the sibling tests lane.

The hand cap generation that caused a failure locally with art audits has been retained as part of the commit, but will need to be aligned with the separate hand cap lane (#1030).

---
*PR created automatically by Jules for task [16811216930405402616](https://jules.google.com/task/16811216930405402616) started by @ejnburrows-rgb*

---

## DRAFT: L16 page-number diamond proofs (issue #988)
**Status:** ❌ NOT READY

**Missing:** Required real UI/browser proof is absent (missing screenshot)

### Description
Draft proof publication for : OOFS-988.md + 390px phone renders of Lesson 16 pages 55/56 showing the page-number diamond clear of the page edge. Applied from the completed proof lane changeSet. Draft only - no merge.

---

## Fix: explicit overflow-y on SimplePageViewer outer container (issue #1020)
**Status:** ❌ NOT READY

**Missing:** Required real UI/browser proof is absent (missing screenshot)

### Description
Controller-published deliverable from Jules session  ( recovery).
Scope: `only — adds explicit `overflow-y-auto` to the outer container plus a short comment referencing the documented root cause (stray native scrollbar fighting `.faithful-page` aspect-ratio sizing).
Verified this run: patch base matches main  typecheck passes; published file on  to contain the fix.
Draft. Do NOT merge without owner approval.

---

## Draft: source-faithful Workbook Lessons 8–18
**Status:** ✅ READY

### Description
All 44 native Workbook pages (23–66) are built on the requested  base, using the existing shared page and interaction components. Restores source geometry, printed models, exact canonical text/order, reading columns and stories, circle word positions, completion grids and sentence ruling. No subject pictures, new buttons, stars or points.
Runtime source:
Last executed checks before environment disconnect: 211 focused tests in 15 files, typecheck and worker build passed; all 44 phone routes captured; earlier 20 real-browser checks passed, including touch on every circle/completion page and typed/freehand persistence.
**Blocked verification:** the latest faded-frame ink correction, including page 41’s sight word, is saved but has not been rerun. The execution service returned 409 environment_offline. Final screenshots/package are not complete. Older committed comparisons are not proof of this runtime source.
[Current REAL / NOT REAL evidence and concrete continuation](
Draft only. No merge, main commit or deployment.

### Visual Proof
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/draft/lane-b-workbook-lessons-8-18/docs/proofs/lane-b-2026-10-20/comparisons/lesson-08.jpg?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/draft/lane-b-workbook-lessons-8-18/docs/proofs/lane-b-2026-10-20/comparisons/lesson-09.jpg?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/draft/lane-b-workbook-lessons-8-18/docs/proofs/lane-b-2026-10-20/comparisons/lesson-10.jpg?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/draft/lane-b-workbook-lessons-8-18/docs/proofs/lane-b-2026-10-20/comparisons/lesson-11.jpg?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/draft/lane-b-workbook-lessons-8-18/docs/proofs/lane-b-2026-10-20/comparisons/lesson-12.jpg?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/draft/lane-b-workbook-lessons-8-18/docs/proofs/lane-b-2026-10-20/comparisons/lesson-13.jpg?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/draft/lane-b-workbook-lessons-8-18/docs/proofs/lane-b-2026-10-20/comparisons/lesson-14.jpg?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/draft/lane-b-workbook-lessons-8-18/docs/proofs/lane-b-2026-10-20/comparisons/lesson-15.jpg?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/draft/lane-b-workbook-lessons-8-18/docs/proofs/lane-b-2026-10-20/comparisons/lesson-16.jpg?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/draft/lane-b-workbook-lessons-8-18/docs/proofs/lane-b-2026-10-20/comparisons/lesson-17.jpg?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/draft/lane-b-workbook-lessons-8-18/docs/proofs/lane-b-2026-10-20/comparisons/lesson-18.jpg?raw=true)

---

## DRAFT: L17 page-number diamond fix ported to main + proofs
**Status:** ❌ NOT READY

**Missing:** Missing side-by-side comparison for artwork claims

### Description
Fixes .
Lesson 17 page-number diamond fix, ported to the current main page DOM
(the earlier fix in  targeted a DOM that no longer exists on main and
was verified a no-op there).
What this  contains:
- `7-line media query moving the page-number
  badges inward (11%) on pages 59-62 at phone widths so they clear the
  corner peel.
- `tests/e2e/l17-diamond-check.spec.ts`: Playwright check that re-shoots
  the proofs.
- `16 before/after screenshots
  (pages 59-62, 390x844 portrait + 844x390 landscape).
Artwork untouched. Draft - awaiting owner visual approval before merge.

### Visual Proof
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/after-390x844-page-59.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/after-390x844-page-60.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/after-390x844-page-61.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/after-390x844-page-62.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/after-844x390-page-59.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/after-844x390-page-60.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/after-844x390-page-61.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/after-844x390-page-62.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/before-390x844-page-59.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/before-390x844-page-60.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/before-390x844-page-61.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/before-390x844-page-62.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/before-844x390-page-59.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/before-844x390-page-60.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/before-844x390-page-61.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/jules/l17-diamond-port-20261020/docs/proofs/l17-diamond-2026-10-20/before-844x390-page-62.png?raw=true)

---

## Payaso Chano: full-screen scene (draft)
**Status:** ❌ NOT READY

**Missing:** Required real UI/browser proof is absent (missing screenshot), Missing video for motion changes, Missing side-by-side comparison for artwork claims

### Description
Draft. Do not merge.
Refs .
## What this does
- New full-screen Payaso Chano screen built on the owner-supplied scene art: Chano in the center, flower frame, Instrucciones panel (4 steps + speaker), green chalkboard "Palabra 1 de 5 / Escucha y forma la palabra" with two slots, four balls ma / mi / mu / me.
- Four buttons below the scene (Escuchar, Comprobar, Borrar, Siguiente). Buttons never sit on the art. No Gretel on this screen.
- Tap or drag a ball into a slot. Comprobar turns green when right, red when wrong (red then clears).
- Chano breathes and sways his arms a little. No ripple. Reduced-motion users see him still.
- Audio only from recorded files: word recordings in / (mamá, meme, mima, mumi) and SFX in /. "mami" has no recording, so it stays silent. The instructions speaker is silent (no recording yet). No speech synthesis.
## Files
- (new; art stored as SVG wrapping WebP)
- (new)
- (routes payaso-chano to the new screen)
Not touched: AGENTS.md, existing art, other , old PayasoChano.tsx.
## Checks
- tsc clean, eslint clean on new files, vitest  53/53, vite build OK.
- Served the build locally and checked at 390x844, 844x390 and 1024x768: no overflow, buttons below the art, wrong answer red then cleared, right answer green, Escuchar plays only the recorded file, 0 console errors.

---

## Owner instruction recordings: 40 master lines and Lesson 3 playback
**Status:** ❌ NOT READY

**Missing:** Required real UI/browser proof is absent (missing screenshot)

### Description
40 continuous instruction clips from the owner's master plus five Lesson 3 phrases. Exact printed-text lookup covers 109 existing instruction regions; unmatched text stays silent. Lines 17/18 play sequentially. Mute, volume, shared cancellation, page-turn stop and unmount cleanup are preserved. No device speech fallback.
Source boundaries, transcripts, durations, hashes, explicit page mappings and loudness measurements are included. Each exported clip was separately transcribed. Sampler accepted by the owner October 19. No unresolved phrase cuts.
, five focused tests and production  bundle pass. Full test suite did not finish within the execution window, so no full-suite pass claimed. Browser playback and visual verification are still pending. Loudness measurements are not proof of music-free audio. This is not full lesson narration or whole-app audio coverage.
Draft only. No merge or production release. No rejected tinywow source, M/ma sample, synthesized voice or  audio used.

---

## Mariposas: full-screen scene from the approved mockup
**Status:** ❌ NOT READY

**Missing:** Required real UI/browser proof is absent (missing screenshot), Missing video for motion changes, Missing side-by-side comparison for artwork claims

### Description
Rebuilds the Mariposas game screen to match the owner-approved mockup, full screen with no page chrome.
- Scene art is cut from the approved mockup only (butterflies masked out, chips redrawn as live text, instruction panels cropped). Nothing generated.
- Layouts: wide (tablet 1280x800), phone landscape (844x390, instructions via the ? button), phone portrait (390x844, garden in two bands, instructions button).
- Gameplay kept from main: pick syllables in order, wrong pick resets, finished word moves on, finish screen with play again. Tap a filled slot to take it back. Sun replays the word audio slot, watering can skips to the next word.
- Audio slots stay empty (no audio file, no generated voice).
- Touches CoreGames.tsx only to return the new scene from MariposasGame. Other  untouched.
- Preview with the mockup's word set: add ?set=mockup to the game URL.

---

## Palabras por minuto: full-screen scene from the approved mockup
**Status:** ❌ NOT READY

**Missing:** Required real UI/browser proof is absent (missing screenshot), Missing video for motion changes, Missing side-by-side comparison for artwork claims

### Description
Rebuilds the Palabras por minuto screen as one full-screen cork board scene that follows the owner-approved mockup.
- Layout: sign top left, title banner, 01:00 timer with play button, instruction bar with audio button, 18-word grid, pinned drawing, plant, books, pencil cup. Gretel appears only on the brand sign.
- Sizes: tablet 1280x800, phone landscape 844x390 (compressed header so the grid keeps its height), phone portrait 390x844 (same scene, stacked).
- Play: 60 s wall-clock timer (same logic as main), words are marked in order, an out-of-order tap shakes red and does not count, finish once, restart.
- Art: all pieces are crops and masks of the approved mockup. Nothing was generated or redrawn. Cork and desk are tiled from mockup crops.
- Motion: the pinned drawing sways from its pin, the sign hangs and sways slightly, the plant leaves sway from the pot. No ripple or pixel effects. Reduced-motion is respected.
- Audio slots are empty (data-) and listed in - Only the Palabras por minuto function body in CoreGames.tsx was changed. Other  and shared files are untouched.
- Adds the Mm word set (.ts) in the mockup order. It is not registered in the game route yet.
Tests: existing WordsPerMinuteGame tests pass unchanged, plus new scene tests.

---

## Draft: rigid original-art picture motion, with explicit layer gaps
**Status:** ❌ NOT READY

**Missing:** Required real UI/browser proof is absent (missing screenshot), Missing video for motion changes, Missing side-by-side comparison for artwork claims

### Description
## Partial rigid-motion draft, not release ready
Replaces the rejected pixel displacement on the 14-picture review set. Based on the original-art  integration and main . No main changes or merge.
- Rigid source-pixel layers: fan hinge, wing hinges, corn husk, squirrel tail, unicorn ear, original soup steam, magnet marks, wheel spokes.
- Stationary star plus a soft glow pulse.
- Held still rather than faked: eyes, red-thread needle, caterpillar, Lala, broom. Missing layers and limits are listed in - Reduced-motion shows the exact original source. Red-thread aguja is the current main source, not the old brown drawing.
Validation: typecheck passed;  build passed; 34 targeted fidelity/freshness/no-displacement checks passed. All 15 replacement SVGs checked in Chromium with reduced motion. 390x844 comparison clips rendered for all 14 pictures. Full test suite timed out, so not claimed passing. Real device and in-page visual integration not yet verified.
This is a visual-review draft. The source crops/masks do not supply hidden surfaces or complete character rigs. No new illustration or inpainting was used.

---

## Rima approved scene, responsive draft and gameplay proof
**Status:** ✅ READY

### Description
## Rima scene draft
Approved source image/crops only. Full-viewport scene, tap-and-place poem, correct/wrong feedback, next P matching rounds, reset and existing session event semantics. Surgical RhymeGame replacement only; no other game or shared styles changed.
Proof: contains three viewport comparisons, wrong/right/reset/next recordings and exact logs. 57 focused tests, typecheck, asset verification and  build pass. Full suite attempt timed out before summary, not a pass.
NOT exact-match or motion complete: phone portrait/wide phone recompose cropped source pieces. Mother/title crop edges remain. No independent mother/child/bee/wing/leaf/background layers, so no fabricated breathing or wing motion. Audio slots empty. No other letter poems invented. See README and gaps.json.
Draft only. No merge or deploy.

### Visual Proof
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/landscape-comparison.jpg?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/landscape-complete.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/landscape-pairs.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/landscape-play.webm?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/landscape-wrong.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/landscape.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/portrait-comparison.jpg?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/portrait-complete.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/portrait-pairs.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/portrait-play.webm?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/portrait-with-live-sound.mp4?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/portrait-wrong.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/portrait.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/tablet-comparison.jpg?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/tablet-complete.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/tablet-pairs.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/tablet-play.webm?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/tablet-wrong.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/instinct/rima-scene-20261019/docs/proofs/rima-20261019/tablet.png?raw=true)

---

## Author games template, mascot-free, recording-only audio (draft)
**Status:** ❌ NOT READY

**Missing:** Missing side-by-side comparison for artwork claims

### Description
Draft. Not for merge until the owner says yes.
Four patches from the owner's ChatGPT  lane, applied on current main . All four applied cleanly, no conflicts.
**OVEN (I ran it)**
- typecheck passes
- 12 game test files, 89 tests pass
- vite build passes
- Games page at 390x844 and 844x390: no page errors, no horizontal overflow, no "Gretel" text or image on the page
- No speech synthesis calls fired while opening all 8
- No speechSynthesis or TTS use inside the  folders or the  route
**UNVERIFIED / OBLEMS**
- Full test suite result: see  comment
- Only opened each game; did not play correct/wrong answers myself. Bundle's own proof (1594 browser actions) was not re-run. The bundle zip was cut off, so its source folder and videos did not arrive; patches did.
- Landscape 844x390: instructions fill the whole screen, the game is below the fold
- lectura-rima shows only "pendiente" (no content)
- Mariposas shows an empty box glyph where a picture should be
- Instruction play buttons are silent: no recordings exist for them (bundle lists 799 empty slots)

### Visual Proof
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/games-author-template-verify/docs/proofs/author-games-verify/ba-landscape.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/games-author-template-verify/docs/proofs/author-games-verify/ba-portrait.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/games-author-template-verify/docs/proofs/author-games-verify/sheet-landscape.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/games-author-template-verify/docs/proofs/author-games-verify/sheet-portrait.png?raw=true)
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/games-author-template-verify/docs/proofs/author-games-verify/sheet-portrait.png?raw=true))
![Proof Screenshot](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/games-author-template-verify/docs/proofs/author-games-verify/sheet-landscape.png?raw=true))

---

## Cream paper, slim teal spine and teal glow on every lesson (draft)
**Status:** ❌ NOT READY

**Missing:** Required real UI/browser proof is absent (missing screenshot), Missing side-by-side comparison for artwork claims

### Description
Draft, not for merge until the owner has seen the pictures. Applies the cream paper page color, slim teal spine and teal glow around work boxes to every lesson workbook page through the shared style instead of Lesson 16 only. One file: No art changes. Built on top of the clip and Limpiar fix branch.

---

## Rebuild Palabras por minuto Mm cork-board game
**Status:** ❌ NOT READY

**Missing:** Required real UI/browser proof is absent (missing screenshot), Missing side-by-side comparison for artwork claims

### Description
Rebuilt Palabras por minuto Mm cork-board game matching exact specs.
---
* created automatically by Jules for task []( started by @ejnburrows-rgb*

---

## Internal Reference Information

| PR Number | Branch | Head SHA | GitHub Link |
|---|---|---|---|
| 1045 | `game/chano-rainbow-juggle-20261020` | `c7c505952867cbdd9cea541f59c0cbea07598ca1` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1045) |
| 1041 | `game/chano-scene-juggling-16811216930405402616` | `0daaa300efd377396fe1e9ee252e4fa97f2e4be5` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1041) |
| 1038 | `jules/l16-diamond-proofs-20261020` | `3361e0ce32007e57f154142659041fdd3d0515b4` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1038) |
| 1025 | `fix/1020-simplepageviewer-overflow` | `72c65cda115287189dff541cc626bdee549f469f` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1025) |
| 1022 | `draft/lane-b-workbook-lessons-8-18` | `fed42a7899d1c540c842608bfe973220aad69597` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1022) |
| 1018 | `jules/l17-diamond-port-20261020` | `9e1e650c3c6fe833bb0095dceaba922446928217` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1018) |
| 1015 | `game/chano-scene` | `10409fe824b78cce1c25825003a56337e3e0c1fd` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1015) |
| 1012 | `audio/owner-instructions-20261019` | `5364b587c50434a7fa6b7e5286adc62a26053af6` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1012) |
| 1010 | `game/mariposas-fullscreen-scene` | `6add8567fa1b2ad8d4af176103cd18fc508b1be1` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1010) |
| 1009 | `palabras-minuto-scene-mockup` | `681e8db713bf92f8db98a6c00f1702481d8fdd53` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1009) |
| 1008 | `motion/rigid-originals-review` | `7419c229567ffb6c2b8159739ae468f525de8603` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1008) |
| 1007 | `instinct/rima-scene-20261019` | `fdbdb2328c299bd389de4bf937ceee834b6f27bf` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1007) |
| 1006 | `games-author-template-verify` | `f41be5c897f0ba10ea1d8833e6982aeda6b1ee45` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1006) |
| 1005 | `instinct/cream-all-lessons-20261019` | `9aaca48cac733e443a6ea03b642f3fae74c9ee91` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1005) |
| 1003 | `activity/palabras-por-minuto-11657455097900780082` | `a41c7fd4bd1b88b789d42c191b76d7501a72f1d2` | [Link](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/1003) |
