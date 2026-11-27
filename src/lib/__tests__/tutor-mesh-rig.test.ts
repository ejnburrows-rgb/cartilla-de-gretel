import { describe, expect, it } from "vitest";
import { buildGretelBodyMesh, deformGretelMesh, solveTwoBoneIK } from "../tutor-mesh-rig";

describe("tutor-mesh-rig", () => {
  it("solves 2-bone analytical IK accurately within reach without snap", () => {
    const sol = solveTwoBoneIK({
      shoulder: { x: 900, y: 500 },
      target: { x: 480, y: 360 },
      upperLen: 260,
      forearmLen: 260,
      bendSign: -1,
    });

    // Elbow must maintain exact bone segment lengths
    const distUpper = Math.hypot(sol.elbow.x - sol.shoulder.x, sol.elbow.y - sol.shoulder.y);
    const distFore = Math.hypot(sol.hand.x - sol.elbow.x, sol.hand.y - sol.elbow.y);
    expect(distUpper).toBeCloseTo(260, 0);
    expect(distFore).toBeCloseTo(260, 0);
    // Target is within reach (distance ~ 442 < 520), so hand arrives accurately
    expect(sol.clampedReach).toBe(false);
    expect(sol.hand.x).toBeCloseTo(480, 0);
    expect(sol.hand.y).toBeCloseTo(360, 0);
  });

  it("softly clamps out-of-reach targets instead of NaN or breaking limbs", () => {
    const sol = solveTwoBoneIK({
      shoulder: { x: 900, y: 500 },
      target: { x: 20, y: 50 },
      upperLen: 220,
      forearmLen: 220,
      bendSign: -1,
    });
    expect(sol.clampedReach).toBe(true);
    expect(Number.isFinite(sol.elbow.x)).toBe(true);
    expect(Number.isFinite(sol.hand.x)).toBe(true);
    const reach = Math.hypot(sol.hand.x - sol.shoulder.x, sol.hand.y - sol.shoulder.y);
    expect(reach).toBeLessThanOrEqual(440);
  });

  it("deforms mesh smoothly across head turn, breathing, and lagged hair curls", () => {
    const mesh = buildGretelBodyMesh(1024, 662, 14, 10);
    expect(mesh.vertices.length).toBe(15 * 11);
    expect(mesh.indices.length).toBe(14 * 10 * 6);

    const restCoords = deformGretelMesh(mesh, {
      breathePhase: 0,
      headTiltDeg: 0,
      headYaw: 0,
      headNodPx: 0,
      hairSwayLeftDeg: 0,
      hairSwayRightDeg: 0,
    });
    const turnedCoords = deformGretelMesh(mesh, {
      breathePhase: 0.8,
      headTiltDeg: -1.8,
      headYaw: -0.9,
      headNodPx: 1.5,
      hairSwayLeftDeg: 0.9,
      hairSwayRightDeg: 0.8,
    });

    // Mid-face head vertices shifted & chest moved gently without collapsing bounds
    let maxDiff = 0;
    for (let i = 0; i < restCoords.length; i++) {
      maxDiff = Math.max(maxDiff, Math.abs(turnedCoords[i] - restCoords[i]));
    }
    expect(maxDiff).toBeGreaterThan(2);
    expect(maxDiff).toBeLessThan(40);
  });
});
