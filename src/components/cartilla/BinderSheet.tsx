import type { CatalogEntry } from "@/lib/lesson-catalog";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { AnswerKeyBlock } from "./AnswerKeyBlock";
import { ExerciseHandout } from "./ExerciseHandout";

// Hoisted Styles for double-brace JSX styling ban compliance
const binderSheetPageStyle: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  maxHeight: "297mm",
  padding: "4mm",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#ffffff",
  overflow: "hidden",
};

const elegantHeaderStyle = (color: string): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: `2.5px solid ${color}`,
  paddingBottom: "0.35rem",
  marginBottom: "0.5rem",
  width: "100%",
});

const headerTitleStyle = (color: string): React.CSSProperties => ({
  fontSize: "1.05rem",
  fontWeight: "800",
  margin: 0,
  color: color,
});

const headerSubtitleStyle: React.CSSProperties = {
  fontSize: "0.6rem",
  textTransform: "uppercase",
  fontWeight: "bold",
  letterSpacing: "0.05em",
  margin: 0,
  color: "#64748b",
};

const pageBadgeStyle = (color: string): React.CSSProperties => ({
  fontSize: "0.7rem",
  fontWeight: "bold",
  fontFamily: "monospace",
  padding: "0.15rem 0.45rem",
  borderRadius: "0.4rem",
  border: `1.5px solid ${color}`,
  color: color,
});

const lowerHalfStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.75rem",
  marginTop: "0.75rem",
  flexShrink: 0,
};

const elegantFooterStyle: React.CSSProperties = {
  borderTop: "1px solid #e2e8f0",
  paddingTop: "0.25rem",
  marginTop: "0.5rem",
  textAlign: "center",
  fontSize: "0.52rem",
  color: "#94a3b8",
  width: "100%",
};

interface BinderSheetProps {
  entry: CatalogEntry;
  pageNumber: number;
}

export function BinderSheet({ entry, pageNumber }: BinderSheetProps) {
  const accentColor = entry.color || "#8B5A2B";

  const headerStyle = elegantHeaderStyle(accentColor);
  const titleStyle = headerTitleStyle(accentColor);
  const badgeStyle = pageBadgeStyle(accentColor);

  return (
    <section className="binder-sheet-page" style={binderSheetPageStyle}>
      {/* ── Binder A4 Header ── */}
      <header style={headerStyle}>
        <div>
          <h2 style={titleStyle}>{entry.title}</h2>
          <p style={headerSubtitleStyle}>
            Carpeta del Docente · Lección {entry.n}
          </p>
        </div>
        <div style={badgeStyle}>Pág. {pageNumber}</div>
      </header>

      {/* ── Upper Half: Textbook Page PDF Render ── */}
      <div className="flex-1 min-h-[30vh] max-h-[45vh] flex items-center justify-center bg-slate-50 border border-slate-200/50 rounded-2xl overflow-hidden p-2">
        <PdfPage
          pageNumber={pageNumber}
          className="shadow-md rounded-xl max-h-[42vh] object-contain"
        />
      </div>

      {/* ── Lower Half: Answer Key + Exercise Handout ── */}
      <div style={lowerHalfStyle}>
        <div className="h-full">
          <AnswerKeyBlock entry={entry} pageNumber={pageNumber} />
        </div>
        <div className="h-full">
          <ExerciseHandout entry={entry} pageNumber={pageNumber} />
        </div>
      </div>

      {/* ── Elegant Footer ── */}
      <footer style={elegantFooterStyle}>
        La Cartilla de Gretel · Leonor Lopetegui · LANY BOOKS LLC · ISBN 0-971-8696-8-5
      </footer>
    </section>
  );
}
