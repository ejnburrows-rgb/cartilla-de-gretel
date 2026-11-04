/**
 * Geometry of the lesson page curl (see PageCurl.tsx): the sheet rolls over
 * a soft cylinder from right to left. Pure functions, unit tested.
 */

export type Pt = [number, number];

/** Smooth slow-in / slow-out, like a hand turning a page. */
export function curlEase(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 0.5 - 0.5 * Math.cos(Math.PI * x);
}

/** Keep the part of a polygon where f(p) <= 0 (Sutherland–Hodgman). */
function clipHalf(poly: Pt[], f: (p: Pt) => number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const fa = f(a);
    const fb = f(b);
    if (fa <= 0) out.push(a);
    if ((fa <= 0) !== (fb <= 0)) {
      const k = fa / (fa - fb);
      out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    }
  }
  return out;
}

/** Split long edges so a curved mapping bends them smoothly. */
function densify(poly: Pt[], step: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k < n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  return out;
}

export const fmt = (poly: Pt[]) => poly.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

export interface CurlGeometry {
  /** Flat part of the turning sheet still on the table (leaf clip). */
  front: Pt[];
  /** Front side of the paper rising into the roll. */
  roll: Pt[];
  /** Blank back of the sheet (roll + the part already turned over). */
  back: Pt[];
  /** Shadow cast on the page being revealed. */
  shadow: Pt[];
  /** Fold line origin and its normal (pointing right), for the shading bands. */
  origin: Pt;
  normal: Pt;
  radius: number;
  /** Fades the sheet out as it leaves the page. */
  opacity: number;
}

/**
 * Geometry of the curl for a page of size w × h at progress p (0–1).
 * The fold line enters at the bottom-right corner, tilts while the sheet is
 * lifted and straightens as it lands, sweeping from right to left.
 */
export function curlGeometry(w: number, h: number, p: number): CurlGeometry {
  const prog = Math.min(1, Math.max(0, p));
  const rMax = Math.min(140, Math.max(28, w * 0.11));
  const radius = rMax * (0.4 + 0.6 * Math.sin(Math.PI * prog));
  const center = w - prog * (w * 1.03 + rMax);
  const tilt = Math.min(h * 0.5, w * 0.38) * Math.pow(Math.sin(Math.PI * prog), 0.6);
  const xt = center + tilt / 2;
  const xb = center - tilt / 2;
  const len = Math.hypot(xb - xt, h) || 1;
  const n: Pt = [h / len, (xt - xb) / len];
  const origin: Pt = [xt, 0];
  const u = (q: Pt) => (q[0] - origin[0]) * n[0] + (q[1] - origin[1]) * n[1];
  const xOf = (d: number) => {
    if (d <= 0) return d;
    if (d <= Math.PI * radius) return radius * Math.sin(d / radius);
    return -(d - Math.PI * radius);
  };
  const map = (q: Pt): Pt => {
    const d = u(q);
    const shift = xOf(d) - d;
    return [q[0] + shift * n[0], q[1] + shift * n[1]];
  };
  const page: Pt[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const quarter = (Math.PI * radius) / 2;
  const front = clipHalf(page, (q) => u(q));
  const rollRegion = clipHalf(
    clipHalf(page, (q) => -u(q)),
    (q) => u(q) - quarter,
  );
  const backRegion = clipHalf(page, (q) => quarter - u(q));
  const step = Math.max(6, radius / 6);
  const roll = densify(rollRegion, step).map(map);
  const back = densify(backRegion, step).map(map);
  const shadow = clipHalf(
    clipHalf(page, (q) => -u(q)),
    (q) => u(q) - radius * 2.4,
  );
  const opacity = prog > 0.88 ? Math.max(0, (1 - prog) / 0.12) : 1;
  return { front, roll, back, shadow, origin, normal: n, radius, opacity };
}

/** CSS clip-path for the flat part of the sheet (leaf coordinates). */
export function frontClipPath(front: Pt[]): string {
  if (front.length < 3) return "polygon(0 0, 0 0, 0 0)";
  return `polygon(${front.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(", ")})`;
}
