# FRAME-REQUESTS — hand-drawn / photo frames needed for living art

**Policy:** Ambient life on student pages and the flipchart uses **only** existing
faithful pixels (transforms + soft eyelid overlay + breath). Do **not** invent
closed-eye redraws or new poses in code. When a true alternate frame is required
for quality, list it here for the art pipeline.

Generated: 2026-07-13 · branch `feat/living-art`

---

## Gretel (mascot)

| ID | Character | Frame needed | Why | Source pose to match |
|----|-----------|--------------|-----|----------------------|
| G-01 | Gretel | Closed-eye idle (true blink frame) | Soft lid overlay is interim; a real blink pose matches line weight | `/cartilla/images/gretel/poses/gretel-idle.webp` (also exists: `gretel-blink.webp` — **verify** it is a true closed-eye, not a wink/glitch; if valid, mark G-01 satisfied) |
| G-02 | Gretel | Settle / land (feet planted, slight knee bend) | Enter-scene settle after slide-in | `/cartilla/images/gretel/poses/gretel-idle.webp` |
| G-03 | Gretel | Exit / wave goodbye (1 frame) | Graceful lesson exit | Wave sequence: `gretel-wave.webp`, `gretel-wave-1.webp`, `gretel-wave-2.webp` |
| G-04 | Gretel | Point-left mirror of `gretel-point.webp` | Bubble on right side of some layouts | `/cartilla/images/gretel/poses/gretel-point.webp` |

**Existing usable poses (do not regenerate):** idle, blink, wave×3, point, cheer×2, talk×3 under `public/cartilla/images/gretel/poses/`.

---

## Student workbook characters (faithful crops)

Blink currently uses a **cream eyelid composite** over the crop — acceptable interim.
True per-character closed-eye frames are requested only where the crop is a clear face
and the overlay reads poorly on dark fur/feathers.

| ID | Character (caption) | Page / lesson | Frame needed | Source image path |
|----|---------------------|---------------|--------------|-------------------|
| S-01 | oso | L2 / vocal-o | Closed eyes | `/cartilla/art/faithful/vocal-o/oso.webp` |
| S-02 | mono | L7 / m | Closed eyes | Path under `/cartilla/art/faithful/leccion-7-m/` matching mono crop in page-layouts |
| S-03 | pollito / gallina (p) | L8 | Closed eyes | `/cartilla/art/faithful/leccion-8-p/` (crop used on picture-grid cells) |
| S-04 | serpiente (s) | L9 | Tongue-in / blink-equivalent micro frame | `/cartilla/art/faithful/leccion-9-s/` |

**Do not invent** additional characters not already in `page-layouts.json` illustrationSrc.

---

## Teacher flipchart

Full-page HD scans already breathe via whole-page transform only.
**No per-character lids** on flipchart scans without masked isolation crops.

| ID | Need | Why | Source |
|----|------|-----|--------|
| F-01 | Optional: per-lesson “still” vs “soft smile” isolation crops for hero figures | Only if art team isolates figures from `/cartilla/art/hd/flipchart/page-NNN.jpg` without restyling | e.g. `page-003.jpg`, `page-007.jpg`, `page-010.jpg` |

Until F-01 exists, flipchart life = whole-page breath only (no fake drawn frames).

---

## Explicitly out of scope (do not request)

- Walk cycles, head turns, lip-sync visemes beyond existing talk frames
- Vectorization / recolor / proportion changes of any book art
- AI-regenerated “same character” replacements
