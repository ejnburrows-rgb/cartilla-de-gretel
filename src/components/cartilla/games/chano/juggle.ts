export const BEAT_MS = 360;
export const HAND_CYCLE_MS = 720;
export const BALL_LOOP_MS = 2160;
export const DWELL_RATIO = 0.65;
export const DWELL_MS = 468;
export const FLIGHT_MS = 612;
export const PHASE_OFFSETS_MS = [0, 720, 1440];

export interface Point {
  x: number;
  y: number;
}

export interface BallGeometry {
  catchLeft: Point;
  throwLeft: Point;
  catchRight: Point;
  throwRight: Point;
  apexY: number;
}

export interface BallState {
  x: number;
  y: number;
  phase: "dwell" | "flight";
  hand: "left" | "right";
  scaleX: number;
  scaleY: number;
  underHandCap: boolean;
}

export function ballStateAt(tMs: number, slotIndex: number, geometry: BallGeometry): BallState {
  const period = BALL_LOOP_MS;
  const localT = (tMs + PHASE_OFFSETS_MS[slotIndex]) % period;

  // segment 1: 0 - 1080 (Left Hand)
  // segment 2: 1080 - 2160 (Right Hand)

  let phase: "dwell" | "flight";
  let hand: "left" | "right";
  let x = 0;
  let y = 0;
  let scaleX = 1;
  let scaleY = 1;
  let underHandCap = false;

  if (localT < 1080) {
    // Segment 1: Left Hand
    if (localT < DWELL_MS) {
      phase = "dwell";
      hand = "left";
      underHandCap = true;
      const progress = localT / DWELL_MS;
      // Shallow scoop path
      // Linear X
      x = geometry.catchLeft.x + (geometry.throwLeft.x - geometry.catchLeft.x) * progress;
      // Scoop Y: slight dip (parabola going down and up)
      const dip = 20 * (1 - Math.pow(2 * progress - 1, 2));
      const linearY = geometry.catchLeft.y + (geometry.throwLeft.y - geometry.catchLeft.y) * progress;
      y = linearY + dip;

      // Catch squash
      if (localT < 90) {
        // 0 to 90ms: interpolate 1 -> squash -> 1. Actually just squash -> 1 over 90ms for simplicity,
        // or a quick sine pulse. Let's do a linear blend from max squash to normal over 90ms.
        // "catch: squash ball to scaleX 1.15 / scaleY 0.85 for ~90ms at the catch instant, then recover."
        // Let's make it peak at 0, recover at 90.
        const r = 1 - (localT / 90);
        scaleX = 1 + 0.15 * r;
        scaleY = 1 - 0.15 * r;
      }
    } else {
      phase = "flight";
      hand = "left"; // Leaving left hand
      underHandCap = false;
      const flightT = localT - DWELL_MS;
      const progress = flightT / FLIGHT_MS;
      // Linear X
      x = geometry.throwLeft.x + (geometry.catchRight.x - geometry.throwLeft.x) * progress;
      // True parabola Y
      // y(t) = a*t^2 + b*t + c. Apex at progress=0.5
      // at p=0: y = throwLeft.y
      // at p=1: y = catchRight.y
      // at p=0.5: y = apexY
      const y0 = geometry.throwLeft.y;
      const y1 = geometry.catchRight.y;
      const yMid = geometry.apexY;
      // y(p) = A*p^2 + B*p + C
      // C = y0
      // A + B + y0 = y1  => B = y1 - y0 - A
      // 0.25*A + 0.5*B + y0 = yMid
      // 0.25*A + 0.5*(y1 - y0 - A) + y0 = yMid
      // 0.25*A + 0.5*y1 - 0.5*y0 - 0.5*A + y0 = yMid
      // -0.25*A + 0.5*y1 + 0.5*y0 = yMid
      // -0.25*A = yMid - 0.5*y1 - 0.5*y0
      // A = -4 * (yMid - 0.5*y1 - 0.5*y0) = 2*y1 + 2*y0 - 4*yMid
      const A = 2 * y1 + 2 * y0 - 4 * yMid;
      const B = y1 - y0 - A;
      y = A * progress * progress + B * progress + y0;
    }
  } else {
    // Segment 2: Right Hand
    const segT = localT - 1080;
    if (segT < DWELL_MS) {
      phase = "dwell";
      hand = "right";
      underHandCap = true;
      const progress = segT / DWELL_MS;
      x = geometry.catchRight.x + (geometry.throwRight.x - geometry.catchRight.x) * progress;
      const dip = 20 * (1 - Math.pow(2 * progress - 1, 2));
      const linearY = geometry.catchRight.y + (geometry.throwRight.y - geometry.catchRight.y) * progress;
      y = linearY + dip;

      if (segT < 90) {
        const r = 1 - (segT / 90);
        scaleX = 1 + 0.15 * r;
        scaleY = 1 - 0.15 * r;
      }
    } else {
      phase = "flight";
      hand = "right"; // Leaving right hand
      underHandCap = false;
      const flightT = segT - DWELL_MS;
      const progress = flightT / FLIGHT_MS;
      x = geometry.throwRight.x + (geometry.catchLeft.x - geometry.throwRight.x) * progress;
      const y0 = geometry.throwRight.y;
      const y1 = geometry.catchLeft.y;
      const yMid = geometry.apexY;
      const A = 2 * y1 + 2 * y0 - 4 * yMid;
      const B = y1 - y0 - A;
      y = A * progress * progress + B * progress + y0;
    }
  }

  return { x, y, phase, hand, scaleX, scaleY, underHandCap };
}
