# Assets, Games & Motion — evidence (2026-11-26, branch `work/assets-motion`)

Captured with Playwright Chromium against `pnpm dev:worker` (demo mode, no real data).
Silent browser recordings; no audio, no physical device.

## Game rounds

| Game | Route | Screens | Result |
|---|---|---|---|
| Cow (vacas) | `/cartilla/juego/cow-game-m` | phone 390×844, tablet 1024×768, desktop 1366×768, projector 1920×1080 | One wrong try, then 5/5 placed, completion dialog. No page errors, no sideways scroll. Recordings: `cow-phone.webm`, `cow-desktop.webm` |
| Payaso Chano (recovered #1015 + #1045) | `/cartilla/juego/payaso-chano-ss` | phone, desktop, projector | All 5 words built and checked, ends "¡Terminaste!". Recording: `chano-phone.webm` |
| Vocal A | `/cartilla/juego/vocal-a` | phone, desktop | Correct "Sí" turns the card green, score 1/5 |
| Fonética P | `/cartilla/juego/fonetica-p` | phone, desktop | "¡Correcto!" |
| Rima P | `/cartilla/juego/rima-p` | phone, desktop | "¡Riman!" |
| Palabras por minuto | `/cartilla/juego/palabras-minuto-p` | phone, desktop | Timer starts |
| Dibujos O | `/cartilla/juego/dibujos-o` | phone, desktop | "¡Ese es el dibujo!" |
| Sílabas O/P/M, Completar palabras | `/cartilla/juego/…` | phone, desktop | Mount without errors (Completar answers still `pendiente`, waiting for teacher mappings) |
| Butterfly Garden (protected) | `/cartilla/juego/mariposas-p` | phone, desktop + its own 9-test suite | Unchanged; own suite passes |
| Piano Hablador | `/cartilla/practica?modo=piano` | phone, desktop | Lesson list renders; microphone rounds NOT TESTED here (no microphone) |
| Board game | — | — | Does not exist in main or any branch; marked missing |

Raw per-run results: `results.json` (the vocal-a "fail" there is the script looking for the wrong success text; the screenshot shows the green correct state).

## Cow bug

`cow-desktop-BEFORE-hidden.jpg`: before the fix the walking "mu" cow is hidden behind the resting "ma" cow while its card moves.
`cow-*-3-walking.jpg`, `cow-desktop-4-lean.jpg`: after the fix the cow walks in front of the herd, carrying its card, and stays behind the fence.

## Stale motion pictures

`vocal-a-bee-old-motion-vs-current-still.jpg`: the old vowel-A motion file (left) still held the retired yellowed scan; the approved still (right) is the colour bee.
`motion-repaired.webm`, `motion-repaired-moving-parts.jpg`: rebuilt Page 1 bee, vowel-A bee and Flip Chart sheet 4 elephant; red marks every pixel that changes over the loop (wings only for the bees; trunk and ears for the elephant).
The elephant motion stays switched off on the Flip Chart until `p006-elefante` `motionDisabled` is cleared in `src/data/flipchart-native-assets.json` (not owned by this workstream).
