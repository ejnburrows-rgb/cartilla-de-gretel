/**
 * Central image resolver for workbook pages.
 *
 * Source of truth: public/cartilla/art/color/workbook-corrected/page-NNN.png
 *   - 2550×3300 px, rendered from the corrected master PDF
 *     (La_cartilla_Workbook.pdf), with correctly-oriented text
 *   - Zero-padded 3-digit filenames (page-001.png … page-092.png)
 *
 * The original .../workbook/page-NNN.png scans had a mirrored/backwards-text
 * bug; they are kept in place untouched but are no longer served.
 *
 * Pages 93-95 fall back to /art/hd/page-N.png (placeholder scans).
 *
 * Images may be cleaned up / cropped / mastered as long as they stay 100%
 * faithful to the original artwork (no restyling).
 */

const COLOR_SCAN_COUNT = 92;

function zeroPad(n: number): string {
  return String(n).padStart(3, "0");
}

export function getBookPageImage(pageNumber: number): string {
  if (pageNumber >= 1 && pageNumber <= COLOR_SCAN_COUNT) {
    return `/cartilla/art/color/workbook-corrected/page-${zeroPad(pageNumber)}.png`;
  }
  return `/art/hd/page-${pageNumber}.png`;
}
