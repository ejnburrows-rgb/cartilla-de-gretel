import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useActivityEvents } from "@/lib/activity-events";

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

export function ClassicWoodenPencil({
  eraser = false,
  className = "",
}: {
  eraser?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 160"
      className={`workbook-pencil-svg ${eraser ? "eraser-end" : "pencil-end"} ${className}`}
      aria-hidden="true"
      style={{
        width: "28px",
        height: "112px",
        filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.25))",
        transformOrigin: eraser ? "20px 20px" : "20px 145px",
      }}
    >
      <g transform={eraser ? "rotate(180 20 80)" : undefined}>
        <path d="M 10 10 C 10 4, 30 4, 30 10 L 30 25 L 10 25 Z" fill="#f472b6" stroke="#db2777" strokeWidth="1" />
        <rect x="9" y="25" width="22" height="12" fill="#9ca3af" rx="1" />
        <line x1="9" y1="29" x2="31" y2="29" stroke="#6b7280" strokeWidth="1" />
        <line x1="9" y1="33" x2="31" y2="33" stroke="#6b7280" strokeWidth="1" />
        <path d="M 10 37 L 30 37 L 30 120 L 10 120 Z" fill="#f59e0b" />
        <rect x="10" y="37" width="6" height="83" fill="#fbbf24" opacity="0.6" />
        <rect x="24" y="37" width="6" height="83" fill="#d97706" opacity="0.5" />
        <path d="M 10 120 L 30 120 L 20 145 Z" fill="#fde68a" stroke="#d97706" strokeWidth="0.5" />
        <path d="M 17 137.5 L 23 137.5 L 20 145 Z" fill="#374151" />
      </g>
    </svg>
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

  useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);
  useEffect(() => { onRetryRef.current = onRetry; }, [onRetry]);

  useEffect(() => {
    if (externalStatus || isCorrect == null) return;

    const resultDelay = reducedMotion ? 2800 : 3200;
    const holdTimer = reducedMotion
      ? undefined
      : window.setTimeout(() => setInternalStatus("holding"), 400);

    if (reducedMotion) setInternalStatus("holding");

    const resultTimer = window.setTimeout(() => {
      if (isCorrect) {
        setInternalStatus("correct");
        emit(completeOnSuccess ? "activity:complete" : "answer:correct", itemId ? { itemId } : undefined);
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
    const timer = window.setTimeout(() => {
      setInternalStatus("erased");
      onRetryRef.current?.();
    }, reducedMotion ? 60 : 900);
    return () => window.clearTimeout(timer);
  }, [currentStatus, externalStatus, reducedMotion]);

  if (currentStatus === "erased") return null;

  const erasing = currentStatus === "erasing";
  const correct = currentStatus === "correct";

  return (
    <div
      className={`workbook-pencil-mark-container relative pointer-events-none ${className}`}
      data-mark-status={currentStatus}
    >
      <svg
        viewBox="0 0 100 100"
        className={`workbook-mark-svg absolute inset-0 h-full w-full transition-all duration-500 ${
          correct
            ? "stroke-emerald-600 fill-emerald-500/10"
            : erasing
              ? "opacity-0 scale-95 stroke-slate-700 fill-slate-500/5"
              : "stroke-slate-700 fill-slate-500/5"
        }`}
        style={{ strokeWidth: "5px", strokeLinecap: "round", strokeLinejoin: "round" }}
        aria-hidden="true"
      >
        {markType === "circle" ? (
          <ellipse cx="50" cy="50" rx="42" ry="38" className={currentStatus === "drawing" ? "animate-draw-circle" : ""} />
        ) : (
          <g className={currentStatus === "drawing" ? "animate-draw-x" : ""}>
            <path d="M 20 20 L 80 80" />
            <path d="M 80 20 L 20 80" />
          </g>
        )}
      </svg>
      {(currentStatus === "drawing" || erasing) && !reducedMotion && (
        <div className={`absolute z-20 ${erasing ? "left-1/2 top-2 -translate-x-1/2" : "bottom-1 right-1"}`}>
          <ClassicWoodenPencil eraser={erasing} />
        </div>
      )}
    </div>
  );
}
