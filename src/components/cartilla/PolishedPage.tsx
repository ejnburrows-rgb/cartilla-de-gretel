import { useMemo } from "react";
import { CATALOG } from "@/lib/lesson-catalog";
import { PdfPage } from "@/components/cartilla/PdfPage";

interface PolishedPageProps {
  pageNumber: number;
  className?: string;
}

function getEntryForPage(pageNumber: number) {
  return CATALOG.find((entry) => {
    const parts = entry.pages.split("-").map(Number);
    const start = parts[0] || 1;
    const end = parts[1] || start;
    return pageNumber >= start && pageNumber <= end;
  });
}

function getPastelBg(color: string) {
  if (color.startsWith("hsl")) {
    return color.replace(/(\d+)%\s*\)$/, "96%)").replace(/(\d+)%\)$/, "96%)");
  }
  return `${color}10`;
}

export function PolishedPage({ pageNumber, className = "" }: PolishedPageProps) {
  const entry = useMemo(() => getEntryForPage(pageNumber), [pageNumber]);
  const activeColor = entry?.color || "#c98c4f";
  const pastelBg = useMemo(() => getPastelBg(activeColor), [activeColor]);

  const isEven = pageNumber % 2 === 0;

  // Real paper look: warm white base + subtle pastel tint + stacked-page shadow.
  const gutterShadow = isEven
    ? "inset -18px 0 24px -12px rgba(0, 0, 0, 0.08)"
    : "inset 18px 0 24px -12px rgba(0, 0, 0, 0.08)";
  const edgeShadow = isEven
    ? "-1px 1px 1px rgba(0,0,0,0.05), -2px 2px 2px rgba(0,0,0,0.04), -3px 3px 2px rgba(0,0,0,0.03), -4px 4px 3px rgba(0,0,0,0.02)"
    : "1px 1px 1px rgba(0,0,0,0.05), 2px 2px 2px rgba(0,0,0,0.04), 3px 3px 2px rgba(0,0,0,0.03), 4px 4px 3px rgba(0,0,0,0.02)";

  // Named style objects (single-brace) to satisfy the double-brace JSX style ban.
  const containerStyle = {
    background: `linear-gradient(${isEven ? "135deg" : "-135deg"}, #fdfaf3 0%, ${pastelBg} 100%)`,
    borderColor: `${activeColor}30`,
    boxShadow: `${gutterShadow}, ${edgeShadow}`,
  };

  const titleStyle = {
    color: activeColor,
  };

  const tabStyle = {
    backgroundColor: activeColor,
    borderColor: `${activeColor}40`,
  };

  const isFirstOfLesson = useMemo(() => {
    if (!entry) return false;
    const start = parseInt((entry.pages || "").split("-")[0] || "1", 10);
    return start === pageNumber;
  }, [entry, pageNumber]);

  const tabLetter = useMemo(() => {
    if (!entry) return "";
    return entry.kind === "consonant"
      ? (entry.letter || "")
      : entry.kind === "vowel"
        ? (entry.vowel || "")
        : String(entry.n);
  }, [entry]);

  return (
    <div
      className={`polished-page w-full h-full px-8 py-6 transition-all duration-350 relative flex flex-col justify-between ${className}`}
      style={containerStyle}
    >
      {/* Interactive side tab strips */}
      {entry && (
        <div
          className={`absolute top-[25%] z-20 w-8 h-20 flex flex-col items-center justify-center shadow-md select-none border-stone-200/20 text-white font-black uppercase text-[10px] tracking-wider transition-transform hover:scale-105 duration-200 ${
            isEven
              ? "left-0 rounded-r-xl border-r border-y"
              : "right-0 rounded-l-xl border-l border-y"
          }`}
          style={tabStyle}
        >
          <span className={isEven ? "pl-0.5" : "pr-0.5"}>{tabLetter}</span>
          <span className={`text-[8px] opacity-75 ${isEven ? "pl-0.5" : "pr-0.5"}`}>
            L{entry.n}
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="w-full flex justify-between items-start border-b border-stone-200/50 pb-3 mb-2">
        {isFirstOfLesson && entry ? (
          <div>
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block">
              Lección {entry.n}
            </span>
            <h3 className="text-sm font-black truncate max-w-[200px]" style={titleStyle}>
              {entry.title}
            </h3>
          </div>
        ) : (
          <div />
        )}
        <span className="text-[10px] font-black uppercase text-stone-400">
          La Cartilla de Gretel
        </span>
      </div>

      {/* Main Page Art */}
      <div className="flex-1 flex items-center justify-center overflow-hidden py-4">
        <PdfPage pageNumber={pageNumber} className="w-full h-full object-contain" />
      </div>

      {/* Page Footer */}
      <div className="w-full flex justify-between items-center pt-3 text-[10px] font-bold text-stone-400">
        <span>Leonor Lopetegui</span>
        <span>Página {pageNumber}</span>
      </div>
    </div>
  );
}
