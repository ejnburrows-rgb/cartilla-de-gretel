# Authentic workbook illustration audit — current repair evidence

**Status:** implemented on `repair/authentic-flipchart-art`, 2026-08-08. This
record overrides older art backlogs, generated-art manifests, crop manifests,
issues, and filename-based “missing” claims.

## Source rule established

The official product separates a **62-page teacher flip chart** from a
**92-page student book**. Its description says the student activities
reinforce material learned from the flip chart; it does not claim that every
student-book distractor is printed in the flip chart:
https://doublermuybien-com.3dcartstores.com/assets/images/Docs/la_cartilla_de_Gretel2.pdf

Both repository teacher sets were compared page by page. Every low-resolution
page maps to the same-numbered HD page (62/62), proving they are duplicate
exports of the same complete flip chart, not two editions or a shuffled set.

Repair rule:

1. The student book determines the exact drawing and activity.
2. If the identical drawing appears in the teacher flip chart, use its authentic
   color crop.
3. If it does not appear after all-62 visual and machine checks, use a lossless
   crop of the exact student-book drawing.
4. Never generate, redraw, recolor, vectorize, substitute a look-alike, expose
   an answer word, or change the activity layout.

## A. Confirmed authentic teacher-color crops

| Drawing | Student pages | Final asset | Teacher source | Result |
|---|---|---|---|---|
| `aro` | 1, 7, 8 | `public/cartilla/art/faithful/vocal-a/aro.webp` | HD teacher page 5, crop `[870,2580,780,660]` | Legacy `remolino` name corrected; complete identical color crop. |
| `iglú` | 4, 5, 8, 10, 13, 14 | `public/cartilla/art/faithful/vocal-i/iglu.webp` | HD teacher page 7, crop `[960,1530,600,570]` | Identical color crop. |

## B. Exact student-book crops used where no teacher counterpart exists

| Drawing | Student pages | Final asset | Workbook source and crop |
|---|---|---|---|
| `abrigo` | 1, 11 | `public/cartilla/art/faithful/leccion-1/abrigo.webp` | `restored/workbook/page-003.png`, `[230,800,440,520]` |
| `globo` | 2 | `public/cartilla/art/faithful/leccion-1/globo.webp` | `restored/workbook/page-004.png`, `[1740,2985,580,515]` |
| `abeja` | 1, 7, 8, 10, 11, 14, 16 | `public/cartilla/art/faithful/vocal-a/abeja.webp` | `restored/workbook/page-009.png`, `[720,1420,580,560]` |
| `oruga` | 7 | `public/cartilla/art/faithful/vocal-o/oruga.webp` | `restored/workbook/page-009.png`, `[720,800,580,570]` |
| `aguja` | 7, 8, 10 | `public/cartilla/art/faithful/vocal-a/aguja.webp` | `restored/workbook/page-009.png`, `[1350,2650,575,590]` |

The five binaries are lossless WebP encodes of those exact pixel crops. Pixel
comparison against the stated workbook rectangles was exact before encoding.
All 14 previously blank cells now reference these assets in
`src/data/page-layouts.json`.

## C. False missing / wrong-name findings

- `remolino` was a wrong legacy name. The printed drawing is `aro`, found on
  teacher page 5 and repaired.
- `iglú` was incorrectly treated as a color gap; the identical color drawing
  is on teacher page 7.
- `abrigo`, `globo`, `abeja`, `oruga`, and `aguja` were not missing
  from the student source. They were only absent from the separate flip chart.
  Blank cells were therefore incorrect.

## D. Generated replacements

Generated lesson substitutes are not active and must not be restored. The final
seven disputed drawings use only teacher-page crops or exact workbook crops.

## E. Unresolved

No illustration slot from this focused seven-drawing audit remains blank.
There is no claim that the five workbook-only drawings have authentic color
versions; none exists in the supplied complete flip chart.

## Evidence checked

- all 62 `teacher-page-01.jpg` through `teacher-page-62.jpg`;
- all 62 HD `page-001.jpg` through `page-062.jpg`;
- 62×62 edge-correlation identity mapping between both sets;
- full contact-sheet and full-resolution visual review;
- exact workbook-cell SIFT/RANSAC and multi-scale edge matching;
- OCR and visual rejection of differently drawn look-alikes;
- official publisher product PDF distinguishing the flip chart and student book;
- runtime-reference audit before removal of old generated/defective assets.

## Preserved scope

No renderer, layout coordinates, click/tap logic, answer visibility, navigation,
responsive rules, curriculum, authentication, database, security, or production
configuration was changed. Main and production remain untouched.
