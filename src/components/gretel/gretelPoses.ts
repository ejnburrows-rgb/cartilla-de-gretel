import type { GretelState } from "./gretelMachine";

/**
 * Real Gretel pose art (owner-supplied, background-removed), one file per
 * FSM state that needs a distinct look. States without a dedicated pose
 * (blinking, boot, error) fall back to idle in getGretelPose() below.
 */
export const GRETEL_POSES: Partial<Record<GretelState, string>> = {
  idle: "/cartilla/images/gretel/poses/gretel-idle.webp",
  waving: "/cartilla/images/gretel/poses/gretel-wave.webp",
  pointing: "/cartilla/images/gretel/poses/gretel-point.webp",
  cheering: "/cartilla/images/gretel/poses/gretel-cheer.webp",
  talking: "/cartilla/images/gretel/poses/gretel-talk.webp",
};

/** Kept for any old call site still importing the single-image constant. */
export const GRETEL_ORIGINAL_ARTWORK = GRETEL_POSES.idle as string;

export function getGretelPose(state: GretelState): string {
  return GRETEL_POSES[state] ?? (GRETEL_POSES.idle as string);
}
