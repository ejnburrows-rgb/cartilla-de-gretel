import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { learnerStorageKey, useLearnerScope } from "@/lib/learner-storage";
import { KEYS } from "@/lib/storage-keys";
import { ArrowLeft } from "lucide-react";
import { NativeLessonViewer } from "@/components/StudentBook/NativeLessonViewer";
import "@/styles/lesson-fit.css";
import type { WorkbookPageEntry } from "@/components/StudentBook/SimplePageViewer";
import { FaithfulPageRenderer } from "@/components/cartilla/FaithfulPageRenderer";
import { buildGretelPageLine } from "@/lib/gretel-page-guide";
import { getPageLayout } from "@/lib/book-faithful";
import { lessonForWorkbookPage } from "@/lib/workbook-pages";

export const Route = createFileRoute("/cartilla/cuaderno")({
  component: ReconstructedWorkbook,
  head: () => ({
    meta: [
      { title: "Cuaderno completo — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Cuaderno digital interactivo con páginas fieles.",
      },
    ],
  }),
});

const AVAILABLE_PRINTED_PAGES = [
  ...Array.from({ length: 85 }, (_, index) => index + 1),
  88,
  89,
  90,
];

function ReconstructedWorkbook() {
  const scope = useLearnerScope();
  const bookmarkKey = learnerStorageKey(KEYS.workbookReaderPage);
  const initialPage = useMemo(() => {
    try {
      const printedPage = Number(localStorage.getItem(bookmarkKey));
      const index = AVAILABLE_PRINTED_PAGES.indexOf(printedPage);
      return index < 0 ? 0 : index;
    } catch {
      return 0;
    }
  }, [bookmarkKey]);
  const handlePageChange = useCallback(
    (index: number) => {
      const printedPage = AVAILABLE_PRINTED_PAGES[index];
      if (printedPage === undefined) return;
      try {
        localStorage.setItem(bookmarkKey, String(printedPage));
      } catch {
        window.dispatchEvent(new Event("cartilla:work-save-failed"));
      }
    },
    [bookmarkKey],
  );
  const pages = useMemo<WorkbookPageEntry[]>(
    () =>
      AVAILABLE_PRINTED_PAGES.map((pageNumber) => ({
        id: `workbook-page-${pageNumber}`,
        pageNumber,
        gretelLine: buildGretelPageLine(getPageLayout(pageNumber), pageNumber),
        // Same native digital page the lessons use — never the raw scan.
        content: (
          <FaithfulPageRenderer
            pageNumber={pageNumber}
            lessonNumber={lessonForWorkbookPage(pageNumber)}
            interactive
            native
          />
        ),
      })),
    [],
  );

  return (
    <div
      className="lc-lesson-shell lc-lesson-shell--fit min-h-screen flex flex-col"
      data-testid="complete-workbook"
    >
      <header className="lc-lesson-header">
        <Link to="/cartilla/lecciones" className="lc-lesson-header__back">
          <ArrowLeft className="w-5 h-5" /> Lecciones
        </Link>
      </header>
      <main className="lc-lesson-main flex-1 px-3 pb-6 max-w-7xl w-full mx-auto flex flex-col items-center">
        <h1 className="lc-lesson-main__intro">Cuaderno completo</h1>
        <div className="w-full">
          <NativeLessonViewer
            key={scope}
            pages={pages}
            chapterLabel="Cuaderno completo"
            initialPage={initialPage}
            onPageChange={handlePageChange}
            gated={false}
            swipe
          />
        </div>
      </main>
    </div>
  );
}
