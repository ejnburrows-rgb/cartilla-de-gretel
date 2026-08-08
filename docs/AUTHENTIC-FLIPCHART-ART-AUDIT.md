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
| aro | 1, 7, 8 | picture selection / vowel matching | `public/cartilla/art/faithful/vocal-a/aro.webp` | `public/cartilla/art/hd/flipchart/page-005.jpg`, crop `[870,2580,780,660]` | The page-1 and page-8 cells were mislabeled `remolino`; all `aro` uses now share the complete authentic teacher-page crop. |

Machine confirmation against the 1208-pixel teacher export also produced 83 good SIFT matches and 73 geometrically consistent inliers on `teacher-page-07.jpg`. No other page was competitive.

## B. Bad but recoverable

| Word | Student page | Original bad asset | Teacher page found | Problem | Correct repair |
|---|---:|---|---:|---|---|
| iglú | 4 (also reused on 5, 8, 10, 13, 14) | `public/cartilla/art/faithful/vocal-i/iglu.webp` | 7 | Grayscale / under-colored workbook crop had been treated as missing color. | Replaced the existing binary with the authentic teacher-page crop; layout and references unchanged. |
| aro | 1, 8 | no illustration asset: cells were captioned `remolino` | 5 | Incorrect object name made the real source unsearchable. | Corrected both cells to `aro` and wired the existing authentic `aro.webp`; layout and interaction unchanged. |

## C. False missing

`iglú` was recoverable from teacher page 7 even though prior records treated it as a color gap. Its exact source page and crop are now recorded in both the faithful manifest and QA record.

`aro` was falsely treated as a separate `remolino` target. The original student-page transcription identifies both disputed cells as `aro`, and teacher page 5 carries the identical color drawing. The cells now use the existing authentic `aro.webp` asset.

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

## Preview verification

- Repository: `ejnburrows-rgb/cartilla-de-gretel`
- Branch: `repair/authentic-flipchart-art`
- Last app-changing commit: `2fefc27adfafa3f25ca2d98d3b009bea438da0d4`
- READY preview: `https://cartilla-de-gretel-jofk8wk64-ejns-projects-1b938dd2.vercel.app`
- Vercel build: completed successfully.
- Browser route: `/cartilla/leccion/1` loaded with meaningful workbook content and no application error overlay.
- `aro.webp`: direct preview reports 780×660 and visually shows the complete teacher-page-5 drawing without the printed word.
- Interaction: clicking the rendered `aro` changed its parent from `fp-ix-cell` to `fp-ix-cell picked`.
- Browser application errors: none. Vercel runtime errors for the checked route/time window: none.
- `iglú.webp`: direct preview reports 600×570 and visually matches the teacher-page-7 crop.
- Lesson 3 is progress-locked in the anonymous preview, so its page-7/page-8 reuse was verified from the canonical layout data and shared asset path, not by mutating student progress.

## Preserved behavior and scope

No page layout, coordinates, activity logic, answer visibility, renderer, navigation, authentication, database, curriculum, or responsive behavior was changed. The five unresolved drawings account for 14 visible cells and remain honest pending slots. Main and production remain untouched.
