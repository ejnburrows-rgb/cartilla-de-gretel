const FAITHFUL_PREFIX = "/cartilla/art/faithful/";

// Owner-approved replacement masters (#1158 abeja, #1160 single-eye ojos)
// supersede older 384/768 derivative images. Serve their canonical files until
// source-matched responsive derivatives have been verified and committed.
const CANONICAL_ONLY = new Set([
  "/cartilla/art/faithful/vocal-a/abeja.webp",
  "/cartilla/art/faithful/leccion-1/ojos.webp",
]);

export function isFaithfulCanonicalArt(src: string): boolean {
  return src.startsWith(FAITHFUL_PREFIX) && src.toLowerCase().endsWith(".webp");
}

export function getFaithfulDeliverySrc(src: string, width: 384 | 768): string {
  if (!isFaithfulCanonicalArt(src) || CANONICAL_ONLY.has(src)) return src;
  return `/cartilla/art/delivery/faithful/${width}/${src.slice(FAITHFUL_PREFIX.length)}`;
}

/**
 * Density-based candidates are intentional: workbook cards are generally
 * 100-300 CSS px wide. 384px covers normal displays and 768px covers retina.
 * The canonical src remains the fallback and source of truth.
 */
export function getFaithfulDeliverySrcSet(src: string): string | undefined {
  if (!isFaithfulCanonicalArt(src) || CANONICAL_ONLY.has(src)) return undefined;
  // Flip Chart-native cutouts are generated during prepare:art and are already
  // presentation-sized. They intentionally have no delivery derivative layer.
  if (src.startsWith(`${FAITHFUL_PREFIX}flipchart-native/`)) return undefined;
  return `${getFaithfulDeliverySrc(src, 384)} 1x, ${getFaithfulDeliverySrc(src, 768)} 2x`;
}
