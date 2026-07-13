/**
 * Map of open illustrationSrc → true closed-eye / micro frames.
 * LivingIllustration prefers these when present; otherwise soft lid overlay.
 * Timing/breath amplitude are unchanged (living-motion.ts).
 */
export const TRUE_BLINK_FRAMES: Readonly<Record<string, string>> = {
  "/cartilla/art/faithful/vocal-o/oso.webp":
    "/cartilla/art/faithful/vocal-o/oso-blink.webp",
  "/cartilla/art/faithful/leccion-7-m/mono.webp":
    "/cartilla/art/faithful/leccion-7-m/mono-blink.webp",
  "/cartilla/art/faithful/leccion-8-p/papa.webp":
    "/cartilla/art/faithful/leccion-8-p/papa-blink.webp",
  "/cartilla/art/faithful/leccion-9-s/sapo.webp":
    "/cartilla/art/faithful/leccion-9-s/sapo-blink.webp",
};

export function resolveTrueBlinkFrame(openSrc: string): string | undefined {
  return TRUE_BLINK_FRAMES[openSrc];
}
