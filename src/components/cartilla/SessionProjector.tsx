import React, { Suspense, useMemo } from "react";
import type { CatalogEntry } from "@/lib/lesson-catalog";

const LazyPdfPage = React.lazy(() =>
  import("@/components/cartilla/PdfPage").then((module) => ({ default: module.PdfPage })),
);
import { FlipBoard } from "@/components/cartilla/FlipBoard";

interface SessionProjectorProps {
  entry: CatalogEntry;
  activeStepIdx: number;
}

const projectorBoxStyle: React.CSSProperties = {
  backgroundColor: "#0d0a06",
  borderRadius: "1.5rem",
  border: "2px solid #3A281E",
  padding: "1.5rem",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: "450px",
};

const titleOverlayStyle: React.CSSProperties = {
  color: "#fff8de",
};

export function getPageForStep(entry: CatalogEntry, stepIdx: number): number {
  const parts = entry.pages.split("-").map(Number);
  const from = parts[0] || 1;
  const to = parts[1] || from;
  const range = to - from + 1;

  if (entry.kind === "intro") {
    // Intro has 2 steps: 0 -> page 1, 1 -> page 2 (reading)
    return Math.min(to, from + stepIdx);
  }

  if (entry.kind === "vowel") {
    // Vowel has 4 steps: 0 -> from, 1 -> from + 1, 2 -> to, 3 -> to
    if (stepIdx === 0) return from;
    if (stepIdx === 1) return Math.min(to, from + 1);
    return to;
  }

  // Consonant has 5 steps: 0 -> from, 1 -> from + 1, 2 -> from + 2, 3 -> to, 4 -> to
  if (stepIdx === 0) return from;
  if (stepIdx === 1) return Math.min(to, from + 1);
  if (stepIdx === 2) return Math.min(to, from + 2);
  return to;
}

export function SessionProjector({ entry, activeStepIdx }: SessionProjectorProps) {
  const pageNumber = useMemo(() => {
    return getPageForStep(entry, activeStepIdx);
  }, [entry, activeStepIdx]);

  return (
    <div style={projectorBoxStyle} className="select-none">
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200/50">
          Proyección del Aula
        </span>
        <div style={titleOverlayStyle} className="text-xs font-bold font-mono">
          Libro de Texto · Página {pageNumber}
        </div>
      </div>

      <div className="w-full flex items-center justify-center bg-stone-900/40 rounded-xl p-4 overflow-hidden border border-white/5">
        <FlipBoard pageNumber={pageNumber} />
      </div>
    </div>
  );
}
