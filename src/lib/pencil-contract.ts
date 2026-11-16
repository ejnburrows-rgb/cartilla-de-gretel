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

let flight: TipFlight | null = null;
let erasing = 0;
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
/** While any eraser is active the pencil tip is hidden. Returns a release function. */
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
export function getTipFlight() {
  return flight;
}
export function isEraserActive() {
  return erasing > 0;
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
