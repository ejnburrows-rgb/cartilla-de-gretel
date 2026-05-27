import { useState, useMemo, useEffect } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { TeacherPresentationShell } from "@/components/cartilla/TeacherPresentationShell";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "@/styles/kiosko.css";

export const Route = createFileRoute("/cartilla/presentar/$n")({
  component: PresentarLesson,
  head: ({ params }) => ({
    meta: [
      { title: `Presentando Lección ${params.n} — La Cartilla de Gretel` },
      { name: "description", content: "Proyector interactivo de lección con control remoto y puntero láser." },
    ],
  }),
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
  },
});

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

export function PresentarLesson() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const n = Number(nParam);

  const entry = useMemo<CatalogEntry | undefined>(
    () => CATALOG.find((e) => e.n === n),
    [n]
  );

  const pages = useMemo<number[]>(() => {
    if (!entry) return [1];
    return getPagesArray(entry.pages);
  }, [entry]);

  const [activePageIndex, setActivePageIndex] = useState(0);
  const activePageNum = pages[activePageIndex] || pages[0];

  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      setActivePageIndex(activePageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (activePageIndex < pages.length - 1) {
      setActivePageIndex(activePageIndex + 1);
    }
  };

  const handleExit = () => {
    navigate({ to: "/cartilla/leccion/$n", params: { n: String(n) } });
  };

  // Keyboard navigation & remote-clicker mapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Remote clickers emulate page up/down, space, enter, or arrows
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePageIndex, pages.length]);

  if (!entry) return null;

  const accentColor = entry.color || "#c98c4f";

  // Hoisted styles for double-brace JSX styling ban compliance
  const slideContainerStyle = {
    background: `radial-gradient(circle at center, ${accentColor}18 0%, #0d0a08 100%)`,
  };

  const cardStyle = {
    borderColor: `${accentColor}30`,
  };

  return (
    <TeacherPresentationShell accentColor={accentColor} onExit={handleExit}>
      <div className="w-full h-full flex flex-col items-center justify-between p-8" style={slideContainerStyle}>
        
        {/* Top Info bar */}
        <div className="w-full flex justify-between items-center text-stone-400">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
              Lección {n}
            </span>
            <h2 className="text-lg font-black text-white">{entry.title}</h2>
          </div>
          <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Slide {activePageIndex + 1} de {pages.length}
          </span>
        </div>

        {/* Page Render */}
        <div className="flex-1 flex items-center justify-center p-4 w-full max-h-[70%]">
          <div className="bg-white rounded-2xl p-4 shadow-xl border-4 max-h-full aspect-[3/4] flex items-center justify-center" style={cardStyle}>
            <PdfPage pageNumber={activePageNum} className="max-h-[380px] w-full object-contain" />
          </div>
        </div>

        {/* Navigation control overlays */}
        <div className="w-full flex justify-between items-center no-print">
          <button
            onClick={handlePrevPage}
            disabled={activePageIndex === 0}
            className="kiosko-huge-arrow hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <span className="text-sm font-bold text-stone-400 font-mono">
            Pág. {activePageNum}
          </span>

          <button
            onClick={handleNextPage}
            disabled={activePageIndex === pages.length - 1}
            className="kiosko-huge-arrow hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Página siguiente"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

      </div>
    </TeacherPresentationShell>
  );
}
