import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { CurlPageViewer } from "@/components/StudentBook/CurlPageViewer";
import type { WorkbookPageEntry } from "@/components/StudentBook/SimplePageViewer";
import { ReconstructedWorkbookPage } from "@/components/cartilla/ReconstructedWorkbookPage";
import { GretelPresence } from "@/components/gretel/GretelPresence";
import { buildGretelPageLine } from "@/lib/gretel-page-guide";
import { getPageLayout } from "@/lib/book-faithful";

export const Route = createFileRoute("/cartilla/cuaderno")({
  component: ReconstructedWorkbook,
  head: () => ({
    meta: [
      { title: "Cuaderno completo — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Cuaderno reconstruido y verificado con vuelta física de páginas y guía de Gretel.",
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
        content: <ReconstructedWorkbookPage pageNumber={pageNumber} />,
      })),
    [],
  );

  return (
    <main className="min-h-screen bg-[#07101f] px-3 py-5 text-white sm:px-6">
      <div className="mx-auto mb-4 flex w-full max-w-7xl items-center justify-between gap-3">
        <Link
          to="/cartilla/lecciones"
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-black transition hover:bg-white/15"
        >
          <ArrowLeft className="h-4 w-4" /> Lecciones
        </Link>
        <div className="text-right">
          <h1 className="text-base font-black sm:text-xl">Cuaderno completo</h1>
          <p className="text-xs font-bold text-white/65">Master reconstruido y verificado</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl">
        <CurlPageViewer
          pages={pages}
          accent="#c98c4f"
          bookCompanion={<GretelPresence autoIntro={false} bookMode hideChrome />}
        />
      </div>
    </main>
  );
}
