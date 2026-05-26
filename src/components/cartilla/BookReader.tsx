import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { getCartillaCrmCssVars, getCartillaCrmTheme } from "@/lib/cartilla-crm-theme";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { BookPageFlip } from "./BookPageFlip";
import { PageExercisePane } from "./PageExercisePane";
import { PolishedPage } from "./PolishedPage";
import { StudentBookToolbar } from "./StudentBookToolbar";
import "@/styles/student-print.css";

type BookReaderProps = {
  initialLesson?: number;
  showExercises?: boolean;
};

function clampIndex(value: number, max: number) {
  return Math.min(Math.max(value, 0), Math.max(max, 0));
}

export function BookReader({ initialLesson = 1, showExercises = true }: BookReaderProps) {
  const lessons = CATALOG.slice(0, TOTAL_LESSONS);
  const initialIndex = clampIndex(lessons.findIndex((entry) => entry.n === initialLesson), lessons.length - 1);
  const [lessonIndex, setLessonIndex] = useState(initialIndex < 0 ? 0 : initialIndex);
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const entry = lessons[lessonIndex] ?? lessons[0];
  const theme = getCartillaCrmTheme(entry.n);
  const cssVars = getCartillaCrmCssVars(entry.n) as CSSProperties;
  const pages = useMemo(() => getWorkbookPagesForLesson(entry.n), [entry.n]);
  const activePage = pages[clampIndex(pageIndex, pages.length - 1)] ?? pages[0];

  const canPrev = lessonIndex > 0 || pageIndex > 0;
  const canNext = lessonIndex < lessons.length - 1 || pageIndex < pages.length - 1;

  const goToLesson = (lessonNumber: number) => {
    const next = lessons.findIndex((lesson) => lesson.n === lessonNumber);
    if (next < 0) return;
    setDirection(next >= lessonIndex ? 1 : -1);
    setLessonIndex(next);
    setPageIndex(0);
  };

  const goPrev = () => {
    if (!canPrev) return;
    setDirection(-1);
    if (pageIndex > 0) {
      setPageIndex((current) => current - 1);
      return;
    }
    const nextLessonIndex = Math.max(0, lessonIndex - 1);
    const nextPages = getWorkbookPagesForLesson(lessons[nextLessonIndex]?.n ?? 1);
    setLessonIndex(nextLessonIndex);
    setPageIndex(Math.max(0, nextPages.length - 1));
  };

  const goNext = () => {
    if (!canNext) return;
    setDirection(1);
    if (pageIndex < pages.length - 1) {
      setPageIndex((current) => current + 1);
      return;
    }
    setLessonIndex((current) => Math.min(lessons.length - 1, current + 1));
    setPageIndex(0);
  };

  return (
    <div className="student-book-shell" style={cssVars}>
      <StudentBookToolbar
        entry={entry}
        theme={theme}
        lessonIndex={lessonIndex}
        totalLessons={lessons.length}
        pageIndex={pageIndex}
        totalPages={pages.length}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={goPrev}
        onNext={goNext}
        onLessonChange={goToLesson}
        lessons={lessons}
      />

      <main className="student-book-stage" aria-live="polite">
        <section className="student-book-vertical">
          <div className="student-book-lesson-ribbon" style={{ borderColor: theme.border }}>
            <div>
              <h2 style={{ color: theme.titleInk }}>{entry.title}</h2>
              {entry.subtitle ? <p>{entry.subtitle}</p> : null}
            </div>
            <div className="rounded-full px-4 py-2 text-sm font-black text-white shadow-sm" style={{ backgroundColor: theme.accent }}>
              Paginas {entry.pages}
            </div>
          </div>

          {activePage ? (
            <BookPageFlip pageKey={`${entry.n}-${activePage.pageNumber}`} direction={direction}>
              <article className="student-book-page-card" style={{ borderColor: theme.border }}>
                <div className="student-book-page-inner">
                  <PolishedPage pageNumber={activePage.pageNumber} lessonN={entry.n} />
                </div>
              </article>
            </BookPageFlip>
          ) : (
            <div className="student-book-page-card p-10 text-center font-black" style={{ color: theme.titleInk }}>
              No hay paginas para esta leccion.
            </div>
          )}

          {showExercises && activePage ? (
            <div className="student-book-exercise-card" style={{ borderColor: theme.border }}>
              <PageExercisePane pageNumber={activePage.pageNumber} />
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
