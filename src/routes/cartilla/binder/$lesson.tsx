import { useMemo } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { LessonBinderSheet } from "@/components/print/LessonBinderSheet";
import { exportBinderToPdf } from "@/lib/binder-export";
import { ArrowLeft, Printer } from "lucide-react";
import "@/styles/cartilla-student.css";
import "@/styles/print.css";

export const Route = createFileRoute("/cartilla/binder/$lesson")({
  component: SingleLessonBinderRoute,
  head: ({ params }) => ({
    meta: [
      {
        title: `Lección ${params.lesson} (Material Impreso) — La Cartilla de Gretel`,
      },
    ],
  }),
  beforeLoad: ({ params }) => {
    const lessonNum = Number(params.lesson);
    if (!Number.isFinite(lessonNum) || !CATALOG.find((e) => e.n === lessonNum)) {
      throw redirect({ to: "/cartilla/binder" });
    }
  },
});

// Hoisted Styles for double-brace JSX styling ban compliance
const previewBarBg: React.CSSProperties = {
  backgroundColor: "#fdfcfa",
  minHeight: "100vh",
  padding: "1.5rem",
  maxWidth: "960px",
  margin: "0 auto",
  width: "100%",
  display: "flex",
  flexDirection: "column",
};

const topBarStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#ffffff",
  padding: "1rem",
  borderRadius: "1.25rem",
  border: "2px solid #ecdac3",
  marginBottom: "1.5rem",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)",
};

const printBtnStyles: React.CSSProperties = {
  backgroundColor: "#78350f",
  color: "#ffffff",
  padding: "0.75rem 1.5rem",
  borderRadius: "1rem",
  fontWeight: "bold",
  fontSize: "0.85rem",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  boxShadow: "0 4px 12px rgba(120, 53, 15, 0.2)",
};

const backLinkStyles: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.85rem",
  fontWeight: "bold",
  color: "#57534e",
};

const printSheetWrapperStyles: React.CSSProperties = {
  backgroundColor: "#ffffff",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
  borderRadius: "1.5rem",
  padding: "2rem",
  border: "1px solid #e7e5e4",
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
};

function getPagesArray(pagesStr: string): number[] {
  const parts = pagesStr.split("-").map(Number);
  const from = parts[0] || 1;
  const to = parts[1] || from;
  const pages: number[] = [];
  for (let i = from; i <= to; i++) {
    pages.push(i);
  }
  return pages;
}

export function SingleLessonBinderRoute() {
  const { lesson: lessonParam } = Route.useParams();
  const lessonNum = Number(lessonParam);

  const entry = useMemo<CatalogEntry | undefined>(
    () => CATALOG.find((e) => e.n === lessonNum),
    [lessonNum]
  );

  const handlePrint = () => {
    exportBinderToPdf();
  };

  if (!entry) return null;

  const pages = getPagesArray(entry.pages);

  return (
    <div style={previewBarBg}>
      {/* ── Screen UI (Hidden on Print) ── */}
      <div className="no-print" style={topBarStyles}>
        <Link to="/cartilla/binder" style={backLinkStyles} className="hover:text-stone-850">
          <ArrowLeft className="w-4 h-4" /> Carpeta del Maestro
        </Link>
        <button onClick={handlePrint} style={printBtnStyles}>
          <Printer className="w-4 h-4 fill-white" />
          Imprimir esta Lección
        </button>
      </div>

      {/* ── Print Content & Sheet Previews ── */}
      <div style={printSheetWrapperStyles} className="print-sheets-only">
        {pages.map((pageNumber) => (
          <LessonBinderSheet
            key={`${entry.n}-${pageNumber}`}
            entry={entry}
            pageNumber={pageNumber}
          />
        ))}
      </div>
    </div>
  );
}
