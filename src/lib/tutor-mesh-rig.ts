/**
 * Real 2D triangulated soft-body mesh skinning, skeletal bone weights, and
 * analytical 2-bone Inverse Kinematics (IK) solver for Gretel's Hybrid Stage.
 *
 * Replaces rigid sprite swaps with smooth continuous deformation across chest
 * breathing, head turns, and multi-segment phase-lagged golden hair waves, plus
 * real shoulder-elbow-hand IK locked directly to the live chalkboard chalk tip.
 */

export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export interface TwoBoneIKSolution {
  readonly shoulder: Vec2;
  readonly elbow: Vec2;
  readonly hand: Vec2;
  /** Upper arm angle in radians (from shoulder toward elbow). */
  readonly upperAngleRad: number;
  /** Forearm angle in radians (from elbow toward hand). */
  readonly forearmAngleRad: number;
  readonly clampedReach: boolean;
}

export interface MeshVertex {
  readonly u: number;
  readonly v: number;
  readonly x0: number;
  readonly y0: number;
  readonly wHead: number;
  readonly wChest: number;
  readonly wHairLeft: number;
  readonly wHairRight: number;
  readonly wBow: number;
}

export interface GretelBodyMesh {
  readonly cols: number;
  readonly rows: number;
  readonly width: number;
  readonly height: number;
  readonly vertices: readonly MeshVertex[];
  readonly indices: readonly number[];
}

export interface MeshPoseInput {
  /** Normalized breathing oscillation [-1..+1]. */
  readonly breathePhase: number;
  /** Head tilt in degrees (strictly bounded, zero bouncing). */
  readonly headTiltDeg: number;
  /** Subtle head turn/yaw [-1 facing chalkboard left .. 0 front .. +1 right]. */
  readonly headYaw: number;
  /** Gentle nodding vertical offset in source pixels. */
  readonly headNodPx: number;
  /** Phase-delayed hair curl swing (left/right angles in deg). */
  readonly hairSwayLeftDeg: number;
  readonly hairSwayRightDeg: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Analytical 2-bone Inverse Kinematics solver using the Law of Cosines.
 * Guarantees smooth continuous elbow bend without snap or over-extension.
 */
export function solveTwoBoneIK(input: {
  readonly shoulder: Vec2;
  readonly target: Vec2;
  readonly upperLen: number;
  readonly forearmLen: number;
  /** +1 bends elbow down/outward (natural right arm reaching left); -1 bends opposite. */
  readonly bendSign?: 1 | -1;
}): TwoBoneIKSolution {
  const { shoulder, target, upperLen, forearmLen } = input;
  const bendSign = input.bendSign ?? -1;

  const dx = target.x - shoulder.x;
  const dy = target.y - shoulder.y;
  const rawDist = Math.hypot(dx, dy);

  const minReach = Math.abs(upperLen - forearmLen) + 6;
  const maxReach = (upperLen + forearmLen) * 0.985;
  const clamped = rawDist > maxReach || rawDist < minReach;
  const dist = clamp(rawDist, minReach, maxReach);

  const baseAngle = Math.atan2(dy, dx);
  const cosShoulderOffset = clamp(
    (upperLen * upperLen + dist * dist - forearmLen * forearmLen) / (2 * upperLen * dist),
    -1,
    1,
  );
  const shoulderOffset = Math.acos(cosShoulderOffset);
  const upperAngleRad = baseAngle + bendSign * shoulderOffset;

  const elbow: Vec2 = {
    x: Number((shoulder.x + Math.cos(upperAngleRad) * upperLen).toFixed(2)),
    y: Number((shoulder.y + Math.sin(upperAngleRad) * upperLen).toFixed(2)),
  };

  const clampedHand: Vec2 =
    rawDist > 0.001
      ? {
          x: Number((shoulder.x + (dx / rawDist) * dist).toFixed(2)),
          y: Number((shoulder.y + (dy / rawDist) * dist).toFixed(2)),
        }
      : { x: shoulder.x + dist, y: shoulder.y };

  const forearmAngleRad = Math.atan2(clampedHand.y - elbow.y, clampedHand.x - elbow.x);

  return {
    shoulder,
    elbow,
    hand: clampedHand,
    upperAngleRad,
    forearmAngleRad,
    clampedReach: clamped,
  };
}

/**
 * Builds an anatomical 2D triangulated vertex grid over a `1024x662` portrait
 * with smooth bone skin weights for head/neck turn, chest breathing, red bow,
 * and hanging left/right wavy hair chains.
 */
export function buildGretelBodyMesh(
  width = 1024,
  height = 662,
  cols = 14,
  rows = 10,
): GretelBodyMesh {
  const vertices: MeshVertex[] = [];

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const y0 = v * height;
    for (let c = 0; c <= cols; c++) {
      const u = c / cols;
      const x0 = u * width;

      // Head region: upper 72% inside central face/hair silhouette
      const wHead = (1 - smoothstep(0.56, 0.84, v)) * (1 - smoothstep(0.32, 0.5, Math.abs(u - 0.5)));
      // Lower torso / striped chest region
      const wChest = smoothstep(0.64, 0.96, v);
      // Bow crest at top center
      const wBow = (1 - smoothstep(0.08, 0.25, v)) * (1 - smoothstep(0.12, 0.28, Math.abs(u - 0.44)));
      // Flowing left & right golden hair strands (strongest below temples & outward)
      const wHairLeft = smoothstep(0.38, 0.16, u) * smoothstep(0.28, 0.85, v);
      const wHairRight = smoothstep(0.62, 0.84, u) * smoothstep(0.32, 0.88, v);

      vertices.push({ u, v, x0, y0, wHead, wChest, wHairLeft, wHairRight, wBow });
    }
  }

