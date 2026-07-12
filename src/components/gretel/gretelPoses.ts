import type { GretelState } from "./gretelMachine";

/**
 * Presentation pose frames under /public/gretel/poses/<pose>/frame-n.webp
 * Source-derived from owner-supplied cutouts (no AI redesign).
 *
 * Rejected: gretel-wave.webp (white tee / teal skirt — clothing mismatch).
 * Blink: enabled — gretel-blink.webp is a valid half-lid frame of the same character.
 */
export const GRETEL_BLINK_ENABLED = true;

export const GRETEL_HERO = {
  src: "/cartilla/art/hero/gretel-hero.webp",
  src2x: "/cartilla/art/hero/gretel-hero@2x.webp",
  cutout: "/cartilla/art/hero/gretel-hero-cutout.webp",
  altEs: "Gretel sostiene el libro La cartilla de Gretel",
  altEn: "Gretel holding the book La cartilla de Gretel",
} as const;

/**
 * Real Gretel pose art, one path or frame array per FSM state.
 * Paths prefer the presentation pack under /gretel/poses/.
 */
export const GRETEL_POSES: Partial<Record<GretelState | "thinking", string | string[]>> = {
  idle: [
    "/gretel/poses/idle/frame-0.webp",
    // frame-1 is blink — only used when GRETEL_BLINK_ENABLED and state === blinking
  ],
  blinking: GRETEL_BLINK_ENABLED
    ? "/gretel/poses/blinking/frame-0.webp"
    : "/gretel/poses/idle/frame-0.webp",
  waving: [
    "/gretel/poses/waving/frame-0.webp",
    "/gretel/poses/waving/frame-1.webp",
  ],
  pointing: "/gretel/poses/pointing/frame-0.webp",
  cheering: [
    "/gretel/poses/cheering/frame-0.webp",
    "/gretel/poses/cheering/frame-1.webp",
  ],
  talking: [
    "/gretel/poses/talking/frame-0.webp",
    "/gretel/poses/talking/frame-1.webp",
    "/gretel/poses/talking/frame-2.webp",
  ],
  /** Contemplative closed-mouth frames for help / waiting states (not a core FSM state). */
  thinking: [
    "/gretel/poses/thinking/frame-0.webp",
    "/gretel/poses/thinking/frame-1.webp",
  ],
};

/** Kept for any old call site still importing the single-image constant. */
export const GRETEL_ORIGINAL_ARTWORK = "/gretel/poses/idle/frame-0.webp";

export function getGretelPoseFrames(state: GretelState | "thinking"): string | string[] {
  if (state === "idle") {
    return GRETEL_POSES.idle?.[0]
      ? (Array.isArray(GRETEL_POSES.idle) ? GRETEL_POSES.idle[0] : GRETEL_POSES.idle)
      : "/gretel/poses/idle/frame-0.webp";
  }
  return GRETEL_POSES[state] ?? (getGretelPoseFrames("idle") as string);
}

export function getGretelPose(state: GretelState | "thinking"): string {
  const pose = getGretelPoseFrames(state);
  return Array.isArray(pose) ? pose[0] : pose;
}

/** Reduced-motion: always the first static frame of a pose (no frame cycling). */
export function getGretelStaticPose(state: GretelState | "thinking"): string {
  return getGretelPose(state);
}
