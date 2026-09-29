import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gretelEvent } from "@/lib/gretel-bus";
import type { WorkbookPageEntry } from "./SimplePageViewer";
import "@/styles/native-lesson.css";

/** One readable learning page at a time, retaining page events and progress persistence. */
export function NativeLessonViewer({
  pages,
  chapterLabel,
  initialPage = 0,
  onPageChange,
  bookCompanion,
  onFinish,
  exactReplica = false,
}: {
  pages: WorkbookPageEntry[];
  chapterLabel: string;
  initialPage?: number;
  onPageChange?: (index: number) => void;
  bookCompanion?: React.ReactNode;
  onFinish?: () => void;
  exactReplica?: boolean;
}) {
  const [index, setIndex] = useState(() => Math.min(Math.max(0, initialPage), pages.length - 1));
  const page = pages[index];

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

  const turn = (next: number) => {
    if (next < 0 || next >= pages.length || next === index) return;
    gretelEvent("page-turn:start");
    setIndex(next);
    onPageChange?.(next);
    window.scrollTo({ top: 0, behavior: "instant" });
    window.setTimeout(() => gretelEvent("page:revealed", {
      pageNumber: pages[next]?.pageNumber,
      text: pages[next]?.gretelLine,
    }), 150);
  };

  const advance = () => {
    if (index === pages.length - 1) onFinish?.();
    else turn(index + 1);
  };

  if (!page) return null;

  if (exactReplica) {
    return (
      <section
        className="native-lesson-viewer native-lesson-viewer--exact"
        aria-label="Página del cuaderno"
        data-native-page={page.pageNumber}
        data-exact-replica="true"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.altKey || event.ctrlKey || event.metaKey) return;
          if (event.key === "ArrowRight") {
            event.preventDefault();
            advance();
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            turn(index - 1);
          }
        }}
        onClick={(event) => {
          if (event.target instanceof HTMLElement && event.target.closest("button, input, textarea, select, [contenteditable], [data-interactive]")) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (event.clientX - rect.left < rect.width / 2) turn(index - 1);
          else advance();
        }}
      >
        <div className="native-lesson-viewer__content">{page.content}</div>
      </section>
    );
  }

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
      <nav className="native-lesson-viewer__navigation" aria-label="Navegación de páginas">
        <button type="button" onClick={() => turn(index - 1)} disabled={index === 0}><ChevronLeft size={18} /> Anterior</button>
        <span>{index + 1} / {pages.length}</span>
        <button type="button" onClick={advance}>{index === pages.length - 1 ? "Terminar lección" : "Siguiente"} <ChevronRight size={18} /></button>
      </nav>
      {bookCompanion && <div className="native-lesson-viewer__companion">{bookCompanion}</div>}
    </section>
  );
}
