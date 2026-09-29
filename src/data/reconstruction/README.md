# Cartilla page mapping / placement data

This directory contains reference data for identifying the correct Student Workbook and teacher Flip Chart pages.

Read `../../../CARTILLA_SOURCE_OF_TRUTH.md` before using any file here.

These mappings help locate content. They do **not** authorize image editing, color transfer, remastering, illustration replacement, or rebuilding book pages from separate objects.

## Canonical inputs

- `student-to-flipchart-284.json` — authoritative Workbook-PDF-sheet ↔ Flip Chart relationship data. It is a page-relationship/reference gate, not permission to copy artwork between books.
- `pdf-sheet-to-printed-page.json` — verified translation between the 98-sheet source PDF and printed Workbook page numbers 1–90. Printed pages 86–87 are absent from the 98-sheet source scan.
- `reconstruction-plan.json` — historical placement data. Treat coordinates as hints only; verify them visually against the matching authoritative source PDF page.
- `production-manifest.json` — historical provenance/verification metadata. It does not override the physical books or `CARTILLA_SOURCE_OF_TRUTH.md`.

## Current implementation priority

1. Identify the exact target book and page.
2. Open the matching authoritative source PDF page.
3. Use the existing approved/fixed/cropped image assets unchanged.
4. Place them so position, scale, crop, spacing, order, and page geometry match the source.
5. Preserve the Flip Chart as the Flip Chart and the Workbook as the Workbook.
6. Verify the rendered digital page side-by-side against the physical-book page.

If historical reconstruction tooling conflicts with the source book, change or bypass the tooling. Do not change the book or the approved image to fit the tooling.
