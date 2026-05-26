import { useEffect, useMemo, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Sparkles } from "lucide-react";
import { KioskoShell } from "@/components/cartilla/KioskoShell";
import { PageExercisePane } from "@/components/cartilla/PageExercisePane";
import { PolishedPage } from "@/components/cartilla/PolishedPage";
import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";

const PRESENTAR_ROUTE = "/cartilla/presentar/$n" as any;
const KIOSKO_ROUTE = "/cartilla/kiosko" as any;

export const Route = createFileRoute(PRESENTAR_ROUTE)({
  component: PresentarLeccionRoute,
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((entry) => entry.n === n)) {
      throw redirect({ to: KIOSKO_ROUTE });
    }
  },
});

function PresentarLeccionRoute() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const n = Number(nParam);
  const entry = useMemo(() => CATALOG.find((item) => item.n === n), [n]);
  const pages = useMemo(() => getWorkbookPagesForLesson(n), [n]);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [n]);

  if (!entry) return null;

  const activePage = pages[pageIndex];
  const totalSlides = Math.max(pages.length, 1);
  const isFirstLesson = n <= 1;
  const isLastLesson = n >= TOTAL_LESSONS;
  const progressValue = ((n - 1 + pageIndex / totalSlides) / TOTAL_LESSONS) * 100;

  const goPrevious = () => {
    if (pageIndex > 0) {
      setPageIndex((current) => current - 1);
      return;
    }
    if (!isFirstLesson) {
      navigate({ to: PRESENTAR_ROUTE, params: { n: String(n - 1) } });
      return;
    }
    navigate({ to: KIOSKO_ROUTE });
  };

  const goNext = () => {
    if (pageIndex < pages.length - 1) {
      setPageIndex((current) => current + 1);
      return;
    }
    if (!isLastLesson) {
      navigate({ to: PRESENTAR_ROUTE, params: { n: String(n + 1) } });
      return;
    }
    navigate({ to: KIOSKO_ROUTE });
  };

  return (
    <KioskoShell
      lessonNumber={n}
      title={entry.title}
      subtitle={entry.subtitle}
      pages={entry.pages}
      progressLabel={`Leccion ${n} de ${TOTAL_LESSONS}`}
      progressValue={progressValue}
      backTo="/cartilla/kiosko"
      backLabel="Kiosko"
      previousLabel={pageIndex === 0 ? (isFirstLesson ? "Kiosko" : "Leccion anterior") : "Pagina anterior"}
      nextLabel={
        pageIndex === pages.length - 1
          ? isLastLesson
            ? "Terminar"
            : "Siguiente leccion"
          : "Pagina siguiente"
      }
      onPrevious={goPrevious}
      onNext={goNext}
    >
      <section className="kiosko-lesson-stage" aria-label={`Leccion ${n}`}>
        <aside className="kiosko-lesson-sidebar">
          <div className="kiosko-lesson-badge">
            <span>Leccion</span>
            <strong>{n}</strong>
          </div>
          <div className="kiosko-slide-count">
            <span>Pagina</span>
            <strong>
              {pageIndex + 1}/{totalSlides}
            </strong>
          </div>
          <div className="kiosko-teacher-cue">
            <Sparkles aria-hidden />
            <span>Lee en voz alta, senala la silaba y pide repeticion coral.</span>
          </div>
          <div className="kiosko-complete-cue">
            <CheckCircle2 aria-hidden />
            <span>Click remoto o flecha derecha para avanzar.</span>
          </div>
        </aside>

        <article className="kiosko-slide">
          {activePage ? (
            <>
              <div className="kiosko-page-frame">
                <PolishedPage
                  pageNumber={activePage.pageNumber}
                  lessonN={n}
                  hideBadge
                  className="kiosko-polished-page"
                />
              </div>
              <div className="kiosko-exercise-pane" data-kiosko-control="true">
                <PageExercisePane pageNumber={activePage.pageNumber} />
              </div>
            </>
          ) : (
            <div className="kiosko-empty-slide">
              <h2>{entry.title}</h2>
              <p>No hay paginas registradas para esta leccion.</p>
            </div>
          )}
        </article>
      </section>
    </KioskoShell>
  );
}
