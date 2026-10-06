import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
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
 * Semantic timing of the Real Workbook Mark (STUDENT_INTERACTION_STANDARD §1–2).
 * The pencil comes to the page, draws the mark slowly enough for a child to see
 * the pencil itself, then lifts away while the mark holds in neutral graphite
 * for ~3 s before the result is revealed. Reduced motion removes only the
 * decorative motion: the mark appears at once and keeps the same neutral hold.
 */
export const WORKBOOK_MARK_TIMING = {
  /** Pencil fades in and settles on the starting point (part of drawMs). */
  approachMs: 500,
  /** Tap → mark finished (approach + the drawn stroke). */
  drawMs: 2700,
  /** Pencil lifts away at the start of the neutral hold. */
  liftMs: 900,
  holdMs: 2800,
  /** Pencil appears, flips to its eraser end, rubs the mark out backwards, lifts away. */
  eraseMs: 3100,
  eraseFlipMs: 1000,
  eraseLiftMs: 300,
  reducedEraseMs: 60,
} as const;

const EASE = "0.45 0.05 0.55 0.95";
/** Pencil geometry: tip at (0,0), body along -y. Length 72 units. */
const PENCIL_LENGTH = 72;
const PENCIL_CENTER_Y = -PENCIL_LENGTH / 2;
/** Writing pose: leaning right like a right-handed child's pencil. */
const PENCIL_POSE = "rotate(30) scale(1.2)";

/**
 * One classic yellow wooden school pencil (hexagonal lacquered body, sharpened
 * cedar cone, graphite point, crimped metal ferrule, pink eraser), drawn
 * tip-at-origin so it can follow the mark path. `uid` keeps gradient ids unique.
 */
