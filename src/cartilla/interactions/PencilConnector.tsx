/**
 * Owner-approved Workbook pencil matching, marking and erasing.
 * Progress keys retain their old storage format so previous student work survives.
 * No rope/lasso rendering, physics, mascot prop, failure buzzer or local TTS.
 */
import { useCallback, useEffect, useMemo, useRef, useState, useId } from "react";
import { useActivityEvents, useActivityState } from "@/lib/activity-events";
import { playCorrectChord } from "@/lib/piano-audio";
import { loadLassoProgress, saveLassoProgress } from "@/lib/activity-canvas-store";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { PencilShape, WorkbookPencilMark, WORKBOOK_MARK_TIMING } from "@/components/cartilla/WorkbookPencilMark";
import type { WorkbookObject } from "@/content/workbook/types";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import { getLivingActor } from "@/lib/living-actor-registry";

/** A registered living actor plays its owner-approved motion; every other card
 *  picture keeps the plain still image exactly as before. */
function CardPicture({ src }: { src: string }) {
  return getLivingActor(src) ? (
    <LivingIllustration src={src} alt="" loading="lazy" />
  ) : (
    <img src={src} alt="" draggable={false} loading="lazy" />
  );
}
import type { InteractionProps } from "./shared";
import "@/styles/activity-mechanics.css";

export type PencilTarget = {
  id: string;
  label: string;
  src?: string;
  box?: { xPct: number; yPct: number; wPct: number; hPct: number };
  correct?: boolean;
  example?: boolean;
  role?: "left" | "right" | "solo";
  pairId?: string;
};
export type PencilMode = "mark" | "pair";
export type PencilConnectorProps = {
  pageKey: string;
  targets: PencilTarget[];
  mode: PencilMode;
  instruction?: string;
  lessonId?: string;
  reducedMotion?: boolean;
  onResult?: (r: { objectId: string; result: "correct" | "wrong" }) => void;
  onComplete?: () => void;
  centerLabel?: string;
  className?: string;
  wideWorkbook?: boolean;
};
type Pt = { x: number; y: number };

