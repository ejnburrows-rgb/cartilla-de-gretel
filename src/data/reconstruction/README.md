# Cartilla deterministic reconstruction

This directory is separate from the HTML `FaithfulPageRenderer`.

## Canonical inputs

- `student-to-flipchart-284.json` — exact copy of the authoritative 98-record Workbook-PDF-sheet ↔ Flip Chart mapping. It contains **284 total page links** (109 primary + 175 supplemental). It is a reference-pool gate, not an object-placement map.
- `pdf-sheet-to-printed-page.json` — verified translation between the 98-sheet source PDF and printed Workbook page numbers 1–90. Printed pages 86–87 are absent from the 98-sheet source scan.
- `reconstruction-plan.json` — object-level placements. Coordinates must be verified against the actual PDFs; never reuse the failed Lovable overlay coordinates.
- `production-manifest.json` — only visually approved reconstructed masters with full provenance. The application may use an entry only when its verification status is PASS and all provenance fields validate.

## Reconstruction priority

1. If the mapped Flip Chart contains the exact same drawing, reuse the authentic colored Flip Chart crop directly in the exact Workbook illustration region.
2. If geometry is not identical, keep the Workbook drawing and use only a separately verified color-transfer result.
3. Never substitute a merely similar illustration.

The engine is `scripts/reconstruct-workbook.mjs`. It operates on PDF pixels and does not call `FaithfulPageRenderer`.
