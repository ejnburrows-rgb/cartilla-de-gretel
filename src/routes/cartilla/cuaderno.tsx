import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { NativeLessonViewer } from "@/components/StudentBook/NativeLessonViewer";
import type { WorkbookPageEntry } from "@/components/StudentBook/SimplePageViewer";
import { FaithfulPageRenderer } from "@/components/cartilla/FaithfulPageRenderer";
import { GretelPresence } from "@/components/gretel/GretelPresence";
import { buildGretelPageLine } from "@/lib/gretel-page-guide";
import { getPageLayout } from "@/lib/book-faithful";
import { archetypeMappingForPage } from "@/data/workbook-archetypes";

export const Route = createFileRoute("/cartilla/cuaderno")({
  component: ReconstructedWorkbook,
  head: () => ({
    meta: [
      { title: "Cuaderno completo — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Cuaderno digital interactivo con páginas fieles y guía de Gretel.",
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
  const pages = useMemo<WorkbookPageEntry[]>(
    () =>
      AVAILABLE_PRINTED_PAGES.map((pageNumber) => ({
        id: `workbook-page-${pageNumber}`,
        pageNumber,
        gretelLine: buildGretelPageLine(getPageLayout(pageNumber), pageNumber),
        content: <FaithfulPageRenderer pageNumber={pageNumber} lessonNumber={archetypeMappingForPage(pageNumber).lessonNumber} interactive native />,
      })),
    [],
  );

  return (
    <main className="min-h-screen bg-[var(--lc-bg)] px-3 py-5 text-[var(--lc-ink)] sm:px-6">
      <div className="mx-auto mb-4 flex w-full max-w-5xl items-center justify-between gap-3">
        <Link
          to="/cartilla/lecciones"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-[var(--lc-teal)] bg-[var(--lc-paper)] px-4 py-2 text-sm font-bold text-[var(--lc-teal)]"
        >
          <ArrowLeft className="h-4 w-4" /> Lecciones
        </Link>
        <div className="text-right">
          <h1 className="text-base font-black sm:text-xl">Cuaderno completo</h1>
          <p className="text-xs font-bold text-[var(--lc-ink-soft)]">Cuaderno digital interactivo</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <NativeLessonViewer
          pages={pages}
          chapterLabel="Cuaderno completo"
        />
        <div className="student-workbook-gretel-guide">
          <GretelPresence autoIntro={false} bookMode hideChrome />
        </div>
      </div>
    </main>
  );
}
