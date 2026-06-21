/**
 * Central image resolver for workbook pages.
 *
 * Source of truth: public/cartilla/art/color/workbook/page-NNN.png
 *   - 2550×3301 px, full color scans of the original book
 *   - Zero-padded 3-digit filenames (page-001.png … page-092.png)
 *
 * HARD RULE: Never replace or alter these source images. They are the truth.
 */

const COLOR_SCAN_COUNT = 92;

function zeroPad(n: number): string {
  return String(n).padStart(3, "0");
}

export function getBookPageImage(pageNumber: number): string | null {
  if (pageNumber >= 1 && pageNumber <= COLOR_SCAN_COUNT) {
    return `/cartilla/art/color/workbook/page-${zeroPad(pageNumber)}.png`;
  }
  return null;
}
