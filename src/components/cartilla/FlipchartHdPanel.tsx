/**
 * FlipchartHdPanel.tsx
 *
 * Displays the HD-colour teacher flipchart artwork for a given lesson —
 * this is the real, physical teacher flipchart (student workbook pages are
 * a separate surface, see FaithfulPageRenderer). Images are served from:
 *   public/cartilla/art/hd/flipchart/page-NNN.jpg
 *
 * ART RULE — POLISH, NOT CHANGE: The existing HD art files are shown
 * exactly as-is. No recolouring, filtering, or cropping.
 *
 * Real vertical (top-hinged) 3-D page flip — pages turn up and over the top
 * like a physical easel flip chart, mirroring the student book's horizontal
 * (left-hinged) turn in SimplePageViewer.tsx but rotated to the X axis.
 * A fancier flip animation lived in TeacherFlipChart.tsx, which showed
 * reconstructed student-workbook pages and has been removed; this is the
 * sole teacher-lane page viewer now.
 */
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getFlipchartPagesForLesson,
  getFlipchartPageSrc,
  type FlipchartPage,
} from "@/lib/flipchart-hd";
import { BookPageImage } from "./BookPageImage";

interface FlipchartHdPanelProps {
  lessonNumber: number;
}

const FLIP_MS = 1100; // must match .flipchart-flip-wrapper's CSS transition duration

function FlipchartFace({ page }: { page?: FlipchartPage }) {
  if (!page) return <div className="w-full h-full bg-surface" />;
  return (
    <BookPageImage
      src={getFlipchartPageSrc(page)}
      alt={`Lámina ${page.flipchartPage} del flipchart`}
      wrapperClassName="border-0 shadow-none bg-transparent"
    />
  );
}

export function FlipchartHdPanel({ lessonNumber }: FlipchartHdPanelProps) {
  const pages: FlipchartPage[] = getFlipchartPagesForLesson(lessonNumber);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [flipTransform, setFlipTransform] = useState("rotateX(0deg)");

  // Reset to first page when lesson changes.
  useEffect(() => {
    setSelectedIdx(0);
    setIsFlipping(false);
    setFlipDirection(null);
    setFlipTransform("rotateX(0deg)");
  }, [lessonNumber]);

  const afterFlip = useCallback((newIndex: number) => {
    setSelectedIdx(newIndex);
    setIsFlipping(false);
    setFlipDirection(null);
  }, []);

  if (pages.length === 0) return null;

  const safeIdx = Math.min(selectedIdx, pages.length - 1);
  const currentPage = pages[safeIdx]!;

  const goTo = (index: number, direction: "next" | "prev") => {
    if (isFlipping) return;
    setFlipDirection(direction);
    setIsFlipping(true);
    setFlipTransform(direction === "next" ? "rotateX(0deg)" : "rotateX(-180deg)");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform(direction === "next" ? "rotateX(-180deg)" : "rotateX(0deg)");
      });
    });

    setTimeout(() => afterFlip(index), FLIP_MS);
  };

  const handlePrev = () => safeIdx > 0 && goTo(safeIdx - 1, "prev");
  const handleNext = () => safeIdx < pages.length - 1 && goTo(safeIdx + 1, "next");

  const staticIdx = isFlipping
    ? flipDirection === "prev"
      ? safeIdx - 1
      : safeIdx + 1
    : safeIdx;
  const flipFrontIdx = isFlipping ? (flipDirection === "next" ? safeIdx : safeIdx - 1) : -1;
  const flipBackIdx = isFlipping ? (flipDirection === "next" ? safeIdx + 1 : safeIdx) : -1;

  return (
    <div className="my-6 w-full max-w-2xl mx-auto">
      {/* Easel frame — matches the existing teacher mode in OfficialWorkbookLessonView */}
      <div className="relative w-full py-8">
        {/* Wooden easel board background */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-stone-950 border-[12px] border-[#8b5e3c] shadow-2xl -z-10" />

        {/* Top binder clamp */}
        <div className="absolute top-2 inset-x-6 h-12 bg-stone-900 rounded-t-2xl border-b border-black/35 flex items-center justify-center -z-5">
          <div className="w-32 h-4 bg-stone-700 rounded shadow-inner" />
        </div>

        {/* Metallic spiral rings */}
        <div className="pointer-events-none absolute top-4 left-12 right-12 z-50 flex items-center justify-between px-4 drop-shadow-md">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="relative block h-7 w-4 rounded-full bg-[conic-gradient(from_220deg,#d4d4d8,#71717a,#d4d4d8,#a1a1aa)] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.65),inset_0_-1.5px_2px_rgba(0,0,0,0.4),0_1.5px_3px_rgba(0,0,0,0.28)]"
            >
              <span className="absolute inset-x-0.5 top-0.5 h-1 rounded-full bg-white/65 blur-[1px]" />
              <span className="absolute inset-x-0.5 bottom-0.5 h-px rounded-full bg-black/35" />
            </span>
          ))}
        </div>

        {/* Page container — real vertical (top-hinged) 3-D flip */}
        <div className="w-full relative px-6 pt-12 pb-6 min-h-[70vh] flex flex-col justify-center overflow-hidden bg-white rounded-2xl shadow-xl border border-stone-200">
          <div
            className="relative w-full"
            style={{ minHeight: "55vh" }}
          >
            {/* Static base — the destination page while a flip is in flight */}
            <div className="w-full h-full absolute inset-0">
              <FlipchartFace page={pages[staticIdx] ?? currentPage} />
            </div>

            {/* Flipping leaf — vertical (rotateX), hinged on the top edge */}
            {isFlipping && (
              <div
                className="absolute inset-0 z-30 pointer-events-none"
                style={{ transformStyle: "preserve-3d", perspective: "1800px" }}
              >
                <div className="flipchart-flip-wrapper" style={{ transform: flipTransform }}>
                  <div className="flipchart-page-front">
                    <FlipchartFace page={pages[flipFrontIdx]} />
                    <div
                      className="flipchart-shadow-overlay"
                      style={{ opacity: flipDirection === "next" ? 1 : 0 }}
                    />
                  </div>
                  <div className="flipchart-page-back">
                    <FlipchartFace page={pages[flipBackIdx]} />
                    <div
                      className="flipchart-shadow-overlay"
                      style={{ opacity: flipDirection === "prev" ? 1 : 0 }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls below the easel */}
        <div className="relative z-10 mt-6 flex items-center justify-between px-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={safeIdx === 0 || isFlipping}
            className="inline-flex items-center gap-2 rounded-2xl border border-amber-900/15 bg-white px-5 py-3 text-sm font-extrabold text-[#3A281E] shadow-sm transition hover:bg-stone-50 disabled:opacity-30 sm:px-6 sm:py-3.5"
            aria-label="Lámina anterior"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Anterior</span>
          </button>
          <span className="bg-white/80 border border-stone-200 px-4 py-2 rounded-full text-xs font-black text-stone-700 shadow-sm">
            Lámina {currentPage.flipchartPage} de {pages[pages.length - 1]?.flipchartPage ?? currentPage.flipchartPage}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={safeIdx >= pages.length - 1 || isFlipping}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-800 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-amber-900 disabled:opacity-30 sm:px-8 sm:py-3.5 sm:text-base"
            aria-label="Lámina siguiente"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
