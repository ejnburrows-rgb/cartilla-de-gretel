const FAITHFUL_PREFIX = "/cartilla/art/faithful/";

export function isFaithfulCanonicalArt(src: string): boolean {
  return src.startsWith(FAITHFUL_PREFIX) && src.toLowerCase().endsWith(".webp");
}

export function getFaithfulDeliverySrc(src: string, width: 384 | 768): string {
  if (!isFaithfulCanonicalArt(src)) return src;
  return `/cartilla/art/delivery/faithful/${width}/${src.slice(FAITHFUL_PREFIX.length)}`;
}

/**
 * Density-based candidates are intentional: workbook cards are generally
 * 100-300 CSS px wide. 384px covers normal displays and 768px covers retina.
 * The canonical src remains the fallback and source of truth.
 */
export function getFaithfulDeliverySrcSet(src: string): string | undefined {
  if (!isFaithfulCanonicalArt(src)) return undefined;
  return `${getFaithfulDeliverySrc(src, 384)} 1x, ${getFaithfulDeliverySrc(src, 768)} 2x`;
}
