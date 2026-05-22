import { lazy, Suspense, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { DragBuildWord } from "./DragBuildWord";
import { assetPath } from "@/lib/assets";

const PdfViewer = lazy(() =>
  import("@/components/PdfViewer").then((m) => ({ default: m.PdfViewer })),
);

const PDF_URL = assetPath("book/book.pdf");
const COVER_SRC = assetPath("cartilla/images/cover.png");

export function BookReader() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const total = Math.min(TOTAL_LESSONS, CATALOG.length);
  const entry = CATALOG[lessonIndex] ?? CATALOG[0];

  return (
    <div
      className="min-h-screen flex flex-col"
      style=
        background:
          "linear-gradient(180deg, #fef3c7 0%, #ecfccb 45%, #e0f2fe 100%)",
      
    >
      <header className="sticky top-0 z-20 w-full bg-white/90 backdrop-blur border-b border-emerald-900/10 px-3 py-2 flex items-center justify-between gap-2">
        <Link
          to="/cartilla"
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-900/80 hover:text-emerald-900 px-3 py-2 rounded-xl border border-emerald-900/10"
        >
          <Home className="w-4 h-4" />{" "}
          <span className="hidden sm:inline">Cartilla</span>
        </Link>
        <div className="flex-1 min-w-0 text-center font-bold text-emerald-900 truncate text-sm sm:text-base">
          {entry.title}
          {entry.pages ? (
            <span className="ml-2 text-emerald-900/60 font-normal text-xs">
              pág {entry.pages}
            </span>
          ) : null}
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-900/80 px-3 py-2 rounded-xl border border-emerald-900/10">
          <BookOpen className="w-4 h-4" /> {lessonIndex + 1}/{total}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-2 py-4 gap-5">
        <div className="w-full max-w-3xl">
          <Suspense
            fallback={
              <div className="text-center text-emerald-900/60 py-10 font-bold">
                Cargando libro…
              </div>
            }
          >
            <PdfViewer url={PDF_URL} />
          </Suspense>
        </div>

        <div className="w-full max-w-3xl bg-white/85 backdrop-blur rounded-3xl shadow-xl border-4 border-amber-200 p-4 sm:p-6">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 text-emerald-900/70 text-center">
            Ejercicio · {entry.title}
          </div>
          <DragBuildWord entry={entry} accent={entry.color || "#059669"} />
        </div>
      </main>

      <nav className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border-t border-emerald-900/10 px-3 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setLessonIndex((i) => Math.max(0, i - 1))}
          disabled={lessonIndex === 0}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-emerald-900/15 bg-white font-bold text-emerald-900 disabled:opacity-30 hover:-translate-y-px transition"
        >
          <ChevronLeft className="w-5 h-5" /> Lección anterior
        </button>
        <button
          type="button"
          onClick={() => setLessonIndex((i) => Math.min(total - 1, i + 1))}
          disabled={lessonIndex >= total - 1}
          className="inline-flex items-center gap-1 px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow-md disabled:opacity-30 hover:-translate-y-px transition"
        >
          Siguiente lección <ChevronRight className="w-5 h-5" />
        </button>
      </nav>

      <motion.img
        src={COVER_SRC}
        alt="Gretel"
        className="fixed bottom-20 right-3 sm:bottom-24 sm:right-6 w-16 sm:w-20 pointer-events-none z-30 rounded-2xl shadow-2xl border-4 border-white bg-white object-contain"
        animate= y: [0, -6, 0] 
        transition= duration: 3, repeat: Infinity, ease: "easeInOut" 
      />
    </div>
  );
}
