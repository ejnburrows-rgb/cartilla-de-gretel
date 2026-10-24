import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GretelRecordedPageButton } from "@/components/cartilla/GretelRecordedPageButton";
import { gretelEvent } from "@/lib/gretel-bus";
import { audioEngine } from "@/lib/audio-engine";
import { LESSON_PAGE_LIFT_MS, LESSON_PAGE_TURN_MS, prefersReducedMotion } from "@/lib/living-motion";
import { remainingHint, usePageCompletion } from "@/lib/page-completion";
import { useFitToPage } from "@/lib/use-fit-to-page";
import { PageCurl } from "./PageCurl";
import type { WorkbookPageEntry } from "./SimplePageViewer";
import "@/styles/native-lesson.css";

/** Quiet time after a page is finished before it turns by itself. */
export const AUTO_TURN_IDLE_MS = 1600;
const SWIPE_MIN_PX = 60;
const SWIPE_EXCLUDED =
  "canvas, textarea, input, select, .am-direct-pencil, .am-dibuja__paper, .fp-trace, .native-corner-hotspot, .fp-ix-fill__choice, .fp-ix-fill__blank, .native-syllable, [data-no-swipe]";

/**
 * NativeLessonViewer — One readable, scrollable learning page at a time.
 * Real-paper page turn animation (owner direction 2026-10-09).
 *
 * Triggers:
 * - Tap / drag bottom-right corner = next page (blocked if incomplete).
 * - Tap / drag bottom-left corner = previous page (always allowed).
 * - Siguiente / Anterior buttons.
 * - ArrowRight / ArrowLeft keyboard keys.
 * - Swipe left / right on touch screens.
 * - Automatically, shortly after the page's activities are finished.
 */
