import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Home } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { BookPage } from "./BookPage";

export function BookReader() {
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const entry = CATALOG[pageIndex] ?? CATALOG[0];
  const total = Math.min(TOTAL_LESSONS, CATALOG.length);

  const goNext = () => {
    if (pageIndex < total - 1) {
      setDirection(1);
      setPageIndex((i) => i + 1);
    }
  };
  const goPrev = () => {
    if (pageIndex > 0) {
      setDirection(-1);
      setPageIndex((i) => i - 1);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-4 px-3"
      style= background: "linear-gradient(180deg, #fef3c7 0%, #ecfccb 45%, #e0f2fe 100%)" 
    >
      <header className="w-full max-w-4xl flex items-center justify-between mb-3">
        <Link
          to="/cartilla"
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-900/70 hover:text-emerald-900 bg-white/70 backdrop-blur px-3 py-2 rounded-xl border border-emerald-900/10 shadow-sm"
        >
          <Home className="w-4 h-4" /> Cartilla
        </Link>
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-900/70 bg-white/70 backdrop-blur px-3 py-2 rounded-xl border border-emerald-900/10 shadow-sm">
          <BookOpen className="w-4 h-4" /> Lección {pageIndex + 1} / {total}
        </div>
      </header>

      <div
        className="relative w-full max-w-4xl"
        style= perspective: "2400px", aspectRatio: "4 / 5" 
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={pageIndex}
            custom={direction}
            initial= rotateY: direction > 0 ? 90 : -90, opacity: 0 
            animate= rotateY: 0, opacity: 1 
            exit= rotateY: direction > 0 ? -90 : 90, opacity: 0 
            transition= duration: 0.6, ease: [0.4, 0.0, 0.2, 1] 
            style=
              transformStyle: "preserve-3d",
              transformOrigin: direction > 0 ? "left center" : "right center",
            
            className="absolute inset-0"
          >
            <BookPage entry={entry} />
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className="w-full max-w-4xl flex items-center justify-between mt-5 px-2 gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={pageIndex === 0}
          className="flex-1 sm:flex-none px-5 py-3 rounded-2xl border-2 border-emerald-900/15 bg-white font-bold text-emerald-900 disabled:opacity-30 hover:-translate-y-px transition shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 inline mr-1" /> Anterior
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={pageIndex >= total - 1}
          className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-lg shadow-md disabled:opacity-30 hover:-translate-y-px transition"
        >
          Siguiente <ArrowRight className="w-5 h-5 inline ml-1" />
        </button>
      </nav>
    </div>
  );
}
