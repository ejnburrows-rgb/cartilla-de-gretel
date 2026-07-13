/**
 * FlipchartHdPanel.tsx
 *
 * Displays the HD-colour teacher flipchart artwork for a given lesson —
 * this is the real, physical teacher flipchart (student workbook pages are
 * a separate surface, see FaithfulPageRenderer). Images are served from:
 *   public/cartilla/art/hd/flipchart/page-NNN.jpg
 *
 * ART RULE — POLISH, NOT CHANGE: The existing HD art files are shown
 * as-is aside from a verified display orientation fix (see below).
 *
 * ORIENTATION: Source JPGs in public/cartilla/art/hd/flipchart/ are stored
 * pixel-upside-down (spiral binding along the bottom edge of the file;
 * illustrations and Spanish labels read inverted). Confirmed on multiple
 * pages (e.g. page-003, page-009). CSS rotate(180deg) restores upright
 * presentation without inventing or recolouring art. (A prior note that
 * this reversed letter order was a misdiagnosis of a mirror transform.)
 *
 * Real vertical (top-hinged) 3-D page flip — pages turn up and over the top
 * like a physical easel flip chart.
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

/** Source scans are stored inverted; correct for on-screen presentation only. */
const FLIPCHART_ORIENTATION_CLASS =
  "[&_img]:rotate-180 [&_img]:origin-center";

function FlipchartFace({ page }: { page?: FlipchartPage }) {
  if (!page) return <div className="w-full h-full bg-surface" />;
  return (
    <BookPageImage
      src={getFlipchartPageSrc(page)}
      alt={`Lámina ${page.flipchartPage} del flipchart`}
      wrapperClassName={`border-0 shadow-none bg-transparent ${FLIPCHART_ORIENTATION_CLASS}`}
      loading="eager"
      decoding="async"
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

  const safeIdx = pages.length === 0 ? 0 : Math.min(selectedIdx, pages.length - 1);
  const currentPage = pages[safeIdx];

  const goTo = useCallback(
    (index: number, direction: "next" | "prev") => {
      if (isFlipping || pages.length === 0) return;
      if (index < 0 || index >= pages.length) return;
      setFlipDirection(direction);
      setIsFlipping(true);
      setFlipTransform(direction === "next" ? "rotateX(0deg)" : "rotateX(-180deg)");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlipTransform(direction === "next" ? "rotateX(-180deg)" : "rotateX(0deg)");
        });
      });

      setTimeout(() => afterFlip(index), FLIP_MS);
    },
    [afterFlip, isFlipping, pages.length],
  );

  const handlePrev = useCallback(() => {
    if (safeIdx > 0) goTo(safeIdx - 1, "prev");
  }, [goTo, safeIdx]);

  const handleNext = useCallback(() => {
    if (safeIdx < pages.length - 1) goTo(safeIdx + 1, "next");
  }, [goTo, pages.length, safeIdx]);

  // Keyboard navigation for classroom presentation (arrows + page keys).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNext, handlePrev]);

  // Prefetch neighbors for smooth flips.
  useEffect(() => {
    if (pages.length === 0) return;
    const neighbors = [pages[safeIdx - 1], pages[safeIdx + 1]].filter(Boolean) as FlipchartPage[];
    for (const p of neighbors) {
      const img = new Image();
      img.src = getFlipchartPageSrc(p);
    }
  }, [pages, safeIdx]);

  if (pages.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto rounded-2xl border border-stone-200 bg-white/95 px-6 py-12 text-center shadow-lg">
        <p className="text-sm font-black uppercase tracking-widest text-stone-400">
          Flipchart
        </p>
        <p className="mt-2 text-lg font-bold text-stone-700">
          No hay láminas del flipchart para la lección {lessonNumber}.
        </p>
      </div>
    );
  }

  const staticIdx = isFlipping
    ? flipDirection === "prev"
      ? safeIdx - 1
      : safeIdx + 1
    : safeIdx;
  const flipFrontIdx = isFlipping ? (flipDirection === "next" ? safeIdx : safeIdx - 1) : -1;
  const flipBackIdx = isFlipping ? (flipDirection === "next" ? safeIdx + 1 : safeIdx) : -1;

  return (
    <div className="w-full h-full max-w-5xl mx-auto flex flex-col min-h-0">
      {/* Easel frame — portrait-friendly for real flipchart scans */}
      <div className="relative w-full flex-1 min-h-0 flex flex-col py-2">
        {/* Wooden easel board background */}
        <div className="absolute inset-0 rounded-[2rem] bg-stone-950 border-[10px] border-[#8b5e3c] shadow-2xl -z-10" />

        {/* Top binder clamp */}
        <div className="absolute top-1 inset-x-4 h-10 bg-stone-900 rounded-t-2xl border-b border-black/35 flex items-center justify-center -z-5">
          <div className="w-28 h-3 bg-stone-700 rounded shadow-inner" />
        </div>

        {/* Metallic spiral rings */}
        <div className="pointer-events-none absolute top-2 left-10 right-10 z-50 flex items-center justify-between px-3 drop-shadow-md">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="relative block h-6 w-3.5 rounded-full bg-[conic-gradient(from_220deg,#d4d4d8,#71717a,#d4d4d8,#a1a1aa)] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.65),inset_0_-1.5px_2px_rgba(0,0,0,0.4),0_1.5px_3px_rgba(0,0,0,0.28)]"
            >
              <span className="absolute inset-x-0.5 top-0.5 h-1 rounded-full bg-white/65 blur-[1px]" />
              <span className="absolute inset-x-0.5 bottom-0.5 h-px rounded-full bg-black/35" />
            </span>
          ))}
        </div>

        {/* Page container — real vertical (top-hinged) 3-D flip */}
        <div className="w-full flex-1 min-h-0 relative mx-3 mt-10 mb-3 flex flex-col justify-center overflow-hidden bg-white rounded-2xl shadow-xl border border-stone-200">
          <div className="relative w-full h-full min-h-[42vh] sm:min-h-[50vh]">
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
        <div className="relative z-10 mt-2 mb-1 flex items-center justify-between gap-2 px-2 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={safeIdx === 0 || isFlipping}
            className="inline-flex items-center gap-2 rounded-2xl border border-amber-900/15 bg-white px-4 py-2.5 text-sm font-extrabold text-[#3A281E] shadow-sm transition hover:bg-stone-50 disabled:opacity-30 sm:px-6 sm:py-3"
            aria-label="Lámina anterior"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <span className="bg-white/90 border border-stone-200 px-3 py-2 rounded-full text-[11px] sm:text-xs font-black text-stone-700 shadow-sm text-center">
            Lámina {safeIdx + 1} / {pages.length}
            <span className="hidden sm:inline text-stone-400 font-bold">
              {" "}
              · pág. {currentPage?.flipchartPage ?? "—"}
            </span>
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={safeIdx >= pages.length - 1 || isFlipping}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-800 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-amber-900 disabled:opacity-30 sm:px-6 sm:py-3"
            aria-label="Lámina siguiente"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
