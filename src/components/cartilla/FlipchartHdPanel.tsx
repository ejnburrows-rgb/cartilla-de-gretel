/**
 * FlipchartHdPanel — teacher Flip Chart viewer.
 *
 * OWNER RULE: the visible page must reproduce the matching physical Flip Chart
 * page as faithfully as possible. Implementation details are subordinate to
 * source-page fidelity. Do not redesign, reflow, modernize, or re-compose the
 * book page. Existing approved/cropped artwork is placement-only and must not
 * be altered. See PROJECT_SOURCE_OF_TRUTH.md.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  getFlipchartPagesForLesson,
  getFlipchartPageSrc,
  isHdFlipchartPath,
  type FlipchartPage,
} from "@/lib/flipchart-hd";
import { FLIPCHART_FLIP_MS, flipchartFlipTransforms } from "@/lib/living-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { audioEngine } from "@/lib/audio-engine";
import { useTeacherPresentation } from "@/lib/teacher-presentation-context";
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
  const { laserPointerActive, handMode } = useTeacherPresentation();

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [targetIdx, setTargetIdx] = useState<number | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCinematicZooming, setIsCinematicZooming] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [flipTransform, setFlipTransform] = useState("rotateX(0deg)");
  const [flipTransitionMs, setFlipTransitionMs] = useState(FLIPCHART_FLIP_MS);

  const easelRef = useRef<HTMLDivElement | null>(null);
  const flipLockedRef = useRef(false);
  const flipTokenRef = useRef(0);
  const flipTimerRef = useRef<number | null>(null);
  const zoomTimerRef = useRef<number | null>(null);

  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    direction: "next" | "prev";
    targetIdx: number;
    pointerId: number;
    soundPlayed: boolean;
    progress: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    direction: "next",
    targetIdx: 0,
    pointerId: -1,
    soundPlayed: false,
    progress: 0,
  });

  useEffect(() => {
    flipTokenRef.current += 1;
    flipLockedRef.current = false;
    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    setSelectedIdx(0);
    setTargetIdx(null);
    setIsFlipping(false);
    setIsDragging(false);
    setIsCinematicZooming(false);
    setPageReady((pages[0]?.flipchartPage ?? 0) > 2);
    setFlipDirection(null);
    setFlipTransform("rotateX(0deg)");
    setFlipTransitionMs(FLIPCHART_FLIP_MS);
    return () => {
      flipTokenRef.current += 1;
      flipLockedRef.current = false;
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    };
  }, [lessonNumber]);

  const afterFlip = useCallback((newIndex: number, token: number) => {
    if (token !== flipTokenRef.current) return;
    flipLockedRef.current = false;
    flipTimerRef.current = null;
    setSelectedIdx(newIndex);
    setTargetIdx(null);
    setIsFlipping(false);
    setIsDragging(false);
    setFlipDirection(null);
  }, []);

  const safeIdx = pages.length === 0 ? 0 : Math.min(selectedIdx, pages.length - 1);
  const currentPage = pages[safeIdx];

  const triggerCinematicZoom = useCallback(() => {
    setIsCinematicZooming(true);
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    zoomTimerRef.current = window.setTimeout(() => setIsCinematicZooming(false), 320);
  }, []);

  const goTo = useCallback(
    (index: number, direction: "next" | "prev", options?: { skipZoom?: boolean }) => {
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
      setTargetIdx(index);
      setFlipDirection(direction);
      setIsFlipping(true);
      setIsDragging(false);
      setFlipTransitionMs(FLIPCHART_FLIP_MS);
      setFlipTransform(start);

      if (!options?.skipZoom) {
        triggerCinematicZoom();
      }

      audioEngine.playPageTurn(true);

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
    [afterFlip, isFlipping, pages.length, reducedMotion, safeIdx, triggerCinematicZoom],
  );

  const handlePrev = useCallback(() => {
    if (safeIdx > 0) goTo(safeIdx - 1, "prev");
  }, [goTo, safeIdx]);

  const handleNext = useCallback(() => {
    if (safeIdx < pages.length - 1) goTo(safeIdx + 1, "next");
  }, [goTo, pages.length, safeIdx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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

  const handleCornerPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    corner: "left" | "right",
  ) => {
    if (laserPointerActive || isFlipping || flipLockedRef.current || pages.length === 0) return;

    const direction: "next" | "prev" =
      handMode === "left"
        ? corner === "left"
          ? "next"
          : "prev"
        : corner === "right"
          ? "next"
          : "prev";

    const targetIndex = direction === "next" ? safeIdx + 1 : safeIdx - 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    event.preventDefault();
    event.stopPropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }

    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      direction,
      targetIdx: targetIndex,
      pointerId: event.pointerId,
      soundPlayed: false,
      progress: 0,
    };
  };

  const handleCornerPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state.active || state.pointerId !== event.pointerId) return;

    const dy = event.clientY - state.startY;
    const easelHeight = easelRef.current?.clientHeight || 500;
    const maxRange = easelHeight * 0.75;

    let progress = 0;
    if (state.direction === "next") {
      progress = Math.min(1, Math.max(0, -dy / maxRange));
    } else {
      progress = Math.min(1, Math.max(0, dy / maxRange));
    }

    state.progress = progress;

    if (progress > 0.04 && !state.soundPlayed) {
      state.soundPlayed = true;
      audioEngine.playPageTurn(true);
      setTargetIdx(state.targetIdx);
      setFlipDirection(state.direction);
      if (!reducedMotion) {
        setIsFlipping(true);
        setIsDragging(true);
      }
    }

    if (!reducedMotion && state.soundPlayed) {
      const angle = state.direction === "next" ? -180 * progress : -180 + 180 * progress;
      setFlipTransform(`rotateX(${angle}deg)`);
    }
  };

  const handleCornerPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state.active || state.pointerId !== event.pointerId) return;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }

    state.active = false;
    const { progress, targetIdx: targetIndex, direction } = state;

    if (reducedMotion) {
      if (progress >= 0.5 || progress < 0.04) {
        if (targetIndex >= 0 && targetIndex < pages.length) {
          setSelectedIdx(targetIndex);
        }
      }
      setIsFlipping(false);
      setIsDragging(false);
      setTargetIdx(null);
      setFlipDirection(null);
      return;
    }

    if (!isFlipping || progress < 0.04) {
      setIsFlipping(false);
      setIsDragging(false);
      goTo(targetIndex, direction);
      return;
    }

    setIsDragging(false);
    flipLockedRef.current = true;
    const token = ++flipTokenRef.current;

    if (progress >= 0.5) {
      setFlipTransitionMs(400);
      const finalAngle = direction === "next" ? "rotateX(-180deg)" : "rotateX(0deg)";
      setFlipTransform(finalAngle);
      flipTimerRef.current = window.setTimeout(() => afterFlip(targetIndex, token), 400);
    } else {
      setFlipTransitionMs(350);
      const springAngle = direction === "next" ? "rotateX(0deg)" : "rotateX(-180deg)";
      setFlipTransform(springAngle);
      flipTimerRef.current = window.setTimeout(() => {
        if (token === flipTokenRef.current) {
          flipLockedRef.current = false;
          setIsFlipping(false);
          setTargetIdx(null);
          setFlipDirection(null);
        }
      }, 350);
    }
  };

  const handleCornerPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state.active || state.pointerId !== event.pointerId) return;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }

    state.active = false;
    flipLockedRef.current = false;
    if (flipTimerRef.current) {
      clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
    setIsFlipping(false);
    setIsDragging(false);
    setTargetIdx(null);
    setFlipDirection(null);
    setFlipTransform("rotateX(0deg)");
  };

  const handleCornerKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    corner: "left" | "right",
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    event.stopPropagation();

    if (laserPointerActive || isFlipping || flipLockedRef.current || pages.length === 0) return;

    const direction: "next" | "prev" =
      handMode === "left"
        ? corner === "left"
          ? "next"
          : "prev"
        : corner === "right"
          ? "next"
          : "prev";

    const targetIndex = direction === "next" ? safeIdx + 1 : safeIdx - 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    goTo(targetIndex, direction);
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

  const destIdx = targetIdx ?? safeIdx;
  const staticIdx = isFlipping ? destIdx : safeIdx;
  const flipFrontIdx = isFlipping ? (flipDirection === "next" ? safeIdx : destIdx) : -1;

  const leftCornerLabel =
    handMode === "left"
      ? `Lámina siguiente (${safeIdx + 2} de ${pages.length})`
      : `Lámina anterior (${safeIdx} de ${pages.length})`;

  const rightCornerLabel =
    handMode === "left"
      ? `Lámina anterior (${safeIdx} de ${pages.length})`
      : `Lámina siguiente (${safeIdx + 2} de ${pages.length})`;

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
      data-hand-mode={handMode}
    >
      <div
        ref={easelRef}
        className={`fc-board__easel${isCinematicZooming ? " is-cinematic-zoom" : ""}`}
        data-testid="flipchart-stage"
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
                    transition: isDragging
                      ? "none"
                      : `transform ${flipTransitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                    willChange: "transform",
                  }}
                >
                  <div className="flipchart-page-front">
                    <FlipchartFace page={pages[flipFrontIdx]} />
                    <div className="flipchart-shadow-overlay" style={{ opacity: flipDirection === "next" ? 0.6 : 0 }} />
                  </div>
                  <div className="flipchart-page-back">
                    <div className="fc-board__paper-back">
                      <div className="fc-board__paper-back-pattern" />
                    </div>
                    <div className="flipchart-shadow-overlay" style={{ opacity: flipDirection === "prev" ? 0.6 : 0 }} />
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Corner Hotspots (Left & Right) */}
            {!laserPointerActive && (
              <>
                <div
                  className={`fc-corner fc-corner--left${laserPointerActive ? " pointer-events-none" : ""}`}
                  role="button"
                  tabIndex={laserPointerActive ? -1 : 0}
                  aria-label={leftCornerLabel}
                  data-testid="flipchart-corner-left"
                  onPointerDown={(e) => handleCornerPointerDown(e, "left")}
                  onPointerMove={handleCornerPointerMove}
                  onPointerUp={handleCornerPointerUp}
                  onPointerCancel={handleCornerPointerCancel}
                  onKeyDown={(e) => handleCornerKeyDown(e, "left")}
                >
                  <div className="fc-corner__dogear" aria-hidden />
                </div>

                <div
                  className={`fc-corner fc-corner--right${laserPointerActive ? " pointer-events-none" : ""}`}
                  role="button"
                  tabIndex={laserPointerActive ? -1 : 0}
                  aria-label={rightCornerLabel}
                  data-testid="flipchart-corner-right"
                  onPointerDown={(e) => handleCornerPointerDown(e, "right")}
                  onPointerMove={handleCornerPointerMove}
                  onPointerUp={handleCornerPointerUp}
                  onPointerCancel={handleCornerPointerCancel}
                  onKeyDown={(e) => handleCornerKeyDown(e, "right")}
                >
                  <div className="fc-corner__dogear" aria-hidden />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

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

      {chrome === "full" && pages.length > 1 && (
        <div className="fc-board__strip" role="tablist" aria-label="Láminas del flipchart">
          {pages.map((page, index) => (
            <button
              key={page.flipchartPage}
              type="button"
              role="tab"
              aria-selected={index === safeIdx}
              disabled={isFlipping || index === safeIdx}
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
