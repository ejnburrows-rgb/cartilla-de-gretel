/**
 * November 1 pencil and mark contract (STUDENT_INTERACTION_STANDARD.md,
 * "Latest pencil and mark contract — 2026-11-01"). Review candidate B only:
 * enabled with `?cursor=contract`; the default Workbook keeps current main behavior.
 *
 * One shared timing/colour source for the Workbook mark kernel and the single
 * pencil-tip cursor, so activity families never re-implement their own timers.
 */
export const PENCIL_CONTRACT = {
  /** Tip travels from the pointer to the first point of the mark. */
  approachMs: 300,
  /** One child's loop around a picture — about two seconds. */
  circleMs: 2000,
  /** Each X stroke; the pencil hops between the two strokes. */
  crossStrokeMs: 850,
  hopMs: 260,
  /** Completed charcoal mark is held before the outcome colour appears. */
  holdMs: 400,
  /** Wrong mark shows red before the eraser touches down. */
  redShowMs: 600,
  /** Physical eraser sequence: touch down, rub, lift. */
  eraseMs: 3500,
  eraseEnterMs: 450,
  eraseLiftMs: 450,
  crumbCount: 12,
  charcoal: "#3a3a38",
  correct: "#258351",
  wrong: "#c4320a",
  minWidthPx: 3.3,
  maxWidthPx: 6.4,
} as const;

export type ContractPt = [number, number];

/** Smooth ease-in-out progress used for both the stroke reveal and the tip position. */
export function contractEase(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** Inverse of contractEase (monotonic), by bisection. */
export function contractEaseInverse(p: number): number {
  const target = Math.min(1, Math.max(0, p));
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    if (contractEase(mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function lengths(points: ContractPt[]): { seg: number[]; total: number } {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const l = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    seg.push(l);
    total += l;
  }
  return { seg, total };
}

/** Point at fraction `t` of a polyline's length. */
export function contractPointAlong(points: ContractPt[], t: number): ContractPt {
  if (points.length < 2) return points[0] ?? [0, 0];
  const { seg, total } = lengths(points);
  let target = Math.min(1, Math.max(0, t)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, target / seg[i]) : 0;
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * k,
        points[i][1] + (points[i + 1][1] - points[i][1]) * k,
      ];
    }
    target -= seg[i];
  }
  return points[points.length - 1];
}

export interface ContractStroke {
  points: ContractPt[];
  /** ms after the mark starts */
  begin: number;
  dur: number;
}

export interface VelocitySegment {
  points: ContractPt[];
  begin: number;
  dur: number;
  /** CSS px; slow pencil = darker/wider, fast pencil = thinner. */
  width: number;
}

/**
 * Split a stroke into short pieces revealed in sequence. Each piece's width
 * follows the pencil speed at that moment (3.3–6.4 px).
 */
export function velocitySegments(stroke: ContractStroke, pieces = 14): VelocitySegment[] {
  const dense: ContractPt[] = [];
  const per = 4;
  for (let i = 0; i <= pieces * per; i++) dense.push(contractPointAlong(stroke.points, i / (pieces * per)));
  const times: number[] = [];
  for (let k = 0; k <= pieces; k++) times.push(contractEaseInverse(k / pieces) * stroke.dur);
  const durs = times.slice(1).map((t, k) => Math.max(1, t - times[k]));
  const fastest = Math.min(...durs);
  const slowest = Math.max(...durs);
  const { minWidthPx, maxWidthPx } = PENCIL_CONTRACT;
  return durs.map((dur, k) => {
    const slow = slowest === fastest ? 0.5 : (dur - fastest) / (slowest - fastest);
    return {
      points: dense.slice(k * per, k * per + per + 1),
      begin: stroke.begin + times[k],
      dur,
      width: Math.round((minWidthPx + (maxWidthPx - minWidthPx) * slow) * 100) / 100,
    };
  });
}

