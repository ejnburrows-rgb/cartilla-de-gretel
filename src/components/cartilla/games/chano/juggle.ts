// juggle.ts — Chano's five-ball rainbow juggle, as a pure function of time.
//
// Owner order 2026-10-20 ("rainbow"): Chano juggles HIS OWN five painted balls (cut out of
// the approved scene). Every ball leaves the left hand, travels the painted arch over the
// hat and lands in the right hand; the right hand passes it back low, in front of his chest
// and below his chin. Never across his face. Each hand dips when a ball lands and lifts when
// it leaves; every ball rests a moment in a hand before each throw. One clock, one steady
// rhythm, plain DOM transforms (no animation library). Reduced motion = painted positions.
//
// All coordinates are scene-art pixels (1086 × 1448).

export type Pt = { x: number; y: number };

/** The five painted balls: syllable, sprite box (cut from the scene) and painted centre. */
export const JUGGLE_BALLS = [
  { syllable: "ma", x: 32, y: 303, w: 158, h: 156 },
  { syllable: "mi", x: 124, y: 111, w: 160, h: 161 },
  { syllable: "mo", x: 315, y: 11, w: 167, h: 161 },
  { syllable: "mu", x: 516, y: 115, w: 160, h: 157 },
  { syllable: "me", x: 581, y: 302, w: 157, h: 156 },
].map((b) => ({ ...b, cx: b.x + b.w / 2, cy: b.y + b.h / 2 }));

/** Painted ball radius (the smallest of the five), used for spacing checks. */
export const BALL_R = 74;

// ---- Rhythm (one clock) -------------------------------------------------------------------
/** One beat = one catch per hand. Calm: 0.68 s. */
export const BEAT_MS = 680;
/** Ball rests in a hand for 60 % of the beat before it is thrown again. */
export const DWELL_MS = Math.round(BEAT_MS * 0.6);
/** Low hand-to-hand pass (right → left) under the chin. */
export const FEED_MS = 600;
/** Five balls, evenly spaced one beat apart: one full loop = five beats. */
export const LOOP_MS = BEAT_MS * JUGGLE_BALLS.length;
/** High arch (left → right) over the hat. */
export const ARCH_MS = LOOP_MS - 2 * DWELL_MS - FEED_MS;

// ---- Hands ----------------------------------------------------------------------------------
/** Shoulder pivots of the two arm layers (scene pixels) and where a held ball sits at rest. */
export const LEFT_PIVOT: Pt = { x: 250, y: 640 };
export const RIGHT_PIVOT: Pt = { x: 612, y: 640 };
export const LEFT_HOLD: Pt = { x: 124, y: 444 };
export const RIGHT_HOLD: Pt = { x: 694, y: 488 };
/** Hand dip on a catch and lift on a throw, in degrees of arm rotation. */
export const DIP_DEG = 8;
export const LIFT_DEG = 6;

const easeInOut = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u)));
const easeOut = (u: number) => Math.sin((Math.PI / 2) * Math.min(1, Math.max(0, u)));
const mod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * Hand angle u ms after that hand's catch. Positive = lifted (for the left hand: rotated
 * clockwise, palm up and in; the right hand uses the mirrored sign). 0 at the catch instant.
 */
export function handLift(uMs: number): number {
  const u = mod(uMs, BEAT_MS);
  const dipEnd = DWELL_MS * 0.4;
  if (u < dipEnd) return -DIP_DEG * easeOut(u / dipEnd); // ball lands: hand gives
  if (u < DWELL_MS)
    return -DIP_DEG + (DIP_DEG + LIFT_DEG) * easeInOut((u - dipEnd) / (DWELL_MS - dipEnd)); // lifts to throw
  return LIFT_DEG * (1 - easeInOut((u - DWELL_MS) / (BEAT_MS - DWELL_MS))); // returns to ready
}

function rotateAbout(p: Pt, pivot: Pt, deg: number): Pt {
  const r = (deg * Math.PI) / 180;
  const dx = p.x - pivot.x;
  const dy = p.y - pivot.y;
  return {
    x: pivot.x + dx * Math.cos(r) - dy * Math.sin(r),
    y: pivot.y + dx * Math.sin(r) + dy * Math.cos(r),
  };
}

/** CSS rotation (deg) of each arm layer. Left lifts clockwise, right lifts counter-clockwise. */
export const leftArmDeg = (lift: number) => lift;
export const rightArmDeg = (lift: number) => -lift;
export const leftHeld = (lift: number) => rotateAbout(LEFT_HOLD, LEFT_PIVOT, leftArmDeg(lift));
export const rightHeld = (lift: number) => rotateAbout(RIGHT_HOLD, RIGHT_PIVOT, rightArmDeg(lift));

