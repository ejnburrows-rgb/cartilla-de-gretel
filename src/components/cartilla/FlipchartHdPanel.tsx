/**
 * FlipchartHdPanel — teacher Flip Chart viewer.
 *
 * OWNER RULE: the visible page must reproduce the matching physical Flip Chart
 * page as faithfully as possible. Implementation details are subordinate to
 * source-page fidelity. Do not redesign, reflow, modernize, or re-compose the
 * book page. Existing approved/cropped artwork is placement-only and must not
 * be altered. See PROJECT_SOURCE_OF_TRUTH.md.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  getFlipchartPagesForLesson,
  getFlipchartPageSrc,
  isHdFlipchartPath,
  type FlipchartPage,
} from "@/lib/flipchart-hd";
import { FLIPCHART_FLIP_MS, flipchartFlipTransforms } from "@/lib/living-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FlipchartNativeBoard } from "./FlipchartNativeBoard";
import "@/styles/flipchart-presenter.css";

interface FlipchartHdPanelProps {
  lessonNumber: number;
  /** Optional accent for nav highlight (book palette). */
  accentColor?: string;
  /**
   * "full" (default): presenter chrome — nav controls + thumbnail strip.
   * "bare": zero chrome — renders ONLY the page board. No nav buttons,
   * no counter, no thumbnails. The book has no chrome inside the page.
   */
  chrome?: "full" | "bare";
}

function FlipchartFace({
  page,
  onReady,
}: {
  page?: FlipchartPage;
  onReady?: () => void;
}) {
  if (!page) return <div className="fc-board__face" aria-hidden />;
  const canonicalSrc = getFlipchartPageSrc(page);
  return (
    <div
      className="fc-board__face"
      data-hd={isHdFlipchartPath(canonicalSrc) ? "true" : "false"}
      data-canonical-src={canonicalSrc}
      data-native-surface="true"
    >
      <FlipchartNativeBoard page={page} onReady={onReady} />
    </div>
  );
}

