import { useEffect, useState, useRef } from "react";
import { speakAsGretel } from "@/lib/gretel-voice";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type MarkStatus = "drawing" | "holding" | "correct" | "erasing" | "erased";

export interface WorkbookPencilMarkProps {
  /** Mark shape: "circle" or "x" */
  markType?: "circle" | "x";
  /** Whether the mark is correct, incorrect, or pending evaluation */
  isCorrect?: boolean | null;
  /** Callback when erasing animation finishes and state is ready for retry */
  onRetryComplete?: () => void;
  /** Callback when correct animation finishes */
  onCorrectComplete?: () => void;
  /** Active status override if controlled externally */
  status?: MarkStatus;
  /** Custom class name */
  className?: string;
  /** Disable speech if handled by parent */
  silent?: boolean;
}

/**
 * Classic Wooden Pencil SVG Asset.
 * Features a nostalgic yellow wooden body, metallic ferrule, pink eraser tip, and graphite tip.
 */
export function ClassicWoodenPencil({
  isEraserMode = false,
  className = "",
}: {
  isEraserMode?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 160"
      className={`workbook-pencil-svg ${isEraserMode ? "eraser-end" : "pencil-end"} ${className}`}
      aria-hidden="true"
      style={{
        width: "28px",
        height: "112px",
        filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.25))",
        transformOrigin: isEraserMode ? "20px 20px" : "20px 145px",
        transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <g transform={isEraserMode ? "rotate(180 20 80)" : undefined}>
        {/* Pink Classic Eraser */}
        <path
          d="M 10 10 C 10 4, 30 4, 30 10 L 30 25 L 10 25 Z"
          fill="#f472b6"
          stroke="#db2777"
          strokeWidth="1"
        />
        {/* Metallic Band / Ferrule */}
        <rect x="9" y="25" width="22" height="12" fill="#9ca3af" rx="1" />
        <line x1="9" y1="29" x2="31" y2="29" stroke="#6b7280" strokeWidth="1" />
        <line x1="9" y1="33" x2="31" y2="33" stroke="#6b7280" strokeWidth="1" />

        {/* Yellow Wooden Pencil Body */}
        <path d="M 10 37 L 30 37 L 30 120 L 10 120 Z" fill="#f59e0b" />
        {/* Facet Highlights/Shadows */}
        <rect x="10" y="37" width="6" height="83" fill="#fbbf24" opacity="0.6" />
        <rect x="24" y="37" width="6" height="83" fill="#d97706" opacity="0.5" />

        {/* Sharpened Wood Cone */}
        <path d="M 10 120 L 30 120 L 20 145 Z" fill="#fde68a" stroke="#d97706" strokeWidth="0.5" />

        {/* Graphite Tip */}
        <path d="M 17 137.5 L 23 137.5 L 20 145 Z" fill="#374151" />
      </g>
    </svg>
  );
}

/**
 * Real Workbook Mark + Pencil Retry
 * 1. Pencil draws a natural graphite circle/mark.
 * 2. Holds neutral graphite mark for ~3 seconds.
 * 3. Correct: turns green + Gretel says "Buen trabajo."
 * 4. Incorrect: Pencil rotates smoothly to eraser end, rubs/erases mark, Gretel says "Inténtalo otra vez."
 */
export function WorkbookPencilMark({
  markType = "circle",
  isCorrect,
  onRetryComplete,
  onCorrectComplete,
  status: externalStatus,
  className = "",
  silent = false,
}: WorkbookPencilMarkProps) {
  const prefersReducedMotion = useReducedMotion();
  const [internalStatus, setInternalStatus] = useState<MarkStatus>("drawing");
  const currentStatus = externalStatus ?? internalStatus;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Stage 1: Draw phase (fast drawing motion ~400ms)
    if (prefersReducedMotion) {
      setInternalStatus("holding");
      return;
    }

    const drawTimer = setTimeout(() => {
      setInternalStatus("holding");
    }, 400);

    return () => clearTimeout(drawTimer);
  }, [prefersReducedMotion]);

  useEffect(() => {
    // Stage 2: Hold neutral pencil mark for ~3 seconds (~3000ms) before evaluating outcome
    if (currentStatus === "holding" && isCorrect !== undefined && isCorrect !== null) {
      timerRef.current = setTimeout(() => {
        if (isCorrect) {
          setInternalStatus("correct");
          if (!silent) {
            void speakAsGretel("Buen trabajo.");
          }
          if (onCorrectComplete) {
            onCorrectComplete();
          }
        } else {
          setInternalStatus("erasing");
          if (!silent) {
            void speakAsGretel("Inténtalo otra vez.");
          }
        }
      }, prefersReducedMotion ? 100 : 2800);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStatus, isCorrect, prefersReducedMotion, silent, onCorrectComplete]);

  useEffect(() => {
    // Stage 3: Erasing phase (~800ms pencil rotation + eraser rubbing)
    if (currentStatus === "erasing") {
      const eraseTimer = setTimeout(() => {
        setInternalStatus("erased");
        if (onRetryComplete) {
          onRetryComplete();
        }
      }, prefersReducedMotion ? 100 : 900);

      return () => clearTimeout(eraseTimer);
    }
  }, [currentStatus, prefersReducedMotion, onRetryComplete]);

  if (currentStatus === "erased") {
    return null;
  }

  const isErasing = currentStatus === "erasing";
  const isCorrectMark = currentStatus === "correct";

  return (
    <div
      className={`workbook-pencil-mark-container relative pointer-events-none ${className}`}
      data-mark-status={currentStatus}
    >
      {/* SVG Workbook Mark (Circle or X) */}
      <svg
        viewBox="0 0 100 100"
        className={`workbook-mark-svg w-full h-full absolute inset-0 transition-all duration-500 ${
          isCorrectMark
            ? "stroke-emerald-600 fill-emerald-500/10"
            : isErasing
            ? "opacity-0 scale-95"
            : "stroke-slate-700 fill-slate-500/5"
        }`}
        style={{
          strokeWidth: "5px",
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
        aria-hidden="true"
      >
        {markType === "circle" ? (
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="38"
            className={currentStatus === "drawing" ? "animate-draw-circle" : ""}
          />
        ) : (
          <g className={currentStatus === "drawing" ? "animate-draw-x" : ""}>
            <path d="M 20 20 L 80 80" />
            <path d="M 80 20 L 20 80" />
          </g>
        )}
      </svg>

      {/* Animated Physical Wooden Pencil */}
      {(currentStatus === "drawing" || currentStatus === "erasing") && !prefersReducedMotion && (
        <div
          className={`absolute z-20 transition-all duration-300 ${
            isErasing ? "top-2 left-1/2 -translate-x-1/2" : "bottom-1 right-1"
          }`}
        >
          <ClassicWoodenPencil isEraserMode={isErasing} />
        </div>
      )}
    </div>
  );
}
