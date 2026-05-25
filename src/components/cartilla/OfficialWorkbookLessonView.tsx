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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-card border-2 border-foreground/5 shadow-sm premium-glass">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary border border-foreground/5 shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" style={getAccentTextStyle(accent)} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-foreground/80 leading-none">
              {mode === "teacher" ? "Presentación del maestro" : "Cuaderno Oficial"}
            </h3>
            <span className="text-[11px] sm:text-xs font-bold text-foreground/50 mt-1 block">
              {mode === "teacher" ? "Libro proyectable en clase de alta resolución" : "Sigue la lección en tu libro impreso"}
            </span>
          </div>
        </div>

        {/* Interface Switcher & Views */}
        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          {/* Pages count indicator */}
          <div className="text-xs font-extrabold text-foreground/60 mr-2 bg-secondary/40 px-3 py-1.5 rounded-xl border border-foreground/5">
            Pág. {pages}
          </div>

          {/* Mode Toggles */}
          {sources.length > 1 && (
            <div className="flex rounded-2xl border border-foreground/10 bg-background/50 p-1">
              <button
                type="button"
                onClick={() => setTwoPageMode(false)}
                className={cn(
                  "p-1.5 rounded-xl transition cursor-pointer",
                  !twoPageMode ? "bg-card shadow-sm text-primary" : "text-foreground/50 hover:text-foreground"
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
                  twoPageMode ? "bg-card shadow-sm text-primary" : "text-foreground/50 hover:text-foreground"
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            style={getAccentBgStyle(accent)}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Pantalla Completa</span>
          </button>
        </div>
      </div>

      {/* Main Open Book container */}
      <div className="relative w-full max-w-5xl mx-auto flex flex-col select-none">
        
        {/* Shadow sheet page effect behind */}
        <div className="absolute inset-x-2 -bottom-2 h-full rounded-[2.5rem] bg-card/60 border border-foreground/5 shadow-md -z-10" />
        <div className="absolute inset-x-4 -bottom-4 h-full rounded-[2.5rem] bg-card/45 border border-foreground/5 shadow-md -z-20" />

        {/* Active open workbook layout */}
        <div className="relative rounded-[2rem] bg-card/95 border-2 border-foreground/10 shadow-2xl p-2 sm:p-4 overflow-hidden">
          
          {/* Subtle center fold shadow overlay for realism */}
          <div className="absolute inset-y-0 left-1/2 w-8 -ml-4 bg-gradient-to-r from-transparent via-foreground/[0.04] to-transparent pointer-events-none z-10" />

          <div className={cn(
            "grid gap-4 items-stretch",
            isDoublePage ? "md:grid-cols-2" : "grid-cols-1"
          )}>
            
            {/* LEFT PAGE (or unique page) */}
            <div className="relative flex flex-col justify-between bg-[#fffff8] rounded-2xl p-3 sm:p-4 md:p-6 border border-foreground/5 shadow-inner">
              
              {/* Binder Spiral down the right edge of left page on desktop */}
              {isDoublePage && (
                <div className="hidden md:flex flex-col justify-between absolute right-[-10px] inset-y-8 w-5 items-center select-none pointer-events-none z-20">
                  {renderSpiralRings(8)}
                </div>
              )}

              {/* Page content */}
              <div className="flex-1">
                <OfficialWorkbookPage source={leftSource} />
                {belowPage?.(leftSource.pageNumber)}
              </div>
            </div>

            {/* RIGHT PAGE (only visible on side-by-side mode) */}
            {isDoublePage && (
              <div className="relative flex flex-col justify-between bg-[#fffff8] rounded-2xl p-3 sm:p-4 md:p-6 border border-foreground/5 shadow-inner">
                {rightSource ? (
                  <div className="flex-1">
                    <OfficialWorkbookPage source={rightSource} />
                    {belowPage?.(rightSource.pageNumber)}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-foreground/10 rounded-2xl p-6">
                    <Info className="w-10 h-10 text-foreground/30 mb-2" />
                    <h4 className="font-extrabold text-foreground/60 text-center text-sm">
                      Fin del segmento
                    </h4>
                    <p className="text-xs text-foreground/40 text-center max-w-[200px] mt-1">
                      Esta lección no tiene más páginas oficiales en el cuaderno.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Page Turning Affordance Indicators */}
          <div className="flex items-center justify-between mt-4 px-1 sm:px-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={selectedIdx === 0}
              className="inline-flex items-center gap-1.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-foreground/10 text-sm font-extrabold text-foreground/70 bg-card hover:bg-secondary/60 disabled:opacity-30 disabled:hover:bg-card shadow-sm active:scale-95 transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Verified badge status */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-foreground/50">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="font-bold">Ilustración original remasterizada</span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={isDoublePage ? (selectedIdx + 2 >= sources.length) : (selectedIdx + 1 >= sources.length)}
              className="inline-flex items-center gap-1.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-foreground/10 text-sm font-extrabold text-foreground/70 bg-card hover:bg-secondary/60 disabled:opacity-30 disabled:hover:bg-card shadow-sm active:scale-95 transition cursor-pointer"
            >
              <span className="hidden sm:inline">Siguiente</span>
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
