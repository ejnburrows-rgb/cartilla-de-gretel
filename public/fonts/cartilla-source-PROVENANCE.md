# Cartilla Source

These partial typefaces reconstruct observed letter outlines from the repository's authentic workbook scans, printed pages 23–66. They are not the original publisher font program. No font service, new subscription, or externally hosted kit is used.

`src/data/workbook-source-font-400.json` and `workbook-source-font-700.json` identify the original page, verified canonical word, source pixel box, baseline, and normalization for every included character. Unobserved characters use the already bundled Workbook Gothic fallback. The `unicode-range` declarations list only the observed characters.

Producer: `scripts/build-lane-b-source-font.py`, using the source-pixel contour code in `scripts/lane_b_source_contours.py`. Every sampled OCR word must match canonical book text, including letter case; source-layout text is never replaced with OCR output. The small page-25 sight word is checked against its canonical two-letter source entry before extracting its two letter components. Word advance widths are fitted against verified source-word measurements. The raw median-width errors are retained in the proof logs.

The source scans are preserved unchanged. `src/data/workbook-middle-source-geometry.json` records their SHA-256 hashes and separately preserves original wave, printed model/arrow/number, title, ruling and drawing-outline geometry. Typography remains live selectable text; printed model outlines are source-preserving vectors. No subject illustrations are added.

To regenerate with Python numpy, scipy, Pillow, fontTools and local Tesseract:

    python scripts/build-lane-b-source-font.py
    python scripts/measure-lane-b-source.py

The generated fonts are scoped to Lane B. Existing components and fonts remain the fallback outside these pages. See workbook-gothic-LICENSE.txt and source/ for the existing fallback font's license and source programs.
