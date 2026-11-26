# Image inspection — 2026-11-26 (Images workstream, #877)

Base: `main` `5e1c8378`, branch `work/images`. This folder holds tooling output and evidence only.
**No production picture, placement or layout file was changed.** Every replacement below waits for the owner's approval.

## 1. What was inspected

`scripts/image-inspection/inspect-rendered-images.mjs` opened each view in Chromium at **phone 390×844 (2× pixels)**, **desktop 1366×768** and **projector 1920×1080**. It measured every visible picture on that view.

| Surface | Views per screen size | Unique pictures | Picture checks |
|---|---|---|---|
| Student Workbook | 86 printed pages (1–85, 88) | 79 | 476 |
| Teacher Flip Chart | 60 lesson sheets (3–62) | 167 | 1,173 |
| Games | 12 game routes | 45 | 249 |

Each check records whether the picture loaded, whether it was stretched, how much of the drawing a container hides (measured on the drawing's own pixels, not on transparent margins), whether it runs off-screen, and whether it is enlarged beyond its file size. One row per check is in `inspection-results.csv`, and totals are in `inspection-summary.json`.

Not covered:
- Pages 86–87 are permanently excluded (SOURCE_BLOCKED).
- Flip Chart sheets 1–2 are the cover and credits pages, which the lesson presenter does not show.
- Lesson 24 pages 2–3 could not be opened by the resume method. Those pages have no picture layout in `page-layouts.json`.

## 2. Results

**Workbook:** 474 of 476 checks pass. The one problem is **igual** on pp. 13–14: the file is only 106×61, so the browser enlarges it 1.5–3.7× on desktop and projector and it looks soft. No higher-resolution source exists. A resolution-only candidate is in `recrop-candidates/igual-*`, and the real fix needs the owner's original file.

**Flip Chart:** all 1,173 checks pass. No picture is broken, stretched, cut off by its box or too low-resolution on any screen size. Some layers use deliberate display masks (`clip-path` in `flipchart-presenter.css`) that hide neighbouring printed words. The masks are working as intended and are not counted as defects.

**Games** (owned by the Assets/Motion workstream, so these are recorded as dependencies and not edited here):
- **Cow game (`cow-game-m`):** each cow is drawn about 17% too wide on desktop and projector and 20% too wide on phone. The parts are 453×518 files placed in a 174×170 box with `object-fit: fill` (`CowGame.tsx`).
- **Cow game, desktop and projector:** the side extensions of the farm scene show seams and a duplicated fence sign at the left and right edges (see `screens/cow-game-desktop.jpg`).
- **Mariposas:** on desktop the watering-can button picture is about 22% cut off. On phone the garden is a wide panorama, so part of it is off-screen by design. Mariposas is protected, so this is reported only.

## 3. Problems inside the picture files

A file-level check (`check-crop-edges.py`, results in `edge-touch.json`, confirmed by eye) found Workbook drawings that are cut off inside their files. Comparing them with the printed Workbook crops (`docs/proofs/artwork-coverage-2026-10-14/crops`) showed that two files in use are **mirror images** of the printed book:
- **uno:** the numeral "1" is backwards on Workbook p.7 and elsewhere.
- **oso:** the bear is flipped.

For each affected file, `build-recrop-candidates.py` made an uncut candidate from the **HD Flip Chart scan of the same drawing**. Only the paper is removed; the drawing is not redrawn. Where the Workbook prints the drawing mirrored relative to the Flip Chart, the candidate keeps the Workbook's orientation. See `recrop-candidates/*-before-after.jpg` and `candidates.json`.

| File in use | Problem | Candidate |
|---|---|---|
| vocal-o/ocho | 8 cut at bottom/right | HD sheet 4 |
| vocal-e/espejo | rim cut, stray dot | HD sheet 6 (Workbook orientation) |
| vocal-a/alas | wing tips cut | HD sheet 5 |
| leccion-23-z/zorro | ears, tail and side cut | HD sheet 60 |
| leccion-8-p/papa | hand cut | HD sheet 12 |
| leccion-19-c/casa | tree and house cut | HD sheet 54 |
| vocal-a/anillo | ring cut | HD sheet 5 (Workbook orientation) |
| vocal-o/olla | pot cut | HD sheet 4 |
| vocal-o/oreja | ear cut | HD sheet 4 (Workbook orientation) |
| vocal-o/oso | **mirrored** + cut | HD sheet 4 |
| vocal-u/uno | **mirrored "1"** + cut | HD sheet 8 |
| vocal-u/unicornio | legs and tail cut | HD sheet 8 (Workbook orientation) |
| vocal-i/igual | low resolution | 4× resolution-only |

There is no HD source for: leccion-14-n/nino, leccion-1/pajaro, pera, taza, vocal-o/ola, aguila or ardilla. These need owner originals.

## 4. Owner decisions (p.7)

`owner-decisions/p007-avion-ojos-owner-decision.jpg`:
- **ojos:** the printed page shows two eyes. Both existing files show one eye. A replacement needs owner-supplied art or an approved crop.
- **avión:** the printed plane differs from the one in use. The alternative `pez.webp` also differs in pose.

## 5. Flip Chart source provenance (124 flags from PR #1321)

`verify-flipchart-layer-provenance.py` compares each of the 167 native layers with its recorded region of the HD sheet scan:
- **Control:** all 55 layers already marked PASS match their scan, which confirms the method.
- **112 pending layers:** 66 match automatically. Of the other 46, a visual review found 40 that are the same drawing with different framing (`visual-review.json`). That leaves **6 that differ from the scan** and need the owner's decision: p008-uva, p015-sopa, p021-dedo (recoloured), p042-burro (recoloured), p017-scene and p003-scene.
- **12 Workbook/shared provenance rows:** 10 files remain unverified (manzana, pera, taza, casa, yate, zapato, anillo, ardilla, escuela, iguana). The `mono-blink` and `sapo-blink` rows refer to files that don't exist and aren't used.
- The audit JSON was not edited; it is regenerated by the release workflow.

## 6. Screens

`screens/*-3-viewports.jpg` shows Workbook p.7, Flip Chart sheet 3 and the cow game at phone, desktop and projector sizes.

In 2 of about 6 headless captures under heavy machine load, the p.7 **ojo** card painted blank, even though the image had loaded. It painted correctly in every later capture. Instinct should check it on a real device.

## Reproduce

```
pnpm dev:worker   # http://127.0.0.1:5173
node scripts/image-inspection/inspect-rendered-images.mjs --only workbook --viewports phone --out /tmp/insp/workbook-phone
python3 scripts/image-inspection/summarize.py /tmp/insp docs/proofs/image-inspection-2026-11-26
python3 scripts/image-inspection/check-crop-edges.py docs/proofs/image-inspection-2026-11-26
python3 scripts/image-inspection/verify-flipchart-layer-provenance.py /tmp/prov
python3 scripts/image-inspection/build-recrop-candidates.py docs/proofs/image-inspection-2026-11-26/recrop-candidates
```
(Python needs Pillow and numpy.)
