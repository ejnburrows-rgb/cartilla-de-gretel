/**
 * FlipchartHdPanel.tsx
 *
 * Displays the HD-colour teacher flipchart artwork for a given lesson,
 * using the same vertical-flip framer-motion animation already present
 * in the app. Images are served from:
 *   public/cartilla/art/hd/flipchart/page-NNN.jpg
 *
 * ART RULE — POLISH, NOT CHANGE: The existing HD art files are shown
 * exactly as-is. No recolouring, filtering, cropping, or 3-D effects.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getFlipchartPagesForLesson,
  getFlipchartPageSrc,
  type FlipchartPage,
} from "@/lib/flipchart-hd";

// ── Framer-motion variants matching the rest of the app ──────────────
const VERTICAL_FLIP_VARIANTS = {
  enter: (direction: number) => ({
    rotateX: direction > 0 ? 0 : 90,
    opacity: direction > 0 ? 0.5 : 0,
    zIndex: direction > 0 ? 0 : 10,
  }),
  center: {
    rotateX: 0,
    opacity: 1,
    zIndex: 5,
  },
  exit: (direction: number) => ({
    rotateX: direction > 0 ? 90 : 0,
    opacity: direction > 0 ? 0 : 0.5,
    zIndex: direction > 0 ? 10 : 0,
  }),
};

interface FlipchartHdPanelProps {
  lessonNumber: number;
}

export function FlipchartHdPanel({ lessonNumber }: FlipchartHdPanelProps) {
  const pages: FlipchartPage[] = getFlipchartPagesForLesson(lessonNumber);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(0);

  // Reset to first page when lesson changes.
  useEffect(() => {
    setSelectedIdx(0);
    setPrevIdx(0);
  }, [lessonNumber]);

  if (pages.length === 0) return null;

  const safeIdx = Math.min(selectedIdx, pages.length - 1);
  const currentPage = pages[safeIdx]!;
  const direction = safeIdx > prevIdx ? 1 : -1;

  const handlePrev = () => {
    if (safeIdx === 0) return;
    setPrevIdx(safeIdx);
    setSelectedIdx(safeIdx - 1);
  };

  const handleNext = () => {
    if (safeIdx >= pages.length - 1) return;
    setPrevIdx(safeIdx);
    setSelectedIdx(safeIdx + 1);
  };

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

        {/* Flipping page container */}
        <div
          className="w-full relative px-6 pt-12 pb-6 min-h-[70vh] flex flex-col justify-center overflow-hidden bg-white rounded-2xl shadow-xl border border-stone-200"
          style={{ perspective: "1500px" }}
        >
          <AnimatePresence custom={direction} mode="popLayout" initial={false}>
            <motion.div
              key={currentPage.flipchartPage}
              custom={direction}
              variants={VERTICAL_FLIP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 20,
                mass: 0.8,
              }}
              style={{
                transformOrigin: "top center",
                backfaceVisibility: "hidden",
                width: "100%",
              }}
            >
              {/* HD Flipchart image — displayed exactly as-is */}
              <img
                src={getFlipchartPageSrc(currentPage)}
                alt={`Lámina ${currentPage.flipchartPage} del flipchart`}
                className="w-full h-full object-contain select-none"
                draggable={false}
                loading="lazy"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls below the easel */}
        <div className="relative z-10 mt-6 flex items-center justify-between px-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={safeIdx === 0}
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
            disabled={safeIdx >= pages.length - 1}
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
