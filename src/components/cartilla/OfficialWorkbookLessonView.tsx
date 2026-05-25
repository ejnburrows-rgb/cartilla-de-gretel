import { useState, type CSSProperties, type ReactNode } from "react";
import { getWorkbookPageSourcesForLesson } from "@/lib/workbook-source";
import { OfficialWorkbookPage } from "./OfficialWorkbookPage";
import { 
  BookOpen, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Columns, 
  Square,
  Info,
  CheckCircle
} from "lucide-react";
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

// Styling helper functions
function getAccentBgStyle(accent: string): CSSProperties {
  return { backgroundColor: accent };
}

function getAccentTextStyle(accent: string): CSSProperties {
  return { color: accent };
}

// Framer motion constants
const BOOK_ANIMATION = {
  initial: { opacity: 0, scale: 0.97, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const }
};

const PAGE_PAPER_TEXTURE =
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[1.75rem] before:bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.72),transparent_24%),radial-gradient(circle_at_76%_84%,rgba(120,53,15,0.08),transparent_22%),linear-gradient(90deg,rgba(120,53,15,0.08),transparent_9%,transparent_91%,rgba(120,53,15,0.07))] before:mix-blend-multiply before:opacity-70 before:z-0";

export function OfficialWorkbookLessonView({
  lessonNumber,
  pages,
  title,
  accent = "hsl(var(--primary))",
  belowPage,
  mode = "student",
}: OfficialWorkbookLessonViewProps) {
  const lessonSource = getWorkbookPageSourcesForLesson(lessonNumber, pages);
  const sources = lessonSource.pages;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [twoPageMode, setTwoPageMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // If no source pages, don't crash
  if (sources.length === 0) {
    return null;
  }

  // Calculate pages to show
  // If double-page spread mode is active and we have at least 2 pages
  const isDoublePage = twoPageMode && sources.length > 1 && !isFullscreen;

  // Let's get the active pages
  const leftPageIdx = selectedIdx;
  const rightPageIdx = selectedIdx + 1 < sources.length ? selectedIdx + 1 : null;

  const leftSource = sources[leftPageIdx] ?? sources[0];
  const rightSource = rightPageIdx !== null ? sources[rightPageIdx] : null;

  const handlePrev = () => {
    if (isDoublePage) {
      setSelectedIdx((prev) => Math.max(0, prev - 2));
    } else {
      setSelectedIdx((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (isDoublePage) {
      if (selectedIdx + 2 < sources.length) {
        setSelectedIdx((prev) => prev + 2);
      }
    } else {
      setSelectedIdx((prev) => Math.min(sources.length - 1, prev + 1));
    }
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setZoomLevel(1);
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2, z + 0.15));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.7, z - 0.15));

  // Binder spiral rings generator
  const renderSpiralRings = (count = 14) => {
    const rings = [];
    for (let i = 0; i < count; i++) {
      rings.push(
        <div key={i} className="relative flex flex-col items-center justify-center h-full my-1 z-10 select-none pointer-events-none">
          {/* Paper Hole Left */}
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/10 absolute -left-2.5 shadow-inner" />
          {/* Paper Hole Right */}
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/10 absolute -right-2.5 shadow-inner" />
          {/* Metal Ring Loop */}
          <div className="w-6 h-3 rounded-full border border-foreground/30 bg-gradient-to-r from-secondary-foreground/20 via-background to-secondary-foreground/30 shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
        </div>
      );
    }
    return rings;
  };

  return (
    <motion.div 
      className="my-8 space-y-4"
      initial={BOOK_ANIMATION.initial}
      animate={BOOK_ANIMATION.animate}
      transition={BOOK_ANIMATION.transition}
    >
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-[#fffdf9] border-2 border-amber-950/10 shadow-[0_10px_30px_rgba(50,30,10,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-950/5 flex items-center justify-center text-amber-800 border border-amber-950/5 shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" style={getAccentTextStyle(accent)} />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-[#3A281E] leading-none">
              {mode === "teacher" ? "Presentación del maestro" : "Cuaderno Oficial"}
            </h3>
            <span className="text-[11px] sm:text-xs font-bold text-stone-500 mt-1 block">
              {mode === "teacher" ? "Libro proyectable en clase de alta resolución" : "Sigue la lección en tu libro impreso"}
            </span>
          </div>
        </div>

        {/* Interface Switcher & Views */}
        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          {/* Pages count indicator */}
          <div className="text-xs font-extrabold text-amber-950/80 bg-amber-950/5 px-3 py-1.5 rounded-xl border border-amber-950/10">
            Pág. {pages}
          </div>

          {/* Mode Toggles */}
          {sources.length > 1 && (
            <div className="flex rounded-2xl border border-stone-200 bg-[#FAF7F0] p-1">
              <button
                type="button"
                onClick={() => setTwoPageMode(false)}
                className={cn(
                  "p-1.5 rounded-xl transition cursor-pointer",
                  !twoPageMode ? "bg-[#fffdfa] shadow-xs text-amber-800" : "text-stone-400 hover:text-stone-700"
                )}
                title="Vista página única"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTwoPageMode(true)}
                className={cn(
                  "p-1.5 rounded-xl transition cursor-pointer",
                  twoPageMode ? "bg-[#fffdfa] shadow-xs text-amber-800" : "text-stone-400 hover:text-stone-700"
                )}
                title="Vista doble página"
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Theater projection button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-800 hover:bg-amber-900 text-[#fffdf9] text-xs font-black shadow-md hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Pantalla Completa</span>
          </button>
        </div>
      </div>

      {/* Main Open Book container */}
      <div className="relative w-full max-w-5xl mx-auto flex flex-col select-none">
        
        {/* Shadow sheet page effect behind */}
        <div className="absolute inset-x-2 -bottom-2 h-full rounded-[2.5rem] bg-[#fffdf9]/70 border border-stone-300/50 shadow-sm -z-10" />
        <div className="absolute inset-x-5 -bottom-4 h-full rounded-[2.5rem] bg-[#efe0c1]/70 border border-amber-950/10 shadow-xs -z-20" />
        <div className="absolute inset-x-10 -bottom-6 h-full rounded-[2.5rem] bg-[#d9bd8b]/35 border border-amber-950/10 -z-30" />
        <div className="pointer-events-none absolute -inset-x-8 bottom-[-1.25rem] h-20 rounded-[50%] bg-[#2c1e16]/24 blur-2xl -z-40" />

        {/* Active open workbook layout with heavy binder cover styling */}
        <div className="relative rounded-[2.5rem] bg-[linear-gradient(135deg,#ead7af,#f6ecd7_38%,#d9bc83)] border-4 border-[#3A281E]/20 shadow-[0_34px_80px_rgba(50,30,10,0.28),inset_0_1px_0_rgba(255,255,255,0.65)] p-2 sm:p-4 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.42),transparent_26%),radial-gradient(circle_at_86%_86%,rgba(76,44,18,0.16),transparent_34%)]" />
          
          {/* Subtle center fold shadow overlay for realism */}
          <div className="absolute inset-y-0 left-1/2 w-16 -ml-8 bg-gradient-to-r from-transparent via-[#2C1E16]/20 to-transparent pointer-events-none z-15" />
          <div className="absolute inset-y-7 left-1/2 w-1 -ml-px rounded-full bg-[#fff8e8]/70 shadow-[0_0_18px_rgba(50,30,10,0.28)] pointer-events-none z-20" />

          <div className={cn(
            "relative z-10 grid gap-4 items-stretch",
            isDoublePage ? "md:grid-cols-2" : "grid-cols-1"
          )}>
            
            {/* LEFT PAGE (or unique page) */}
            <div className={cn("relative flex flex-col justify-between bg-[#fffdf9] rounded-[1.75rem] p-4 sm:p-6 border border-stone-200 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_8px_18px_rgba(55,35,18,0.10),4px_6px_0_-2px_#fffcf8,8px_10px_0_-4px_#faf7ef,12px_14px_0_-7px_#efe4d0]", PAGE_PAPER_TEXTURE)}>
              
              {/* Binder Spiral down the right edge of left page on desktop */}
              {isDoublePage && (
                <div className="hidden md:flex flex-col justify-between absolute right-[-10px] inset-y-8 w-5 items-center select-none pointer-events-none z-20">
                  {renderSpiralRings(8)}
                </div>
              )}

              {/* Page content */}
              <div className="relative z-10 flex-1">
                <OfficialWorkbookPage source={leftSource} />
                {belowPage?.(leftSource.pageNumber)}
              </div>
            </div>

            {/* RIGHT PAGE (only visible on side-by-side mode) */}
            {isDoublePage && (
              <div className={cn("relative flex flex-col justify-between bg-[#fffdf9] rounded-[1.75rem] p-4 sm:p-6 border border-stone-200 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_8px_18px_rgba(55,35,18,0.10),4px_6px_0_-2px_#fffcf8,8px_10px_0_-4px_#faf7ef,12px_14px_0_-7px_#efe4d0]", PAGE_PAPER_TEXTURE)}>
                {rightSource ? (
                  <div className="relative z-10 flex-1">
                    <OfficialWorkbookPage source={rightSource} />
                    {belowPage?.(rightSource.pageNumber)}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-stone-250 bg-stone-50/50 rounded-[1.5rem] p-6">
                    <Info className="w-10 h-10 text-stone-300 mb-2" />
                    <h4 className="font-extrabold text-stone-600 text-center text-sm">
                      Fin del segmento
                    </h4>
                    <p className="text-xs text-stone-400 text-center max-w-[200px] mt-1 font-medium leading-relaxed">
                      Esta lección no tiene más páginas oficiales en el cuaderno.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Page Turning Affordance Indicators */}
          <div className="flex items-center justify-between mt-5 px-1 sm:px-2 relative z-10">
            <button
              type="button"
              onClick={handlePrev}
              disabled={selectedIdx === 0}
              className="inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl border border-amber-900/15 text-sm font-extrabold text-[#3A281E] bg-white hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-white shadow-xs active:scale-[0.98] transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Anterior</span>
            </button>

            {/* Verified badge status */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-950/60 bg-[#fffdf9]/90 border border-stone-200/80 px-4 py-2 rounded-full shadow-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-extrabold">Ilustración original remasterizada</span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={isDoublePage ? (selectedIdx + 2 >= sources.length) : (selectedIdx + 1 >= sources.length)}
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 rounded-2xl bg-amber-800 text-white font-extrabold text-sm sm:text-base shadow-sm hover:bg-amber-900 disabled:opacity-30 active:scale-[0.98] transition cursor-pointer"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAILED CLASSROOM THEATER FULLSCREEN OVERLAY */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            className="fixed inset-0 bg-background z-50 flex flex-col p-4 overflow-hidden select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Fullscreen Header controls */}
            <div className="flex items-center justify-between pb-3 border-b border-foreground/10 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-extrabold"
                  style={getAccentBgStyle(accent)}
                >
                  L{lessonNumber}
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-foreground/80 md:text-base leading-none">
                    {title} · Presentación Proyectable
                  </h2>
                  <span className="text-[10px] md:text-xs font-bold text-foreground/50 mt-1 block">
                    Modo proyección de aula · Alta Definición
                  </span>
                </div>
              </div>

              {/* Projection Controls */}
              <div className="flex items-center gap-2">
                {/* Zoom buttons */}
                <div className="flex rounded-xl border border-foreground/10 bg-background p-1">
                  <button 
                    onClick={handleZoomOut} 
                    className="px-2 py-1 text-xs font-bold hover:bg-secondary/40 rounded-lg cursor-pointer"
                    title="Zoom -"
                  >
                    A-
                  </button>
                  <span className="px-2 py-1 text-xs font-bold text-foreground/60 bg-secondary/20 rounded-md">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button 
                    onClick={handleZoomIn} 
                    className="px-2 py-1 text-xs font-bold hover:bg-secondary/40 rounded-lg cursor-pointer"
                    title="Zoom +"
                  >
                    A+
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 active:scale-[0.97] transition cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            </div>

            {/* Projection Main Area */}
            <div className="flex-1 flex items-center justify-center overflow-auto p-4 bg-secondary/15 rounded-[2rem] border border-foreground/5 shadow-inner">
              <div 
                className="transition-transform duration-200 ease-out origin-center flex flex-col items-center gap-3 w-full"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* Current Page */}
                <div className="w-full max-w-2xl bg-card border-2 border-foreground/10 rounded-[2.5rem] shadow-2xl p-4 overflow-hidden">
                  <OfficialWorkbookPage source={sources[selectedIdx] ?? sources[0]} />
                  {belowPage?.((sources[selectedIdx] ?? sources[0]).pageNumber)}
                </div>
              </div>
            </div>

            {/* Projection Navigation Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-foreground/10 mt-4 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                disabled={selectedIdx === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-foreground/10 text-xs font-extrabold text-foreground/70 hover:bg-secondary/50 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
                <span>Pág. Anterior</span>
              </button>

              <div className="text-xs font-extrabold text-foreground/60 bg-secondary/40 px-4 py-2 rounded-xl border border-foreground/5">
                Cuaderno pág. {leftSource.pageNumber} / {sources[sources.length - 1].pageNumber}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={selectedIdx + 1 >= sources.length}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-foreground/10 text-xs font-extrabold text-foreground/70 hover:bg-secondary/50 disabled:opacity-30 cursor-pointer"
              >
                <span>Pág. Siguiente</span>
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
