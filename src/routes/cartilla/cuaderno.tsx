import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { DigitalPageViewer } from "@/components/StudentBook/DigitalPageViewer";
import type { WorkbookPageEntry } from "@/components/StudentBook/SimplePageViewer";
import { ExactWorkbookPage } from "@/components/cartilla/ExactWorkbookPage";
import { buildGretelPageLine } from "@/lib/gretel-page-guide";
import { getPageLayout } from "@/lib/book-faithful";

export const Route = createFileRoute("/cartilla/cuaderno")({
  component: ExactWorkbook,
  head: () => ({
    meta: [
      { title: "Cuaderno completo — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Cuaderno digital fiel al libro físico.",
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

function ExactWorkbook() {
  const pages = useMemo<WorkbookPageEntry[]>(
    () =>
      AVAILABLE_PRINTED_PAGES.map((pageNumber) => ({
        id: `workbook-page-${pageNumber}`,
        pageNumber,
        gretelLine: buildGretelPageLine(getPageLayout(pageNumber), pageNumber),
        content: <ExactWorkbookPage pageNumber={pageNumber} />,
      })),
    [],
  );

  return (
    <main className="workbook-exact-shell">
      <DigitalPageViewer pages={pages} exactReplica />
    </main>
  );
}
