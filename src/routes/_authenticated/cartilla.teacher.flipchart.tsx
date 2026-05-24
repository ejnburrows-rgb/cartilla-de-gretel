import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Presentation, ArrowLeft, Maximize, Minimize, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import teacherFlipchartData from "@/data/teacher-flipchart.json";

export const Route = createFileRoute("/_authenticated/cartilla/teacher/flipchart")({
  component: TeacherFlipchart,
  head: () => ({ meta: [{ title: "Flipchart de Clase — La Cartilla de Gretel" }] }),
});

function TeacherFlipchart() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalPages = teacherFlipchartData.pages.length;
  const currentData = teacherFlipchartData.pages[currentPage - 1];

  const goNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const goPrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        if (currentPage < totalPages) setCurrentPage((p) => p + 1);
      }
      if (e.key === "ArrowLeft") {
        if (currentPage > 1) setCurrentPage((p) => p - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!currentData) return <div>Cargando...</div>;

  return (
    <div className={cn(
      "flex flex-col min-h-screen",
      isFullscreen ? "bg-black" : "bg-neutral-900"
    )}>
      {/* Top Navigation Bar - Hidden in true fullscreen to maximize projection space */}
      {!isFullscreen && (
        <header className="flex items-center justify-between px-6 py-4 bg-neutral-950 border-b border-neutral-800 text-neutral-100">
          <div className="flex items-center gap-4">
            <Link
              to="/cartilla/teacher/presentacion"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-4 py-2 text-sm font-bold text-neutral-200 hover:bg-neutral-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
            <div className="flex items-center gap-2">
              <Presentation className="h-5 w-5 text-indigo-400" />
              <h1 className="font-bold text-lg">Flipchart de Clase</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Honest status indicator */}
             <div className="flex items-center gap-2 text-xs font-semibold">
                {currentData.remasterStatus === "original only" ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Clock className="h-3.5 w-3.5" /> Remaster pendiente
                  </span>
                ) : (
                   <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Remaster listo
                  </span>
                )}
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Fuente conectada
                </span>
             </div>

            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-4 py-2 text-sm font-bold text-neutral-200 hover:bg-neutral-700 transition-colors"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              {isFullscreen ? "Salir" : "Proyectar"}
            </button>
          </div>
        </header>
      )}

      {/* Main Presentation Area */}
      <main className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-hidden group">
        
        {/* Navigation Overlays */}
        <button 
          onClick={goPrev}
          disabled={currentPage === 1}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity hover:bg-black/60 z-10"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>

        <button 
          onClick={goNext}
          disabled={currentPage === totalPages}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity hover:bg-black/60 z-10"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-10 h-10" />
        </button>

        {/* The Flipchart Page */}
        <div className="relative h-full w-full flex items-center justify-center">
          <img 
            src={currentData.path} 
            alt={`Página ${currentData.flipchartPage} del flipchart`}
            className="max-h-full max-w-full object-contain drop-shadow-2xl rounded-sm"
          />
        </div>

        {/* Floating Page Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          {currentPage} / {totalPages}
        </div>
      </main>
    </div>
  );
}