/** Tip position (mark coordinates) at `ms` after the mark started, or null when off the mark. */
export function contractTipAt(strokes: ContractStroke[], ms: number): ContractPt | null {
  for (let i = 0; i < strokes.length; i++) {
    const s = strokes[i];
    if (ms < s.begin) {
      if (i === 0) return null;
      const prev = strokes[i - 1];
      const from = prev.points[prev.points.length - 1];
      const to = s.points[0];
      const k = contractEase((ms - (prev.begin + prev.dur)) / Math.max(1, s.begin - prev.begin - prev.dur));
      return [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
    }
    if (ms <= s.begin + s.dur) return contractPointAlong(s.points, contractEase((ms - s.begin) / s.dur));
  }
  return null;
}

/* ── Single pencil-tip cursor choreography store ───────────────────────────── */

export interface TipFlight {
  id: symbol;
  el: HTMLElement;
  /** viewBox height of the mark (width is always 100). */
  height: number;
  strokes: ContractStroke[];
  start: number;
}

export interface EraseFlight {
  id: symbol;
  el: HTMLElement;
  /** viewBox height of the mark (width is always 100). */
  height: number;
  /** Polyline points of the stroke being erased (rubbed backwards from end to start). */
  points: ContractPt[];
  enterMs: number;
  rubMs: number;
  liftMs: number;
  totalMs: number;
  start: number;
}

export interface ErasePose {
  /** Mark-coordinate target along the stroke. */
  markPt: ContractPt;
  /** Screen-pixel back-and-forth scrubbing oscillation (0,0 during enter/lift). */
  scrubPx: ContractPt;
  /** Degrees rotated around the pencil's midpoint: 0 = graphite tip, 180 = back pink eraser dome. */
  flipDeg: number;
  /** Smooth 0..1 lift arc while flipping (0 when touching paper). */
  lift: number;
  phase: "enter" | "rub" | "lift";
}

/**
 * Compute the single physical pencil's pose at `ms` into an autonomous erase flight:
 * smoothly flips 0° → 180° onto its back pink eraser dome during `enterMs`,
 * rubs back-and-forth along the stroke from end → start during `rubMs`,
 * then flips 180° → 0° back to its graphite tip during `liftMs`.
 */
export function contractEraseAt(
  f: Pick<EraseFlight, "points" | "enterMs" | "rubMs" | "liftMs" | "totalMs">,
  ms: number,
): ErasePose {
  const t = Math.max(0, Math.min(f.totalMs, ms));
  const rubEnd = f.enterMs + f.rubMs;
  if (t < f.enterMs) {
    const k = contractEase(t / Math.max(1, f.enterMs));
    return {
      markPt: contractPointAlong(f.points, 1),
      scrubPx: [0, 0],
      flipDeg: 180 * k,
      lift: Math.sin(Math.PI * k),
      phase: "enter",
    };
  }
  if (t <= rubEnd) {
    const rubElapsed = t - f.enterMs;
    const p = 1 - rubElapsed / Math.max(1, f.rubMs);
    const scrubPeriod = 220;
    const angle = (rubElapsed / scrubPeriod) * Math.PI * 2;
    return {
      markPt: contractPointAlong(f.points, p),
      scrubPx: [Math.sin(angle) * 9, -Math.sin(angle) * 3],
      flipDeg: 180,
      lift: 0,
      phase: "rub",
    };
  }
  const k = contractEase((t - rubEnd) / Math.max(1, f.liftMs));
  return {
    markPt: contractPointAlong(f.points, 0),
    scrubPx: [0, 0],
    flipDeg: 180 * (1 - k),
    lift: Math.sin(Math.PI * k),
    phase: "lift",
  };
}

let flight: TipFlight | null = null;
let eraseFlight: EraseFlight | null = null;
let erasing = 0;
let manualErasing = 0;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function startTipFlight(f: Omit<TipFlight, "id" | "start">): symbol {
  const id = Symbol("tip-flight");
  flight = { ...f, id, start: performance.now() };
  notify();
  return id;
}
export function endTipFlight(id: symbol) {
  if (flight?.id === id) {
    flight = null;
    notify();
  }
}
export function startEraseFlight(f: Omit<EraseFlight, "id" | "start">): symbol {
  const id = Symbol("erase-flight");
  eraseFlight = { ...f, id, start: performance.now() };
  notify();
  return id;
}
export function endEraseFlight(id: symbol) {
  if (eraseFlight?.id === id) {
    eraseFlight = null;
    notify();
  }
}
/** While an external inline eraser (e.g. PencilConnector) is active, the cursor overlay hides. Returns a release function. */
export function holdEraser(): () => void {
  erasing += 1;
  notify();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    erasing = Math.max(0, erasing - 1);
    notify();
  };
}
/** While a canvas drawing/paint eraser tool is selected by the learner, the cursor flips to its back pink eraser. */
export function holdManualEraser(): () => void {
  manualErasing += 1;
  notify();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    manualErasing = Math.max(0, manualErasing - 1);
    notify();
  };
}
export function getTipFlight() {
  return flight;
}
export function getEraseFlight() {
  return eraseFlight;
}
export function isExternalEraserActive() {
  return erasing > 0;
}
export function isEraserActive() {
  return erasing > 0 || eraseFlight !== null;
}
export function isManualEraserActive() {
  return manualErasing > 0;
}
export function subscribeTip(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
/** Map mark coordinates to viewport px for a mark box (viewBox 0 0 100 height, meet). */
export function markToScreen(el: Element, height: number, pt: ContractPt): ContractPt {
  const r = el.getBoundingClientRect();
  const unit = Math.min(r.width / 100, r.height / height);
  const ox = r.left + (r.width - 100 * unit) / 2;
  const oy = r.top + (r.height - height * unit) / 2;
  return [ox + pt[0] * unit, oy + pt[1] * unit];
}