export function DirectPencilConnector({
  pageKey,
  targets,
  mode,
  instruction,
  lessonId,
  reducedMotion: reducedMotionProp,
  onResult,
  onComplete,
  centerLabel = "Uu",
  wideWorkbook = false,
  className,
}: PencilConnectorProps) {
  const shadowUid = `pencil-shadow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { emit: gretelEvent, record: recordEvent } = useActivityEvents();
  const [incorrectAttempts, setIncorrectAttempts] = useActivityState("incorrectAttempts", 0);
  const incorrectRef = useRef(incorrectAttempts);
  incorrectRef.current = incorrectAttempts;

  const reducedMotionHook = useReducedMotion();
  const reducedMotion = reducedMotionProp ?? reducedMotionHook;

  const stageRef = useRef<HTMLDivElement>(null);
  const centerElRef = useRef<HTMLButtonElement>(null);
  const targetEls = useRef<Map<string, HTMLButtonElement>>(new Map());

  const isPairMode = mode === "pair";

  const leftTargets = useMemo(
    () => (isPairMode ? targets.filter((t) => t.role === "left") : []),
    [isPairMode, targets],
  );
  const rightTargets = useMemo(
    () => (isPairMode ? targets.filter((t) => t.role === "right") : targets),
    [isPairMode, targets],
  );

  const totalNeeded = useMemo(() => {
    if (isPairMode) {
      return leftTargets.length;
    }
    const nonExample = targets.filter((t) => !t.example);
    const correctNonExample = nonExample.filter((t) => t.correct === true);
    return correctNonExample.length > 0 ? correctNonExample.length : nonExample.length;
  }, [isPairMode, leftTargets.length, targets]);

  const validMarkIds = useMemo(
    () =>
      new Set(
        targets
          .filter(
            (t) =>
              t.example ||
              t.correct === true ||
              targets.every((item) => item.correct === undefined),
          )
          .map((t) => t.id),
      ),
    [targets],
  );

  // Helper to validate saved or live pair/mark keys against current targets, roles, pairId, and unique endpoints
  const validateProgressKeys = useCallback(
    (rawKeys: string[]): Set<string> => {
      if (!Array.isArray(rawKeys)) rawKeys = [];
      const validated = new Set<string>();
      // Pre-drawn examples are always pre-connected
      targets.filter((t) => t.example).forEach((t) => validated.add(t.id));

      if (isPairMode) {
        const usedLeft = new Set<string>();
        const usedRight = new Set<string>();

        targets.filter((t) => t.example).forEach((t) => {
          if (t.role === "left") usedLeft.add(t.id);
          if (t.role === "right") usedRight.add(t.id);
        });

        for (const key of rawKeys) {
          if (typeof key !== "string") continue;
          const parts = key.split("|");
          if (parts.length !== 2) continue;
          const [leftId, rightId] = parts;
          if (usedLeft.has(leftId) || usedRight.has(rightId)) continue;

          const left = targets.find((t) => t.id === leftId && t.role === "left");
          const right = targets.find((t) => t.id === rightId && t.role === "right");
          if (!left || !right || !left.pairId || !right.pairId) continue;
          if (left.pairId !== right.pairId) continue;

          usedLeft.add(leftId);
          usedRight.add(rightId);
          validated.add(key);
        }
      } else {
        for (const id of rawKeys) {
          if (typeof id !== "string") continue;
          if (validMarkIds.has(id)) {
            const target = targets.find((t) => t.id === id);
            if (target && target.correct !== false) {
              validated.add(id);
            }
          }
        }
      }
      return validated;
    },
    [isPairMode, targets, validMarkIds],
  );

  const [marked, setMarked] = useState<Set<string>>(() => {
    const saved = loadLassoProgress(pageKey)?.completedIds ?? [];
    return validateProgressKeys(saved);
  });

  const [selectedStartId, setSelectedStartId] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartId, setDragStartId] = useState<string | null>(null);
  const [dragPt, setDragPt] = useState<Pt | null>(null);
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null);
  const [wrongLine, setWrongLine] = useState<{ from: Pt; to: Pt; targetId: string } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const finishedRef = useRef(false);

  const activePointerRef = useRef<number | null>(null);
  const heldSourceRef = useRef<string | null>(null);

  const justInitiatedCenterRef = useRef(false);
  const justInitiatedLeftRef = useRef<string | null>(null);
  const [measureTick, setMeasureTick] = useState(0);

  const learnerMarkedCount = useMemo(() => {
    return [...marked].filter((id) => !targets.find((t) => t.id === id)?.example).length;
  }, [marked, targets]);

  const recordWrong = useCallback(() => {
    incorrectRef.current += 1;
    setIncorrectAttempts(incorrectRef.current);
    if (lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: learnerMarkedCount,
        total: totalNeeded + incorrectRef.current,
        meta: {
          exercise: `pencil_line_${pageKey}`,
          completed: false,
          attemptCorrect: false,
          mode,
        },
      });
    }
  }, [lessonId, learnerMarkedCount, totalNeeded, setIncorrectAttempts, recordEvent, pageKey, mode]);

  const persist = useCallback(
    (ids: string[]) => {
      saveLassoProgress(pageKey, ids);
    },
    [pageKey],
  );

  const finishIfDone = useCallback(
    (count: number) => {
      if (count >= totalNeeded && totalNeeded > 0 && !finishedRef.current) {
        finishedRef.current = true;
        setCompleted(true);
        gretelEvent("activity:complete");
        if (lessonId) {
          recordEvent({
            lessonId,
            kind: "exercise",
            score: totalNeeded,
            total: totalNeeded + incorrectRef.current,
            meta: {
              exercise: `pencil_line_${pageKey}`,
              completed: true,
              attemptCorrect: true,
              mode,
            },
          });
        }
        onComplete?.();
      }
    },
    [totalNeeded, lessonId, pageKey, mode, onComplete, gretelEvent, recordEvent],
  );

  useEffect(() => {
    if (learnerMarkedCount >= totalNeeded && totalNeeded > 0 && !finishedRef.current) {
      finishedRef.current = true;
      setCompleted(true);
      gretelEvent("activity:complete", { restored: true });
    }
  }, [learnerMarkedCount, totalNeeded, gretelEvent]);

  // Center / Element Point Helper
  const getCenterPt = useCallback((el: HTMLElement | null): Pt => {
    const stage = stageRef.current;
    if (!stage || !el) return { x: 200, y: 200 };
    const sr = stage.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return {
      x: er.left + er.width / 2 - sr.left,
      y: er.top + er.height / 2 - sr.top,
    };
  }, []);

  const getTargetCenter = useCallback(
    (id: string): Pt => {
      const el = targetEls.current.get(id);
      return getCenterPt(el ?? null);
    },
    [getCenterPt],
  );

  const [centerPt, setCenterPt] = useState<Pt>({ x: 200, y: 200 });

  const updateCenterPt = useCallback(() => {
    if (centerElRef.current) {
      setCenterPt(getCenterPt(centerElRef.current));
    }
  }, [getCenterPt]);

  const measureEndpoints = useCallback(() => {
    updateCenterPt();
    setMeasureTick((v) => v + 1);
  }, [updateCenterPt]);

  // Remeasure target endpoints after initial mount, ref attachment, and state changes
  useEffect(() => {
    measureEndpoints();
    const t1 = setTimeout(measureEndpoints, 50);
    const t2 = setTimeout(measureEndpoints, 150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [measureEndpoints, targets, isExpanded, marked]);

  // ResizeObserver on stageRef for layout/resize remeasurement
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      measureEndpoints();
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, [measureEndpoints]);

  useEffect(() => {
    window.addEventListener("resize", measureEndpoints);
    return () => window.removeEventListener("resize", measureEndpoints);
  }, [measureEndpoints]);

  // Check if left/right pair is connected
  const isLeftConnected = useCallback(
    (id: string) => [...marked].some((m) => m.startsWith(`${id}|`) || m === id),
    [marked],
  );

  const isRightConnected = useCallback(
    (id: string) => [...marked].some((m) => m.endsWith(`|${id}`) || m === id),
    [marked],
  );

  // Pointer drag handlers
  const handlePointerDownCenter = (e: React.PointerEvent) => {
    if (completed || (e.button !== undefined && e.button !== 0)) return;
    e.preventDefault();
    activePointerRef.current = e.pointerId;
    heldSourceRef.current = "center";
    stageRef.current?.setPointerCapture?.(e.pointerId);
    if (!selectedStart) {
      setSelectedStart(true);
      justInitiatedCenterRef.current = true;
    } else {
      justInitiatedCenterRef.current = false;
    }
    setIsDragging(true);
    setDragStartId("center");
    const stage = stageRef.current;
    if (stage) {
      const sr = stage.getBoundingClientRect();
      setDragPt({ x: e.clientX - sr.left, y: e.clientY - sr.top });
    }
  };

  const handlePointerDownLeft = (e: React.PointerEvent, leftTarget: PencilTarget) => {
    if (completed || isLeftConnected(leftTarget.id) || (e.button !== undefined && e.button !== 0)) return;
    e.preventDefault();
    activePointerRef.current = e.pointerId;
    heldSourceRef.current = leftTarget.id;
    stageRef.current?.setPointerCapture?.(e.pointerId);
    if (selectedStartId !== leftTarget.id) {
      setSelectedStartId(leftTarget.id);
      justInitiatedLeftRef.current = leftTarget.id;
    } else {
      justInitiatedLeftRef.current = null;
    }
    setIsDragging(true);
    setDragStartId(leftTarget.id);
    const stage = stageRef.current;
    if (stage) {
      const sr = stage.getBoundingClientRect();
      setDragPt({ x: e.clientX - sr.left, y: e.clientY - sr.top });
    }
  };

  const handlePointerMoveStage = (e: React.PointerEvent) => {
    if (!isDragging || !stageRef.current || e.pointerId !== activePointerRef.current) return;
    if (e.pointerType === "mouse" && (e.buttons & 1) === 0) {
      cancelDragState();
      return;
    }
    const sr = stageRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - sr.left, y: e.clientY - sr.top };
    setDragPt(pt);

    // Find candidate targets
    let nearestId: string | null = null;
    let minDistance = 70;

    const candidateTargets = isPairMode ? rightTargets : targets;

    for (const t of candidateTargets) {
      if (isPairMode ? isRightConnected(t.id) : marked.has(t.id)) continue;
      const el = targetEls.current.get(t.id);
      if (!el) continue;
      const er = el.getBoundingClientRect();
      if (
        e.clientX >= er.left - 10 &&
        e.clientX <= er.right + 10 &&
        e.clientY >= er.top - 10 &&
        e.clientY <= er.bottom + 10
      ) {
        nearestId = t.id;
        break;
      }
      const tc = {
        x: er.left + er.width / 2 - sr.left,
        y: er.top + er.height / 2 - sr.top,
      };
      const dist = Math.hypot(pt.x - tc.x, pt.y - tc.y);
      if (dist < minDistance) {
        minDistance = dist;
        nearestId = t.id;
      }
    }
    setHoverTargetId(nearestId);
  };

  const attemptConnect = useCallback(
    (target: PencilTarget) => {
      if (marked.has(target.id) || completed) return;

      const isCorrect = Boolean(target.correct);

      if (isCorrect) {
        playCorrectChord();
        gretelEvent("answer:correct", { itemId: target.id });
        const next = new Set(marked).add(target.id);
        setMarked(next);
        persist([...next]);
        const count = [...next].filter((id) => !targets.find((t) => t.id === id)?.example).length;
        finishIfDone(count);
        onResult?.({ objectId: target.id, result: "correct" });
      } else {
        gretelEvent("answer:wrong", { itemId: target.id });
        recordWrong();
        const from = centerPt;
        const to = getTargetCenter(target.id);
        setWrongLine({ from, to, targetId: target.id });
        const retryDuration = reducedMotion
          ? WORKBOOK_MARK_TIMING.reducedEraseMs
          : WORKBOOK_MARK_TIMING.eraseMs;
        setTimeout(() => setWrongLine(null), retryDuration);
        onResult?.({ objectId: target.id, result: "wrong" });
      }
    },
    [marked, completed, targets, centerPt, getTargetCenter, persist, finishIfDone, onResult, recordWrong, gretelEvent, reducedMotion],
  );

  const attemptPairConnect = useCallback(
    (left: PencilTarget, right: PencilTarget) => {
      if (isLeftConnected(left.id) || isRightConnected(right.id) || completed) return;

      const isCorrect = left.pairId && right.pairId ? left.pairId === right.pairId : false;
      const pairKey = `${left.id}|${right.id}`;

      if (isCorrect) {
        playCorrectChord();
        gretelEvent("answer:correct", { itemId: pairKey });
        const next = new Set(marked).add(pairKey);
        setMarked(next);
        persist([...next]);
        const count = [...next].filter((id) => !id.includes("example")).length;
        finishIfDone(count);
        setSelectedStartId(null);
        onResult?.({ objectId: pairKey, result: "correct" });
      } else {
        gretelEvent("answer:wrong", { itemId: right.id });
        recordWrong();
        const from = getTargetCenter(left.id);
        const to = getTargetCenter(right.id);
        setWrongLine({ from, to, targetId: right.id });
        const retryDuration = reducedMotion
          ? WORKBOOK_MARK_TIMING.reducedEraseMs
          : WORKBOOK_MARK_TIMING.eraseMs;
        setTimeout(() => setWrongLine(null), retryDuration);
        onResult?.({ objectId: right.id, result: "wrong" });
      }
    },
    [marked, completed, isLeftConnected, isRightConnected, getTargetCenter, persist, finishIfDone, onResult, recordWrong, gretelEvent, reducedMotion],
  );

  const cancelDragState = useCallback(() => {
    const pointerId = activePointerRef.current;
    activePointerRef.current = null;
    heldSourceRef.current = null;
    setIsDragging(false);
    setDragPt(null);
    setHoverTargetId(null);
    setDragStartId(null);
    setSelectedStart(false);
    setSelectedStartId(null);
    justInitiatedCenterRef.current = false;
    justInitiatedLeftRef.current = null;
    if (pointerId != null && stageRef.current?.hasPointerCapture?.(pointerId)) {
      stageRef.current.releasePointerCapture(pointerId);
    }
  }, []);

  useEffect(() => {
    const onReleaseOutside = (event: PointerEvent) => {
      if (activePointerRef.current === event.pointerId) cancelDragState();
    };
    const onVisibility = () => { if (document.hidden) cancelDragState(); };
    window.addEventListener("pointerup", onReleaseOutside);
    window.addEventListener("pointercancel", onReleaseOutside);
    window.addEventListener("blur", cancelDragState);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointerup", onReleaseOutside);
      window.removeEventListener("pointercancel", onReleaseOutside);
      window.removeEventListener("blur", cancelDragState);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [cancelDragState]);

  const handlePointerUpStage = (e: React.PointerEvent) => {
    if (!isDragging || e.pointerId !== activePointerRef.current) return;
    const sourceId = heldSourceRef.current;
    // Capture delivers releases here even outside the page. Only an actual
    // release inside a target counts, never a stale nearest-hover candidate.
    const candidates = isPairMode ? rightTargets : targets;
    const releasedTarget = candidates.find((target) => {
      const rect = targetEls.current.get(target.id)?.getBoundingClientRect();
      return rect && e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;
    });
    cancelDragState();
    if (!releasedTarget) return;
    if (isPairMode && sourceId) {
      const left = targets.find((target) => target.id === sourceId);
      if (left) attemptPairConnect(left, releasedTarget);
    } else if (sourceId === "center") {
      attemptConnect(releasedTarget);
    }
  };

  const handleCenterClick = () => {
    if (completed) return;
    if (justInitiatedCenterRef.current) {
      justInitiatedCenterRef.current = false;
      return;
    }
    setSelectedStart((prev) => !prev);
  };

  const handleTargetClick = (target: PencilTarget) => {
    if (marked.has(target.id) || completed) return;
    attemptConnect(target);
    setSelectedStart(false);
  };

  const handleLeftClick = (leftTarget: PencilTarget) => {
    if (completed || isLeftConnected(leftTarget.id)) return;
    if (justInitiatedLeftRef.current === leftTarget.id) {
      justInitiatedLeftRef.current = null;
      return;
    }
    if (selectedStartId === leftTarget.id) {
      setSelectedStartId(null);
    } else {
      setSelectedStartId(leftTarget.id);
    }
  };

  const handleRightClick = (rightTarget: PencilTarget) => {
    if (completed || isRightConnected(rightTarget.id)) return;
    if (selectedStartId) {
      const left = targets.find((t) => t.id === selectedStartId);
      if (left) {
        attemptPairConnect(left, rightTarget);
      }
    }
  };

  // 3x3 layout cell placement for Central Mode
  const topCells = targets.slice(0, 3);
  const midLeft = targets[3];
  const midRight = targets[4];
  const bottomCells = targets.slice(5, 8);

  // Derive start pt for active drag line
  const activeStartPt = useMemo(() => {
    if (!isDragging) return null;
    if (isPairMode && dragStartId) {
      return getTargetCenter(dragStartId);
    }
    return centerPt;
  }, [isDragging, isPairMode, dragStartId, getTargetCenter, centerPt]);

  return (
    <div
      className={`am-direct-pencil${className ? ` ${className}` : ""}${wideWorkbook ? " am-direct-pencil--wide-workbook" : ""}${isExpanded ? " is-expanded" : ""}`}
      data-complete={String(completed)}
    >
      <div className="am-direct-pencil__toolbar">
        <button
          type="button"
          className="am-direct-pencil__focus-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Volver a la página" : "Ampliar área de trabajo"}
        >
          {isExpanded ? "Volver a la página" : "Ampliar para trazar"}
        </button>
      </div>

      <div
        className="am-direct-pencil__stage"
        ref={stageRef}
        onPointerMove={handlePointerMoveStage}
        onPointerUp={handlePointerUpStage}
        onPointerCancel={cancelDragState}
        onLostPointerCapture={cancelDragState}
      >
        {/* SVG Direct Pencil Lines Layer */}
        <svg className="am-direct-pencil__svg-layer" aria-hidden="true">
          <defs>
            <filter id={shadowUid} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#0f766e" floodOpacity="0.25" />
            </filter>
            <linearGradient id={`${shadowUid}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
          </defs>

          {/* Settled / Connected Lines (Central Mode) */}
          {!isPairMode &&
            targets.map((t) => {
              if (!marked.has(t.id)) return null;
              // measureTick forces recalculation once target refs mount
              void measureTick;
              const targetPt = getTargetCenter(t.id);
              const isExample = t.example;
              return (
                <g key={`line-${t.id}`} className="am-direct-pencil__line-group">
                  <line
                    x1={centerPt.x}
                    y1={centerPt.y}
                    x2={targetPt.x}
                    y2={targetPt.y}
                    stroke="#0d9488"
                    strokeWidth={isExample ? 3 : 4.5}
                    strokeDasharray={isExample ? "6 4" : undefined}
                    strokeLinecap="round"
                    filter={`url(#${shadowUid})`}
                  />
                  <circle cx={targetPt.x} cy={targetPt.y} r={isExample ? 4 : 5.5} fill="#0d9488" />
                  <circle cx={centerPt.x} cy={centerPt.y} r={4} fill="#0d9488" />
                </g>
              );
            })}

          {/* Settled / Connected Lines (Pair Mode) */}
          {isPairMode &&
            [...marked].map((pairKey) => {
              const [leftId, rightId] = pairKey.split("|");
              if (!leftId || !rightId) return null;
              // measureTick forces recalculation once target refs mount
              void measureTick;
              const ptA = getTargetCenter(leftId);
              const ptB = getTargetCenter(rightId);
              return (
                <g key={`pair-line-${pairKey}`} className="am-direct-pencil__line-group">
                  <line
                    x1={ptA.x}
                    y1={ptA.y}
                    x2={ptB.x}
                    y2={ptB.y}
                    stroke="#0d9488"
                    strokeWidth={4.5}
                    strokeLinecap="round"
                    filter={`url(#${shadowUid})`}
                  />
                  <circle cx={ptA.x} cy={ptA.y} r={5} fill="#0d9488" />
                  <circle cx={ptB.x} cy={ptB.y} r={5} fill="#0d9488" />
                </g>
              );
            })}

          {/* Active Drag Line with Wooden Pencil */}
          {isDragging && dragPt && activeStartPt && (
            <g className="am-direct-pencil__active-line">
              <line
                x1={activeStartPt.x}
                y1={activeStartPt.y}
                x2={dragPt.x}
                y2={dragPt.y}
                stroke="#0d9488"
                strokeWidth={5}
                strokeLinecap="round"
                filter={`url(#${shadowUid})`}
              />
              <circle cx={dragPt.x} cy={dragPt.y} r={6} fill="#0f766e" />
              {/* Wooden Pencil at Tip */}
              {(() => {
                const angle =
                  Math.atan2(dragPt.y - activeStartPt.y, dragPt.x - activeStartPt.x) *
                  (180 / Math.PI);
                return (
                  <g
                    transform={`translate(${dragPt.x}, ${dragPt.y}) rotate(${angle + 30}) scale(0.65)`}
                    style={{ pointerEvents: "none" }}
                  >
                    <PencilShape uid={`${shadowUid}-drag-pencil`} />
                  </g>
                );
              })()}
            </g>
          )}

          {/* Wrong Retry Line with Pencil Rotating to Eraser (Shared Kernel Animation) */}
          {wrongLine && (
            <g className="am-direct-pencil__retry-group">
              {reducedMotion ? (
                <line
                  className="am-direct-pencil__retry-line"
                  x1={wrongLine.from.x}
                  y1={wrongLine.from.y}
                  x2={wrongLine.to.x}
                  y2={wrongLine.to.y}
                  stroke="#0d9488"
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity="0.6"
                />
              ) : (
                (() => {
                  const { eraseMs, eraseFlipMs, eraseLiftMs } = WORKBOOK_MARK_TIMING;
                  const kFlip = (eraseFlipMs / eraseMs).toFixed(4);
                  const kAppear = (Math.min(220, eraseFlipMs / 4) / eraseMs).toFixed(4);
                  const kRubbed = ((eraseMs - eraseLiftMs) / eraseMs).toFixed(4);
                  const rubMs = eraseMs - eraseFlipMs - eraseLiftMs;
                  const scrubPeriod = 190;
                  const PENCIL_CENTER_Y = -36;
                  const linePath = `M ${wrongLine.from.x} ${wrongLine.from.y} L ${wrongLine.to.x} ${wrongLine.to.y}`;

                  return (
                    <>
                      <path
                        d={linePath}
                        stroke="#0d9488"
                        strokeWidth={4}
                        strokeLinecap="round"
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
                      <g opacity="0" filter={`url(#${shadowUid})`}>
                        <animateMotion
                          dur={`${eraseMs}ms`}
                          fill="freeze"
                          keyTimes={`0;${kFlip};${kRubbed};1`}
                          keyPoints="1;1;0;0"
                          calcMode="linear"
                          path={linePath}
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
                          <g transform="rotate(30) scale(1.2)">
                            <g>
                              <animateTransform
                                attributeName="transform"
                                type="rotate"
                                dur={`${eraseMs}ms`}
                                fill="freeze"
                                values={`0 0 ${PENCIL_CENTER_Y};0 0 ${PENCIL_CENTER_Y};180 0 ${PENCIL_CENTER_Y};180 0 ${PENCIL_CENTER_Y}`}
                                keyTimes={`0;${kAppear};${kFlip};1`}
                                calcMode="spline"
                                keySplines="0 0 1 1;0.45 0.05 0.55 0.95;0 0 1 1"
                              />
                              <PencilShape uid={`${shadowUid}-retry-pencil`} />
                            </g>
                          </g>
                        </g>
                      </g>
                    </>
                  );
                })()
              )}
            </g>
          )}
        </svg>

        {wideWorkbook && !isPairMode && (
          <div className="am-direct-pencil__wide-board">
            <button type="button" ref={centerElRef}
              className={`am-direct-pencil__center${selectedStart || isDragging ? " is-active" : ""}`}
              onPointerDown={handlePointerDownCenter}
              onClick={(e) => { if (e.detail === 0) handleCenterClick(); }}
              aria-label={`Vocal central ${centerLabel}`} aria-pressed={selectedStart || isDragging}>
              <span className="am-direct-pencil__center-text">{centerLabel}</span>
              <span className="am-direct-pencil__center-halo" aria-hidden="true" />
            </button>
            <div className="am-direct-pencil__wide-pictures">{targets.map(t => renderTargetCell(t))}</div>
          </div>
        )}
        {/* Default composition is unchanged for other pages and games. */}
        {!isPairMode && !wideWorkbook && (
          <div className="am-direct-pencil__grid">
            {/* Top Row */}
            <div className="am-direct-pencil__row am-direct-pencil__row--top">
              {topCells.map((t) => renderTargetCell(t))}
            </div>

            {/* Middle Row: Left Picture | CENTER Uu | Right Picture */}
            <div className="am-direct-pencil__row am-direct-pencil__row--mid">
              {midLeft && renderTargetCell(midLeft)}

              <button
                type="button"
                ref={centerElRef}
                className={`am-direct-pencil__center${selectedStart || isDragging ? " is-active" : ""}`}
                onPointerDown={handlePointerDownCenter}
                onClick={(e) => { if (e.detail === 0) handleCenterClick(); }}
                aria-label={`Vocal central ${centerLabel}`}
                aria-pressed={selectedStart || isDragging}
              >
                <span className="am-direct-pencil__center-text">{centerLabel}</span>
                <span className="am-direct-pencil__center-halo" aria-hidden="true" />
              </button>

              {midRight && renderTargetCell(midRight)}
            </div>

            {/* Bottom Row */}
            <div className="am-direct-pencil__row am-direct-pencil__row--bottom">
              {bottomCells.map((t) => renderTargetCell(t))}
            </div>
          </div>
        )}

        {/* Multi-Pair Mode: Left Column (Vowels) & Right Column (Pictures) */}
        {isPairMode && (
          <div className="am-direct-pencil__multi-grid">
            <div className="am-direct-pencil__column am-direct-pencil__column--left">
              {leftTargets.map((t) => {
                const connected = isLeftConnected(t.id);
                const selected = selectedStartId === t.id || (isDragging && dragStartId === t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    ref={(el) => {
                      if (el) targetEls.current.set(t.id, el);
                      else targetEls.current.delete(t.id);
                    }}
                    className={[
                      "am-direct-pencil__left-card",
                      connected ? "is-connected" : "",
                      selected ? "is-active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={connected}
                    onPointerDown={(e) => handlePointerDownLeft(e, t)}
                    onClick={(e) => { if (e.detail === 0) handleLeftClick(t); }}
                    aria-label={`Vocal ${t.label}`}
                    aria-pressed={selected || connected}
                  >
                    <span className="am-direct-pencil__left-text">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="am-direct-pencil__column am-direct-pencil__column--right">
              {rightTargets.map((t) => {
                const connected = isRightConnected(t.id);
                const approaching = hoverTargetId === t.id;
                const wrong = wrongLine?.targetId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    ref={(el) => {
                      if (el) targetEls.current.set(t.id, el);
                      else targetEls.current.delete(t.id);
                    }}
                    className={[
                      "am-direct-pencil__target",
                      connected ? "is-connected" : "",
                      approaching ? "is-approaching" : "",
                      wrong ? "is-retry" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={connected}
                    onClick={(e) => { if (e.detail === 0) handleRightClick(t); }}
                    aria-label={t.label}
                    aria-pressed={connected}
                  >
                    <div className="am-direct-pencil__card">
                      {t.src ? (
                        <CardPicture src={t.src} />
                      ) : (
                        <span className="am-direct-pencil__target-text">{t.label}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function renderTargetCell(t: PencilTarget) {
    const isMarked = marked.has(t.id);
    const isApproaching = hoverTargetId === t.id;
    const isWrong = wrongLine?.targetId === t.id;

    return (
      <button
        key={t.id}
        type="button"
        ref={(el) => {
          if (el) targetEls.current.set(t.id, el);
          else targetEls.current.delete(t.id);
        }}
        className={[
          "am-direct-pencil__target",
          isMarked ? "is-connected" : "",
          isApproaching ? "is-approaching" : "",
          isWrong ? "is-retry" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={isMarked}
        onClick={(e) => { if (e.detail === 0) handleTargetClick(t); }}
        aria-label={t.label}
        aria-pressed={isMarked}
        data-correct={t.correct === undefined ? undefined : String(t.correct)}
        data-example={t.example ? "true" : undefined}
      >
        <div className="am-direct-pencil__card">
          {t.src ? (
            <CardPicture src={t.src} />
          ) : (
            <span className="am-direct-pencil__target-text">{t.label}</span>
          )}
        </div>
      </button>
    );
  }
}

/** Preserve existing saved pair progress while presenting only approved pencil lines. */
export function PencilConnectorFromWorkbook({
  objects, onResult, onComplete, reducedMotion, pageKey, mode, instruction, lessonId,
}: InteractionProps & { pageKey: string; mode: PencilMode; instruction?: string; lessonId?: string }) {
  const targets: PencilTarget[] = objects.map((o: WorkbookObject) => {
    const d = (o.interaction?.data ?? {}) as { correct?: boolean; role?: "left" | "right"; pairId?: string };
    return { id: o.id, label: o.alt ?? o.text ?? o.id, src: o.src, box: o.box,
      correct: d.correct, role: d.role ?? "solo", pairId: d.pairId };
  });
  return <DirectPencilConnector pageKey={pageKey} targets={targets} mode={mode}
    instruction={instruction} lessonId={lessonId} reducedMotion={reducedMotion}
    onResult={onResult} onComplete={onComplete} className="am-direct-pencil--workbook" />;
}

/** Source-page picture choices: circle each answer with the shared real pencil actor. */
export function PencilMarkFromWorkbook({
  objects, onResult, onComplete, pageKey,
}: InteractionProps & { pageKey: string }) {
  const graded = objects.filter((o) => (o.interaction?.data as {correct?: boolean} | undefined)?.correct !== undefined);
  const correct = objects.filter((o) =>
    graded.length === 0 || (o.interaction?.data as {correct?: boolean} | undefined)?.correct === true);
  const [marked, setMarked] = useState<Set<string>>(() =>
    new Set((loadLassoProgress(pageKey)?.completedIds ?? []).filter(id => correct.some(o => o.id === id))));
  const [pending, setPending] = useState<{id: string; correct: boolean} | null>(null);
  const finished = useRef(false);
  useEffect(() => {
    if (correct.length > 0 && marked.size === correct.length && !finished.current) {
      finished.current = true;
      onComplete?.();
    }
  }, [correct.length, marked, onComplete]);
  return <div className="am-pencil-mark-grid">
    {objects.map((object) => {
      const isCorrect = correct.some((o) => o.id === object.id);
      const done = marked.has(object.id);
      const active = pending?.id === object.id;
      return <button key={object.id} type="button" className="am-pencil-mark-grid__item"
        aria-label={object.alt ?? object.text ?? object.id} aria-pressed={done || active}
        disabled={done || (pending !== null && !active)}
        onClick={() => setPending({id: object.id, correct: isCorrect})}>
        {object.src ? <img src={object.src} alt="" draggable={false} /> : <span>{object.text ?? object.alt ?? object.id}</span>}
        {(active || done) && <span className="am-pencil-mark-grid__overlay" aria-hidden="true">
          <WorkbookPencilMark markType="circle" round itemId={object.id}
            isCorrect={active ? isCorrect : true} status={done ? "correct" : undefined}
            onSuccess={() => {
              const next = new Set(marked).add(object.id);
              setMarked(next); saveLassoProgress(pageKey, [...next]); setPending(null);
              onResult?.({objectId: object.id, result: "correct"});
            }}
            onRetry={() => { setPending(null); onResult?.({objectId: object.id, result: "wrong"}); }} />
        </span>}
      </button>;
    })}
  </div>;
}
