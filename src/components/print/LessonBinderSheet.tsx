import React from "react";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { AnswerKeyBlock } from "./AnswerKeyBlock";
import { ExerciseHandout } from "./ExerciseHandout";
import { HomeworkSlip } from "./HomeworkSlip";

// Hoisted Styles for double-brace JSX styling ban compliance
const binderSheetPageStyle: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  height: "100%",
  minHeight: "10in",
  padding: "0.2in 0",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  backgroundColor: "#ffffff",
};

const elegantHeaderStyle = (color: string): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: `2.5px solid ${color}`,
  paddingBottom: "0.25rem",
  marginBottom: "0.4rem",
  width: "100%",
  flexShrink: 0,
});

const headerTitleStyle = (color: string): React.CSSProperties => ({
  fontSize: "0.95rem",
  fontWeight: "800",
  margin: 0,
  color: color,
});

const headerSubtitleStyle: React.CSSProperties = {
  fontSize: "0.58rem",
  textTransform: "uppercase",
  fontWeight: "bold",
  letterSpacing: "0.05em",
  margin: 0,
  color: "#78716c",
};

const badgeStyle = (color: string): React.CSSProperties => ({
  fontSize: "0.65rem",
  fontWeight: "bold",
  fontFamily: "monospace",
  padding: "0.1rem 0.4rem",
  borderRadius: "0.35rem",
  border: `1.5px solid ${color}`,
  color: color,
});

const lowerHalfStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.6rem",
  marginTop: "0.6rem",
  flexShrink: 0,
};

const elegantFooterStyle: React.CSSProperties = {
  borderTop: "1px solid #e7e5e4",
  paddingTop: "0.2rem",
  marginTop: "0.4rem",
  textAlign: "center",
  fontSize: "0.5rem",
  color: "#a8a29e",
  width: "100%",
  flexShrink: 0,
};

interface LessonBinderSheetProps {
  entry: CatalogEntry;
  pageNumber: number;
}

export function LessonBinderSheet({ entry, pageNumber }: LessonBinderSheetProps) {
  const accentColor = entry.color || "#8B5A2B";

  const header = elegantHeaderStyle(accentColor);
  const title = headerTitleStyle(accentColor);
  const badge = badgeStyle(accentColor);

  const pageStyleWithBorder: React.CSSProperties = {
    ...binderSheetPageStyle,
    borderLeft: `10px solid ${accentColor}`,
    paddingLeft: "0.25in",
    paddingRight: "0.15in",
  };

  return (
    <section className="binder-sheet-page" style={pageStyleWithBorder}>
      {/* ── Binder Header ── */}
      <header style={header}>
        <div>
          <h2 style={title}>{entry.title}</h2>
          <p style={headerSubtitleStyle}>
            Cuaderno Especial Docente · Lección {entry.n}
          </p>
        </div>
        <div style={badge}>Pág. {pageNumber}</div>
      </header>

      {/* ── Upper Section: Original Workbook PDF page ── */}
      <div className="flex-1 min-h-[30vh] max-h-[38vh] flex items-center justify-center bg-stone-50 border border-stone-200 rounded-xl overflow-hidden p-1.5">
        <PdfPage
          pageNumber={pageNumber}
          className="rounded-lg overflow-hidden max-h-[36vh] object-contain"
        />
      </div>

      {/* ── Middle Section: Answer Key + Exercise Handout ── */}
      <div style={lowerHalfStyle}>
        <div>
          <AnswerKeyBlock entry={entry} pageNumber={pageNumber} />
        </div>
        <div>
          <ExerciseHandout entry={entry} pageNumber={pageNumber} />
        </div>
      </div>

      {/* ── Homework slip half-page tear-off ── */}
      <HomeworkSlip entry={entry} pageNumber={pageNumber} />

      {/* ── Footer ── */}
      <footer style={elegantFooterStyle}>
        La Cartilla de Gretel · Leonor Lopetegui · ISBN 0-971-8696-8-5
      </footer>
    </section>
  );
}
export type LessonBinderSheet = typeof LessonBinderSheet;

