# ART REPAIR REPORT — Worker D (page 4 focus)

## Terminal
ART_REPAIR_COMPLETE

## Scope
Repair targets: ojos, oreja, abeja, ola, oso, olla, oveja

## Results

| slug | verdict | confidence | method | mono | notes |
|------|---------|------------|--------|------|-------|
| ojos | FIXED_FROM_SOURCE | MEDIUM | o-page-4-frame-interior | False | Teal eyes from exercise page; no full painted flipchart vocab panel |
| oreja | FIXED_FROM_SOURCE | HIGH | faithful-verified + o-page-3 crosscheck | False | Corrupt 11x12 cropBox replaced; upright color ear |
| abeja | FIXED_FROM_SOURCE | LOW | a-page-5-frame-interior-lineart | True | Lineart only; no full-color flipchart abeja in available sources; unmatched for color tran |
| ola | FIXED_FROM_SOURCE | LOW | o-page-4-frame-interior-monochrome | True | Monochrome wave; no full-color flipchart match |
| oso | VERIFIED_UPRIGHT | HIGH | staged-flipchart-color | False | Flipchart color authority o-page-3 |
| olla | VERIFIED_UPRIGHT | HIGH | staged-flipchart-color | False | Flipchart color authority o-page-3 |
| oveja | VERIFIED_UPRIGHT | HIGH | staged-flipchart-color-label-trimmed | False | Flipchart color authority o-page-3; word label trimmed |


## Counts
- Targets: 7
- Repaired (VERIFIED_UPRIGHT | FIXED_FROM_SOURCE): 7
- Unprovable: 0

## Findings
1. **ojos** — faithful `vocal-o/ojos.webp` was a non-representational teal blob. Recropped both eyes from `o-page-4.jpg` exercise frame (teal irises; source-faithful).
2. **oreja** — manifest cropBox was corrupt (11×12). Upright color ear verified from o-page-3 / faithful; exported clean.
3. **oso / olla / oveja** — HIGH confidence flipchart color from staged `flipchart-color/vocal-o/` (o-page-3 authority). oveja label trimmed.
4. **ola** — monochrome wave recropped from o-page-4 frame interior. No color flipchart panel in available sources → not color-matched.
5. **abeja** — truncated faithful color crop unusable; full bee recropped as lineart from a-page-5. No color flipchart panel available → not color-matched.
6. **Physical workbook page-004** HD export is **rotated 180°** and is Lección 1 vowel-grid content; crop-manifest subject names for PAGE-004-OBJECT-* do not match the drawings on that physical page. Orientation fix saved to QA only; no invented full-page color composite.

## Outputs
- Before/after: `generated/art-repair-qa/*-before-after.png`
- Color/lineart assets: `public/cartilla/art/color/workbook/<slug>.webp`
- Palettes: `generated/flipbook-palettes/<slug>.json`

## Rules compliance
- No AI redraw, no invented colors, no CSS filter colorization, no blanket asset rotation
- Unmatched (ola, abeja) remain monochrome lineart
