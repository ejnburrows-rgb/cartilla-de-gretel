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
 * The pencil draws the mark, the mark holds in neutral graphite for ~3 s, then
 * the result is revealed. Reduced motion removes only the decorative motion:
 * the mark appears at once and keeps the same neutral hold.
 */
export const WORKBOOK_MARK_TIMING = {
  drawMs: 800,
  holdMs: 2800,
  /** Rotate to the eraser end, erase along the mark, lift away. */
  eraseMs: 1300,
  reducedEraseMs: 60,
} as const;

const EASE = "0.45 0.05 0.55 0.95";
/** Pencil geometry: tip at (0,0), body along -y. Length 62 units. */
const PENCIL_CENTER_Y = -31;

/** One classic wooden school pencil, drawn tip-at-origin for path following. */
function PencilShape() {
  return (
    <g className="workbook-pencil__shape">
      <path
        d="M -3.6 -56.2 L -3.6 -59.4 Q -3.6 -62 -1 -62 L 1 -62 Q 3.6 -62 3.6 -59.4 L 3.6 -56.2 Z"
        fill="#ef8fa8"
        stroke="#c7607d"
        strokeWidth="0.4"
      />
      <rect
        x="-3.8"
        y="-56.4"
        width="7.6"
        height="6.4"
        rx="0.6"
        fill="#c9ced6"
        stroke="#8d949e"
        strokeWidth="0.4"
      />
      <line x1="-3.8" y1="-54.3" x2="3.8" y2="-54.3" stroke="#8d949e" strokeWidth="0.45" />
      <line x1="-3.8" y1="-52.2" x2="3.8" y2="-52.2" stroke="#8d949e" strokeWidth="0.45" />
      <rect x="-3.6" y="-50" width="7.2" height="40" fill="#f4b41a" />
      <rect x="-3.6" y="-50" width="2.3" height="40" fill="#fbd157" />
      <rect x="1.3" y="-50" width="2.3" height="40" fill="#d8920c" />
      <path
        d="M -3.6 -10 Q -2.4 -11.2 -1.2 -10 Q 0 -11.2 1.2 -10 Q 2.4 -11.2 3.6 -10 L 1.25 -3.3 L -1.25 -3.3 Z"
        fill="#efd2a2"
        stroke="#c99a5c"
        strokeWidth="0.35"
      />
      <path d="M -1.25 -3.3 L 1.25 -3.3 L 0 0 Z" fill="#3b3b40" />
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
  return (
    <svg
      viewBox="-12 -66 24 70"
      className={`workbook-pencil-svg ${eraser ? "eraser-end" : "pencil-end"} ${className}`}
      aria-hidden="true"
    >
      <g transform={eraser ? `rotate(180 0 ${PENCIL_CENTER_Y})` : undefined}>
        <PencilShape />
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

/** Draw phase: stroke reveal and the pencil tip travelling on the same path. */
function DrawingPencil({
  path,
  begin = "0ms",
  dur,
  shadow,
}: {
  path: string;
  begin?: string;
  dur: number;
  shadow: string;
}) {
  return (
    <g className="workbook-pencil" opacity="0" filter={`url(#${shadow})`}>
      <animateMotion
        begin={begin}
        dur={`${dur}ms`}
        fill="freeze"
        calcMode="spline"
        keyTimes="0;1"
        keyPoints="0;1"
        keySplines={EASE}
        path={path}
      />
      <animate
        attributeName="opacity"
        begin={begin}
        dur={`${dur + 220}ms`}
        fill="freeze"
        values="0;1;1;0"
        keyTimes="0;0.08;0.8;1"
      />
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          begin={begin}
          dur={`${dur + 220}ms`}
          fill="freeze"
          values="0 0;0 0;5 -7"
          keyTimes="0;0.78;1"
        />
        <g transform="rotate(32) scale(0.86)">
          <PencilShape />
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
  begin = "0ms",
  dur,
}: {
  path: string;
  animate: boolean;
  begin?: string;
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
        begin={begin}
        dur={`${dur}ms`}
        fill="freeze"
        calcMode="spline"
        keyTimes="0;1"
        keySplines={EASE}
        values="100;0"
      />
      <animate
        attributeName="opacity"
        begin={begin}
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
  const drawDur =
    markType === "circle" ? WORKBOOK_MARK_TIMING.drawMs : WORKBOOK_MARK_TIMING.drawMs / 2;
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
              dur={drawDur}
              begin={`${i * drawDur}ms`}
            />
          ))}
          {animateDraw &&
            strokes.map((d, i) => (
              <DrawingPencil
                key={`p${i}`}
                path={d}
                dur={drawDur}
                begin={`${i * drawDur}ms`}
                shadow={shadowId}
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
                          dur={`${WORKBOOK_MARK_TIMING.eraseMs}ms`}
                          fill="freeze"
                          values="0;0;100;100"
                          keyTimes="0;0.23;0.85;1"
                        />
                      </path>
                    ))}
                    <g
                      className="workbook-pencil workbook-pencil--eraser"
                      opacity="0"
                      filter={`url(#${shadowId})`}
                    >
                      <animateMotion
                        dur={`${WORKBOOK_MARK_TIMING.eraseMs}ms`}
                        fill="freeze"
                        keyTimes="0;0.23;0.85;1"
                        keyPoints="1;1;0;0"
                        calcMode="linear"
                        path={strokes[strokes.length - 1] ?? all}
                      />
                      <animate
                        attributeName="opacity"
                        dur={`${WORKBOOK_MARK_TIMING.eraseMs}ms`}
                        fill="freeze"
                        values="0;1;1;0"
                        keyTimes="0;0.06;0.88;1"
                      />
                      <g transform="rotate(32) scale(0.86)">
                        <g>
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            dur={`${WORKBOOK_MARK_TIMING.eraseMs}ms`}
                            fill="freeze"
                            values={`0 0 ${PENCIL_CENTER_Y};180 0 ${PENCIL_CENTER_Y};180 0 ${PENCIL_CENTER_Y}`}
                            keyTimes="0;0.23;1"
                            calcMode="spline"
                            keySplines={`${EASE};0 0 1 1`}
                          />
                          <PencilShape />
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
