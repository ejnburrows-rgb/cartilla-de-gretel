import type { GretelState } from "./gretelMachine";

/**
 * Real Gretel pose art (owner-supplied, background-removed), one file per
 * FSM state that needs a distinct look. States without a dedicated pose
 * (blinking, boot, error) fall back to idle in getGretelPose() below.
 */
/**
 * Pose paths. FRAME-REQUESTS fulfillment:
 * - blinking → true closed-eye idle (gretel-closed-idle.webp). Legacy
 *   gretel-blink.webp is square/mismatch vs idle and is NOT regenerated.
 * - settling / exiting / pointingLeft are additive true frames.
 */
export const GRETEL_POSES: Partial<Record<GretelState | "settling" | "exiting" | "pointingLeft", string | string[]>> = {
  idle: "/cartilla/images/gretel/poses/gretel-idle.webp",
  /** True closed-eye matching idle canvas (666×1000). */
  blinking: "/cartilla/images/gretel/poses/gretel-closed-idle.webp",
  /** Enter-scene settle / land. */
  settling: "/cartilla/images/gretel/poses/gretel-settle.webp",
  /** Lesson exit / goodbye wave (selected from wave-2). */
  exiting: "/cartilla/images/gretel/poses/gretel-wave-exit.webp",
  waving: [
    "/cartilla/images/gretel/poses/gretel-wave.webp",
    "/cartilla/images/gretel/poses/gretel-wave-1.webp",
    "/cartilla/images/gretel/poses/gretel-wave-2.webp",
  ],
  pointing: "/cartilla/images/gretel/poses/gretel-point.webp",
  /** Mirror of point for right-side bubble layouts. */
  pointingLeft: "/cartilla/images/gretel/poses/gretel-point-left.webp",
  cheering: [
    "/cartilla/images/gretel/poses/gretel-cheer.webp",
    "/cartilla/images/gretel/poses/gretel-cheer-1.webp",
  ],
  talking: [
    "/cartilla/images/gretel/poses/gretel-talk-0.webp",
    "/cartilla/images/gretel/poses/gretel-talk-1.webp",
    "/cartilla/images/gretel/poses/gretel-talk-2.webp",
  ],
};

/** Kept for any old call site still importing the single-image constant. */
export const GRETEL_ORIGINAL_ARTWORK = "/cartilla/images/gretel/poses/gretel-idle.webp";

export type GretelPoseKey = GretelState | "settling" | "exiting" | "pointingLeft";

export function getGretelPoseFrames(state: GretelPoseKey): string | string[] {
  return GRETEL_POSES[state] ?? (GRETEL_POSES.idle as string);
}

export function getGretelPose(state: GretelPoseKey): string {
  const pose = GRETEL_POSES[state] ?? GRETEL_POSES.idle;
  return Array.isArray(pose) ? pose[0] : (pose as string);
}
