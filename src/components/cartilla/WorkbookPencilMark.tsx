import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useActivityEvents } from "@/lib/activity-events";
import "@/styles/workbook-pencil.css";

export type WorkbookMarkStatus = "drawing" | "holding" | "correct" | "erasing" | "erased";

export interface WorkbookPencilMarkProps {
  markType?: "circle" | "x";
  isCorrect?: boolean | null;
  completeOnSuccess?: boolean;
  itemId?: string;
  status?: WorkbookMarkStatus;
  className?: string;
  onSuccess?: () => void;
  onRetry?: () => void;
}

/**
 * Semantic timing of the Real Workbook Mark — close-up pencil (owner 2026-10-06,
 * motion amended 2026-10-08). The big pencil starts completely off the right edge
 * of the screen, travels in over everything in its way, draws the mark in about
 * two seconds (green when right, red when wrong), and travels back out off the
 * right edge of the screen. A wrong mark is then rubbed out by the big eraser,
 * which comes in from the right edge of the screen the same way, scrubs back and
 * forth with crumbs falling, and leaves off the right edge again.
 * Reduced motion removes only the decorative motion: the coloured mark appears
 * at once and the result keeps the same timing.
 */
export const WORKBOOK_MARK_TIMING = {
  /** Pencil travels in from off the right edge of the screen and touches down (part of drawMs). */
  approachMs: 800,
  /** Tap → mark finished (approach + the ~2 s drawn stroke). */
  drawMs: 2800,
  /** Pencil travels back out past the right edge of the screen after the mark is drawn. */
  liftMs: 800,
  /** Mark finished → result (the pencil has left the screen). */
  holdMs: 800,
  /** Eraser comes in, rubs the mark out with crumbs, leaves. */
  eraseMs: 4000,
  /** Eraser travel in from off the right edge of the screen (part of eraseMs). */
  eraseFlipMs: 800,
  /** Eraser travel back out past the right edge of the screen (part of eraseMs). */
  eraseLiftMs: 800,
  reducedEraseMs: 60,
} as const;

const EASE = "0.45 0.05 0.55 0.95";
/** Pencil geometry: tip at (0,0), body along -y. */
const PENCIL_LENGTH = 79.5;
const PENCIL_CENTER_Y = -PENCIL_LENGTH / 2;
/** Close-up pose: body runs up and to the right, about 30° above horizontal. */
const PENCIL_TILT = 60;
/**
 * Big close-up tool (owner reference 2026-10-06): the pencil is about a third of
 * the box high, so it is always much longer than the box and only its front shows.
 */
const PENCIL_SCALE = 7;
const PENCIL_POSE = `rotate(${PENCIL_TILT}) scale(${PENCIL_SCALE})`;
/** The eraser lies a little flatter, its body running off to the right. */
const ERASER_TILT = 66;
const ERASER_POSE = `rotate(${ERASER_TILT}) scale(${PENCIL_SCALE})`;
/** Unit vector along the pencil body (tip → eraser) in mark coordinates. */
const AXIS: [number, number] = [
  Math.sin((PENCIL_TILT * Math.PI) / 180),
  -Math.cos((PENCIL_TILT * Math.PI) / 180),
];
/** Extra distance (mark units) past the screen's right edge, so no part of the tool shows before it enters. */
const OFFSCREEN_MARGIN = 24;

/**
 * A polished yellow school pencil: three lit hexagonal facets with a scalloped
 * sharpening edge, cedar cone with grain, dark graphite point, ribbed silver
 * ferrule and a soft pink eraser. Drawn tip-at-origin so it can follow the mark
 * path. `uid` keeps gradient ids unique.
 */
/**
 * `stretch` (owner 2026-10-08) lengthens the yellow body by that many units so a
 * big, solid, real pencil can run from the picture right off the edge of the
 * screen — near the picture only its tip (or its eraser end) is seen, nothing is
 * faded or cut off. The eraser and band move back with the end of the body.
 */