function PencilShape({ uid }: { uid: string }) {
  const g = (name: string) => `${uid}-${name}`;
  const u = (name: string) => `url(#${g(name)})`;
  return (
    <g className="workbook-pencil__shape">
      <defs>
        <linearGradient id={g("lacq")} x1="-4" y1="0" x2="4" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f9cf3d" />
          <stop offset="0.3" stopColor="#ffe27a" />
          <stop offset="0.34" stopColor="#f7c21c" />
          <stop offset="0.66" stopColor="#efb10f" />
          <stop offset="0.7" stopColor="#d99706" />
          <stop offset="1" stopColor="#b97a04" />
        </linearGradient>
        <linearGradient id={g("wood")} x1="-4" y1="0" x2="4" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f6dcb0" />
          <stop offset="0.45" stopColor="#efcb93" />
          <stop offset="1" stopColor="#c9975a" />
        </linearGradient>
        <linearGradient
          id={g("lead")}
          x1="-1.4"
          y1="0"
          x2="1.4"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#6b6b73" />
          <stop offset="0.45" stopColor="#3a3a40" />
          <stop offset="1" stopColor="#1f1f23" />
        </linearGradient>
        <linearGradient
          id={g("metal")}
          x1="-4.3"
          y1="0"
          x2="4.3"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#8e959e" />
          <stop offset="0.25" stopColor="#f3f5f7" />
          <stop offset="0.45" stopColor="#c3c8ce" />
          <stop offset="0.75" stopColor="#9aa1a9" />
          <stop offset="1" stopColor="#6c737b" />
        </linearGradient>
        <linearGradient
          id={g("eraser")}
          x1="-4"
          y1="0"
          x2="4"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#f6a7b6" />
          <stop offset="0.35" stopColor="#f9bcc8" />
          <stop offset="1" stopColor="#d9768c" />
        </linearGradient>
      </defs>
      {/* Pink eraser with a softly worn rounded top. */}
      <path
        d="M -3.9 -65.6 L -3.9 -69.6 Q -3.9 -72 -1.6 -72 L 1.6 -72 Q 3.9 -72 3.9 -69.6 L 3.9 -65.6 Z"
        fill={u("eraser")}
      />
      <path
        d="M -3.9 -69.2 Q -3.9 -71.4 -1.8 -71.6 L -1.2 -71.6"
        fill="none"
        stroke="#fde0e6"
        strokeWidth="0.5"
        strokeLinecap="round"
      />
      {/* Crimped metal ferrule: two rolled rings around a ribbed band. */}
      <rect x="-4.3" y="-66" width="8.6" height="9.4" rx="0.5" fill={u("metal")} />
      <rect x="-4.3" y="-65.4" width="8.6" height="1.5" fill="#000" opacity="0.08" />
      <rect x="-4.3" y="-58.6" width="8.6" height="1.5" fill="#000" opacity="0.08" />
      {[-62.9, -61.9, -60.9].map((y) => (
        <line key={y} x1="-4.3" y1={y} x2="4.3" y2={y} stroke="#737a83" strokeWidth="0.35" />
      ))}
      <line
        x1="-4.3"
        y1="-63.6"
        x2="4.3"
        y2="-63.6"
        stroke="#ffffff"
        strokeWidth="0.3"
        opacity="0.7"
      />
      <line
        x1="-4.3"
        y1="-59.9"
        x2="4.3"
        y2="-59.9"
        stroke="#ffffff"
        strokeWidth="0.3"
        opacity="0.7"
      />
      {/* Sharpened cedar cone (under the lacquer's scalloped edge). */}
      <path d="M -4 -14.6 L 4 -14.6 L 1.35 -4.4 L -1.35 -4.4 Z" fill={u("wood")} />
      <path
        d="M -2.2 -12.8 L -0.9 -5.2 M 0.6 -13.4 L 0.35 -5 M 2.4 -12.2 L 1.05 -5.4"
        stroke="#b9874d"
        strokeWidth="0.22"
        opacity="0.55"
      />
      {/* Graphite point. */}
      <path d="M -1.35 -4.4 L 1.35 -4.4 L 0.12 -0.15 Q 0 0.15 -0.12 -0.15 Z" fill={u("lead")} />
      <path
        d="M -0.9 -4.1 L -0.2 -1.2"
        stroke="#9a9aa3"
        strokeWidth="0.25"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Hexagonal lacquered body: three visible facets, scalloped where sharpened. */}
      <path
        d="M -4 -56.6 L 4 -56.6 L 4 -13.1 Q 3.35 -15.3 2.67 -14.4 Q 2 -13.4 1.33 -12.7 Q 0 -15.5 -1.33 -12.7 Q -2 -13.4 -2.67 -14.4 Q -3.35 -15.3 -4 -13.1 Z"
        fill={u("lacq")}
      />
      <line
        x1="-1.33"
        y1="-56.6"
        x2="-1.33"
        y2="-12.9"
        stroke="#c98d06"
        strokeWidth="0.22"
        opacity="0.7"
      />
      <line
        x1="1.33"
        y1="-56.6"
        x2="1.33"
        y2="-12.9"
        stroke="#a87304"
        strokeWidth="0.22"
        opacity="0.7"
      />
      <rect x="-2.95" y="-55.8" width="0.7" height="40.5" rx="0.35" fill="#fff8d6" opacity="0.55" />
      {/* Fine foil band below the ferrule, as on classic school pencils. */}
      <rect x="-4" y="-55.2" width="8" height="0.6" fill="#1f5d3a" opacity="0.85" />
      <rect x="-4" y="-56.6" width="8" height="1.4" fill="#000" opacity="0.06" />
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

function smoothPath(points: Pt[]): string {
  const f = (n: number) => n.toFixed(2);
  let d = `M ${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/**
 * A child's single pencil loop around the picture: slightly irregular, with a
 * small overlap where the pencil comes back past its starting point.
 */
function handDrawnLoop(height: number, seed: number): string {
  const cx = 50;
  const cy = height / 2;
  const rx = 46;
  const ry = Math.max(12, height / 2 - 4);
  const p1 = (seed % 628) / 100 || 0.6;
  const p2 = ((seed >>> 10) % 628) / 100 || 1.1;
  const start = (-110 * Math.PI) / 180;
  const sweep = (382 * Math.PI) / 180;
  const steps = 20;
  const points: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + sweep * t;
    const wobble = 1 + 0.022 * Math.sin(2 * a + p1) + 0.012 * Math.sin(3 * a + p2) + 0.04 * t;
    points.push([cx + rx * wobble * Math.cos(a), cy + ry * wobble * Math.sin(a)]);
  }
  return smoothPath(points);
}

/** Two pencil strokes for "Marca con una x". */
function handDrawnCross(height: number): string[] {
  const top = height * 0.18;
  const bottom = height * 0.82;
  return [
    smoothPath([
      [20, top],
      [50, height / 2 + 1],
      [81, bottom],
    ]),
    smoothPath([
      [80, top + 1],
      [50, height / 2 - 1],
      [19, bottom - 1],
    ]),
  ];
}

function useCellAspect(ref: React.RefObject<HTMLDivElement | null>): number {
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
  return aspect;
}

/**
 * Draw phase. The pencil fades in just above the starting point and settles
 * onto it (`approach`), travels the mark exactly as the stroke is revealed
 * (`dur`), then lifts away and fades (`lift`).
 */
function DrawingPencil({
  path,
  begin = 0,
  approach,
  dur,
  lift,
  shadow,
  uid,
}: {
  path: string;
  begin?: number;
  approach: number;
  dur: number;
  lift: number;
  shadow: string;
  uid: string;
}) {
  const travel = approach + dur;
  const total = travel + lift;
  const a = (approach / travel).toFixed(4);
  const kApproach = (approach / total).toFixed(4);
  const kDone = (travel / total).toFixed(4);
  const kFade = ((travel + lift * 0.35) / total).toFixed(4);
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
      <animate
        attributeName="opacity"
        begin={`${begin}ms`}
        dur={`${total}ms`}
        fill="freeze"
        values="0;1;1;1;0"
        keyTimes={`0;${kApproach};${kDone};${kFade};1`}
      />
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          begin={`${begin}ms`}
          dur={`${total}ms`}
          fill="freeze"
          calcMode="spline"
          values="7 -10;0 0;0 0;8 -11"
          keyTimes={`0;${kApproach};${kDone};1`}
          keySplines={`0.2 0.6 0.4 1;0 0 1 1;0.5 0 0.8 0.6`}
        />
        <g transform={PENCIL_POSE}>
          <PencilShape uid={uid} />
        </g>
      </g>
    </g>
  );
}

/**
 * One pencil stroke. The same <path> element persists from drawing to hold to
 * result, so the neutral → green change is a smooth colour transition.
 */
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
        keyTimes="0;0.04;1"
      />
    </path>
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
  const shadowId = `wb-pencil-shadow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const aspect = useCellAspect(boxRef);
  const height = Math.round(100 * aspect * 10) / 10;
  const seed = useMemo(() => hashSeed(itemId ?? "mark"), [itemId]);
  const strokes = useMemo(
    () => (markType === "circle" ? [handDrawnLoop(height, seed)] : handDrawnCross(height)),
    [height, markType, seed],
  );

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
  // Circle: one slow loop. Cross: two strokes with a short hop between them.
  const hopMs = 260;
  const strokeDur = markType === "circle" ? drawMs - approachMs : (drawMs - approachMs - hopMs) / 2;
  const schedule = strokes.map((_, i) => {
    const strokeBegin = approachMs + i * (strokeDur + hopMs);
    const approach = i === 0 ? approachMs : hopMs;
    return { strokeBegin, pencilBegin: strokeBegin - approach, approach };
  });
  const viewBox = `0 0 100 ${height}`;
  const shadowDefs = (
    <defs>
      <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="1.4" dy="2.2" stdDeviation="1.4" floodColor="#000" floodOpacity="0.22" />
      </filter>
    </defs>
  );

  return (
    <div
      ref={boxRef}
      className={`workbook-pencil-mark workbook-pencil-mark-container ${className}`}
      data-mark-status={currentStatus}
      data-mark-type={markType}
    >
      {!erasing && (
        <svg key="mark" className="workbook-pencil-mark__svg" viewBox={viewBox} aria-hidden="true">
          {animateDraw && shadowDefs}
          {strokes.map((d, i) => (
            <MarkStroke
              key={i}
              path={d}
              animate={animateDraw}
              dur={strokeDur}
              begin={schedule[i].strokeBegin}
            />
          ))}
          {animateDraw &&
            strokes.map((d, i) => (
              <DrawingPencil
                key={`p${i}`}
                path={d}
                begin={schedule[i].pencilBegin}
                approach={schedule[i].approach}
                dur={strokeDur}
                lift={i === strokes.length - 1 ? liftMs : hopMs}
                shadow={shadowId}
                uid={`${shadowId}-d${i}`}
              />
            ))}
        </svg>
      )}
      {erasing && (
        <svg key="erase" className="workbook-pencil-mark__svg" viewBox={viewBox} aria-hidden="true">
          {!reducedMotion && shadowDefs}
          {reducedMotion
            ? null
            : (() => {
                const all = strokes.join(" ");
                const { eraseMs, eraseFlipMs, eraseLiftMs } = WORKBOOK_MARK_TIMING;
                const kFlip = (eraseFlipMs / eraseMs).toFixed(4);
                const kAppear = (Math.min(220, eraseFlipMs / 4) / eraseMs).toFixed(4);
                const kRubbed = ((eraseMs - eraseLiftMs) / eraseMs).toFixed(4);
                const rubMs = eraseMs - eraseFlipMs - eraseLiftMs;
                const scrubPeriod = 190;
                return (
                  <>
                    {strokes.map((d, i) => (
                      <path
                        key={i}
                        className="workbook-pencil-mark__stroke"
                        d={d}
                        pathLength={100}
                        strokeDasharray="100 100"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          dur={`${eraseMs}ms`}
                          fill="freeze"
                          values="0;0;100;100"
                          keyTimes={`0;${kFlip};${kRubbed};1`}
                        />
                      </path>
                    ))}
                    <g
                      className="workbook-pencil workbook-pencil--eraser"
                      opacity="0"
                      filter={`url(#${shadowId})`}
                    >
                      <animateMotion
                        dur={`${eraseMs}ms`}
                        fill="freeze"
                        keyTimes={`0;${kFlip};${kRubbed};1`}
                        keyPoints="1;1;0;0"
                        calcMode="linear"
                        path={strokes[strokes.length - 1] ?? all}
                      />
                      <animate
                        attributeName="opacity"
                        dur={`${eraseMs}ms`}
                        fill="freeze"
                        values="0;1;1;0"
                        keyTimes={`0;${kAppear};${kRubbed};1`}
                      />
                      <g>
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          begin={`${eraseFlipMs}ms`}
                          dur={`${scrubPeriod}ms`}
                          repeatCount={Math.floor(rubMs / scrubPeriod)}
                          values="0 0;1.3 -0.7;0 0;-1.3 0.7;0 0"
                        />
                        <g transform={PENCIL_POSE}>
                          <g>
                            <animateTransform
                              attributeName="transform"
                              type="rotate"
                              dur={`${eraseMs}ms`}
                              fill="freeze"
                              values={`0 0 ${PENCIL_CENTER_Y};0 0 ${PENCIL_CENTER_Y};180 0 ${PENCIL_CENTER_Y};180 0 ${PENCIL_CENTER_Y}`}
                              keyTimes={`0;${kAppear};${kFlip};1`}
                              calcMode="spline"
                              keySplines={`0 0 1 1;${EASE};0 0 1 1`}
                            />
                            <PencilShape uid={`${shadowId}-e`} />
                          </g>
                        </g>
                      </g>
                    </g>
                  </>
                );
              })()}
        </svg>
      )}
    </div>
  );
}
