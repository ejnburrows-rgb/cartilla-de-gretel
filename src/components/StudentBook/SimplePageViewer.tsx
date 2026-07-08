import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gretelEvent } from "@/components/gretel/gretelEvents";

/** Canonical home for this type — StudentWorkbookFlip.tsx (the 3-D flip-book
 * shell this component replaces) has been deleted. */
export interface WorkbookPageEntry {
  id: string;
  cover?: boolean;
  src?: string;
  content: ReactNode;
}

export interface SimplePageViewerProps {
  pages: WorkbookPageEntry[];
  initialPage?: number;
  /** CSS aspect-ratio value for a single page, e.g. "0.707". Must stay
   * aspect-ratio-driven, never a fixed height — a fixed-height wrapper here
   * fights .faithful-page's own aspect-ratio sizing and produces a stray
   * native scrollbar (see CLAUDE.md's documented scrollbar-bug root cause). */
  singleAspectRatio?: string;
  onPageChange?: (index: number) => void;
}

/**
 * Replaces StudentWorkbookFlip's 3-D page-flip animation with a plain,
 * instant page swap — same real page content (FaithfulPageRenderer via
 * buildPageArray), same aspect-ratio sizing, no rotateY/perspective. The
 * flip animation was a presentation gimmick on top of the real content;
 * this keeps the content and drops the gimmick, matching the same pattern
 * already applied to the teacher's FlipchartHdPanel.
 */
export function SimplePageViewer({
  pages,
  initialPage = 0,
  singleAspectRatio,
  onPageChange,
}: SimplePageViewerProps) {
  useEffect(() => {
    gretelEvent("mount");
  }, []);

  const [currentIndex, setCurrentIndex] = useState(Math.max(0, initialPage));

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < pages.length - 1;

  const goTo = (index: number) => {
    setCurrentIndex(index);
    onPageChange?.(index);
    gretelEvent("page-flip");
  };

  const current = pages[currentIndex];

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col items-center">
      <div
        className="workbook-container"
        style={{ aspectRatio: singleAspectRatio ?? "3 / 4" }}
      >
        <div className="spiral-binding">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="spiral-ring" />
          ))}
        </div>
        <div className="w-full h-full relative overflow-hidden rounded-b-xl">
          {current ? (
            <div
              key={current.id}
              data-density={current.cover ? "hard" : "soft"}
              className="relative flex h-full w-full flex-col overflow-hidden bg-surface"
            >
              <div className="flex-1 w-full h-full p-0">{current.content}</div>
            </div>
          ) : (
            <div className="w-full h-full bg-surface" />
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-6 z-20 no-print">
        <button
          onClick={() => hasPrev && goTo(currentIndex - 1)}
          disabled={!hasPrev}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all border ${
            hasPrev
              ? "bg-white text-stone-700 hover:bg-stone-50 border-stone-300 shadow-sm"
              : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50"
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        <div className="text-sm font-bold text-stone-700 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm">
          Página {currentIndex + 1} de {pages.length}
        </div>
        <button
          onClick={() => hasNext && goTo(currentIndex + 1)}
          disabled={!hasNext}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all border ${
            hasNext
              ? "bg-white text-stone-700 hover:bg-stone-50 border-stone-300 shadow-sm"
              : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50"
          }`}
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
