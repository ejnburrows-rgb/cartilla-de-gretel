/**
 * Full Gretel pose library — not a scarce 3-file character.
 */
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

const publicRoot = join(process.cwd(), "public");

describe("Gretel full pose library inventory", () => {
  it("inventories every known Gretel asset with usable/wired flags", () => {
    expect(GRETEL_ASSET_INVENTORY.length).toBeGreaterThanOrEqual(18);
    for (const row of GRETEL_ASSET_INVENTORY) {
      expect(row.path).toBeTruthy();
      expect(typeof row.usable).toBe("boolean");
      expect(typeof row.wired).toBe("boolean");
      expect(row.notes.length).toBeGreaterThan(3);
    }
  });

  it("wires far more than idle+blink+talk-0 (no scarce 3-file system)", () => {
    const wired = allWiredPosePaths();
    expect(wired.length).toBeGreaterThanOrEqual(14);
    // Required families present
    expect(wired.some((p) => p.includes("gretel-wave"))).toBe(true);
    expect(wired.some((p) => p.includes("gretel-cheer"))).toBe(true);
    expect(wired.some((p) => p.includes("gretel-point"))).toBe(true);
    expect(wired.some((p) => p.includes("gretel-settle"))).toBe(true);
    expect(wired.some((p) => p.includes("gretel-talk-1"))).toBe(true);
    expect(wired.some((p) => p.includes("gretel-talk-2"))).toBe(true);
    expect(wired.some((p) => p.includes("gretel-closed-idle"))).toBe(true);
  });

  it("every wired pose file exists and is non-empty on disk", () => {
    for (const rel of allWiredPosePaths()) {
      const abs = join(publicRoot, rel.replace(/^\//, ""));
      expect(existsSync(abs), `missing ${rel}`).toBe(true);
      const bytes = statSync(abs).size;
      expect(bytes, `stub/empty ${rel}`).toBeGreaterThan(2000);
    }
  });

  it("rejects legacy gretel-blink.webp (wrong canvas) from GRETEL_POSES", () => {
    const wired = allWiredPosePaths().join("\n");
    expect(wired).not.toContain("gretel-blink.webp");
    const blinkRow = GRETEL_ASSET_INVENTORY.find((r) => r.path.includes("gretel-blink.webp"));
    expect(blinkRow?.usable).toBe(false);
    expect(blinkRow?.wired).toBe(false);
  });

  it("multi-frame families cycle for wave/cheer/talk", () => {
    expect(Array.isArray(getGretelPoseFrames("waving"))).toBe(true);
    expect((getGretelPoseFrames("waving") as string[]).length).toBeGreaterThanOrEqual(3);
    expect((getGretelPoseFrames("cheering") as string[]).length).toBeGreaterThanOrEqual(2);
    expect((getGretelPoseFrames("talking") as string[]).length).toBeGreaterThanOrEqual(3);
    expect((getGretelPoseFrames("welcome") as string[]).length).toBeGreaterThanOrEqual(3);
    expect((getGretelPoseFrames("pointingLeft") as string[]).length).toBeGreaterThanOrEqual(2);
  });

  it("maps product moments to pose families", () => {
    expect(poseForBusEvent("lesson:start")).toBe("welcome");
    expect(poseForBusEvent("answer:correct")).toBe("cheering");
    expect(poseForBusEvent("answer:wrong")).toBe("encouraging");
    expect(poseForBusEvent("hint:show")).toBe("pointing");
    expect(getGretelPose("encouraging")).toContain("settle");
    expect(getGretelPose("exiting")).toContain("wave-exit");
  });

  it("every usable inventory row is either wired or explicitly unused-with-reason", () => {
    for (const row of GRETEL_ASSET_INVENTORY) {
      if (row.usable && !row.wired) {
        // Only source reference may be usable-but-unwired
        expect(row.notes.toLowerCase()).toMatch(/unused|source|reference|reject/);
      }
      if (!row.usable) {
        expect(row.wired).toBe(false);
      }
    }
  });

  it("GRETEL_POSES covers idle welcome wave point cheer talk settle exit encourage", () => {
    const keys = Object.keys(GRETEL_POSES);
    for (const k of [
      "idle",
      "blinking",
      "welcome",
      "waving",
      "pointing",
      "pointingLeft",
      "cheering",
      "talking",
      "settling",
      "exiting",
      "encouraging",
    ]) {
      expect(keys).toContain(k);
    }
  });
});
