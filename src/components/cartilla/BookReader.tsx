import type { CSSProperties } from "react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { DragBuildWord } from "./DragBuildWord";
import { assetPath } from "@/lib/assets";
import { cn } from "@/lib/utils";

const COVER_SRC = assetPath("cartilla/images/cover.png");

const REAL_KIT_PHOTOS: Array<{ src: string; label: string }> = [
  { src: assetPath("cartilla/images/original/cover.jpg"), label: "Portada original" },
  { src: assetPath("cartilla/images/original/student-book.jpg"), label: "Cuaderno del estudiante" },
  { src: assetPath("cartilla/images/original/flipchart.jpg"), label: "Flipchart 17\u00d722" },
  { src: assetPath("cartilla/images/original/syllabic-charts.jpg"), label: "Carteles sil\u00e1bicos" },
  { src: assetPath("cartilla/images/original/homework.jpg"), label: "Tareas reproducibles" },
  { src: assetPath("cartilla/images/original/evaluations.jpg"), label: "Evaluaciones" },
];

const PAGE_BG: CSSProperties = {}; // Now using cartilla-crm-bg class

const BOB_ANIMATE = { y: [0, -6, 0] };
const BOB_TRANSITION = { duration: 3, repeat: Infinity, ease: "easeInOut" as const };

export function BookReader() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const total = Math.min(TOTAL_LESSONS, CATALOG.length);
  const entry = CATALOG[lessonIndex] ?? CATALOG[0];

  return (
    <div className="min-h-screen flex flex-col text-[var(--cartilla-title-ink)] cartilla-crm-bg">
      <header className="sticky top-0 z-20 w-full bg-[#FAF7F0]/95 backdrop-blur border-b border-amber-900/15 px-4 py-3 flex items-center justify-between gap-2 shadow-xs">
        <Link
          to="/cartilla"
          className="inline-flex items-center gap-2 text-sm font-black text-amber-950/80 hover:text-amber-950 px-3 py-2 rounded-xl border border-amber-900/15 bg-white/60 hover:bg-white transition"
        >
          <Home className="w-4 h-4" />{" "}
          <span className="hidden sm:inline">Cartilla</span>
        </Link>
        <div className="flex-1 min-w-0 text-center font-black text-amber-950 truncate text-sm sm:text-base">
          {entry.title}
          {entry.pages ? (
            <span className="ml-2 text-amber-900/60 font-bold text-xs bg-amber-950/5 px-2 py-0.5 rounded-md">
              pág. {entry.pages}
            </span>
          ) : null}
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-black text-amber-950/80 px-3 py-2 rounded-xl border border-amber-900/15 bg-white/60">
          <BookOpen className="w-4 h-4 text-amber-850" /> {lessonIndex + 1}/{total}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-6 gap-8 max-w-4xl w-full mx-auto">
        <section className="w-full flex flex-col items-center gap-3">
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-950/60">
            La Cartilla de Gretel · Leonor Lopetegui
          </div>
          <img
            src={COVER_SRC}
            alt="Portada — La Cartilla de Gretel"
            className="w-44 sm:w-56 rounded-2xl shadow-xl border-4 border-white object-contain bg-white transform hover:scale-102 transition duration-300"
          />
        </section>

        <section className="w-full">
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest mb-3.5 text-amber-950/70 text-center">
            Materiales originales convertidos en CRM de aula
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {REAL_KIT_PHOTOS.map((p, idx) => {
              const rotation = idx % 2 === 0 ? "hover:rotate-1" : "hover:-rotate-1";
              return (
                <figure 
                  key={p.src} 
                  className={cn(
                    "bg-[#fffdfa] p-2 rounded-xl shadow-md border border-stone-200/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col transform",
                    rotation
                  )}
                >
                  <div className="overflow-hidden rounded-lg bg-stone-100 flex-1">
                    <img src={p.src} alt={p.label} className="w-full h-28 sm:h-32 object-cover object-center" loading="lazy" />
                  </div>
                  <figcaption className="pt-2 px-1 text-[11px] font-extrabold text-amber-950/80 text-center truncate">
                    {p.label}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>

        {/* 3D Warm Book Page reader layout */}
        <section className="w-full cartilla-book-paper rounded-[2rem] p-5 sm:p-8 relative overflow-hidden">
          {/* Spine fold line inside the workbook reader page */}
          <div className="absolute inset-y-0 left-1/2 w-6 -ml-3 bg-gradient-to-r from-transparent via-[#3A281E]/[0.05] to-transparent pointer-events-none" />
          
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest mb-4 text-amber-900/60 text-center">
            Práctica de lectura · {entry.title}
          </div>
          <div className="relative z-10">
            <DragBuildWord entry={entry} accent={entry.color || "#8b5a2b"} />
          </div>
        </section>
      </main>

      <nav className="sticky bottom-0 z-20 bg-[#FAF7F0]/95 backdrop-blur border-t border-amber-900/15 px-4 py-3.5 flex items-center justify-between gap-3 shadow-[0_-8px_30px_rgba(50,30,10,0.08)]">
        <button
          type="button"
          onClick={() => setLessonIndex((i) => Math.max(0, i - 1))}
          disabled={lessonIndex === 0}
          className="inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl border border-amber-900/20 bg-white font-extrabold text-sm sm:text-base text-amber-950 shadow-xs hover:bg-stone-50 disabled:opacity-35 active:scale-[0.98] transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" /> 
          <span>Anterior</span>
        </button>
        <button
          type="button"
          onClick={() => setLessonIndex((i) => Math.min(total - 1, i + 1))}
          disabled={lessonIndex >= total - 1}
          className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 rounded-2xl bg-amber-800 text-white font-extrabold text-sm sm:text-base shadow-sm hover:bg-amber-900 disabled:opacity-35 active:scale-[0.98] transition cursor-pointer"
        >
          <span>Siguiente</span> 
          <ChevronRight className="w-5 h-5" />
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
