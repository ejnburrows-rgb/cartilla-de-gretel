# Handoff: Images → Assets, Games & Motion (`work/assets-motion`, PR #1326)

Written by the Images lane on 2026-11-26.

Base checked: `main` `5e1c8378`, plus the #1326 head `e987218`. Nothing on `work/assets-motion` was edited, and none of the files listed below were edited on `work/images`. Each file has one writer.

## 1. Payaso Chano scene art: Images sign-off PASS

#1326 asked the Images lane to confirm that the recovered Chano scene SVGs wrap owner-supplied art unchanged. Evidence: `chano-scene-check.json` and `chano-scene-check.jpg`, produced by `scripts/image-inspection/check-chano-art.py`.

| Check | Result |
|---|---|
| All 14 `public/cartilla/art/chano-scene/*.svg` match the owner-verified drafts byte for byte | 8 match #1015 (`10409fe`), 6 match #1045 (`c7c5059`) |
| Each embedded picture is drawn at its own pixel size | 14 of 14 at scale 1.000, so nothing is stretched or enlarged |
| The 5 `juggle-ball-*.svg` files are cut-outs of the owner scene at their painted positions (`JUGGLE_BALLS` in `juggle.ts`) | Mean difference 2.8–3.1 of 255 levels (compression only) |
| `scene-juggle-bg.svg` changes only under the 5 balls | 1 visibly changed pixel outside the balls. Elsewhere the average difference is 2.6 of 255 (compression). Under the balls the background was filled in, as the owner ordered in #1045. |

**What Assets/Motion still owns:** catching the exact ball into the slot, and filling phone landscape edge to edge (owner notes on #1015). The Images lane needs nothing more for Chano.

## 2. Flip Chart sheet 6 elephant: switch-on spec

All seven sheet-6 pictures were replaced in #1247 (`fbc35d3`), so the old motion masks no longer fit them. That is why each one carries `motionDisabled: true`. #1326 rebuilds only the elephant motion file, `public/cartilla/art/optimized/flipchart-native/p006-elefante-alive.svg`.

Images-lane check of the rebuilt file (`elephant-motion-check.json` and `.jpg`, produced by `check-elephant-motion.mjs`):

- **Motion off (reduced motion):** pixel-identical to the approved still `p006-elefante.png`, the owner's colour elephant from `dc20ffb`.
- **While moving:** only the head, ear and trunk area changes, at most 2.2% of pixels at any sampled moment, inside x 230–515 and y 43–391. The body, tail and legs stay still.
- **Old motion file on main:** a different, older drawing that differs from the still by 22% even with motion off. This confirms the hold was right.

**Exact change Assets/Motion should make inside #1326,** in the same commit as the rebuilt SVG and never before it:

```
src/data/flipchart-native-assets.json
  sheet "6", entry with "src": "/cartilla/art/optimized/flipchart-native/p006-elefante.png"
  (line 255 on main 5e1c8378): delete the line  "motionDisabled": true
```

- Keep `motionDisabled: true` on the other six sheet-6 entries (scene, espejo, Ema, estrella, erizo, escalera) until their motion is rebuilt.
- The Images lane hands over this one line so the file has a single writer, and will not edit it on `work/images`.
- **Check after the change:** Flip Chart Lesson 4, sheet 6. The elephant moves its trunk and ears only, and stays still with reduced motion. Take phone and projector screenshots.

## 3. Game image defects found by the Images inspection (Assets/Motion files)

- **Cow game (`CowGame.tsx`):** each 453×518 cow part is drawn in a 174×170 box (91×87 on phone) with `.cg-p{object-fit:fill}`, so the cows are stretched 17–20% wider. A fix should keep the 453:518 shape: size the box from that shape, or use `object-fit:contain` with a matching box. The side copies of `scene.webp` on desktop and projector show seams and a duplicated fence sign at both edges. Evidence: `screens/cow-game-*`.
- **Mariposas / Butterfly Garden:** reported only, because the files are protected. The watering-can button picture is about 22% cut off on desktop and projector.

## 4. If the owner approves any of the 13 Workbook replacements

The Images lane swaps the still under the same filename and regenerates the 384/768 delivery copies. In the same change, Assets/Motion must add a hold to `src/data/stale-motion-art.json` for every swapped file whose motion is tied to the old pixels, and later rebuild that motion. Rigs in `src/lib/living-actor-registry.ts` at `main` `5e1c8378`:

| File (`faithful/…`) | Motion rig tied to old pixels |
|---|---|
| vocal-o/oso | `aliveSrc` `oso-alive.svg` + `blinkFrame` (breathe) |
| vocal-o/olla | `aliveSrc` `olla-alive.svg` (steam) |
| leccion-23-z/zorro | `parts` tail mask (wag) |
| vocal-a/alas | `parts` (flutter) |
| vocal-o/oreja, vocal-u/unicornio | `parts` (nod) |
| vocal-o/ocho, vocal-e/espejo, leccion-19-c/casa, vocal-a/anillo, vocal-u/uno, vocal-i/igual | `parts` (glint) |
| leccion-8-p/papa | none |

**p.7 avión:** the plane in use, `vocal-a/avion.webp`, has `avion-alive.svg`. If the owner picks the owner-supplied plane (`leccion-1/pez.webp`) for p.7, that motion needs a hold and a rebuild as well.
