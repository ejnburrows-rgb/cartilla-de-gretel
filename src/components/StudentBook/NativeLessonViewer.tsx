import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gretelEvent } from "@/lib/gretel-bus";
import { audioEngine } from "@/lib/audio-engine";
import { LESSON_PAGE_TURN_MS, prefersReducedMotion } from "@/lib/living-motion";
import { remainingHint, usePageCompletion } from "@/lib/page-completion";
import type { WorkbookPageEntry } from "./SimplePageViewer";
import "@/styles/native-lesson.css";

const isTestEnv = typeof process !== "undefined" && process.env?.NODE_ENV === "test";

/**
 * NativeLessonViewer — One readable, scrollable learning page at a time.
 * Real-paper page turn animation (owner direction 2026-10-09).
 *
 * Triggers:
 * - Tap / drag bottom-right corner = next page (blocked if incomplete).
 * - Tap / drag bottom-left corner = previous page (always allowed).
 * - Siguiente / Anterior buttons.
 * - ArrowRight / ArrowLeft keyboard keys.
 */
export function NativeLessonViewer({
  pages,
  chapterLabel,
  initialPage = 0,
  onPageChange,
  onFinish,
  lessonNumber,
}: {
  pages: WorkbookPageEntry[];
  chapterLabel: string;
  initialPage?: number;
  onPageChange?: (index: number) => void;
  onFinish?: () => void;
  /** Lesson being studied; an already-completed lesson is never re-gated. */
  lessonNumber?: number;
}) {
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(0, initialPage), pages.length - 1),
  );
  const revealTimer = useRef<number | undefined>(undefined);
  const turnTimeoutRef = useRef<number | undefined>(undefined);
  const [hint, setHint] = useState("");

  // Turn state
  const [turning, setTurning] = useState(false);
  const [turnDirection, setTurnDirection] = useState<"next" | "prev" | null>(null);
  const [turnPhase, setTurnPhase] = useState<"idle" | "zoom" | "curling" | "settling" | "dragging">("idle");
  const [destinationIndex, setDestinationIndex] = useState<number | null>(null);
  const [dragProgress, setDragProgress] = useState(0);
  const dragProgressRef = useRef(0);
  // A cancelled/dragged gesture must not generate a second navigation via click.
  const suppressCornerClickRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; active: boolean; isDragging: boolean }>({
    x: 0,
    y: 0,
    active: false,
    isDragging: false,
  });

  const page = pages[index];
  const completion = usePageCompletion(page?.pageNumber, lessonNumber);
  const isLast = index === pages.length - 1;

  useEffect(() => {
    gretelEvent("mount");
    revealTimer.current = window.setTimeout(() => {
      gretelEvent("page:revealed", {
        pageNumber: pages[index]?.pageNumber,
        text: pages[index]?.gretelLine,
      });
    }, 150);
    return () => {
      if (revealTimer.current) window.clearTimeout(revealTimer.current);
      if (turnTimeoutRef.current) window.clearTimeout(turnTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear hint when page complete
  useEffect(() => {
    if (!completion.complete) return;
    setHint("");
    document.querySelectorAll("[data-page-remaining]").forEach((el) => el.removeAttribute("data-page-remaining"));
  }, [completion.complete]);

  // Update hint if activity changes
  const remainingKey = completion.remaining.map((activity) => activity.id).join("|");
  useEffect(() => {
    if (completion.complete) return;
    setHint((current) => (current ? remainingHint(completion.remaining) : current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingKey]);

  const showRemaining = useCallback(() => {
    const text = remainingHint(completion.remaining);
    setHint(text);
    document.querySelectorAll("[data-page-remaining]").forEach((el) => el.removeAttribute("data-page-remaining"));
    completion.remaining.forEach((activity) => {
      document.querySelector(`[data-gretel-activity="${activity.id}"]`)?.setAttribute("data-page-remaining", "true");
    });
    const first = completion.remaining[0];
    const target = first ? document.querySelector<HTMLElement>(`[data-gretel-activity="${first.id}"]`) : null;
    const reduce = prefersReducedMotion();
    target?.scrollIntoView?.({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }, [completion.remaining]);

  const executeTurn = useCallback(
    (targetIndex: number, direction: "next" | "prev") => {
      if (turning || targetIndex < 0 || targetIndex >= pages.length || targetIndex === index) return;

      if (direction === "next" && !completion.complete) {
        showRemaining();
        return;
      }

      setHint("");
      gretelEvent("page-turn:start");
      audioEngine.playPageTurn(true);

      const reduce = prefersReducedMotion() || isTestEnv;
      if (reduce) {
        setIndex(targetIndex);
        onPageChange?.(targetIndex);
        window.scrollTo({ top: 0, behavior: "instant" });
        if (revealTimer.current) window.clearTimeout(revealTimer.current);
        revealTimer.current = window.setTimeout(() => {
          gretelEvent("page:revealed", {
            pageNumber: pages[targetIndex]?.pageNumber,
            text: pages[targetIndex]?.gretelLine,
          });
        }, 150);
        return;
      }

      setTurning(true);
      setTurnDirection(direction);
      setDestinationIndex(targetIndex);
      setTurnPhase("zoom");

      if (turnTimeoutRef.current) window.clearTimeout(turnTimeoutRef.current);

      // Phase 1: 0.3s corner zoom
      turnTimeoutRef.current = window.setTimeout(() => {
        setTurnPhase("curling");

        // Phase 2: 2.0s HD 3D page curl
        turnTimeoutRef.current = window.setTimeout(() => {
          setTurnPhase("settling");
          setIndex(targetIndex);
          onPageChange?.(targetIndex);
          window.scrollTo({ top: 0, behavior: "instant" });

          turnTimeoutRef.current = window.setTimeout(() => {
            setTurning(false);
            setTurnDirection(null);
            setTurnPhase("idle");
            setDestinationIndex(null);
            setDragProgress(0);

            if (revealTimer.current) window.clearTimeout(revealTimer.current);
            revealTimer.current = window.setTimeout(() => {
              gretelEvent("page:revealed", {
                pageNumber: pages[targetIndex]?.pageNumber,
                text: pages[targetIndex]?.gretelLine,
              });
            }, 150);
          }, 100);
        }, LESSON_PAGE_TURN_MS);
      }, 300);
    },
    [turning, pages, index, completion.complete, showRemaining, onPageChange],
  );

  const forward = useCallback(() => {
    if (!completion.complete) {
      showRemaining();
      return;
    }
    if (isLast) onFinish?.();
    else executeTurn(index + 1, "next");
  }, [completion.complete, isLast, onFinish, executeTurn, index, showRemaining]);

  const turnPrev = useCallback(() => {
    executeTurn(index - 1, "prev");
  }, [executeTurn, index]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        forward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        turnPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [forward, turnPrev]);

  // Drag physics on corner hotspots
  const handlePointerDown = (direction: "next" | "prev", e: React.PointerEvent) => {
    if (turning) return;
    const targetIdx = direction === "next" ? index + 1 : index - 1;
    if (targetIdx < 0 || targetIdx >= pages.length) return;

    dragStartRef.current = { x: e.clientX, y: e.clientY, active: true, isDragging: false };
    dragProgressRef.current = 0;
    suppressCornerClickRef.current = false;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const handlePointerMove = (direction: "next" | "prev", e: React.PointerEvent) => {
    if (!dragStartRef.current.active) return;

    const deltaX = direction === "next"
      ? dragStartRef.current.x - e.clientX
      : e.clientX - dragStartRef.current.x;

    if (!dragStartRef.current.isDragging) {
      if (Math.abs(deltaX) < 6) return; // threshold for drag vs tap
      if (direction === "next" && !completion.complete) {
        showRemaining();
        dragStartRef.current.active = false;
        suppressCornerClickRef.current = true;
        return;
      }
      dragStartRef.current.isDragging = true;
      // Drag distance still counts with reduced motion, but no 3D layer mounts.
      if (!prefersReducedMotion() && !isTestEnv) {
        const targetIdx = direction === "next" ? index + 1 : index - 1;
        setTurning(true);
        setTurnDirection(direction);
        setDestinationIndex(targetIdx);
        setTurnPhase("dragging");
      }
    }

    const rect = containerRef.current?.getBoundingClientRect();
    const width = rect?.width || 600;
    const prog = Math.min(1, Math.max(0, deltaX / (width * 0.75)));
    dragProgressRef.current = prog;
    if (!prefersReducedMotion() && !isTestEnv) setDragProgress(prog);
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (!dragStartRef.current.active) return;
    dragStartRef.current.active = false;
    dragStartRef.current.isDragging = false;
    dragProgressRef.current = 0;
    suppressCornerClickRef.current = true;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    // Cancellation only discards the presentation gesture; no navigation,
    // audio, progress or completion callback can be emitted.
    setTurning(false);
    setTurnDirection(null);
    setTurnPhase("idle");
    setDestinationIndex(null);
    setDragProgress(0);
  };

  const handlePointerUp = (direction: "next" | "prev", e: React.PointerEvent) => {
    if (!dragStartRef.current.active) return;
    const wasDragging = dragStartRef.current.isDragging;
    dragStartRef.current.active = false;
    dragStartRef.current.isDragging = false;

    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }

    if (wasDragging) {
      suppressCornerClickRef.current = true;
      const targetIdx = direction === "next" ? index + 1 : index - 1;
      const progress = dragProgressRef.current;
      dragProgressRef.current = 0;
      if (progress >= 0.5) {
        if (prefersReducedMotion() || isTestEnv) {
          executeTurn(targetIdx, direction);
          return;
        }
        // Complete the turn
        audioEngine.playPageTurn(true);
        gretelEvent("page-turn:start");
        setTurnPhase("curling");

        if (turnTimeoutRef.current) window.clearTimeout(turnTimeoutRef.current);
        turnTimeoutRef.current = window.setTimeout(() => {
          setTurnPhase("settling");
          setIndex(targetIdx);
          onPageChange?.(targetIdx);
          window.scrollTo({ top: 0, behavior: "instant" });

          turnTimeoutRef.current = window.setTimeout(() => {
            setTurning(false);
            setTurnDirection(null);
            setTurnPhase("idle");
            setDestinationIndex(null);
            setDragProgress(0);

            if (revealTimer.current) window.clearTimeout(revealTimer.current);
            revealTimer.current = window.setTimeout(() => {
              gretelEvent("page:revealed", {
                pageNumber: pages[targetIdx]?.pageNumber,
                text: pages[targetIdx]?.gretelLine,
              });
            }, 150);
          }, 100);
        }, Math.round(LESSON_PAGE_TURN_MS * (1 - progress)));
      } else {
        // Spring back
        setTurnPhase("idle");
        setTurning(false);
        setTurnDirection(null);
        setDestinationIndex(null);
        setDragProgress(0);
      }
    }
  };

  const handleCornerClick = (direction: "next" | "prev") => {
    if (suppressCornerClickRef.current) {
      suppressCornerClickRef.current = false;
      return;
    }
    if (turning || turnPhase !== "idle") return;
    if (direction === "next") forward();
    else turnPrev();
  };

  if (!page) return null;

  const destPage = destinationIndex !== null ? pages[destinationIndex] : null;

  return (
    <section
      ref={containerRef}
      className={`native-lesson-viewer ${turning ? "is-turning" : ""} turn-phase-${turnPhase}`}
      aria-label="Página de aprendizaje"
      data-native-page={page.pageNumber}
      data-page-complete={completion.complete ? "true" : "false"}
      data-turn-direction={turnDirection || undefined}
      data-turn-phase={turnPhase}
      data-page-turn-ms={LESSON_PAGE_TURN_MS}
    >
      <div className="native-lesson-viewer__topline">
        <span className="native-lesson-viewer__chapter">{chapterLabel}</span>
        <span className="native-lesson-viewer__page">
          Página {page.pageNumber} · {index + 1} de {pages.length}
        </span>
      </div>

      <div className="native-lesson-viewer__stage">
        {/* Destination page rendered underneath during turn */}
        {turning && destPage && (
          <div className="native-lesson-viewer__underneath" aria-hidden="true">
            <div className="native-lesson-viewer__content">{destPage.content}</div>
          </div>
        )}

        {/* Current turning page leaf */}
        <div
          className={`native-lesson-viewer__leaf ${turnPhase !== "idle" ? `turn-${turnDirection}-${turnPhase}` : ""}`}
          style={
            turnPhase === "dragging"
              ? ({
                  "--drag-prog": dragProgress,
                } as React.CSSProperties)
              : undefined
          }
        >
          <div className="native-lesson-viewer__content">{page.content}</div>

          {/* Real paper underside & moving shadow during curl */}
          {turning && (
            <>
              <div className="native-page-underside" aria-hidden="true" />
              <div className="native-page-shadow" aria-hidden="true" />
            </>
          )}

          {/* Corner Hotspot - Bottom Right (Next) */}
          {index < pages.length - 1 && (
            <button
              type="button"
              className="native-corner-hotspot native-corner-hotspot--next"
              data-testid="corner-next"
              aria-label="Página siguiente (doblar esquina)"
              title={
                completion.complete
                  ? "Siguiente página"
                  : "Termina la actividad de esta página para seguir"
              }
              data-locked={completion.complete ? undefined : "true"}
              onClick={() => handleCornerClick("next")}
              onPointerDown={(e) => handlePointerDown("next", e)}
              onPointerMove={(e) => handlePointerMove("next", e)}
              onPointerUp={(e) => handlePointerUp("next", e)}
              onPointerCancel={handlePointerCancel}
              onLostPointerCapture={handlePointerCancel}
            >
              <span className="native-corner-peel" aria-hidden="true" />
            </button>
          )}

          {/* Corner Hotspot - Bottom Left (Prev) */}
          {index > 0 && (
            <button
              type="button"
              className="native-corner-hotspot native-corner-hotspot--prev"
              data-testid="corner-prev"
              aria-label="Página anterior (doblar esquina)"
              title="Página anterior"
              onClick={() => handleCornerClick("prev")}
              onPointerDown={(e) => handlePointerDown("prev", e)}
              onPointerMove={(e) => handlePointerMove("prev", e)}
              onPointerUp={(e) => handlePointerUp("prev", e)}
              onPointerCancel={handlePointerCancel}
              onLostPointerCapture={handlePointerCancel}
            >
              <span className="native-corner-peel" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="native-lesson-viewer__footer">
        {hint && (
          <p
            className="native-lesson-viewer__hint"
            role="status"
            aria-live="polite"
            id="native-lesson-next-hint"
          >
            {hint}
          </p>
        )}
        <nav
          className="native-lesson-viewer__navigation"
          aria-label="Navegación de páginas"
        >
          <button
            type="button"
            onClick={turnPrev}
            disabled={index === 0 || turning}
            data-testid="button-prev"
          >
            <ChevronLeft size={20} /> Anterior
          </button>
          <span>
            {index + 1} / {pages.length}
          </span>
          <button
            type="button"
            onClick={forward}
            disabled={turning}
            aria-disabled={completion.complete ? undefined : true}
            aria-describedby={hint ? "native-lesson-next-hint" : undefined}
            data-locked={completion.complete ? undefined : "true"}
            data-testid="button-next"
            title={
              completion.complete
                ? undefined
                : "Termina la actividad de esta página para seguir"
            }
          >
            {isLast ? "Terminar lección" : "Siguiente"} <ChevronRight size={20} />
          </button>
        </nav>
      </div>
    </section>
  );
}
