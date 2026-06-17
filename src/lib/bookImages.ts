/**
 * Helper module for book page images.
 *
 * Remastered WebP images live in /public/art/remastered/.
 * Source: public/cartilla/art/color/workbook/page-NNN.png (2550×3301, 300 DPI)
 * Converted to WebP quality-90 — 2.8× higher resolution than previous 900×1350 PNGs.
 *
 * Falls back to /art/hd/page-N.png for pages 93-95 (not in workbook source set).
 */

const REMASTERED_COUNT = 92;

export function getBookPageImage(pageNumber: number): string {
  if (pageNumber >= 1 && pageNumber <= REMASTERED_COUNT) {
    return `/art/remastered/page-${pageNumber}.webp`;
  }
  // Pages beyond the remastered set fall back to old hd PNGs
  return `/art/hd/page-${pageNumber}.png`;
}
