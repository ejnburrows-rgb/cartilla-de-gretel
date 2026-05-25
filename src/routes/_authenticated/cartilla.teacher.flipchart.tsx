import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Maximize,
  Minimize,
  Presentation,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import teacherFlipchartData from "@/data/teacher-flipchart.json";
import { assetPath } from "@/lib/assets";
import { getBestDisplayPath, getQualityLabel, getRemasterAssetByOriginal } from "@/lib/remaster-assets";

export const Route = createFileRoute("/_authenticated/cartilla/teacher/flipchart")({
  component: TeacherFlipchart,
  head: () => ({ meta: [{ title: "Flipchart de Clase — La Cartilla de Gretel" }] }),
});

function TeacherFlipchart() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qualityMode, setQualityMode] = useState<"source" | "projection">("projection");
  const [fallbackPath, setFallbackPath] = useState<string | null>(null);

  const totalPages = teacherFlipchartData.pages.length;
  const currentData = teacherFlipchartData.pages[currentPage - 1];
  const originalPath = currentData?.path ?? "";
  const originalPublicPath = originalPath ? assetPath(originalPath) : "";
  const remasterAsset = useMemo(() => getRemasterAssetByOriginal(originalPath), [originalPath]);
  const computedDisplayPath = getBestDisplayPath(originalPath, qualityMode === "source" ? "source" : "projection") ?? originalPublicPath;
  const displayPath = fallbackPath ?? computedDisplayPath;
  const qualityLabel = getQualityLabel(originalPath, qualityMode === "source" ? "source" : "projection");
  const isEnhanced = displayPath !== originalPublicPath;

  useEffect(() => {
    setFallbackPath(null);
  }, [computedDisplayPath]);

  const goNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const goPrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key.toLowerCase() === "q") setQualityMode((mode) => (mode === "projection" ? "source" : "projection"));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((error) => console.error(`Error attempting to enable full-screen mode: ${error.message}`));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!currentData) return <div>Cargando...</div>;

  let remasterStatusLabel = "Escaneo conectado";
  let remasterBadgeStyle = "bg-amber-100 text-amber-800 border border-amber-200";
  let isApproved = false;

  if (remasterAsset) {
    if (remasterAsset.approvalStatus === "approved") {
      remasterStatusLabel = "Remaster aprobado";
      remasterBadgeStyle = "bg-emerald-100 text-emerald-800 border border-emerald-200";
      isApproved = true;
    } else if (isEnhanced) {
      remasterStatusLabel = qualityLabel;
      remasterBadgeStyle = "bg-indigo-100 text-indigo-800 border border-indigo-200";
    } else if (remasterAsset.cleanupStatus === "cleaned") {
      remasterStatusLabel = "Limpieza completada";
      remasterBadgeStyle = "bg-sky-100 text-sky-800 border border-sky-200";
    }
  }

  return (
    <div className={cn("flex min-h-screen flex-col", isFullscreen ? "bg-stone-900" : "bg-stone-100")}>
      {!isFullscreen && (
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Link to="/cartilla/teacher/presentacion" className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-black text-stone-700 transition-colors hover:bg-stone-200">
              <ArrowLeft className="h-4 w-4" /> Presentación
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Presentation className="h-5 w-5 text-[var(--cartilla-accent)]" />
                <h1 className="text-lg font-black text-stone-900">Libro del Maestro</h1>
              </div>
              <p className="text-xs font-semibold text-stone-500">Presentación de clase como libro proyectable</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black shadow-sm", remasterBadgeStyle)}>
              {isApproved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              {remasterStatusLabel}
            </span>
            <button type="button" onClick={() => setQualityMode((mode) => (mode === "projection" ? "source" : "projection"))} className="inline-flex items-center gap-2 rounded-full bg-[var(--cartilla-accent)] px-4 py-2 text-sm font-black text-white shadow-md transition hover:opacity-90">
              {qualityMode === "projection" ? "Modo proyección" : "Escaneo original"}
            </button>
            <button onClick={toggleFullscreen} className="inline-flex items-center gap-2 rounded-full bg-stone-800 px-4 py-2 text-sm font-black text-white shadow-md transition-colors hover:bg-stone-700">
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              {isFullscreen ? "Salir" : "Proyectar"}
            </button>
          </div>
        </header>
      )}

      <main className="group relative flex flex-1 items-center justify-center overflow-hidden p-2 sm:p-6">
        <button onClick={goPrev} disabled={currentPage === 1} className="absolute left-2 sm:left-6 top-1/2 z-20 flex h-14 w-14 sm:h-16 sm:w-16 -translate-y-1/2 items-center justify-center rounded-full bg-stone-900/60 text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity hover:bg-stone-900/80 disabled:opacity-0 group-hover:opacity-100" aria-label="Página anterior">
          <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10" />
        </button>

        <button onClick={goNext} disabled={currentPage === totalPages} className="absolute right-2 sm:right-6 top-1/2 z-20 flex h-14 w-14 sm:h-16 sm:w-16 -translate-y-1/2 items-center justify-center rounded-full bg-stone-900/60 text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity hover:bg-stone-900/80 disabled:opacity-0 group-hover:opacity-100" aria-label="Página siguiente">
          <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10" />
        </button>

        {/* Projected Book Frame */}
        <div className={cn(
          "relative flex flex-col w-full h-full max-w-6xl mx-auto rounded-[2rem] bg-white border border-stone-200 shadow-2xl overflow-hidden transition-all duration-300",
          isFullscreen ? "rounded-none border-none max-w-none" : ""
        )}>
          {/* Identity Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-stone-50 border-b border-stone-100 shrink-0">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[var(--cartilla-accent)] flex items-center justify-center text-white shadow-inner">
                 <Presentation className="w-4 h-4" />
               </div>
               <div>
                 <h2 className="font-extrabold text-sm text-stone-700">Libro del Maestro</h2>
                 <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">La Cartilla de Gretel</span>
               </div>
             </div>
             <div className="flex flex-col items-end">
               <div className="text-xs font-black text-stone-600 bg-white px-3 py-1 rounded-full shadow-sm border border-stone-200">
                 Página {currentData.flipchartPage} / {totalPages}
               </div>
             </div>
          </div>
          
          {/* Book Image Content */}
          <div className="flex-1 w-full flex items-center justify-center bg-stone-100/50 p-2 sm:p-6 overflow-hidden relative">
            {/* Subtle shadow behind the page to make it pop like paper */}
            <div className="absolute inset-8 bg-stone-200/50 blur-xl rounded-full -z-10" />
            
            <img
              src={displayPath}
              alt={`Página ${currentData.flipchartPage} del libro del maestro`}
              className="relative max-h-full max-w-full rounded-sm object-contain drop-shadow-xl ring-1 ring-stone-900/5 bg-white"
              decoding="async"
              loading="eager"
              fetchPriority="high"
              onError={() => {
                if (displayPath !== originalPublicPath) setFallbackPath(originalPublicPath);
              }}
            />
          </div>
        </div>

        {/* Quick controls overlay at the bottom */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full bg-stone-900/80 backdrop-blur px-5 py-2.5 text-sm font-black tracking-widest text-white opacity-0 shadow-2xl transition-opacity group-hover:opacity-100">
          <span className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded-md">{currentPage}</span> / {totalPages}
          </span>
          <div className="w-px h-4 bg-white/20" />
          <span className="inline-flex items-center gap-1.5 text-[11px] tracking-normal opacity-80">
            <Clock className="h-3.5 w-3.5" /> Q: Calidad
          </span>
        </div>
      </main>
    </div>
  );
}

