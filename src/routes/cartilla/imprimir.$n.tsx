import { useEffect, type CSSProperties } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";
import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { PdfPage } from "@/components/cartilla/PdfPage";

export const Route = createFileRoute("/cartilla/imprimir/$n")({
  component: PrintRoute,
});

const ROOT_STYLE: CSSProperties = {
  minHeight: "100vh",
  background: "#f4efe6",
  padding: "16px 0 32px",
};

const HEADER_STYLE: CSSProperties = {
  width: "210mm",
  maxWidth: "100%",
  margin: "0 auto 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 12mm",
  boxSizing: "border-box",
};

const TITLE_STYLE: CSSProperties = {
  color: "#5a3a14",
  fontWeight: 700,
  margin: 0,
  fontSize: "1rem",
};

const BUTTON_STYLE: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #c98c4f",
  background: "#c98c4f",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const LINK_STYLE: CSSProperties = {
  color: "#5a3a14",
  textDecoration: "underline",
  fontWeight: 600,
};

const PAGE_STYLE: CSSProperties = {
  width: "210mm",
  minHeight: "297mm",
  margin: "0 auto 12mm",
  background: "white",
  pageBreakAfter: "always",
  breakAfter: "page",
  padding: "12mm",
  boxSizing: "border-box",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const EMPTY_STYLE: CSSProperties = {
  textAlign: "center",
  color: "#5a3a14",
  marginTop: 24,
};

const PRINT_CSS = `
@media print {
  body { background: white !important; }
  .cartilla-no-print { display: none !important; }
  .cartilla-print-page {
    box-shadow: none !important;
    margin: 0 auto !important;
    padding: 0 !important;
  }
}
@page { size: A4; margin: 10mm; }
`;

function PrintRoute() {
  const params = Route.useParams();
  const n = Number(params.n);
  const entry = CATALOG.find((e) => e.n === n);
  const pages = entry ? getWorkbookPagesForLesson(n) : [];

  useEffect(() => {
    document.title = entry
      ? `Imprimir — Lección ${n}: ${entry.title}`
      : `Imprimir — Lección ${n}`;
  }, [n, entry]);

  if (!entry) {
    return (
      <div style={ROOT_STYLE}>
        <div style={HEADER_STYLE}>
          <Link to="/cartilla/lecciones" style={LINK_STYLE}>
            ← Volver a lecciones
          </Link>
        </div>
        <p style={EMPTY_STYLE}>Lección no encontrada.</p>
      </div>
    );
  }

  return (
    <div style={ROOT_STYLE}>
      <style>{PRINT_CSS}</style>
      <div className="cartilla-no-print" style={HEADER_STYLE}>
        <Link
          to="/cartilla/leccion/$n"
          params= n: String(n) 
          style={LINK_STYLE}
        >
          ← Volver a la lección
        </Link>
        <h1 style={TITLE_STYLE}>
          Lección {n}: {entry.title}
        </h1>
        <button type="button" style={BUTTON_STYLE} onClick={() => window.print()}>
          Imprimir
        </button>
      </div>
      {pages.map((pageNumber) => (
        <section
          key={pageNumber}
          className="cartilla-print-page"
          style={PAGE_STYLE}
        >
          <PdfPage pageNumber={pageNumber} hideBadge />
        </section>
      ))}
      {pages.length === 0 ? (
        <p style={EMPTY_STYLE}>No hay páginas asignadas a esta lección.</p>
      ) : null}
    </div>
  );
}
