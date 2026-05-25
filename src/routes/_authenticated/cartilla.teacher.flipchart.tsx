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
  const remasterAsset = useMemo(() => getRemasterAssetByOriginal(originalPath), [originalPath]);
  const computedDisplayPath = getBestDisplayPath(originalPath, qualityMode === "source" ? "source" : "projection") ?? originalPath;
  const displayPath = fallbackPath ?? computedDisplayPath;
  const qualityLabel = getQualityLabel(originalPath, qualityMode === "source" ? "source" : "projection");
  const isEnhanced = displayPath !== originalPath;

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
  let remasterBadgeStyle = "bg-amber-500/10 text-amber-200 border border-amber-500/20";
  let isApproved = false;

  if (remasterAsset) {
    if (remasterAsset.approvalStatus === "approved") {
      remasterStatusLabel = "Remaster aprobado";
      remasterBadgeStyle = "bg-emerald-500/10 text-emerald-200 border border-emerald-500/20";
      isApproved = true;
    } else if (isEnhanced) {
      remasterStatusLabel = qualityLabel;
      remasterBadgeStyle = "bg-indigo-500/10 text-indigo-200 border border-indigo-500/20";
    } else if (remasterAsset.cleanupStatus === "cleaned") {
      remasterStatusLabel = "Limpieza completada";
      remasterBadgeStyle = "bg-sky-500/10 text-sky-200 border border-sky-500/20";
    }
  }

  return (
    <div className={cn("flex min-h-screen flex-col", isFullscreen ? "bg-black" : "bg-neutral-950")}>
      {!isFullscreen && (
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 bg-neutral-950 px-6 py-4 text-neutral-100">
          <div className="flex items-center gap-4">
            <Link to="/cartilla/teacher/presentacion" className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-4 py-2 text-sm font-black text-neutral-200 transition-colors hover:bg-neutral-700">
              <ArrowLeft className="h-4 w-4" /> Presentación
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Presentation className="h-5 w-5 text-indigo-400" />
                <h1 className="text-lg font-black">Flipchart de clase</h1>
              </div>
              <p className="text-xs font-semibold text-neutral-400">Presentación del maestro como libro proyectable</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black", remasterBadgeStyle)}>
              {isApproved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              {remasterStatusLabel}
            </span>
            <button type="button" onClick={() => setQualityMode((mode) => (mode === "projection" ? "source" : "projection"))} className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-black text-white transition hover:bg-indigo-500">
              {qualityMode === "projection" ? "Modo proyección" : "Escaneo original"}
            </button>
            <button onClick={toggleFullscreen} className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-4 py-2 text-sm font-black text-neutral-200 transition-colors hover:bg-neutral-700">
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              {isFullscreen ? "Salir" : "Proyectar"}
            </button>
          </div>
        </header>
      )}

      <main className="group relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.20),transparent_40%),linear-gradient(135deg,#030303,#171717_55%,#050505)] p-3 md:p-8">
        <button onClick={goPrev} disabled={currentPage === 1} className="absolute left-4 top-1/2 z-20 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity hover:bg-black/65 disabled:opacity-0 group-hover:opacity-100" aria-label="Página anterior">
          <ChevronLeft className="h-10 w-10" />
        </button>

        <button onClick={goNext} disabled={currentPage === totalPages} className="absolute right-4 top-1/2 z-20 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity hover:bg-black/65 disabled:opacity-0 group-hover:opacity-100" aria-label="Página siguiente">
          <ChevronRight className="h-10 w-10" />
        </button>

        <div className="relative flex h-full w-full items-center justify-center [perspective:1900px]">
          <div className="absolute inset-x-[10%] bottom-4 h-12 rounded-full bg-black/60 blur-3xl" />
          <div className="pointer-events-none absolute inset-y-[7%] left-1/2 z-10 w-14 -translate-x-1/2 rounded-full bg-gradient-to-r from-black/25 via-black/10 to-transparent blur-lg" />
          <img
            src={displayPath}
            alt={`Página ${currentData.flipchartPage} del flipchart`}
            className="relative max-h-full max-w-full rounded-xl object-contain shadow-[0_36px_110px_rgba(0,0,0,0.62),0_8px_18px_rgba(0,0,0,0.35)] ring-1 ring-white/12 [transform:translateZ(0)]"
            decoding="async"
            loading="eager"
            fetchPriority="high"
            onError={() => {
              if (displayPath !== originalPath) setFallbackPath(originalPath);
            }}
          />
        </div>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/60 px-4 py-2 text-sm font-black tracking-widest text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
          <span>{currentPage} / {totalPages}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2 py-0.5 text-[10px] tracking-normal">
            <Clock className="h-3 w-3" /> Q cambia calidad
          </span>
        </div>
      </main>
    </div>
  );
}
