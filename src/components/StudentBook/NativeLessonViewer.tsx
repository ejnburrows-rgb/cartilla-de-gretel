import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gretelEvent } from "@/lib/gretel-bus";
import { remainingHint, usePageCompletion } from "@/lib/page-completion";
import type { WorkbookPageEntry } from "./SimplePageViewer";
import "@/styles/native-lesson.css";

/** One readable, scrollable learning page at a time, retaining the book's
 * page events and the caller's existing student progress persistence.
 *
 * Owner rule: Anterior is always available; Siguiente / Terminar lección only
 * work once the page's required activity is complete (page-completion.ts). */
export function NativeLessonViewer({
  pages, chapterLabel, initialPage = 0, onPageChange, bookCompanion, onFinish, lessonNumber,
}: {
  pages: WorkbookPageEntry[];
  chapterLabel: string;
  initialPage?: number;
  onPageChange?: (index: number) => void;
  bookCompanion?: ReactNode;
  onFinish?: () => void;
  /** Lesson being studied; an already-completed lesson is never re-gated. */
  lessonNumber?: number;
}) {
  const [index, setIndex] = useState(() => Math.min(Math.max(0, initialPage), pages.length - 1));
  const revealTimer = useRef<number | undefined>(undefined);
  const [hint, setHint] = useState("");
  const page = pages[index];
  const completion = usePageCompletion(page?.pageNumber, lessonNumber);
  const isLast = index === pages.length - 1;

  useEffect(() => {
    gretelEvent("mount");
    revealTimer.current = window.setTimeout(() => gretelEvent("page:revealed", {
      pageNumber: pages[index]?.pageNumber,
      text: pages[index]?.gretelLine,
    }), 150);
    return () => window.clearTimeout(revealTimer.current);
    // The initial reveal occurs once; navigation handles subsequent reveals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear the hint and the "still to do" marks as soon as the page is done.
  useEffect(() => {
    if (!completion.complete) return;
    setHint("");
    document.querySelectorAll("[data-page-remaining]").forEach((el) => el.removeAttribute("data-page-remaining"));
  }, [completion.complete]);

  // While a hint is showing, keep it in step with what is still left to do.
  const remainingKey = completion.remaining.map((activity) => activity.id).join("|");
  useEffect(() => {
    if (completion.complete) return;
    setHint((current) => (current ? remainingHint(completion.remaining) : current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingKey]);

  const turn = (next: number) => {
    if (next < 0 || next >= pages.length || next === index) return;
    setHint("");
    gretelEvent("page-turn:start");
    setIndex(next);
    onPageChange?.(next);
    window.scrollTo({ top: 0, behavior: "instant" });
    window.clearTimeout(revealTimer.current);
    revealTimer.current = window.setTimeout(() => gretelEvent("page:revealed", {
      pageNumber: pages[next]?.pageNumber,
      text: pages[next]?.gretelLine,
    }), 150);
  };

  const showRemaining = () => {
    const text = remainingHint(completion.remaining);
    setHint(text);
    document.querySelectorAll("[data-page-remaining]").forEach((el) => el.removeAttribute("data-page-remaining"));
    completion.remaining.forEach((activity) => {
      document.querySelector(`[data-gretel-activity="${activity.id}"]`)?.setAttribute("data-page-remaining", "true");
    });
    const first = completion.remaining[0];
    const target = first ? document.querySelector<HTMLElement>(`[data-gretel-activity="${first.id}"]`) : null;
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView?.({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  const forward = () => {
    if (!completion.complete) {
      showRemaining();
      return;
    }
    if (isLast) onFinish?.();
    else turn(index + 1);
  };

  if (!page) return null;
  return (
    <section
      className="native-lesson-viewer"
      aria-label="Página de aprendizaje"
      data-native-page={page.pageNumber}
      data-page-complete={completion.complete ? "true" : "false"}
    >
      <div className="native-lesson-viewer__topline">
        <span className="native-lesson-viewer__chapter">{chapterLabel}</span>
        <span className="native-lesson-viewer__page">Página {page.pageNumber} · {index + 1} de {pages.length}</span>
      </div>

      <div className="native-lesson-viewer__layout">
        <div className="native-lesson-viewer__content">{page.content}</div>

        <aside className="native-lesson-viewer__side" aria-label="Gretel y navegación">
          {bookCompanion && <div className="native-lesson-viewer__companion">{bookCompanion}</div>}
          {hint && (
            <p className="native-lesson-viewer__hint" role="status" aria-live="polite" id="native-lesson-next-hint">
              {hint}
            </p>
          )}
          <nav className="native-lesson-viewer__navigation" aria-label="Navegación de páginas">
            <button type="button" onClick={() => turn(index - 1)} disabled={index === 0}>
              <ChevronLeft size={20} /> Anterior
            </button>
            <span>{index + 1} / {pages.length}</span>
            <button
              type="button"
              onClick={forward}
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
