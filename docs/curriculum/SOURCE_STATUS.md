# Cartilla Source Status

> Compact source-of-truth status for implementation agents.

## Authoritative visual/page-layout sources

Use the owner's Google Drive originals:

`Google Drive > Cartilla Production Hub > 01 Source Documents`

- Teacher: `La Cartilla de Gretel Flip Chart.pdf`
- Student: `Libro del alumno - Rescan and Optimize (2).pdf`

For book-page appearance and layout, these two PDFs are authoritative. Read `../../PROJECT_SOURCE_OF_TRUTH.md`.

## Verified authoritative material
- Student workbook original rescan: 98 PDF pages.
- Student workbook prepared digital source: 92 PDF pages.
- Numbered instructional workbook content: printed pages 1–90, Lessons 1–24.
- Flip Chart: 62 PDF pages total; 60 numbered instructional pages.
- Evaluations 7–24: full text available.
- Evaluation 13 (N n): confirmed available.
- B.L. Master 7: full source available.
- B.L. Master 25: partial/thumbnail source.
- Homework/Rima samples: 7, 8, 9.
- Supplemental Pp/vowel/game materials: available in source package.

## Source-pending
- Original full Teacher's Guide.
- Evaluations 1–6 full masters.
- Homework/Rima masters 1–6 and 10–24.
- Most Blackline Masters / individual syllabic sheets.
- Original/master audio.

## Hard implementation rule

If source material is absent, mark it `source-pending`.
Do not invent, reconstruct, or silently substitute content and label it as original.

For the teacher Flip Chart / flipbook and Student Workbook:

- the approved/fixed/cropped images are locked;
- do not recolor, remaster, regenerate, redraw, recrop, retouch, restyle, or replace them;
- do not transfer art/colors/layout between the two books;
- reproduce each source book's own page order, placement, scale, geometry, spacing, and composition;
- responsive behavior may scale the whole page but must not reflow its internal book layout.

## Corrections
- Evaluation 13 is present.
- Flip Chart pages 3 and 6 are present in the authoritative uploaded Flip Chart.
- Do not create an original-curriculum “pages 91–92 review/fluency/certificate” section. The 92-page prepared workbook source ends with printed workbook page 90 followed by the back cover; the 98-page source includes non-instructional/blank pages before the back cover.
- The 98-sheet source rescan has a verified scan gap: printed workbook pages 86–87 are absent. PDF sheet 91 is printed page 85; PDF sheets 92–94 resume at printed pages 88–90. Use `src/data/reconstruction/pdf-sheet-to-printed-page.json`; never infer printed page identity from a fixed offset.

## Canonical instructional chain
lesson → skill → workbook page → flipchart page → item/attempt → evaluation → teacher evidence → intervention

Missing original resources may be attached later without changing this architecture.