export function NativeLessonViewer({
  pages,
  chapterLabel,
  initialPage = 0,
  onPageChange,
  onFinish,
  lessonNumber,
  autoTurn = false,
  swipe = false,
  gated = true,
}: {
  pages: WorkbookPageEntry[];
  chapterLabel: string;
  initialPage?: number;
  onPageChange?: (index: number) => void;
  onFinish?: () => void;
  /** Lesson being studied; an already-completed lesson is never re-gated. */
  lessonNumber?: number;
  /** Turn the page by itself shortly after its activities are finished. */
  autoTurn?: boolean;
  /** Swipe left / right on touch screens to turn pages. */
  swipe?: boolean;
  /** Require page completion before turning forward (lessons). The complete book browses freely. */
  gated?: boolean;
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
  const dragProgressRef = useRef(0);
  const dragRafRef = useRef<number | undefined>(undefined);
  const leafRef = useRef<HTMLDivElement>(null);
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
  const pageCompletion = usePageCompletion(page?.pageNumber, lessonNumber);
  const completion = gated ? pageCompletion : { ...pageCompletion, remaining: [], complete: true };
  const isLast = index === pages.length - 1;
  const isBookEnd = isLast && !gated && !onFinish;
  useFitToPage(containerRef, index);

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
      if (dragRafRef.current) window.cancelAnimationFrame(dragRafRef.current);
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

      const reduce = prefersReducedMotion();
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

      // Phase 1: the corner of the sheet lifts.
      turnTimeoutRef.current = window.setTimeout(() => {
        setTurnPhase("curling");

        // Phase 2: slow, realistic paper curl from right to left.
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

            if (revealTimer.current) window.clearTimeout(revealTimer.current);
            revealTimer.current = window.setTimeout(() => {
              gretelEvent("page:revealed", {
                pageNumber: pages[targetIndex]?.pageNumber,
                text: pages[targetIndex]?.gretelLine,
              });
            }, 150);
          }, 100);
        }, LESSON_PAGE_TURN_MS);
      }, LESSON_PAGE_LIFT_MS);
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

  // Latest navigation callbacks for the native listeners below.
  const forwardRef = useRef(forward);
  const turnPrevRef = useRef(turnPrev);
  forwardRef.current = forward;
  turnPrevRef.current = turnPrev;

  // Auto page turn (owner decision 2026-10-12): when the child finishes the
  // last activity on a page, the page turns by itself once the child has
  // stopped touching it for a moment. Pages that were already finished on
  // arrival, and the lesson's last page, wait for the child instead.
  // A hold over the quiet time must never turn the page mid-stroke: while
  // ANY pointer is down the idle timer stays cancelled, and a fresh quiet
  // period begins only after the last pointer lifts.
  // Fingers/pens/mouse buttons currently down anywhere on the screen. Kept
  // for the whole visit so a press that began BEFORE the page finished
  // (e.g. the finger still resting on the last answer) also holds the turn.
  const activePointersRef = useRef(0);
  useEffect(() => {
    if (!autoTurn) return;
    const onDown = () => {
      activePointersRef.current += 1;
    };
    const onRelease = () => {
      activePointersRef.current = Math.max(0, activePointersRef.current - 1);
    };
    const onReset = () => {
      activePointersRef.current = 0;
    };
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointerup", onRelease, true);
    window.addEventListener("pointercancel", onRelease, true);
    window.addEventListener("blur", onReset);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", onRelease, true);
      window.removeEventListener("pointercancel", onRelease, true);
      window.removeEventListener("blur", onReset);
      activePointersRef.current = 0;
    };
  }, [autoTurn]);

  const autoTurnBaseline = useRef({ index, complete: completion.complete });
  useEffect(() => {
    const previous = autoTurnBaseline.current;
    autoTurnBaseline.current = { index, complete: completion.complete };
    if (!autoTurn || previous.index !== index || previous.complete || !completion.complete || isLast) return;
    const root = containerRef.current;
    let timer: number | undefined;
    const startIdleTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => forwardRef.current(), AUTO_TURN_IDLE_MS);
    };
    const onPointerDown = () => {
      window.clearTimeout(timer);
      timer = undefined;
    };
    // Runs after the capture-phase counter above has already been updated.
    const onPointerRelease = () => {
      if (activePointersRef.current === 0) startIdleTimer();
    };
    const onKeyDown = () => {
      if (activePointersRef.current === 0) startIdleTimer();
    };
    if (activePointersRef.current === 0) startIdleTimer();
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerRelease);
    window.addEventListener("pointercancel", onPointerRelease);
    // Leaving the window resets the finger count (above); count that as a
    // release so a finished page never stays stuck waiting for a lift.
    window.addEventListener("blur", onPointerRelease);
    root?.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerRelease);
      window.removeEventListener("pointercancel", onPointerRelease);
      window.removeEventListener("blur", onPointerRelease);
      root?.removeEventListener("keydown", onKeyDown);
    };
  }, [autoTurn, completion.complete, index, isLast]);

  // Swipe left / right on touch screens turns the page (Siguiente still
  // waits until the page is finished). Writing, drawing and line-tracing
  // areas keep their own finger movement.
  useEffect(() => {
    const root = containerRef.current;
    if (!swipe || !root) return;
    let start: { x: number; y: number; t: number; id: number } | null = null;
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || !event.isPrimary) return;
      const target = event.target as Element | null;
      if (target?.closest?.(SWIPE_EXCLUDED)) return;
      start = { x: event.clientX, y: event.clientY, t: event.timeStamp, id: event.pointerId };
    };
    const onUp = (event: PointerEvent) => {
      const begin = start;
      start = null;
      if (!begin || begin.id !== event.pointerId) return;
      const dx = event.clientX - begin.x;
      const dy = event.clientY - begin.y;
      if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dy) > Math.abs(dx) * 0.6 || event.timeStamp - begin.t > 900) return;
      // A swipe that starts on a picture must not also choose that picture.
      const swallowClick = (click: MouseEvent) => {
        click.preventDefault();
        click.stopPropagation();
      };
      window.addEventListener("click", swallowClick, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener("click", swallowClick, { capture: true }), 400);
      if (dx < 0) forwardRef.current();
      else turnPrevRef.current();
    };
    const onCancel = () => {
      start = null;
    };
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onCancel);
    return () => {
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onCancel);
    };
  }, [swipe]);

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
      if (!prefersReducedMotion()) {
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
    if (!prefersReducedMotion()) {
      if (!dragRafRef.current) {
        dragRafRef.current = window.requestAnimationFrame(() => {
          dragRafRef.current = undefined;
          if (leafRef.current) {
            leafRef.current.style.setProperty("--drag-prog", String(dragProgressRef.current));
          }
        });
      }
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (dragRafRef.current) {
      window.cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = undefined;
    }
    if (leafRef.current) {
      leafRef.current.style.removeProperty("--drag-prog");
    }
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
  };

  const handlePointerUp = (direction: "next" | "prev", e: React.PointerEvent) => {
    if (dragRafRef.current) {
      window.cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = undefined;
    }
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
      if (leafRef.current) {
        leafRef.current.style.removeProperty("--drag-prog");
      }
      if (progress >= 0.5) {
        if (prefersReducedMotion()) {
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
  // Going back, the previous page is the sheet that rolls back in over the
  // current one; going forward, the current sheet rolls away.
  const rollingBack = turning && turnDirection === "prev" && turnPhase !== "settling" && destPage !== null;
  const leafPage = rollingBack && destPage ? destPage : page;
  const underPage = rollingBack ? page : destPage;

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
          {typeof page.pageNumber === "number"
            ? `Página ${page.pageNumber}`
            : "Actividad"}{" · "}
          {index + 1} de {pages.length}
        </span>
      </div>

      <GretelRecordedPageButton key={page.pageNumber} pageNumber={page.pageNumber} lessonNumber={lessonNumber} firstPageOfLesson={index === 0} disabled={turning} />

      <div className="native-lesson-viewer__stage">
        {/* Destination page rendered underneath during turn */}
        {turning && underPage && (
          <div className="native-lesson-viewer__underneath" aria-hidden="true">
            <div className="native-lesson-viewer__content">{underPage.content}</div>
          </div>
        )}

        {/* Current turning page leaf */}
        <div
          ref={leafRef}
          className={`native-lesson-viewer__leaf ${turnPhase !== "idle" ? `turn-${turnDirection}-${turnPhase}` : ""}`}
          style={
            turnPhase === "dragging"
              ? ({
                  "--drag-prog": dragProgressRef.current,
                } as React.CSSProperties)
              : undefined
          }
        >
          <div className="native-lesson-viewer__content">{leafPage.content}</div>

          {/* Corner Hotspot - Bottom Right (Next) */}
          {index < pages.length - 1 && (
            <button
              type="button"
              className="native-corner-hotspot native-corner-hotspot--next"
              data-testid="corner-next"
              aria-label="Avanzar de página (doblar esquina)"
              title={
                completion.complete
                  ? "Doblar esquina para avanzar"
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

        <PageCurl
          phase={turnPhase}
          direction={turnDirection}
          leafRef={leafRef}
          dragProgressRef={dragProgressRef}
          turnMs={LESSON_PAGE_TURN_MS}
          liftMs={LESSON_PAGE_LIFT_MS}
        />
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
            <ChevronLeft size={20} aria-hidden="true" /> <span className="native-lesson-viewer__nav-label">Anterior</span>
          </button>
          <span>
            {index + 1} / {pages.length}
          </span>
          <button
            type="button"
            onClick={forward}
            disabled={turning || isBookEnd}
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
            <span className="native-lesson-viewer__nav-label">{isBookEnd ? "Fin del cuaderno" : isLast ? "Terminar lección" : "Siguiente"}</span> <ChevronRight size={20} aria-hidden="true" />
          </button>
        </nav>
      </div>
    </section>
  );
}