  const indices: number[] = [];
  const stride = cols + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i00 = r * stride + c;
      const i10 = i00 + 1;
      const i01 = i00 + stride;
      const i11 = i01 + 1;
      indices.push(i00, i10, i11, i00, i11, i01);
    }
  }

  return { cols, rows, width, height, vertices, indices };
}

/**
 * Evaluates deformed `(x, y)` coordinates across all mesh vertices for a single frame.
 */
export function deformGretelMesh(
  mesh: GretelBodyMesh,
  pose: MeshPoseInput,
): Float32Array {
  const out = new Float32Array(mesh.vertices.length * 2);
  const pivotX = mesh.width * 0.5;
  const pivotY = mesh.height * 0.72;
  const tiltRad = (clamp(pose.headTiltDeg, -5, 5) * Math.PI) / 180;
  const yaw = clamp(pose.headYaw, -1, 1);
  const breathe = clamp(pose.breathePhase, -1, 1);
  const nodY = clamp(pose.headNodPx, -6, 6);
  const hairLRad = (clamp(pose.hairSwayLeftDeg, -3, 3) * Math.PI) / 180;
  const hairRRad = (clamp(pose.hairSwayRightDeg, -3, 3) * Math.PI) / 180;

  for (let i = 0; i < mesh.vertices.length; i++) {
    const vt = mesh.vertices[i];
    let x = vt.x0;
    let y = vt.y0;

    // 1. Subtle 2.5D head rotation & tilt around neck pivot
    if (vt.wHead > 0.001) {
      const rx = x - pivotX;
      const ry = y - pivotY;
      const localTilt = tiltRad * vt.wHead;
      const cosT = Math.cos(localTilt);
      const sinT = Math.sin(localTilt);
      const rotX = rx * cosT - ry * sinT;
      const rotY = rx * sinT + ry * cosT;
      // Pseudo-cylindrical 2.5D yaw shift (foreground features shift toward turn direction)
      const yawShift = yaw * 14 * vt.wHead * (1 - Math.abs(vt.u - 0.5) * 1.4);
      x = pivotX + rotX + yawShift;
      y = pivotY + rotY + nodY * vt.wHead;
    }

    // 2. Organic radial torso breathing (never rectangular bounce)
    if (vt.wChest > 0.001) {
      x += (vt.u - 0.5) * breathe * 2.4 * vt.wChest;
      y -= breathe * 2.8 * vt.wChest;
    }

    // 3. Soft bow squash/drag lag
    if (vt.wBow > 0.001) {
      x += yaw * 4.5 * vt.wBow;
      y += nodY * 0.15 * vt.wBow;
    }

    // 4. Multi-segment golden hair curl sway anchored around temple roots
    if (vt.wHairLeft > 0.001) {
      const hpx = mesh.width * 0.28;
      const hpy = mesh.height * 0.36;
      const dx = x - hpx;
      const dy = y - hpy;
      const ang = hairLRad * vt.wHairLeft;
      x = hpx + dx * Math.cos(ang) - dy * Math.sin(ang);
      y = hpy + dx * Math.sin(ang) + dy * Math.cos(ang);
    }
    if (vt.wHairRight > 0.001) {
      const hpx = mesh.width * 0.72;
      const hpy = mesh.height * 0.38;
      const dx = x - hpx;
      const dy = y - hpy;
      const ang = hairRRad * vt.wHairRight;
      x = hpx + dx * Math.cos(ang) - dy * Math.sin(ang);
      y = hpy + dx * Math.sin(ang) + dy * Math.cos(ang);
    }

    out[i * 2] = x;
    out[i * 2 + 1] = y;
  }
  return out;
}
