# Cartilla Source Status

> Compact source status for implementation agents. For rules, read `../../AGENTS.md`, `../../CARTILLA_DIGITAL_DIRECTIVE.md`, `../../ASSET_FIDELITY_POLICY.md`, and `../../STUDENT_INTERACTION_STANDARD.md`.

## Authoritative visual/page-layout sources

Use the owner's Google Drive originals:

`Google Drive > Cartilla Production Hub > 01 Source Documents`

- Teacher: `La Cartilla de Gretel Flip Chart.pdf`
- Student: `Libro del alumno - Rescan and Optimize (2).pdf`

The matching source book defines structure and content. `CARTILLA_DIGITAL_DIRECTIVE.md` defines how that source is adapted into a modern digital product.

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

For the teacher Flip Chart and Student Workbook:

- preserve the matching book's structure, content, reading order, and page sequence;
- preserve approved/fixed/cropped artwork source geometry and identity;
- do not regenerate, redraw, replace, restyle, or guess visual content;
- verified source-preserving color transfer from an exact mapped Flip Chart/canonical counterpart is allowed under `ASSET_FIDELITY_POLICY.md`; preserve the Workbook drawing exactly and do not transfer extra objects/backgrounds/content between books;
- use modern digital typography, spacing, interaction, and responsive behavior only within the limits of `CARTILLA_DIGITAL_DIRECTIVE.md`.

## Corrections

- Evaluation 13 is present.
- Flip Chart pages 3 and 6 are present in the authoritative uploaded Flip Chart.
- Do not create an original-curriculum “pages 91–92 review/fluency/certificate” section. The 92-page prepared workbook source ends with printed workbook page 90 followed by the back cover; the 98-page source includes non-instructional/blank pages before the back cover.
- The 98-sheet source rescan has a verified scan gap: printed workbook pages 86–87 are absent. PDF sheet 91 is printed page 85; PDF sheets 92–94 resume at printed pages 88–90. Use `src/data/reconstruction/pdf-sheet-to-printed-page.json`; never infer printed page identity from a fixed offset.

## Canonical instructional chain

lesson → skill → workbook page → flipchart page → item/attempt → evaluation → teacher evidence → intervention

Missing original resources may be attached later without changing this architecture.
