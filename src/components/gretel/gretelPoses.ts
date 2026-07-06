import type { GretelState } from "./gretelMachine";

/**
 * Real Gretel pose art (owner-supplied, background-removed), one file per
 * FSM state that needs a distinct look. States without a dedicated pose
 * (blinking, boot, error) fall back to idle in getGretelPose() below.
 */
export const GRETEL_POSES: Partial<Record<GretelState, string | string[]>> = {
  idle: "/cartilla/images/gretel/poses/gretel-idle.webp",
  blinking: "/cartilla/images/gretel/poses/gretel-blink.webp",
  waving: [
    "/cartilla/images/gretel/poses/gretel-wave.webp",
    "/cartilla/images/gretel/poses/gretel-wave-1.webp",
    "/cartilla/images/gretel/poses/gretel-wave-2.webp",
  ],
  pointing: "/cartilla/images/gretel/poses/gretel-point.webp",
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

export function getGretelPoseFrames(state: GretelState): string | string[] {
  return GRETEL_POSES[state] ?? (GRETEL_POSES.idle as string);
}

export function getGretelPose(state: GretelState): string {
  const pose = GRETEL_POSES[state] ?? GRETEL_POSES.idle;
  return Array.isArray(pose) ? pose[0] : (pose as string);
}
