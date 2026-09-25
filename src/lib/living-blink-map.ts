/**
 * Map of open illustrationSrc → true closed-eye / micro frames.
 * Only visually clean authored frames belong here. LivingIllustration falls
 * back to its CSS eyelid animation when no clean authored frame exists.
 */
export const TRUE_BLINK_FRAMES: Readonly<Record<string, string>> = {
  "/cartilla/art/faithful/vocal-o/oso.webp": "/cartilla/art/faithful/vocal-o/oso-blink.webp",
};

export function resolveTrueBlinkFrame(openSrc: string): string | undefined {
  return TRUE_BLINK_FRAMES[openSrc];
}
