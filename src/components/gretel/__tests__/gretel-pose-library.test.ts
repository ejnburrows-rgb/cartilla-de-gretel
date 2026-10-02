import { describe, it, expect } from "vitest";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  GRETEL_ASSET_INVENTORY,
  GRETEL_POSES,
  allWiredPosePaths,
  getGretelPose,
  getGretelPoseFrames,
  poseForBusEvent,
} from "../gretelPoses";

const APPROVED = "/cartilla/images/gretel/gretel-approved-master.png";
const publicRoot = join(process.cwd(), "public");

describe("Gretel approved-master inventory", () => {
  it("has one approved visual asset", () => {
    expect(GRETEL_ASSET_INVENTORY).toHaveLength(1);
    expect(GRETEL_ASSET_INVENTORY[0]?.path).toBe(APPROVED);
    expect(GRETEL_ASSET_INVENTORY[0]?.usable).toBe(true);
    expect(GRETEL_ASSET_INVENTORY[0]?.wired).toBe(true);
  });

  it("wires only the approved master", () => {
    expect(allWiredPosePaths()).toEqual([APPROVED]);
    expect(allWiredPosePaths().join("\n")).not.toContain("/poses/");
  });

  it("approved master exists and is non-empty", () => {
    const abs = join(publicRoot, APPROVED.replace(/^\//, ""));
    expect(existsSync(abs)).toBe(true);
    expect(statSync(abs).size).toBeGreaterThan(2000);
  });

  it("keeps every semantic pose key but resolves it to the approved master", () => {
    const keys = Object.keys(GRETEL_POSES);
    for (const key of [
      "idle", "blinking", "welcome", "waving", "pointing", "pointingLeft",
      "cheering", "talking", "settling", "exiting", "encouraging",
    ]) {
      expect(keys).toContain(key);
      expect(getGretelPose(key as keyof typeof GRETEL_POSES)).toBe(APPROVED);
      expect(getGretelPoseFrames(key as keyof typeof GRETEL_POSES)).toEqual([APPROVED]);
    }
  });

  it("preserves reaction semantics without alternate artwork", () => {
    expect(poseForBusEvent("lesson:start")).toBe("welcome");
    expect(poseForBusEvent("answer:correct")).toBe("cheering");
    expect(poseForBusEvent("answer:wrong")).toBe("encouraging");
    expect(poseForBusEvent("hint:show")).toBe("pointing");
  });
});
