# Ilustraciones que requieren reparación

**Current authoritative evidence:** `docs/AUTHENTIC-FLIPCHART-ART-AUDIT.md`.

The first rule is workbook drawing → identical color drawing in all 62 teacher pages → existing digital slot. Missing metadata never authorizes generated, recolored, emoji, clip-art, or visually similar lesson artwork.

## Verified repair

| Word | Student pages | Final asset | Teacher source | Status |
|---|---|---|---|---|
| iglú | 4, 5, 8, 10, 13, 14 | `public/cartilla/art/faithful/vocal-i/iglu.webp` | teacher page 7, HD crop `[960,1530,600,570]` | Authentic crop applied and QA PASS. |
| aro | 1, 8 | `public/cartilla/art/faithful/vocal-a/aro.webp` | teacher page 5, HD crop `[870,2580,780,660]` | Legacy `remolino` name corrected; complete authentic crop applied and browser-verified. |

## Exact workbook templates recorded; teacher match unresolved

| Word | Student pages | Workbook source and crop |
|---|---|---|
| abrigo | 1, 11 | `page-003.png [230,800,440,520]` |
| globo | 2 | `page-004.png [1740,2985,580,515]` |
| abeja | 1, 7, 8, 10, 11, 14, 16 | `page-009.png [720,1420,580,560]` |
| oruga | 7 | `page-009.png [720,800,580,570]` |
| aguja | 7, 8, 10 | `page-009.png [1350,2650,575,590]` |

All 62 teacher pages and all 62 HD duplicates were checked using the exact workbook drawings plus full-page visual review, SIFT/RANSAC, edge-template matching, and OCR. No identical source crop has passed visual confirmation for these five. They account for 14 visible cells and remain neutral pending slots without answer words or substitutes.

Generated lesson substitutes and the six defective unused faithful files were removed after runtime-reference verification. The former `remolino` target must not be reopened: it was the workbook's `aro`, now mapped to teacher page 5. Historical `ART_BACKLOG.md` and `MISSING_ASSETS.md` are not work queues.