export function PencilShape({ uid, stretch = 0 }: { uid: string; stretch?: number }) {
  const back = -stretch;
  const top = f2(-60.2 - stretch);
  const g = (name: string) => `${uid}-${name}`;
  const u = (name: string) => `url(#${g(name)})`;
  const lin = (id: string, stops: [number, string][], x1: number, x2: number) => (
    <linearGradient id={g(id)} x1={x1} y1="0" x2={x2} y2="0" gradientUnits="userSpaceOnUse">
      {stops.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </linearGradient>
  );
  return (
    <g className="workbook-pencil__shape">
      <defs>
        {lin(
          "lacq",
          [
            [0, "#ffd864"],
            [0.16, "#ffe58f"],
            [0.33, "#ffc93a"],
            [0.335, "#ffb422"],
            [0.5, "#ffbf33"],
            [0.665, "#f5a312"],
            [0.67, "#e08a0e"],
            [1, "#b8680a"],
          ],
          -6.5,
          6.5,
        )}
        {lin(
          "wood",
          [
            [0, "#fbe6c2"],
            [0.45, "#f1cf9c"],
            [0.7, "#e2b57c"],
            [1, "#c38b4e"],
          ],
          -6.5,
          6.5,
        )}
        {lin(
          "lead",
          [
            [0, "#62626c"],
            [0.35, "#34343b"],
            [1, "#121215"],
          ],
          -2.4,
          2.4,
        )}
        {lin(
          "metal",
          [
            [0, "#737a83"],
            [0.15, "#dfe4e9"],
            [0.3, "#ffffff"],
            [0.48, "#c3c9d0"],
            [0.75, "#9aa1a9"],
            [1, "#5c636b"],
          ],
          -6.8,
          6.8,
        )}
        {lin(
          "eraser",
          [
            [0, "#f7aebd"],
            [0.28, "#fccbd5"],
            [0.7, "#ee93a8"],
            [1, "#d26e88"],
          ],
          -6.3,
          6.3,
        )}
        <linearGradient id={g("shade")} x1="0" y1="-23" x2="0" y2="-19" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7a4a14" stopOpacity="0.35" />
          <stop offset="1" stopColor="#7a4a14" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={stretch ? `translate(0 ${f2(back)})` : undefined}>
      {/* Soft pink eraser, slightly worn and rounded. */}
      <path
        d="M -6.3 -69.5 L -6.3 -75.2 Q -6.3 -79.5 -2.4 -79.5 L 2.4 -79.5 Q 6.3 -79.5 6.3 -75.2 L 6.3 -69.5 Z"
        fill={u("eraser")}
      />
      <path
        d="M -4.4 -70.6 L -4.4 -75.4 Q -4.2 -77.9 -2 -78.1"
        fill="none"
        stroke="#fff3f6"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path d="M 3.6 -78.6 Q 5.6 -77.6 5.8 -74.6" fill="none" stroke="#b9566f" strokeWidth="0.5" opacity="0.4" />
      {/* Ribbed silver ferrule. */}
      <rect x="-6.8" y="-70.4" width="13.6" height="10.2" rx="0.9" fill={u("metal")} />
      {[-68.6, -67, -65.4, -63.8].map((y) => (
        <g key={y}>
          <line x1="-6.8" y1={y} x2="6.8" y2={y} stroke="#535a62" strokeWidth="0.42" opacity="0.8" />
          <line x1="-6.8" y1={y + 0.5} x2="6.8" y2={y + 0.5} stroke="#ffffff" strokeWidth="0.32" opacity="0.75" />
        </g>
      ))}
      <rect x="-6.8" y="-62.2" width="13.6" height="2" fill="#000" opacity="0.1" />
      <rect x="-6.8" y="-70.4" width="13.6" height="0.9" fill="#000" opacity="0.12" />
      </g>
      {/* Sharpened cedar cone with grain. */}
      <path d="M -6.5 -23.4 L 6.5 -23.4 L 2.4 -6.4 L -2.4 -6.4 Z" fill={u("wood")} />
      <path
        d="M -4.2 -19.8 L -1.8 -8.6 M -1.3 -20.6 L -0.5 -8 M 1.6 -20.4 L 0.9 -8.1 M 4.2 -19.6 L 1.9 -8.8"
        stroke="#b07a3e"
        strokeWidth="0.32"
        opacity="0.5"
        fill="none"
      />
      {/* Graphite point with a soft sheen. */}
      <path d="M -2.45 -6.7 L 2.45 -6.7 L 0.5 -0.55 Q 0 0.4 -0.5 -0.55 Z" fill={u("lead")} />
      <path d="M -1.35 -6.1 L -0.3 -1.5" stroke="#9696a0" strokeWidth="0.5" strokeLinecap="round" opacity="0.8" />
      {/* Hexagonal lacquered body: three lit facets, scalloped where sharpened. */}
      <path
        d={`M -6.5 ${top} L 6.5 ${top} L 6.5 -21.6 Q 4.35 -17.2 2.17 -21.6 Q 0 -16.4 -2.17 -21.6 Q -4.35 -17.2 -6.5 -21.6 Z`}
        fill={u("lacq")}
      />
      <path
        d="M -6.5 -21.6 Q -4.35 -17.2 -2.17 -21.6 Q 0 -16.4 2.17 -21.6 Q 4.35 -17.2 6.5 -21.6"
        fill="none"
        stroke="#9c5a08"
        strokeWidth="0.35"
        opacity="0.55"
      />
      <line x1="-2.17" y1={top} x2="-2.17" y2="-21.6" stroke="#e39a12" strokeWidth="0.32" opacity="0.85" />
      <line x1="2.17" y1={top} x2="2.17" y2="-21.6" stroke="#a9620a" strokeWidth="0.32" opacity="0.85" />
      <rect x="-5.4" y={f2(-59.6 - stretch)} width="1.5" height={f2(37 + stretch)} rx="0.75" fill="#fff8de" opacity="0.65" />
      <rect x="-0.8" y={f2(-59.6 - stretch)} width="0.7" height={f2(38 + stretch)} rx="0.35" fill="#fff3c4" opacity="0.4" />
      <rect x="-6.5" y={top} width="13" height="1.4" fill="#000" opacity="0.08" />
    </g>
  );
}

/** Exported for activity adapters that need the same physical tool family. */
export function ClassicWoodenPencil({
  eraser = false,
  className = "",
}: {
  eraser?: boolean;
  className?: string;
}) {
  const uid = `wb-pencil-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg
      viewBox={`-12 ${-PENCIL_LENGTH - 4} 24 ${PENCIL_LENGTH + 8}`}
      className={`workbook-pencil-svg ${eraser ? "eraser-end" : "pencil-end"} ${className}`}
      aria-hidden="true"
    >
      <g transform={eraser ? `rotate(180 0 ${PENCIL_CENTER_Y})` : undefined}>
        <PencilShape uid={uid} />
      </g>
    </svg>
  );
}

function hashSeed(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619) >>> 0;
  return hash;
}

type Pt = [number, number];
const f2 = (n: number) => n.toFixed(2);

function smoothPath(points: Pt[]): string {
  let d = `M ${f2(points[0][0])} ${f2(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f2(c1[0])} ${f2(c1[1])} ${f2(c2[0])} ${f2(c2[1])} ${f2(p2[0])} ${f2(p2[1])}`;
  }
  return d;
}

/**
 * A child's single pencil loop around the picture: slightly irregular, with a
 * small overlap where the pencil comes back past its starting point.
 */
function handDrawnLoop(height: number, seed: number): Pt[] {
  const cx = 50;
  const cy = height / 2;
  const rx = 45;
  const ry = Math.max(12, height / 2 - 5);
  const p1 = (seed % 628) / 100 || 0.6;
  const p2 = ((seed >>> 10) % 628) / 100 || 1.1;
  // Starts on the right of the picture, where the pencil first touches down.
  const start = (-35 * Math.PI) / 180;
  const sweep = (382 * Math.PI) / 180;
  const steps = 20;
  const points: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + sweep * t;
    const wobble = 1 + 0.02 * Math.sin(2 * a + p1) + 0.012 * Math.sin(3 * a + p2) + 0.035 * t;
    points.push([cx + rx * wobble * Math.cos(a), cy + ry * wobble * Math.sin(a)]);
  }
  return points;
}

/** Two pencil strokes for "Marca con una x". */
function handDrawnCross(height: number): Pt[][] {
  const top = height * 0.18;
  const bottom = height * 0.82;
  return [
    [
      [20, top],
      [50, height / 2 + 1],
      [81, bottom],
    ],
    [
      [80, top + 1],
      [50, height / 2 - 1],
      [19, bottom - 1],
    ],
  ];
}

/** Point at fraction `t` (0–1) of a polyline's length. */
function pointAlong(points: Pt[], t: number): Pt {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const l = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    seg.push(l);
    total += l;
  }
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

/** Box aspect in CSS px (aspect drives the mark shape). */
function useCellBox(ref: React.RefObject<HTMLDivElement | null>): { aspect: number } {
  const [aspect, setAspect] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setAspect(Math.min(2.5, Math.max(0.4, height / width)));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return { aspect };
}

interface FlightBox {
  left: number;
  top: number;
  width: number;
  height: number;
  /** Viewport width in CSS px. */
  vw: number;
  /** Viewport height in CSS px. */
  vh: number;
}

/**
 * Where the mark box sits on the screen while a tool is in flight. The tools fly
 * in a fixed layer above the whole page (the page sheet clips its contents), so
 * this layer is kept exactly over the mark box, following scrolls and resizes.
 */
function useFlightBox(ref: React.RefObject<HTMLDivElement | null>, active: boolean): FlightBox | null {
  const [box, setBox] = useState<FlightBox | null>(null);
  useLayoutEffect(() => {
    if (!active) {
      setBox(null);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth || document.documentElement.clientWidth || 0;
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      setBox((prev) =>
        prev &&
        prev.left === r.left &&
        prev.top === r.top &&
        prev.width === r.width &&
        prev.height === r.height &&
        prev.vw === vw &&
        prev.vh === vh
          ? prev
          : { left: r.left, top: r.top, width: r.width, height: r.height, vw, vh },
      );
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };
    measure();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, active]);
  return box;
}

/**
 * How much longer than a stock pencil the tool must be (shape units) so that, from
 * the picture, its body always runs right off the edge of the screen.
 */
function stretchToScreenEdge(box: FlightBox, height: number): number {
  const unit = box.width > 0 && box.height > 0 ? Math.min(box.width / 100, box.height / height) : 0;
  if (unit <= 0) return 0;
  const needed = Math.hypot(box.vw, box.vh) / unit / PENCIL_SCALE;
  return Math.max(0, Math.ceil(needed - PENCIL_LENGTH));
}

/**
 * Translation (mark units) that puts a tool resting at `from` completely past the
 * right edge of the screen, a little higher than where it touches down.
 */
function offscreenFrom(box: FlightBox, height: number, from: Pt): string {
  const unit = box.width > 0 && box.height > 0 ? Math.min(box.width / 100, box.height / height) : 0;
  // Mark box is centred in its element (SVG "meet"); find the screen's right edge in mark units.
  const edge = unit > 0 ? (box.vw - box.left - (box.width - 100 * unit) / 2) / unit : 140;
  const dx = Math.max(edge, 100) + OFFSCREEN_MARGIN - from[0];
  return `${f2(dx)} ${f2(-10)}`;
}

/**
 * Draw phase. The big pencil starts completely off the right edge of the screen,
 * travels in over everything on the way and touches down on the starting point
 * (`approach`), travels the mark exactly as the stroke is revealed (`dur`) with
 * the small wrist turns of a real hand, then travels back out past the right
 * edge of the screen (`lift`). Nothing clips it: it flies in its own layer.
 */
function DrawingPencil({
  path,
  begin = 0,
  approach,
  dur,
  lift,
  shadow,
  uid,
  first,
  last,
  offscreen,
  stretch,
}: {
  path: string;
  begin?: number;
  approach: number;
  dur: number;
  lift: number;
  shadow: string;
  uid: string;
  first: boolean;
  last: boolean;
  /** Translation that puts the pencil past the right edge of the screen. */
  offscreen: string;
  /** Extra body length so the pencil runs off the edge of the screen. */
  stretch: number;
}) {
  const travel = approach + dur;
  const total = travel + lift;
  const a = (approach / travel).toFixed(4);
  const kApproach = (approach / total).toFixed(4);
  const kDone = (travel / total).toFixed(4);
  // Between the two strokes of an X the pencil only hops a little off the paper.
  const hop: Pt = [AXIS[0] * 6, AXIS[1] * 6];
  const enter = first ? offscreen : `${f2(hop[0])} ${f2(hop[1])}`;
  const leave = last ? offscreen : `${f2(hop[0])} ${f2(hop[1])}`;
  return (
    <g className="workbook-pencil" opacity="0" filter={`url(#${shadow})`}>
      <animateMotion
        begin={`${begin}ms`}
        dur={`${travel}ms`}
        fill="freeze"
        calcMode="spline"
        keyTimes={`0;${a};1`}
        keyPoints="0;0;1"
        keySplines={`0 0 1 1;${EASE}`}
        path={path}
      />
      <animate attributeName="opacity" begin={`${begin}ms`} dur={`${total}ms`} values="1;1" />
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          begin={`${begin}ms`}
          dur={`${total}ms`}
          fill="freeze"
          calcMode="spline"
          values={`${enter};0 0;0 0;${leave}`}
          keyTimes={`0;${kApproach};${kDone};1`}
          keySplines={`0.3 0 0.25 1;0 0 1 1;0.55 0 0.7 1`}
        />
        <g>
          {/* The wrist turns a few degrees as the hand goes round. */}
          <animateTransform
            attributeName="transform"
            type="rotate"
            begin={`${begin}ms`}
            dur={`${total}ms`}
            fill="freeze"
            calcMode="spline"
            values="2;0;-3;2;0;0"
            keyTimes={`0;${kApproach};${((approach + dur * 0.35) / total).toFixed(4)};${((approach + dur * 0.75) / total).toFixed(4)};${kDone};1`}
            keySplines={`0.3 0 0.4 1;${EASE};${EASE};${EASE};0 0 1 1`}
          />
          <g transform={PENCIL_POSE}>
            <PencilShape uid={uid} stretch={stretch} />
          </g>
        </g>
      </g>
    </g>
  );
}

/** One pencil stroke, revealed exactly as the pencil tip travels it. */
function MarkStroke({
  path,
  animate,
  begin = 0,
  dur,
}: {
  path: string;
  animate: boolean;
  begin?: number;
  dur: number;
}) {
  if (!animate) return <path className="workbook-pencil-mark__stroke" d={path} />;
  return (
    <path
      className="workbook-pencil-mark__stroke"
      d={path}
      pathLength={100}
      strokeDasharray="100 100"
      strokeDashoffset="100"
      opacity="0"
    >
      <animate
        attributeName="stroke-dashoffset"
        begin={`${begin}ms`}
        dur={`${dur}ms`}
        fill="freeze"
        calcMode="spline"
        keyTimes="0;1"
        keySplines={EASE}
        values="100;0"
      />
      <animate
        attributeName="opacity"
        begin={`${begin}ms`}
        dur={`${dur}ms`}
        fill="freeze"
        values="0;1;1"
        keyTimes="0;0.02;1"
      />
    </path>
  );
}

const CRUMB_COLORS = ["#f3a9b8", "#ee93a7", "#f8c6d0", "#e59aa6", "#d98593"];

/**
 * Eraser crumbs: rubber flakes that break off where the eraser rubs, tumble and
 * fall a little under gravity, and stay on the paper until the eraser leaves.
 */
function EraserCrumbs({
  points,
  seed,
  enterMs,
  rubMs,
  totalMs,
}: {
  points: Pt[];
  seed: number;
  enterMs: number;
  rubMs: number;
  totalMs: number;
}) {
  const crumbs = useMemo(() => {
    let s = seed || 7;
    const rnd = () => {
      s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0;
      s = Math.imul(s ^ (s >>> 13), 3266489909) >>> 0;
      return ((s ^= s >>> 16) >>> 0) / 4294967296;
    };
    const out: { x: number; y: number; dx: number; dy: number; rx: number; ry: number; rot: number; spin: number; c: string; t: number }[] = [];
    const n = 28;
    for (let i = 0; i < n; i++) {
      // The eraser runs backwards along the mark, so crumbs break off from t=1 to 0.
      const t = 1 - (i + rnd() * 0.7) / n;
      const [px, py] = pointAlong(points, t);
      // Big, clearly visible rubber crumbs (owner close-up reference 2026-10-08).
      const r = 2.8 + rnd() * 2.6;
      out.push({
        x: px + (rnd() - 0.5) * 12,
        y: py + (rnd() - 0.5) * 9,
        dx: -4 + rnd() * 10,
        dy: 8 + rnd() * 14,
        rx: r * (1 + rnd() * 0.5),
        ry: r * (0.6 + rnd() * 0.3),
        rot: rnd() * 180,
        spin: (rnd() - 0.5) * 240,
        c: CRUMB_COLORS[Math.floor(rnd() * CRUMB_COLORS.length)],
        t: 1 - t,
      });
    }
    return out;
  }, [points, seed]);
  const kEnd = (enterMs + rubMs) / totalMs;
  return (
    <g className="workbook-pencil__crumbs">
      {crumbs.map((c, i) => {
        const appear = (enterMs + c.t * rubMs) / totalMs;
        const kA = appear.toFixed(4);
        const kB = Math.min(appear + 0.015, kEnd - 0.001).toFixed(4);
        const kFall = Math.min(appear + 0.17, 0.995).toFixed(4);
        return (
          <g key={i} opacity="0">
            <animate
              attributeName="opacity"
              dur={`${totalMs}ms`}
              fill="freeze"
              values="0;0;1;1;0"
              keyTimes={`0;${kA};${kB};${kEnd.toFixed(4)};1`}
            />
            <animateTransform
              attributeName="transform"
              type="translate"
              dur={`${totalMs}ms`}
              fill="freeze"
              calcMode="spline"
              values={`${f2(c.x)} ${f2(c.y)};${f2(c.x)} ${f2(c.y)};${f2(c.x + c.dx)} ${f2(c.y + c.dy)};${f2(c.x + c.dx)} ${f2(c.y + c.dy)}`}
              keyTimes={`0;${kA};${kFall};1`}
              keySplines={`0 0 1 1;0.45 0 0.9 0.6;0 0 1 1`}
            />
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                dur={`${totalMs}ms`}
                fill="freeze"
                values={`${c.rot.toFixed(0)};${c.rot.toFixed(0)};${(c.rot + c.spin).toFixed(0)};${(c.rot + c.spin).toFixed(0)}`}
                keyTimes={`0;${kA};${kFall};1`}
              />
              <ellipse rx={f2(c.rx)} ry={f2(c.ry)} fill={c.c} />
            </g>
          </g>
        );
      })}
    </g>
  );
}

/**
 * Shared Workbook feedback kernel used by p1/p2 and later adapters.
 * Semantic timing is stable under reduced motion: only decorative motion is removed.
 */
export function WorkbookPencilMark({
  markType = "circle",
  isCorrect,
  completeOnSuccess = false,
  itemId,
  status: externalStatus,
  className = "",
  onSuccess,
  onRetry,
}: WorkbookPencilMarkProps) {
  const reducedMotion = useReducedMotion();
  const { emit } = useActivityEvents();
  const [internalStatus, setInternalStatus] = useState<WorkbookMarkStatus>("drawing");
  const currentStatus = externalStatus ?? internalStatus;
  const onSuccessRef = useRef(onSuccess);
  const onRetryRef = useRef(onRetry);
  const boxRef = useRef<HTMLDivElement>(null);
  const baseId = `wb-pencil-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const shadowId = `${baseId}-shadow`;
  const { aspect } = useCellBox(boxRef);
  const flying =
    !reducedMotion &&
    !externalStatus &&
    (currentStatus === "drawing" || currentStatus === "holding" || currentStatus === "erasing");
  const flightBox = useFlightBox(boxRef, flying);
  const height = Math.round(100 * aspect * 10) / 10;
  const seed = useMemo(() => hashSeed(itemId ?? "mark"), [itemId]);
  const strokePoints = useMemo(
    () => (markType === "circle" ? [handDrawnLoop(height, seed)] : handDrawnCross(height)),
    [height, markType, seed],
  );
  const strokes = useMemo(() => strokePoints.map(smoothPath), [strokePoints]);
  // Green when right, red when wrong — from the first line the pencil draws.
  const result =
    externalStatus === "correct" ? "correct" : isCorrect == null ? undefined : isCorrect ? "correct" : "wrong";

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  useEffect(() => {
    onRetryRef.current = onRetry;
  }, [onRetry]);

  useEffect(() => {
    if (externalStatus || isCorrect == null) return;
    const { drawMs, holdMs } = WORKBOOK_MARK_TIMING;
    const resultDelay = reducedMotion ? holdMs : drawMs + holdMs;
    if (reducedMotion) setInternalStatus("holding");
    const holdTimer = reducedMotion
      ? undefined
      : window.setTimeout(() => setInternalStatus("holding"), drawMs);
    const resultTimer = window.setTimeout(() => {
      if (isCorrect) {
        setInternalStatus("correct");
        emit(
          completeOnSuccess ? "activity:complete" : "answer:correct",
          itemId ? { itemId } : undefined,
        );
        onSuccessRef.current?.();
      } else {
        emit("answer:wrong", itemId ? { itemId } : undefined);
        setInternalStatus("erasing");
      }
    }, resultDelay);
    return () => {
      if (holdTimer !== undefined) window.clearTimeout(holdTimer);
      window.clearTimeout(resultTimer);
    };
  }, [completeOnSuccess, emit, externalStatus, isCorrect, itemId, reducedMotion]);

  useEffect(() => {
    if (externalStatus || currentStatus !== "erasing") return;
    const timer = window.setTimeout(
      () => {
        setInternalStatus("erased");
        onRetryRef.current?.();
      },
      reducedMotion ? WORKBOOK_MARK_TIMING.reducedEraseMs : WORKBOOK_MARK_TIMING.eraseMs,
    );
    return () => window.clearTimeout(timer);
  }, [currentStatus, externalStatus, reducedMotion]);

  if (currentStatus === "erased") return null;

  const erasing = currentStatus === "erasing";
  // Restored/validated marks (external status) and reduced motion render the finished mark statically.
  const animateDraw = !reducedMotion && !externalStatus;
  const { approachMs, drawMs, liftMs } = WORKBOOK_MARK_TIMING;
  // Circle: one ~2 s loop. Cross: two strokes with a short hop between them.
  const hopMs = 260;
  const strokeDur = markType === "circle" ? drawMs - approachMs : (drawMs - approachMs - hopMs) / 2;
  const schedule = strokes.map((_, i) => {
    const strokeBegin = approachMs + i * (strokeDur + hopMs);
    const approach = i === 0 ? approachMs : hopMs;
    return { strokeBegin, pencilBegin: strokeBegin - approach, approach };
  });
  const viewBox = `0 0 100 ${height}`;
  const toolDefs = (
    <defs>
      <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="1.6" dy="2.4" stdDeviation="1.6" floodColor="#3b2a14" floodOpacity="0.24" />
      </filter>
    </defs>
  );
  const { eraseMs, eraseFlipMs, eraseLiftMs } = WORKBOOK_MARK_TIMING;
  const enterMs = eraseFlipMs;
  const rubMs = eraseMs - enterMs - eraseLiftMs;
  const kTouch = (enterMs / eraseMs).toFixed(4);
  const kRubbed = ((eraseMs - eraseLiftMs) / eraseMs).toFixed(4);
  const scrubPeriod = 220;
  const lastPath = strokes[strokes.length - 1];
  const lastPoints = strokePoints[strokePoints.length - 1];

  /**
   * Owner 2026-10-08: the pencil and the eraser come from off the right edge of the
   * screen, pass over everything on the way, do their job and leave the same way.
   * They fly in a fixed layer above the whole page, kept exactly over this mark box,
   * so the page sheet (which clips its contents) never cuts them off.
   */
  const stretch = flightBox ? stretchToScreenEdge(flightBox, height) : 0;
  const flightLayer =
    flying && flightBox && typeof document !== "undefined"
      ? createPortal(
          <svg
            key={erasing ? "erase-flight" : "draw-flight"}
            className="workbook-pencil-flight"
            data-mark-status={currentStatus}
            data-mark-result={result}
            viewBox={viewBox}
            aria-hidden="true"
            style={{
              left: `${flightBox.left}px`,
              top: `${flightBox.top}px`,
              width: `${flightBox.width}px`,
              height: `${flightBox.height}px`,
            }}
          >
            {toolDefs}
            {!erasing &&
              strokes.map((d, i) => (
                <DrawingPencil
                  key={`p${i}`}
                  path={d}
                  begin={schedule[i].pencilBegin}
                  approach={schedule[i].approach}
                  dur={strokeDur}
                  lift={i === strokes.length - 1 ? liftMs : hopMs}
                  shadow={shadowId}
                  uid={`${baseId}-d${i}`}
                  first={i === 0}
                  last={i === strokes.length - 1}
                  offscreen={offscreenFrom(flightBox, height, strokePoints[i][0])}
                  stretch={stretch}
                />
              ))}
            {erasing &&
              (() => {
                const off = offscreenFrom(flightBox, height, lastPoints[lastPoints.length - 1]);
                return (
                  <g className="workbook-pencil workbook-pencil--eraser" filter={`url(#${shadowId})`}>
                    <animateMotion
                      dur={`${eraseMs}ms`}
                      fill="freeze"
                      keyTimes={`0;${kTouch};${kRubbed};1`}
                      keyPoints="1;1;0;0"
                      calcMode="linear"
                      path={lastPath}
                    />
                    <g>
                      {/* Comes in from off the right edge of the screen, eraser first;
                          leaves the same way once the mark is gone. */}
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        dur={`${eraseMs}ms`}
                        fill="freeze"
                        calcMode="spline"
                        values={`${off};0 0;0 0;${off}`}
                        keyTimes={`0;${kTouch};${kRubbed};1`}
                        keySplines={`0.3 0 0.25 1;0 0 1 1;0.55 0 0.7 1`}
                      />
                      <g>
                        {/* Firm back-and-forth rubbing, the way a child scrubs. */}
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          begin={`${enterMs}ms`}
                          dur={`${scrubPeriod}ms`}
                          repeatCount={Math.floor(rubMs / scrubPeriod)}
                          values="0 0;5 -1.4;0 0;-4.5 1.2;0 0"
                        />
                        <g transform={ERASER_POSE}>
                          <g transform={`rotate(180 0 ${f2(PENCIL_CENTER_Y - stretch / 2)})`}>
                            <PencilShape uid={`${baseId}-e`} stretch={stretch} />
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                );
              })()}
          </svg>,
          document.body,
        )
      : null;

  return (
    <div
      ref={boxRef}
      className={`workbook-pencil-mark workbook-pencil-mark-container ${className}`}
      data-mark-status={currentStatus}
      data-mark-result={result}
      data-mark-type={markType}
    >
      {!erasing && (
        <svg key="mark" className="workbook-pencil-mark__svg" viewBox={viewBox} aria-hidden="true">
          {strokes.map((d, i) => (
            <MarkStroke
              key={i}
              path={d}
              animate={animateDraw}
              dur={strokeDur}
              begin={schedule[i].strokeBegin}
            />
          ))}
        </svg>
      )}
      {erasing && (
        <svg key="erase" className="workbook-pencil-mark__svg" viewBox={viewBox} aria-hidden="true">
          {!reducedMotion && (
            <>
              {/* A faint smudge where the rubber passed, gone by the time the eraser leaves. */}
              {strokes.map((d, i) => (
                <path
                  key={`ghost${i}`}
                  className="workbook-pencil-mark__stroke workbook-pencil-mark__ghost"
                  d={d}
                  opacity="0"
                >
                  <animate
                    attributeName="opacity"
                    dur={`${eraseMs}ms`}
                    fill="freeze"
                    values="0;0.16;0.1;0"
                    keyTimes={`0;${kTouch};${kRubbed};1`}
                  />
                </path>
              ))}
              {strokes.map((d, i) => (
                <path key={i} className="workbook-pencil-mark__stroke" d={d} pathLength={100} strokeDasharray="100 100">
                  <animate
                    attributeName="stroke-dashoffset"
                    dur={`${eraseMs}ms`}
                    fill="freeze"
                    values="0;0;100;100"
                    keyTimes={`0;${kTouch};${kRubbed};1`}
                  />
                </path>
              ))}
              <EraserCrumbs points={lastPoints} seed={seed} enterMs={enterMs} rubMs={rubMs} totalMs={eraseMs} />
            </>
          )}
        </svg>
      )}
      {flightLayer}
    </div>
  );
}
