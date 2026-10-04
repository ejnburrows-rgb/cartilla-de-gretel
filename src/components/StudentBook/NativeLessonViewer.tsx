import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gretelEvent } from "@/lib/gretel-bus";
import { remainingHint, usePageCompletion } from "@/lib/page-completion";
import {
  ELEGANT_EASE,
  STUDENT_PAGE_TURN_MS,
  prefersReducedMotion,
  studentFlipTransforms,
} from "@/lib/living-motion";
import type { WorkbookPageEntry } from "./SimplePageViewer";
import "@/styles/native-lesson.css";

export function NativeLessonViewer({
  pages, chapterLabel, initialPage = 0, onPageChange, bookCompanion, onFinish, lessonNumber,
}: {
  pages: WorkbookPageEntry[];
  chapterLabel: string;
  initialPage?: number;
  onPageChange?: (index: number) => void;
  bookCompanion?: ReactNode;
  onFinish?: () => void;
  lessonNumber?: number;
}) {
  const [index, setIndex] = useState(() => Math.min(Math.max(0, initialPage), pages.length - 1));
  const revealTimer = useRef<number | undefined>(undefined);
  const turnTimer = useRef<number | undefined>(undefined);
  const [hint, setHint] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [flipTransform, setFlipTransform] = useState("rotateY(0deg)");
  const isTurningRef = useRef(false);
  const page = pages[index];
  const completion = usePageCompletion(page?.pageNumber, lessonNumber);
  const isLast = index === pages.length - 1;

  useEffect(() => {
    gretelEvent("mount");
    revealTimer.current = window.setTimeout(() => gretelEvent("page:revealed", {
      pageNumber: pages[index]?.pageNumber,
      text: pages[index]?.gretelLine,
    }), 150);
    return () => {
      window.clearTimeout(revealTimer.current);
      window.clearTimeout(turnTimer.current);
    };
    // Initial reveal only; navigation owns later reveals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!completion.complete) return;
    setHint("");
    document.querySelectorAll("[data-page-remaining]").forEach((el) => el.removeAttribute("data-page-remaining"));
  }, [completion.complete]);

  const remainingKey = completion.remaining.map((activity) => activity.id).join("|");
  useEffect(() => {
    if (completion.complete) return;
    setHint((current) => (current ? remainingHint(completion.remaining) : current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingKey]);

  const reveal = useCallback((next: number) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    window.clearTimeout(revealTimer.current);
    revealTimer.current = window.setTimeout(() => {
      gretelEvent("page:revealed", {
        pageNumber: pages[next]?.pageNumber,
        text: pages[next]?.gretelLine,
      });
      gretelEvent("page-flip");
    }, 100);
  }, [pages]);

  const turn = useCallback((next: number) => {
    if (next < 0 || next >= pages.length || next === index || isTurningRef.current) return;
    setHint("");
    isTurningRef.current = true;
    const direction: "next" | "prev" = next > index ? "next" : "prev";
    gretelEvent("page-turn:start");

    // Existing learner state is committed by the route before the visible page changes.
    onPageChange?.(next);

    if (prefersReducedMotion()) {
      setIndex(next);
      isTurningRef.current = false;
      reveal(next);
      return;
    }

    const { start, end } = studentFlipTransforms(direction);
    setFlipDirection(direction);
    setIsFlipping(true);
    setFlipTransform(start);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFlipTransform(end));
    });

    turnTimer.current = window.setTimeout(() => {
      setIndex(next);
      setIsFlipping(false);
      setFlipDirection(null);
      isTurningRef.current = false;
      reveal(next);
    }, STUDENT_PAGE_TURN_MS);
  }, [index, onPageChange, pages.length, reveal]);

  const showRemaining = () => {
    const text = remainingHint(completion.remaining);
    setHint(text);
    document.querySelectorAll("[data-page-remaining]").forEach((el) => el.removeAttribute("data-page-remaining"));
    completion.remaining.forEach((activity) => {
      document.querySelector(`[data-gretel-activity="${activity.id}"]`)?.setAttribute("data-page-remaining", "true");
    });
    const first = completion.remaining[0];
    const target = first ? document.querySelector<HTMLElement>(`[data-gretel-activity="${first.id}"]`) : null;
    target?.scrollIntoView?.({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "center",
    });
  };

  const forward = () => {
    if (isTurningRef.current) return;
    if (!completion.complete) {
      showRemaining();
      return;
    }
    if (isLast) onFinish?.();
    else turn(index + 1);
  };

  if (!page) return null;
  const destination = flipDirection === null
    ? undefined
    : pages[flipDirection === "next" ? index + 1 : index - 1];
  const flipFront = flipDirection === "next" ? page : destination;
  const flipBack = flipDirection === "next" ? destination : page;

  return (
    <section
      className="native-lesson-viewer"
      aria-label="Página de aprendizaje"
      data-native-page={page.pageNumber}
      data-page-complete={completion.complete ? "true" : "false"}
      data-physical-workbook="true"
      data-page-turn-ms={STUDENT_PAGE_TURN_MS}
    >
      <div className="native-lesson-viewer__topline">
        <span className="native-lesson-viewer__chapter">{chapterLabel}</span>
        <span className="native-lesson-viewer__page">Página {page.pageNumber} · {index + 1} de {pages.length}</span>
      </div>

      <div className="native-lesson-viewer__layout">
        <div className="native-lesson-viewer__content relative" style={{ perspective: "1800px" }}>
          {isFlipping && destination ? (
            <>
              <div className="h-full w-full">{destination.content}</div>
              <div
                className="absolute inset-0 z-30 pointer-events-none"
                style={{ transformStyle: "preserve-3d", perspective: "1800px" }}
                data-testid="workbook-turn-leaf"
              >
                <div
                  className="workbook-flip-wrapper"
                  style={{
                    transform: flipTransform,
                    transformOrigin: "left center",
                    transition: `transform ${STUDENT_PAGE_TURN_MS}ms ${ELEGANT_EASE}`,
                  }}
                >
                  <div className="workbook-page-front">
                    {flipFront?.content}
                    <div className="workbook-shadow-overlay" style={{ opacity: flipDirection === "next" ? 1 : 0 }} />
                  </div>
                  <div className="workbook-page-back">
                    {flipBack?.content}
                    <div className="workbook-shadow-overlay" style={{ opacity: flipDirection === "prev" ? 1 : 0 }} />
                  </div>
                </div>
              </div>
            </>
          ) : page.content}
        </div>

        <aside className="native-lesson-viewer__side" aria-label="Gretel y navegación">
          {bookCompanion && <div className="native-lesson-viewer__companion">{bookCompanion}</div>}
          {hint && (
            <p className="native-lesson-viewer__hint" role="status" aria-live="polite" id="native-lesson-next-hint">
              {hint}
            </p>
          )}
          <nav className="native-lesson-viewer__navigation" aria-label="Navegación de páginas">
            <button type="button" onClick={() => turn(index - 1)} disabled={index === 0 || isFlipping}>
              <ChevronLeft size={20} /> Anterior
            </button>
            <span>{index + 1} / {pages.length}</span>
            <button
              type="button"
              onClick={forward}
              disabled={isFlipping}
              aria-disabled={completion.complete ? undefined : true}
              aria-describedby={hint ? "native-lesson-next-hint" : undefined}
              data-locked={completion.complete ? undefined : "true"}
              title={completion.complete ? undefined : "Termina la actividad de esta página para seguir"}
            >
              {isLast ? "Terminar lección" : "Siguiente"} <ChevronRight size={20} />
            </button>
          </nav>
        </aside>
      </div>
    </section>
  );
}
