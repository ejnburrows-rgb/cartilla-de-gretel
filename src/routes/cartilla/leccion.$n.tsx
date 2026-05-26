import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { getCartillaCrmCssVars, getCartillaCrmTheme } from "@/lib/cartilla-crm-theme";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { useLessonProgress } from "@/lib/lesson-progress";
import { BookPageFlip } from "@/components/cartilla/BookPageFlip";
import { PageExercisePane } from "@/components/cartilla/PageExercisePane";
import { PolishedPage } from "@/components/cartilla/PolishedPage";
import "@/styles/student-print.css";

export const Route = createFileRoute("/cartilla/leccion/$n")({
  component: LeccionScanRoute,
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
  },
});

function LeccionScanRoute() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const n = Number(nParam);
  const entry = CATALOG.find((e) => e.n === n);
  const pages = getWorkbookPagesForLesson(n);
  const { markCompleted } = useLessonProgress();
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    setPageIndex(0);
    setDirection(1);
  }, [n]);

  if (!entry) return null;

  const theme = getCartillaCrmTheme(n);
  const cssVars = getCartillaCrmCssVars(n) as CSSProperties;
  const activePage = pages[pageIndex];
  const totalPages = pages.length;

  const goPrev = () => {
    setDirection(-1);
    if (pageIndex > 0) {
      setPageIndex((p) => p - 1);
      return;
    }
    if (n > 1) {
      navigate({ to: "/cartilla/leccion/$n", params: { n: String(n - 1) } });
      return;
    }
    navigate({ to: "/cartilla/lecciones" });
  };

  const goNext = () => {
    setDirection(1);
    if (pageIndex < totalPages - 1) {
      setPageIndex((p) => p + 1);
      return;
    }
    markCompleted(n);
    if (n < TOTAL_LESSONS) {
      navigate({ to: "/cartilla/leccion/$n", params: { n: String(n + 1) } });
      return;
    }
    navigate({ to: "/cartilla/lecciones" });
  };

  return (
    <div className="student-book-shell" style={cssVars}>
      <header className="student-book-toolbar" style={{ borderColor: theme.border }}>
        <div className="student-book-toolbar__top">
          <Link to="/cartilla/lecciones" className="student-book-icon-button" style={{ borderColor: theme.border, color: theme.titleInk }} aria-label="Volver al indice">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="student-book-toolbar__title">
            <span className="student-book-toolbar__eyebrow" style={{ color: theme.accentDark }}>
              <BookOpen className="h-4 w-4" /> Leccion {n} de {TOTAL_LESSONS}
            </span>
            <h1 style={{ color: theme.titleInk }}>{entry.title}</h1>
          </div>
          <a href="/cartilla/imprimir/all" className="student-book-icon-button" style={{ borderColor: theme.border, color: theme.titleInk }} aria-label="Imprimir libro">
            <Printer className="h-4 w-4" />
          </a>
        </div>
      </header>

      <main className="student-book-stage" aria-live="polite">
        <section className="student-book-vertical">
          <div className="student-book-lesson-ribbon" style={{ borderColor: theme.border }}>
            <div>
              <h2 style={{ color: theme.titleInk }}>{entry.title}</h2>
              {entry.subtitle ? <p>{entry.subtitle}</p> : null}
            </div>
            <select
              value={n}
              onChange={(event) => navigate({ to: "/cartilla/leccion/$n", params: { n: event.target.value } })}
              className="rounded-xl border bg-white/80 px-3 py-2 text-sm font-black shadow-sm"
              style={{ borderColor: theme.border, color: theme.titleInk }}
              aria-label="Saltar a otra leccion"
            >
              {CATALOG.map((item) => (
                <option key={item.n} value={item.n}>
                  Leccion {item.n}: {item.title}
                </option>
              ))}
            </select>
          </div>

          {activePage ? (
            <BookPageFlip pageKey={`${n}-${activePage.pageNumber}`} direction={direction}>
              <article className="student-book-page-card" style={{ borderColor: theme.border }}>
                <div className="student-book-page-inner">
                  <PolishedPage pageNumber={activePage.pageNumber} lessonN={n} />
                </div>
              </article>
            </BookPageFlip>
          ) : (
            <div className="student-book-page-card p-10 text-center font-black" style={{ color: theme.titleInk }}>
              No hay paginas para esta leccion.
            </div>
          )}

          {activePage ? (
            <div className="student-book-exercise-card" style={{ borderColor: theme.border }}>
              <PageExercisePane pageNumber={activePage.pageNumber} />
            </div>
          ) : null}
        </section>
      </main>

      <nav className="student-book-toolbar fixed inset-x-0 bottom-0 top-auto" style={{ borderColor: theme.border }}>
        <div className="student-book-toolbar__controls">
          <button type="button" onClick={goPrev} className="student-book-nav-button" style={{ borderColor: theme.border, color: theme.titleInk }}>
            <ChevronLeft className="h-5 w-5" />
            <span>{pageIndex === 0 ? (n > 1 ? "Leccion anterior" : "Indice") : "Pagina anterior"}</span>
          </button>
          <div className="student-book-toolbar__status" style={{ borderColor: theme.border }}>
            Pagina {Math.min(pageIndex + 1, Math.max(totalPages, 1))} de {Math.max(totalPages, 1)}
          </div>
          <button type="button" onClick={goNext} className="student-book-nav-button" style={{ backgroundColor: theme.accent, borderColor: theme.accent, color: "white" }}>
            <span>{pageIndex === totalPages - 1 ? "Siguiente leccion" : "Pagina siguiente"}</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </nav>
    </div>
  );
}
