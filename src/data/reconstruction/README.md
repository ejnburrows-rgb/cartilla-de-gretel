# Cartilla page mapping / placement data

This directory contains reference data for identifying the correct Workbook and Flip Chart pages.

It does **not** authorize image editing, color transfer, remastering, illustration replacement, or rebuilding book pages from separate objects.

Read `../../../BOOK_FIDELITY_RULE.md` first.

## Canonical inputs

- `student-to-flipchart-284.json` — authoritative Workbook-PDF-sheet ↔ Flip Chart relationship data. It is a reference-pool/page-relationship gate, not permission to copy artwork between books.
- `pdf-sheet-to-printed-page.json` — verified translation between the 98-sheet source PDF and printed Workbook page numbers 1–90. Printed pages 86–87 are absent from the 98-sheet source scan.
- `reconstruction-plan.json` — historical placement data. Treat coordinates as hints only; verify placement visually against the authoritative physical-book PDFs.
- `production-manifest.json` — historical provenance/verification metadata. It does not override the current book-fidelity rule.

## Current priority

1. Identify the exact target book and page.
2. Use that book's authoritative page as the visual layout reference.
3. Place the existing approved/fixed/cropped image assets in the correct source-faithful positions.
4. Preserve page geometry, spacing, scale, order, and composition.
5. Do not alter the image pixels or transfer artwork/colors between books.
6. Verify side-by-side against the corresponding book page.

If historical reconstruction tooling conflicts with this rule, the tooling must be changed or bypassed; the book must not be changed to fit the tooling.
