# Image inspection — 2026-11-26 (Images workstream, #877)

Base: `main` `5e1c8378`, branch `work/images`. This folder holds tooling output and evidence only.
**No production picture, placement or layout file was changed.** Every replacement below waits for the owner's approval.

## 1. What was inspected

`scripts/image-inspection/inspect-rendered-images.mjs` opened each view in Chromium at **phone 390×844 (2× pixels)**, **desktop 1366×768** and **projector 1920×1080**. It measured every visible picture on that view.

| Surface | Views per screen size | Unique pictures | Picture checks |
|---|---|---|---|
| Student Workbook | 86 printed pages (1–85, 88) | 79 | 480 |
| Teacher Flip Chart | 60 lesson sheets (3–62) | 167 | 1,173 |
| Games | 12 game routes | 45 | 244 |

Each check records whether the picture loaded, whether it was stretched, how much of the drawing a container hides (measured on the drawing's own pixels, not on transparent margins), whether it runs off-screen, and whether it is enlarged beyond its file size. One row per check is in `inspection-results.csv`, and totals are in `inspection-summary.json`.

Not covered:
- Pages 86–87 are permanently excluded (SOURCE_BLOCKED).
- Flip Chart sheets 1–2 are the cover and credits pages, which the lesson presenter does not show.

Lesson 24 (printed pages 88, 89, 90) is now fully covered. The first sweep did not reach pages 89–90: for Lesson 24 the app moves old bookmarks that have no printed page number back one page, so the seeded positions landed one page early. The inspection now corrects the bookmark and retries once. Printed pages 88–90 are text and writing exercises with no pictures, so they correctly show 0 pictures at every screen size.

**Scope of this evidence.** These are rendered picture checks plus sampled screenshots. They show whether pictures load, fit and stay sharp. They do **not** establish that the full curriculum or the games are accepted: gameplay, completion gates and real-device behaviour are verified separately (demo-control verification is with Devin; Instinct does visual QA).

## 2. Results

**Workbook:** 476 of 480 checks pass. The one problem is **igual** on pp. 13–14: the file is only 106×61, so the browser enlarges it 1.5–3.7× on desktop and projector and it looks soft. No HD scan of this drawing exists. There are two options, shown side by side in `owner-intake-reconciliation/igual-options.jpg`:
- **Option A** is **an enlargement with sharpening, not an HD source**: the same 106×61 file enlarged 4× (Lanczos) and lightly sharpened. It adds no detail.
- **Option B** is the owner-supplied equals sign from the October 14 intake (#1, 1254×1254). It shows the same two bars with a brown outline. See section 3b.

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
| vocal-e/espejo | rim cut | HD sheet 6 (Workbook orientation) |
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
| vocal-i/igual | low resolution | Option A: **enlargement with sharpening, not an HD source**. Option B: owner intake #1 |

There is no HD source for: leccion-14-n/nino, leccion-1/pajaro, pera, taza, vocal-o/ola, aguila or ardilla (see 3b).

### 3a. Does cleanup erase real detail? (detail-loss audit)

The candidates are made in two steps. First, only paper connected to the outside of the crop becomes transparent, so enclosed whites such as eye whites and highlights stay opaque. Second, islands are removed if they touch the crop border, if their centre lies outside the recorded drawing box, or if they are smaller than 30 px. Every removed island is listed in `candidates.json` under `removedIslands`, and `recrop-candidates/*-removed-pixels.jpg` paints removed pixels red over the source, with the drawing box in blue.

What the audit found:
- **Removed at the border:** printed caption letters or neighbouring scenery cut by the crop box (papá, casa, ocho, oso, espejo, uno, unicornio). None of it belongs to the drawing. The small red tick marks beside the "1" in uno are part of the drawing and are **kept**.
- **Removed inside a drawing box:** 4 specks of 1–2 px (ocho 1, oso 2, alas 1+1). `recrop-candidates/removed-specks-zoom.jpg` shows each one at 4×. They are scan-halo pixels just outside a black outline, not eyes, dots or thin lines.
- **Unaffected:** zorro, anillo, olla and oreja lost nothing.
- **Transparency:** viewed on blue, all 12 candidates keep their eyes, dots, highlights and thin lines. The only areas made transparent are white zones open to the outside paper, such as the gaps between the unicorn's legs. They look identical on the Workbook's white cards.
- **No pixel change:** adding the audit did not change any candidate (the candidate files are byte-identical).

### 3b. The seven "no HD source" pictures against the owner's 69 intake originals

`owner-intake-reconciliation/` holds numbered contact sheets of all 69 originals listed in `public/cartilla/art/owner-intake/2026-10-14/manifest.json` (`intake-1-36.jpg`, `intake-37-69.jpg`). `result.json` records the visual match and the closest intake items:
- **None of the seven is in the intake.** niño (#10 and #43 are different boys), pájaro (#39 is a chick), pera (#12 is an apple), taza, ola (#25 and #60 are a wind cloud), águila and ardilla are **truly missing** and need owner originals.
- **igual is in the intake** as #1, an owner-supplied equals sign at 1254×1254. It is option B above.
- Reproduce with `scripts/image-inspection/reconcile-owner-intake.py`.

## 4. Page 7 (`owner-decisions/p007-ojo-approved-avion-comparison.jpg`)

- **ojo: approved as is, no correction.** `PROJECT_SOURCE_OF_TRUTH.md` keeps the singular `ojo` with `ojo.png` in both approved positions. The printed page shows two eyes, but changing that would be an **optional owner reversal of an approved decision**, not a fix. No two-eye file exists (`ojos.webp` is also one eye), so a reversal would need new owner art.
- **avión (optional):** the plane in use on p.7, `vocal-a/avion.webp`, has no approval record; it has not changed since the September 19 rewrite. The owner supplied a colour plane on 2026-10-22 (`leccion-1/pez.webp`, commit `dc20ffb`), which is already used for "avión" on other pages. Neither one matches the printed plane exactly. Switching would also need the motion file reworked (see the handoff).

## 5. Flip Chart source provenance (124 flags from PR #1321)

`verify-flipchart-layer-provenance.py` compares each of the 167 native layers with its recorded region of the HD sheet scan:
- **Control:** all 55 layers already marked PASS match their scan, which confirms the method.
- **112 pending layers:** 66 match automatically. Of the other 46, a visual review found 40 that are the same drawing with different framing (`visual-review.json`).
- **6 differ from the scan, and all 6 are already approved as is**, so no owner decision is needed (`approvals.json`):
  - p008-uva, p015-sopa, p021-dedo, p042-burro and p017-scene are owner-supplied colour art installed in `dc20ffb` (2026-10-22), each with its WhatsApp time recorded.
  - p003-scene is the owner's verdict-approved swap (#873, `65f30fe`, 2026-10-16).
  - Each file in use is still exactly the approved one.
  - These are not the "seven Flip Chart fixes accepted October 20", which are other pictures (#1159).
- **12 Workbook/shared provenance rows:** 10 files remain unverified (manzana, pera, taza, casa, yate, zapato, anillo, ardilla, escuela, iguana). The `mono-blink` and `sapo-blink` rows refer to files that don't exist and aren't used.
- The audit JSON was not edited; it is regenerated by the release workflow.

## 6. Handoff and ownership

`HANDOFF-assets-motion.md` covers four items:
- **Chano scene art (PASS):** `chano-scene-check.json` and `.jpg`.
- **Sheet-6 elephant:** the rebuilt motion matches the approved still (`elephant-motion-check.json` and `.jpg`), with the exact one-line switch Assets/Motion should make inside #1326.
- **Cow and Mariposas defects.**
- **Motion that needs a hold** if any of the 13 replacements is approved.

Who owns what (coordinator ruling on #1327):
- **Images (this lane):** the Chano artwork review and the elephant-switch review, both done above.
- **Assets/Motion:** the cow picture ratio and scene seams, plus the living-motion registry and motion outputs.
- **Performance:** the #1171 delivery-size assessment.
- **Instinct:** reproducing the blank p.7 eye on a real device and the watering-can clipping. Butterfly Garden is protected, and no garden rebuild is authorized.

## 7. Screens

`screens/*-3-viewports.jpg` shows Workbook p.7, Flip Chart sheet 3 and the cow game at phone, desktop and projector sizes.

In 2 of about 6 headless captures under heavy machine load, the p.7 **ojo** card painted blank, even though the image had loaded. It painted correctly in every later capture. Instinct should check it on a real device.

## Reproduce

```
pnpm dev:worker   # http://127.0.0.1:5173
node scripts/image-inspection/inspect-rendered-images.mjs --only workbook --viewports phone --out test-results/image-inspection/workbook-phone
python3 scripts/image-inspection/summarize.py
python3 scripts/image-inspection/check-crop-edges.py
python3 scripts/image-inspection/verify-flipchart-layer-provenance.py
python3 scripts/image-inspection/build-recrop-candidates.py && python3 scripts/image-inspection/check-mirroring.py
python3 scripts/image-inspection/reconcile-owner-intake.py
python3 scripts/image-inspection/build-p7-decision-sheet.py
# Chano / elephant inputs come from the #1326 head (git show into test-results/chano-scene and test-results/elephant):
python3 scripts/image-inspection/check-chano-art.py
node scripts/image-inspection/check-elephant-motion.mjs
```
(Python needs Pillow and numpy. The scripts take no path arguments: they read `test-results/` and write only into this folder.)
