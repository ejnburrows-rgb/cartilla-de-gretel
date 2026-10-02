import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";

export type GretelPoseKey =
  | "boot" | "settling" | "idle" | "blinking" | "talking" | "waving"
  | "pointing" | "cheering" | "exiting" | "error" | "pointingLeft"
  | "encouraging" | "welcome";

export const GRETEL_POSES: Record<GretelPoseKey, string | string[]> = {
  boot: GRETEL_APPROVED_MASTER_SRC,
  settling: GRETEL_APPROVED_MASTER_SRC,
  idle: GRETEL_APPROVED_MASTER_SRC,
  blinking: GRETEL_APPROVED_MASTER_SRC,
  talking: GRETEL_APPROVED_MASTER_SRC,
  waving: GRETEL_APPROVED_MASTER_SRC,
  pointing: GRETEL_APPROVED_MASTER_SRC,
  cheering: GRETEL_APPROVED_MASTER_SRC,
  exiting: GRETEL_APPROVED_MASTER_SRC,
  error: GRETEL_APPROVED_MASTER_SRC,
  pointingLeft: GRETEL_APPROVED_MASTER_SRC,
  encouraging: GRETEL_APPROVED_MASTER_SRC,
  welcome: GRETEL_APPROVED_MASTER_SRC,
};

export type GretelAssetRow = { path: string; pose: string; usable: boolean; wired: boolean; notes: string };
export const GRETEL_ASSET_INVENTORY: GretelAssetRow[] = [{
  path: GRETEL_APPROVED_MASTER_SRC,
  pose: "approved master",
  usable: true,
  wired: true,
  notes: "Owner-approved master; the only Gretel illustration used by the app.",
}];
export function allWiredPosePaths(): string[] { return [GRETEL_APPROVED_MASTER_SRC]; }
export function poseForGretelEvent(): GretelPoseKey | null { return "idle"; }

export function getGretelPose(key: GretelPoseKey): string {
  const pose = GRETEL_POSES[key];
  return Array.isArray(pose) ? pose[0]! : pose;
}

export function getGretelPoseFrames(key: GretelPoseKey): string[] {
  const pose = GRETEL_POSES[key];
  return Array.isArray(pose) ? pose : [pose];
}

export function poseForBusEvent(event: string): GretelPoseKey {
  switch (event) {
    case "lesson:start": return "welcome";
    case "answer:correct":
    case "lesson:complete":
    case "activity:complete": return "cheering";
    case "answer:wrong": return "encouraging";
    case "hint:show": return "pointing";
    case "page-turn:start": return "settling";
    case "talk:start": return "talking";
    case "talk:stop": return "idle";
    default: return "idle";
  }
}
