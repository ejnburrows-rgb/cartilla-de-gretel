import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { DragBuildWord } from "./DragBuildWord";
import { assetPath } from "@/lib/assets";

const COVER_SRC = assetPath("cartilla/images/cover.png");

const REAL_KIT_PHOTOS: Array<{ src: string; label: string }> = [
  { src: assetPath("cartilla/images/original/cover.jpg"), label: "Portada del libro" },
  { src: assetPath("cartilla/images/original/student-book.jpg"), label: "Libro del alumno" },
  { src: assetPath("cartilla/images/original/flipchart.jpg"), label: "Flipchart 17\u00d722" },
  { src: assetPath("cartilla/images/original/syllabic-charts.jpg"), label: "Carteles sil\u00e1bicos" },
  { src: assetPath("cartilla/images/original/homework.jpg"), label: "Tareas reproducibles" },
  { src: assetPath("cartilla/images/original/evaluations.jpg"), label: "Evaluaciones" },
];

const PAGE_BG: React.CSSProperties = {
  background:
    "linear-gradient(180deg, #fef3c7 0%, #ecfccb 45%, #e0f2fe 100%)",
};

const BOB_ANIMATE = { y: [0, -6, 0] };
const BOB_TRANSITION = { duration: 3, repeat: Infinity, ease: "easeInOut" as const };

export function BookReader() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const total = Math.min(TOTAL_LESSONS, CATALOG.length);
  const entry = CATALOG[lessonIndex] ?? CATALOG[0];

  return (
    <div className="min-h-screen flex flex-col" style={PAGE_BG}>
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

      <main className="flex-1 flex flex-col items-center px-3 py-5 gap-6">
        <section className="w-full max-w-3xl flex flex-col items-center gap-3">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-900/60">
            La Cartilla de Gretel · Leónor Lopetegui
          </div>
          <img
            src={COVER_SRC}
            alt="Portada — La Cartilla de Gretel"
            className="w-48 sm:w-64 rounded-2xl shadow-2xl border-4 border-white object-contain bg-white"
          />
        </section>

        <section className="w-full max-w-3xl">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 text-emerald-900/70">
            Materiales originales
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {REAL_KIT_PHOTOS.map((p) => (
              <figure key={p.src} className="bg-white rounded-xl shadow border border-emerald-900/10 overflow-hidden flex flex-col">
                <img src={p.src} alt={p.label} className="w-full h-32 sm:h-36 object-cover" loading="lazy" />
                <figcaption className="px-2 py-1.5 text-[11px] font-bold text-emerald-900/80 text-center truncate">
                  {p.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="w-full max-w-3xl bg-white/85 backdrop-blur rounded-3xl shadow-xl border-4 border-amber-200 p-4 sm:p-6">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 text-emerald-900/70 text-center">
            Ejercicio · {entry.title}
          </div>
          <DragBuildWord entry={entry} accent={entry.color || "#059669"} />
        </section>
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
        animate={BOB_ANIMATE}
        transition={BOB_TRANSITION}
      />
    </div>
  );
}
