import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gretelEvent, onGretelEvent } from "@/lib/gretel-bus";
import {
  markPageActivityDone,
  readDonePageNumbers,
} from "@/lib/page-activity-gate";
import type { WorkbookPageEntry } from "./SimplePageViewer";
import "@/styles/native-lesson.css";

/** One readable, scrollable learning page at a time, retaining the book's
 * page events and the caller's existing student progress persistence. */
export function NativeLessonViewer({
  pages, chapterLabel, initialPage = 0, onPageChange, bookCompanion, onFinish, lessonId,
}: {
  pages: WorkbookPageEntry[];
  chapterLabel: string;
  initialPage?: number;
  onPageChange?: (index: number) => void;
  bookCompanion?: React.ReactNode;
  onFinish?: () => void;
  /** When provided, per-page activity completion persists in localStorage. */
  lessonId?: number;
}) {
  const [index, setIndex] = useState(() => Math.min(Math.max(0, initialPage), pages.length - 1));
  const page = pages[index];

  // Pages whose required activity is already satisfied: view-complete pages
  // (no requiresActivity) plus any activity pages the student finished before
  // (persisted per lesson). The gate opens for a page when its index is here.
  const [doneSet, setDoneSet] = useState<Set<number>>(() => {
    const persisted = lessonId != null ? readDonePageNumbers(lessonId) : new Set<number>();
    const initial = new Set<number>();
    pages.forEach((entry, i) => {
      if (!entry.requiresActivity) initial.add(i);
      else if (entry.pageNumber != null && persisted.has(entry.pageNumber)) initial.add(i);
    });
    return initial;
  });

  // Refs so the gretel-bus subscription always sees the current page without
  // re-subscribing on every turn.
  const indexRef = useRef(index);
  indexRef.current = index;
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const lessonIdRef = useRef(lessonId);
  lessonIdRef.current = lessonId;

  useEffect(() => {
    gretelEvent("mount");
    const timer = window.setTimeout(() => gretelEvent("page:revealed", {
      pageNumber: pages[index]?.pageNumber,
      text: pages[index]?.gretelLine,
    }), 150);
    return () => window.clearTimeout(timer);
    // The initial reveal occurs once; navigation handles subsequent reveals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Owner rule (PROJECT_SOURCE_OF_TRUTH.md #5): the student cannot advance
  // with Siguiente until the required activity on the current page is
  // finished. Interactive exercises already report completion through the
  // existing `activity:complete` gretel-bus event — this subscribes to that
  // channel instead of inventing a parallel progress system. Only the
  // currently mounted page can emit it, so it always belongs to this page.
  useEffect(() => onGretelEvent((type) => {
    if (type !== "activity:complete") return;
    const i = indexRef.current;
    const entry = pagesRef.current[i];
    const lid = lessonIdRef.current;
    setDoneSet((prev) => {
      if (prev.has(i)) return prev;
      const next = new Set(prev);
      next.add(i);
      return next;
    });
    if (lid != null && entry?.pageNumber != null) markPageActivityDone(lid, entry.pageNumber);
  }), []);

  const canAdvance = !page?.requiresActivity || doneSet.has(index);

  const turn = (next: number) => {
    if (next < 0 || next >= pages.length || next === index) return;
    // Back is always allowed; forward requires the gate on the page being left.
    if (next > index) {
      const leaving = pagesRef.current[index];
      if (leaving?.requiresActivity && !doneSet.has(index)) return;
    }
    gretelEvent("page-turn:start");
    setIndex(next);
    onPageChange?.(next);
    window.scrollTo({ top: 0, behavior: "instant" });
    window.setTimeout(() => gretelEvent("page:revealed", {
      pageNumber: pages[next]?.pageNumber,
      text: pages[next]?.gretelLine,
    }), 150);
  };

  const handleNext = () => {
    if (index === pages.length - 1) {
      if (canAdvance) onFinish?.();
      return;
    }
    turn(index + 1);
  };

  if (!page) return null;
  const isLast = index === pages.length - 1;
  return (
    <section className="native-lesson-viewer" aria-label="Página de aprendizaje" data-native-page={page.pageNumber}>
      <div className="native-lesson-viewer__topline">
        <span className="native-lesson-viewer__chapter">{chapterLabel}</span>
        <span className="native-lesson-viewer__page">Página {page.pageNumber} · {index + 1} de {pages.length}</span>
      </div>
      <div className="native-lesson-viewer__progress" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={pages.length} aria-label="Progreso de páginas">
        {pages.map((entry, step) => <span key={entry.id} className={step <= index ? "is-done" : ""} />)}
      </div>
      <div className="native-lesson-viewer__content">{page.content}</div>
      {!canAdvance && (
        <p className="native-lesson-viewer__gate-hint" role="status">
          Completa la actividad de esta página para continuar
        </p>
      )}
      <nav className="native-lesson-viewer__navigation" aria-label="Navegación de páginas">
        <button type="button" onClick={() => turn(index - 1)} disabled={index === 0}><ChevronLeft size={18} /> Anterior</button>
        <span>{index + 1} / {pages.length}</span>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canAdvance}
          aria-disabled={!canAdvance}
          title={canAdvance ? undefined : "Completa la actividad de esta página para continuar"}
        >
          {isLast ? "Terminar lección" : "Siguiente"} <ChevronRight size={18} />
        </button>
      </nav>
      {bookCompanion && <div className="native-lesson-viewer__companion">{bookCompanion}</div>}
    </section>
  );
}
