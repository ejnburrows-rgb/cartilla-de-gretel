import { useState, type ReactNode } from "react";
import { getWorkbookPageSourcesForLesson } from "@/lib/workbook-source";
import { PolishedPage } from "./PolishedPage";
import { BookOpen, Maximize2, Minimize2, ChevronLeft, ChevronRight, Columns, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type OfficialWorkbookLessonViewProps = {
  lessonNumber: number;
  pages: string;
  title: string;
  accent?: string;
  belowPage?: (activePageNumber: number) => ReactNode;
  mode?: "student" | "teacher";
};

const BOOK_ANIMATION = {
  initial: { opacity: 0, scale: 0.985, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { duration: 0.32, ease: "easeOut" as const },
};

const FULLSCREEN_MOTION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function OfficialWorkbookLessonView({
  lessonNumber,
  pages,
  title,
  belowPage,
  mode = "student",
}: OfficialWorkbookLessonViewProps) {
  const lessonSource = getWorkbookPageSourcesForLesson(lessonNumber, pages);
  const sources = lessonSource.pages;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [twoPageMode, setTwoPageMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (sources.length === 0) return null;

  const isDoublePage = twoPageMode && sources.length > 1 && !isFullscreen;
  const leftSource = sources[selectedIdx] ?? sources[0];
  const rightSource = selectedIdx + 1 < sources.length ? sources[selectedIdx + 1] : null;

  const handlePrev = () => setSelectedIdx((prev) => Math.max(0, prev - (isDoublePage ? 2 : 1)));
  const handleNext = () => {
    if (isDoublePage) setSelectedIdx((prev) => (prev + 2 < sources.length ? prev + 2 : prev));
    else setSelectedIdx((prev) => Math.min(sources.length - 1, prev + 1));
  };
  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setZoomLevel(1);
  };

  const zoomPercent = Math.round(zoomLevel * 100);

  return (
    <motion.div className="my-6 space-y-4" initial={BOOK_ANIMATION.initial} animate={BOOK_ANIMATION.animate} transition={BOOK_ANIMATION.transition}>
      <div className="rounded-[2rem] border border-white/65 bg-white/72 p-4 shadow-[0_18px_54px_rgba(50,30,10,0.10)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#ffe7a8] to-[#ffb7c5] text-[#3A281E] shadow-sm">
              <BookOpen className="h-5 w-5 text-[#3A281E]" />
            </div>
            <div>
              <h3 className="text-sm font-black leading-none text-[#3A281E] sm:text-base">
                {mode === "teacher" ? "Presentación del maestro" : "Cuaderno del estudiante"}
              </h3>
              <span className="mt-1 block text-[11px] font-bold text-[#6d4c35] sm:text-xs">
                Página original del cuaderno en formato completo
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className="rounded-xl border border-amber-950/10 bg-white/80 px-3 py-1.5 text-xs font-extrabold text-amber-950/80">
              Pág. {pages}
            </div>
            {sources.length > 1 && (
              <div className="flex rounded-2xl border border-amber-950/10 bg-white/80 p-1">
                <button type="button" onClick={() => setTwoPageMode(false)} className={cn("rounded-xl p-1.5 transition", !twoPageMode ? "bg-[#fff0b8] text-amber-900 shadow-sm" : "text-stone-400 hover:text-stone-700")} title="Vista página única">
                  <Square className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setTwoPageMode(true)} className={cn("rounded-xl p-1.5 transition", twoPageMode ? "bg-[#fff0b8] text-amber-900 shadow-sm" : "text-stone-400 hover:text-stone-700")} title="Vista doble página">
                  <Columns className="h-4 w-4" />
                </button>
              </div>
            )}
            <button type="button" onClick={handleToggleFullscreen} className="inline-flex items-center gap-1.5 rounded-2xl bg-[#3A281E] px-4 py-2 text-xs font-black text-white shadow-md transition hover:bg-[#21150f] active:scale-[0.98]">
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Pantalla completa</span>
            </button>
          </div>
        </div>
      </div>

      <div className="official-workbook-canvas">
        <div className={cn("official-workbook-spread", isDoublePage ? "md:grid-cols-2" : "grid-cols-1")}>
          <section className="official-workbook-slot">
            <PolishedPage pageNumber={leftSource.pageNumber} />
            {belowPage?.(leftSource.pageNumber)}
          </section>
          {isDoublePage && rightSource && (
            <section className="official-workbook-slot">
              <PolishedPage pageNumber={rightSource.pageNumber} />
              {belowPage?.(rightSource.pageNumber)}
            </section>
          )}
        </div>

        <div className="relative z-10 mt-5 flex items-center justify-between px-1 sm:px-2">
          <button type="button" onClick={handlePrev} disabled={selectedIdx === 0} className="inline-flex items-center gap-2 rounded-2xl border border-amber-900/15 bg-white px-5 py-3 text-sm font-extrabold text-[#3A281E] shadow-sm transition hover:bg-stone-50 disabled:opacity-30 sm:px-6 sm:py-3.5">
            <ChevronLeft className="h-5 w-5" />
            <span>Anterior</span>
          </button>
          <button type="button" onClick={handleNext} disabled={isDoublePage ? selectedIdx + 2 >= sources.length : selectedIdx + 1 >= sources.length} className="inline-flex items-center gap-2 rounded-2xl bg-amber-800 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-amber-900 disabled:opacity-30 sm:px-8 sm:py-3.5 sm:text-base">
            <span>Siguiente</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_15%_10%,#fff3b0,transparent_30%),radial-gradient(circle_at_85%_8%,#b9f3ff,transparent_32%),linear-gradient(135deg,#fff8de,#ffd6e3_48%,#d9efff)] p-4"
            initial={FULLSCREEN_MOTION.initial}
            animate={FULLSCREEN_MOTION.animate}
            exit={FULLSCREEN_MOTION.exit}
          >
            <div className="mb-4 flex shrink-0 items-center justify-between rounded-2xl bg-white/70 p-3 shadow-sm backdrop-blur">
              <div>
                <h2 className="text-sm font-extrabold leading-none text-[#3A281E] md:text-base">{title} · página {sources[selectedIdx]?.pageNumber ?? leftSource.pageNumber}</h2>
                <span className="mt-1 block text-[10px] font-bold text-[#3A281E]/60 md:text-xs">Cuaderno del estudiante en pantalla completa</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))} className="rounded-lg bg-white px-2 py-1 text-xs font-bold shadow-sm">A-</button>
                <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold shadow-sm">{zoomPercent}%</span>
                <button onClick={() => setZoomLevel((z) => Math.min(2, z + 0.15))} className="rounded-lg bg-white px-2 py-1 text-xs font-bold shadow-sm">A+</button>
                <button onClick={handleToggleFullscreen} className="inline-flex items-center gap-1.5 rounded-xl bg-[#3A281E] px-3 py-1.5 text-xs font-bold text-white">
                  <Minimize2 className="h-3.5 w-3.5" /> Salir
                </button>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto rounded-[2rem] bg-white/38 p-4 shadow-inner backdrop-blur-sm">
              <div className="w-full max-w-5xl origin-center transition-transform duration-200">
                <PolishedPage pageNumber={sources[selectedIdx]?.pageNumber ?? leftSource.pageNumber} />
              </div>
            </div>
            <div className="mt-4 flex shrink-0 items-center justify-between rounded-2xl bg-white/70 p-3 shadow-sm backdrop-blur">
              <button onClick={handlePrev} disabled={selectedIdx === 0} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-950/10 bg-white px-4 py-2.5 text-xs font-extrabold text-[#3A281E] disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" /> Pág. anterior
              </button>
              <button onClick={handleNext} disabled={selectedIdx + 1 >= sources.length} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-950/10 bg-white px-4 py-2.5 text-xs font-extrabold text-[#3A281E] disabled:opacity-30">
                Pág. siguiente <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
