import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { OfficialWorkbookLessonView } from "./OfficialWorkbookLessonView";

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
          <Home className="w-4 h-4" />
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

      <main className="flex-1 w-full max-w-6xl mx-auto px-3 py-4 sm:px-5 sm:py-6">
        <OfficialWorkbookLessonView
          lessonNumber={entry.n}
          pages={entry.pages}
          title={entry.title}
          accent={entry.color}
        />
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
    </div>
  );
}
