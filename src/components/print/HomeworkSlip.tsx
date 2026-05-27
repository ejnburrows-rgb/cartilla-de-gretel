import React from "react";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { Scissors } from "lucide-react";

// Hoisted Styles for double-brace JSX styling ban compliance
const slipContainerStyle: React.CSSProperties = {
  boxSizing: "border-box",
  border: "2px dashed #a8a29e", // Scissor/cut dashed line
  borderRadius: "0.75rem",
  padding: "0.5rem 0.85rem",
  backgroundColor: "#fafaf9",
  marginTop: "0.4rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.3rem",
  width: "100%",
};

const slipHeaderStyle = (color: string): React.CSSProperties => ({
  fontSize: "0.68rem",
  fontWeight: "bold",
  textTransform: "uppercase",
  color: color,
  margin: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid #e7e5e4",
  paddingBottom: "0.15rem",
});

const detailsStyle: React.CSSProperties = {
  fontSize: "0.62rem",
  color: "#44403c",
  lineHeight: "1.35",
  margin: 0,
};

const signBlockStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  marginTop: "0.35rem",
  fontSize: "0.55rem",
  fontWeight: "bold",
  color: "#78716c",
};

interface HomeworkSlipProps {
  entry: CatalogEntry;
  pageNumber: number;
}

export function HomeworkSlip({ entry, pageNumber }: HomeworkSlipProps) {
  const accentColor = entry.color || "#8B5A2B";
  const headerStyle = slipHeaderStyle(accentColor);

  return (
    <div style={slipContainerStyle} className="homework-slip-box">
      <div style={headerStyle}>
        <span>Tarea para el Hogar / Homework Assignment</span>
        <span className="flex items-center gap-0.5 text-[9px] text-stone-500 font-normal">
          <Scissors className="w-2.5 h-2.5" /> Recortar / Cut here
        </span>
      </div>

      <div style={detailsStyle}>
        <div>
          <strong className="text-stone-850">Lección / Lesson: </strong> {entry.title} (págs. {entry.pages})
        </div>
        <div className="mt-1">
          <span className="font-bold text-stone-850">Español: </span> Repase la página de caligrafía y practique lectura en voz alta con su hijo durante 10 minutos. Firme abajo cuando termine.
        </div>
        <div className="mt-0.5 italic text-stone-600">
          <span className="font-bold not-italic text-stone-700">English: </span> Please review the handwriting page and practice aloud reading with your child for 10 minutes. Sign below upon completion.
        </div>
      </div>

      <div style={signBlockStyle}>
        <span>Fecha / Date: _________________</span>
        <span>Firma del Tutor / Parent Signature: _______________________</span>
      </div>
    </div>
  );
}