// ---- Paths ----------------------------------------------------------------------------------
function catmullRom(pts: Pt[], samplesPerSeg: number): Pt[] {
  const out: Pt[] = [];
  const p = [pts[0], ...pts, pts[pts.length - 1]];
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    for (let s = 0; s < samplesPerSeg; s++) {
      const t = s / samplesPerSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 *
        (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** Time lookup: ball slows near the top like a real throw (speed² grows with drop height). */
function timeTable(path: Pt[], topSpeedRatio: number): number[] {
  const yTop = Math.min(...path.map((q) => q.y));
  const yLow = Math.max(...path.map((q) => q.y));
  const t = [0];
  for (let i = 1; i < path.length; i++) {
    const ds = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
    const ym = (path[i].y + path[i - 1].y) / 2;
    const v = Math.sqrt(
      topSpeedRatio ** 2 + (1 - topSpeedRatio ** 2) * ((ym - yTop) / (yLow - yTop)),
    );
    t.push(t[i - 1] + ds / v);
  }
  const total = t[t.length - 1];
  return t.map((x) => x / total);
}

function sampleAt(path: Pt[], table: number[], u: number): Pt {
  const k = Math.min(1, Math.max(0, u));
  let lo = 0;
  let hi = table.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (table[mid] <= k) lo = mid;
    else hi = mid;
  }
  const span = table[hi] - table[lo] || 1;
  const f = (k - table[lo]) / span;
  return {
    x: path[lo].x + (path[hi].x - path[lo].x) * f,
    y: path[lo].y + (path[hi].y - path[lo].y) * f,
  };
}

const RELEASE_LEFT = leftHeld(LIFT_DEG);
const CATCH_RIGHT = rightHeld(0);
const RELEASE_RIGHT = rightHeld(LIFT_DEG);
const CATCH_LEFT = leftHeld(0);

/** High arch through the five painted positions (ma → mi → mo → mu → me), eased a little
 * outward from the hat between them so no ball ever brushes the hat tip. */
const ARCH_CENTRE: Pt = { x: 400, y: 470 };
const ARCH_PUSH = 14;
const ARCH = catmullRom(
  [
    RELEASE_LEFT,
    ...JUGGLE_BALLS.map((b, i) => {
      const push = i === 0 || i === JUGGLE_BALLS.length - 1 ? 0 : ARCH_PUSH;
      const dx = b.cx - ARCH_CENTRE.x;
      const dy = b.cy - ARCH_CENTRE.y;
      const len = Math.hypot(dx, dy) || 1;
      return { x: b.cx + (dx / len) * push, y: b.cy + (dy / len) * push };
    }),
    CATCH_RIGHT,
  ],
  40,
);
const ARCH_T = timeTable(ARCH, 0.42);

/** Low pass, right hand → left hand, sagging under the chin in front of the chest. */
const FEED_LOW_Y = 700;
function feedAt(u: number): Pt {
  const t = easeInOut(u) * 0.7 + u * 0.3;
  const a = RELEASE_RIGHT;
  const d = CATCH_LEFT;
  const b = { x: a.x - 60, y: FEED_LOW_Y + 60 };
  const c = { x: d.x + 60, y: FEED_LOW_Y + 60 };
  const m = 1 - t;
  return {
    x: m * m * m * a.x + 3 * m * m * t * b.x + 3 * m * t * t * c.x + t * t * t * d.x,
    y: m * m * m * a.y + 3 * m * m * t * b.y + 3 * m * t * t * c.y + t * t * t * d.y,
  };
}

export type BallPhase = "left-hand" | "arch" | "right-hand" | "feed";
export type BallState = Pt & { phase: BallPhase };
export type JuggleFrame = {
  balls: BallState[];
  leftArmDeg: number;
  rightArmDeg: number;
  /** 0..1 breathing, on the same clock (one breath every two loops). */
  breath: number;
};

/** Offset of the right hand's catches relative to the left hand's, within a beat. */
const RIGHT_CATCH_OFFSET = DWELL_MS + ARCH_MS;

/** Where ball `i` is at time `tMs`. Ball i is caught by the left hand at tMs = i·BEAT + k·LOOP. */
export function ballAt(tMs: number, i: number): BallState {
  const tau = mod(tMs - i * BEAT_MS, LOOP_MS);
  if (tau < DWELL_MS) return { ...leftHeld(handLift(tau)), phase: "left-hand" };
  const t1 = tau - DWELL_MS;
  if (t1 < ARCH_MS) return { ...sampleAt(ARCH, ARCH_T, t1 / ARCH_MS), phase: "arch" };
  const t2 = t1 - ARCH_MS;
  if (t2 < DWELL_MS) return { ...rightHeld(handLift(t2)), phase: "right-hand" };
  return { ...feedAt((t2 - DWELL_MS) / FEED_MS), phase: "feed" };
}

export function frameAt(tMs: number): JuggleFrame {
  return {
    balls: JUGGLE_BALLS.map((_, i) => ballAt(tMs, i)),
    leftArmDeg: leftArmDeg(handLift(tMs)),
    rightArmDeg: rightArmDeg(handLift(tMs - RIGHT_CATCH_OFFSET)),
    breath: 0.5 - 0.5 * Math.cos((2 * Math.PI * mod(tMs, LOOP_MS * 2)) / (LOOP_MS * 2)),
  };
}

/** Face (glasses to chin) and hat cone, in scene pixels: balls must never cover them. */
export const FACE_BOX = { x: 330, y: 395, w: 200, h: 182 };
export const HAT_BOX = { x: 300, y: 205, w: 200, h: 190 };

export function circleHitsBox(
  p: Pt,
  r: number,
  box: { x: number; y: number; w: number; h: number },
) {
  const nx = Math.max(box.x, Math.min(p.x, box.x + box.w));
  const ny = Math.max(box.y, Math.min(p.y, box.y + box.h));
  return Math.hypot(p.x - nx, p.y - ny) < r;
}