export function FlipchartHdPanel({ lessonNumber, accentColor, chrome = "full" }: FlipchartHdPanelProps) {
  const pages: FlipchartPage[] = useMemo(
    () => getFlipchartPagesForLesson(lessonNumber),
    [lessonNumber],
  );
  const reducedMotion = useReducedMotion();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [flipTransform, setFlipTransform] = useState("rotateX(0deg)");
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const flipLockedRef = useRef(false);
  const flipTokenRef = useRef(0);
  const flipTimerRef = useRef<number | null>(null);

  useEffect(() => {
    flipTokenRef.current += 1;
    flipLockedRef.current = false;
    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    setSelectedIdx(0);
    setIsFlipping(false);
    setPageReady((pages[0]?.flipchartPage ?? 0) > 2);
    setFlipDirection(null);
    setFlipTransform("rotateX(0deg)");
    return () => {
      flipTokenRef.current += 1;
      flipLockedRef.current = false;
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    };
  }, [lessonNumber]);

  const afterFlip = useCallback((newIndex: number, token: number) => {
    if (token !== flipTokenRef.current) return;
    flipLockedRef.current = false;
    flipTimerRef.current = null;
    setSelectedIdx(newIndex);
    setIsFlipping(false);
    setFlipDirection(null);
  }, []);

  const safeIdx = pages.length === 0 ? 0 : Math.min(selectedIdx, pages.length - 1);
  const currentPage = pages[safeIdx];

  const goTo = useCallback(
    (index: number, direction: "next" | "prev") => {
      if (flipLockedRef.current || isFlipping || pages.length === 0) return;
      if (index < 0 || index >= pages.length || index === safeIdx) return;
      setPageReady((pages[index]?.flipchartPage ?? 0) > 2);

      if (reducedMotion) {
        setSelectedIdx(index);
        return;
      }

      flipLockedRef.current = true;
      const token = ++flipTokenRef.current;
      const { start, end } = flipchartFlipTransforms(direction);
      setFlipDirection(direction);
      setIsFlipping(true);
      setFlipTransform(start);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (token === flipTokenRef.current) setFlipTransform(end);
        });
      });

      flipTimerRef.current = window.setTimeout(
        () => afterFlip(index, token),
        FLIPCHART_FLIP_MS,
      );
    },
    [afterFlip, isFlipping, pages.length, reducedMotion, safeIdx],
  );

  const handlePrev = useCallback(() => {
    if (safeIdx > 0) goTo(safeIdx - 1, "prev");
  }, [goTo, safeIdx]);

  const handleNext = useCallback(() => {
    if (safeIdx < pages.length - 1) goTo(safeIdx + 1, "next");
  }, [goTo, pages.length, safeIdx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]")) return;
      if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        handleNext();
      } else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNext, handlePrev]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || isFlipping) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const dominant = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    if (Math.abs(dominant) < 56) return;
    if (dominant < 0) handleNext();
    else handlePrev();
  };

  if (pages.length === 0) {
    return (
      <div className="fc-board__empty" data-testid="flipchart-empty">
        <p className="fc-board__empty-kicker">Flipchart</p>
        <p className="fc-board__empty-title">
          No hay láminas del flipchart para la lección {lessonNumber}.
        </p>
      </div>
    );
  }

  const staticIdx = isFlipping ? (flipDirection === "prev" ? safeIdx - 1 : safeIdx + 1) : safeIdx;
  const flipFrontIdx = isFlipping ? (flipDirection === "next" ? safeIdx : safeIdx - 1) : -1;
  const flipBackIdx = isFlipping ? (flipDirection === "next" ? safeIdx + 1 : safeIdx) : -1;

  const boardStyle = {
    ...(accentColor ? { ["--fc-accent" as string]: accentColor } : {}),
    ["--fc-turn-ms" as string]: `${FLIPCHART_FLIP_MS}ms`,
  } as CSSProperties;

  return (
    <div
      className="fc-board"
      style={boardStyle}
      data-testid="flipchart-hd-panel"
      data-hd-primary="true"
      data-presenter-mode="native"
      data-delivery-tier="independent-faithful-assets"
      data-page-turn-axis="vertical"
      data-page-turn-ms={FLIPCHART_FLIP_MS}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-chrome={chrome}
    >
      <div
        className="fc-board__easel"
        data-testid="flipchart-stage"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div className="fc-board__page">
          <div className="fc-board__page-inner">
            <div className="absolute inset-0 h-full w-full">
              <FlipchartFace page={pages[staticIdx] ?? currentPage} onReady={() => setPageReady(true)} />
            </div>

            {!pageReady && !isFlipping && (
              <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 flex justify-center" aria-live="polite">
                <span className="rounded-full border border-stone-200 bg-white/90 px-3 py-1.5 text-xs font-extrabold text-stone-600 shadow-sm backdrop-blur">
                  Cargando lámina…
                </span>
              </div>
            )}

            {isFlipping && (
              <div
                className="pointer-events-none absolute inset-0 z-30"
                data-testid="vertical-flip-layer"
                style={{ transformStyle: "preserve-3d", perspective: "2400px" }}
              >
                <div
                  className="flipchart-flip-wrapper"
                  style={{
                    transform: flipTransform,
                    transformOrigin: "top center",
                    transition: `transform ${FLIPCHART_FLIP_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                    willChange: "transform",
                  }}
                >
                  <div className="flipchart-page-front">
                    <FlipchartFace page={pages[flipFrontIdx]} />
                    <div className="flipchart-shadow-overlay" style={{ opacity: flipDirection === "next" ? 1 : 0 }} />
                  </div>
                  <div className="flipchart-page-back">
                    <FlipchartFace page={pages[flipBackIdx]} />
                    <div className="flipchart-shadow-overlay" style={{ opacity: flipDirection === "prev" ? 1 : 0 }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {(
        <div className="fc-board__controls">
          <button
            type="button"
            onClick={handlePrev}
            disabled={safeIdx === 0 || isFlipping}
            className="fc-board__nav"
            aria-label="Lámina anterior"
          >
            <ChevronUp className="h-5 w-5" aria-hidden />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <div className="fc-board__counter" data-testid="flipchart-counter">
            <span>Hoja {safeIdx + 1} de {pages.length}</span>
            <span className="fc-board__counter-sub">
              Lámina {currentPage?.flipchartPage ?? "—"} · Lección {lessonNumber}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={safeIdx >= pages.length - 1 || isFlipping}
            className="fc-board__nav fc-board__nav--next"
            aria-label="Lámina siguiente"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronDown className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}

      {chrome === "full" && pages.length > 1 && (
        <div className="fc-board__strip" role="tablist" aria-label="Láminas del flipchart">
          {pages.map((page, index) => (
            <button
              key={page.flipchartPage}
              type="button"
              role="tab"
              aria-selected={index === safeIdx}
              className={`fc-board__thumb${index === safeIdx ? " is-active" : ""}`}
              onClick={() => goTo(index, index > safeIdx ? "next" : "prev")}
              aria-label={`Ir a hoja ${index + 1}`}
            >
              <FlipchartNativeBoard page={page} decorative />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
