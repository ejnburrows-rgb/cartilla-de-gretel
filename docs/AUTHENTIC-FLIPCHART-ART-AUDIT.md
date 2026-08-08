# Authentic flip-chart art audit — current repair evidence

**Status:** active repair record, 2026-08-08, branch `repair/authentic-flipchart-art`. This file overrides stale art-backlog, generated-art, provenance, crop-manifest, PR, issue, and commit claims when they conflict with the source images.

## Rule

The student workbook identifies the exact drawing. The 62 teacher flip-chart files identify that same drawing in color. The existing digital workbook identifies its slot and interaction.

For lesson content, never generate, redraw, recolor, vectorize, or substitute artwork. A filename, missing crop box, missing manifest entry, validator result, or “missing source” message is not proof that the drawing is absent. Do not add answer words to picture-selection activities.

## A. Confirmed authentic

This focused audit covered the seven reported defects. It does not recertify every other PASS asset.

| Word | Student pages | Activity | Final asset | Teacher source | Result |
|---|---|---|---|---|---|
| iglú | 4, 5, 8, 10, 13, 14 | picture selection / vowel matching | `public/cartilla/art/faithful/vocal-i/iglu.webp` | `public/cartilla/art/hd/flipchart/page-007.jpg`, crop `[960,1530,600,570]` | Exact colored drawing confirmed; printed word excluded; QA PASS. |

Machine confirmation against the 1208-pixel teacher export also produced 83 good SIFT matches and 73 geometrically consistent inliers on `teacher-page-07.jpg`. No other page was competitive.

## B. Bad but recoverable

| Word | Student page | Original bad asset | Teacher page found | Problem | Correct repair |
|---|---:|---|---:|---|---|
| iglú | 4 (also reused on 5, 8, 10, 13, 14) | `public/cartilla/art/faithful/vocal-i/iglu.webp` | 7 | Grayscale / under-colored workbook crop had been treated as missing color. | Replaced the existing binary with the authentic teacher-page crop; layout and references unchanged. |

## C. False missing

`iglú` was recoverable from teacher page 7 even though prior records treated it as a color gap. Its exact source page and crop are now recorded in both the faithful manifest and QA record.

No other item is classified false-missing until an identical teacher drawing passes visual confirmation.

## D. Generated replacements

The generated lesson substitutes for `abeja`, `aguja`, `abrigo`, `oruga`, `globo`, `remolino`, and `iglú` had no active runtime references after the branch CSS repair. Their seven SVG files and retired manifest records were removed in commit `5caf269`.

The six defective faithful binaries and blank duplicate `abeja_wb` likewise had zero references in page layouts, workbook manifest, lessons, consonants, animal gallery, or active CSS. Those seven files and their stale faithful/QA entries were removed in commit `7ef92d0`. Their original workbook drawings remain preserved in the restored workbook source pages below.

## E. Truly unresolved after all 62 teacher pages

These are unresolved matches, not authorization for substitutes.

| Word | Student pages | Exact workbook template | Workbook crop box | Result after teacher search |
|---|---|---|---|---|
| abrigo | 1, 11 | `public/cartilla/art/restored/workbook/page-003.png` | `[230,800,440,520]` | No identical teacher drawing visually confirmed. |
| globo | 2 | `public/cartilla/art/restored/workbook/page-004.png` | `[1740,2985,580,515]` | No identical teacher drawing visually confirmed. |
| abeja | 1, 7, 8, 10, 11, 14, 16 | `public/cartilla/art/restored/workbook/page-009.png` | `[720,1420,580,560]` | No identical teacher drawing visually confirmed; decorative bees on teacher page 60 are different drawings and were rejected. |
| oruga | 7 | `public/cartilla/art/restored/workbook/page-009.png` | `[720,800,580,570]` | No identical teacher drawing visually confirmed; teacher page 7's labeled `insecto` is a different drawing and was rejected. |
| aguja | 7, 8, 10 | `public/cartilla/art/restored/workbook/page-009.png` | `[1350,2650,575,590]` | No identical teacher drawing visually confirmed. |
| remolino | 1, 8 | `public/cartilla/art/restored/workbook/page-009.png` | `[1350,800,575,570]` | No identical teacher drawing visually confirmed. |

Evidence checked for every unresolved item:

1. all 62 exact files `teacher-page-01.jpg` through `teacher-page-62.jpg`;
2. all 62 higher-resolution `public/cartilla/art/hd/flipchart/page-001.jpg` through `page-062.jpg`;
3. full-page contact-sheet and full-resolution visual review;
4. SIFT feature matching with Lowe ratio filtering and RANSAC homography;
5. multi-scale edge-template matching from the exact workbook cell;
6. OCR of all 62 teacher pages for the six object names;
7. visual rejection of every top machine candidate that showed a different drawing, page furniture, text, or decoration.

The reusable audit command is `python scripts/find-authentic-flipchart-art.py`. Its templates now point to the exact workbook cells above; the previous wrong `a-page-4.jpg` boxes were removed.

## Preserved behavior and scope

No page layout, coordinates, activity logic, answer visibility, renderer, navigation, authentication, database, curriculum, or responsive behavior was changed. The six unresolved cells remain honest pending slots. Main and production remain untouched.
