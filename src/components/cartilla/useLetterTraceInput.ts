// useLetterTraceInput.ts
// Shared input-adaptive logic for the two letter-tracing exercises
// (WorkbookLetterTrace in the workbook's writing-line region, and
// DragLetterTrace in the games). Both import from here so the two can never
// drift apart — the same rule that already governs the stroke templates.
//
// WHY: dragging a held pointer along a curved path is a pen gesture. On a
// touchscreen it feels natural; with a mouse it is genuinely hard. So the
// input device decides how the SAME letter and the SAME stroke template are
// graded:
//   - touch-primary (pointer: coarse) -> unchanged drag-the-path tracing
//   - mouse-primary (pointer: fine)   -> tap the checkpoints in writing order
// Detection is by matchMedia only — never user-agent sniffing — and it
// re-checks on change, so a tablet with a mouse plugged in switches live.
import { useCallback, useEffect, useRef, useState } from "react";
import { advanceTap, type Point, type TapPosition } from "./letter-stroke-templates";

export type TraceInputMode = "drag" | "tap";

/**
 * Reads the primary pointer. Defaults to "drag" (the original behaviour) when
 * matchMedia is unavailable — jsdom under test, or an old browser — so the
 * touch experience is never accidentally degraded by a detection failure.
 * Mirrors the defensive matchMedia style already used in lib/living-motion.ts.
 */
export function detectTraceInputMode(): TraceInputMode {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "drag";
  try {
    // Only a confident "fine and not coarse" pointer switches to tap mode.
    // Hybrids that report coarse (touch laptops, tablets) keep tracing.
    if (window.matchMedia("(pointer: coarse)").matches) return "drag";
    return window.matchMedia("(pointer: fine)").matches ? "tap" : "drag";
  } catch {
    return "drag";
  }
}

/** Live primary-pointer mode; re-evaluates when the pointer capability changes. */
export function useTraceInputMode(): TraceInputMode {
  const [mode, setMode] = useState<TraceInputMode>(() => detectTraceInputMode());

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    let coarse: MediaQueryList;
    let fine: MediaQueryList;
    try {
      coarse = window.matchMedia("(pointer: coarse)");
      fine = window.matchMedia("(pointer: fine)");
    } catch {
      return;
    }
    const update = () => setMode(detectTraceInputMode());
    update();
    // addEventListener is the modern API; older Safari only has addListener.
    const attach = (mql: MediaQueryList) => {
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", update);
        return () => mql.removeEventListener("change", update);
      }
      if (typeof mql.addListener === "function") {
        mql.addListener(update);
        return () => mql.removeListener(update);
      }
      return () => {};
    };
    const detachCoarse = attach(coarse);
    const detachFine = attach(fine);
    return () => {
      detachCoarse();
      detachFine();
    };
  }, []);

  return mode;
}

export interface UseLetterTapTraceArgs {
  strokes: Point[][] | null;
  /** Fired once, when the final checkpoint of the final stroke is tapped. */
  onComplete: (wrongCheckpoints: number) => void;
  /** Fired on every correct tap, for the per-note sound. */
  onCorrectTap?: (orderWithinStroke: number) => void;
  /** Fired the first time the child taps wrong at a given checkpoint. */
  onWrongTap?: () => void;
}

export interface LetterTapTrace {
  position: TapPosition;
  /** Strokes fully tapped, ready to draw solid. */
  completedStrokes: Point[][];
  /** Points tapped so far within the active stroke (draws progressively). */
  currentStrokePoints: Point[];
  finished: boolean;
  /** True briefly after a wrong tap, for gentle visual feedback. */
  wrongFlash: boolean;
  /** How many distinct checkpoints the child fumbled (never a spiral). */
  wrongCheckpoints: number;
  tapCheckpoint: (strokeIdx: number, pointIdx: number) => void;
  reset: () => void;
}

/**
 * Tap-the-dots-in-order grading over the very same stroke template the drag
 * mode follows, so the child still sees correct letter formation and
 * direction: the path draws itself progressively as each dot is hit.
 *
 * Fumbles are counted once per checkpoint, no matter how many times the child
 * taps the wrong dot there — deliberately no penalty spiral. That mirrors the
 * drag grader, which likewise counts one penalty per contiguous off-path
 * excursion rather than one per frame.
 */
export function useLetterTapTrace({
  strokes,
  onComplete,
  onCorrectTap,
  onWrongTap,
}: UseLetterTapTraceArgs): LetterTapTrace {
  const [position, setPosition] = useState<TapPosition>({ strokeIdx: 0, pointIdx: 0 });
  const [completedStrokes, setCompletedStrokes] = useState<Point[][]>([]);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<Point[]>([]);
  const [finished, setFinished] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [wrongCheckpoints, setWrongCheckpoints] = useState(0);

  // Checkpoints already counted as fumbled, so repeated wrong taps on the same
  // dot never stack up a punishing score.
  const fumbledRef = useRef<Set<string>>(new Set());
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    },
    [],
  );

  const reset = useCallback(() => {
    setPosition({ strokeIdx: 0, pointIdx: 0 });
    setCompletedStrokes([]);
    setCurrentStrokePoints([]);
    setFinished(false);
    setWrongFlash(false);
    setWrongCheckpoints(0);
    fumbledRef.current = new Set();
    if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
  }, []);

  const tapCheckpoint = useCallback(
    (strokeIdx: number, pointIdx: number) => {
      if (!strokes || finished) return;
      const result = advanceTap(strokes, position, { strokeIdx, pointIdx });

      if (result.kind === "wrong") {
        const key = `${position.strokeIdx}:${position.pointIdx}`;
        if (!fumbledRef.current.has(key)) {
          fumbledRef.current.add(key);
          setWrongCheckpoints((n) => n + 1);
          onWrongTap?.();
        }
        setWrongFlash(true);
        if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
        wrongTimerRef.current = setTimeout(() => setWrongFlash(false), 500);
        return;
      }

      const tappedPoint = strokes[strokeIdx]?.[pointIdx];
      if (!tappedPoint) return;
      const grown = [...currentStrokePoints, tappedPoint];
      setWrongFlash(false);
      onCorrectTap?.(pointIdx);

      if (result.kind === "point") {
        setCurrentStrokePoints(grown);
        setPosition(result.next);
        return;
      }

      // Stroke finished (or the whole letter) — bank it and start clean.
      setCompletedStrokes((prev) => [...prev, grown]);
      setCurrentStrokePoints([]);

      if (result.kind === "stroke") {
        setPosition(result.next);
        return;
      }

      setFinished(true);
      onComplete(fumbledRef.current.size);
    },
    [strokes, finished, position, currentStrokePoints, onComplete, onCorrectTap, onWrongTap],
  );

  return {
    position,
    completedStrokes,
    currentStrokePoints,
    finished,
    wrongFlash,
    wrongCheckpoints,
    tapCheckpoint,
    reset,
  };
}
