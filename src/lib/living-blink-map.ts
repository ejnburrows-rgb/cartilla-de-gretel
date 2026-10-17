/**
 * Map of open illustrationSrc → true closed-eye / micro frames.
 * Only visually clean authored frames belong here. LivingIllustration falls
 * back to its CSS eyelid animation when no clean authored frame exists.
 */
export const TRUE_BLINK_FRAMES: Readonly<Record<string, string>> = {
  // vocal-o/oso-blink.webp was made from the OLD bear. The bear was redrawn
  // (picture PR #888), so swapping to it would flash old art. The new bear blinks
  // inside vocal-o/oso-alive.svg instead.
};

export function resolveTrueBlinkFrame(openSrc: string): string | undefined {
  return TRUE_BLINK_FRAMES[openSrc];
}
