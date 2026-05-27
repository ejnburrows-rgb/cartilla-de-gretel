import React, { useEffect, useState, useMemo, Suspense } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, Minimize, MousePointer, BookOpen } from "lucide-react";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { prefetchPage } from "@/components/cartilla/PdfPage";
import { CinemaPointer } from "@/components/cartilla/CinemaPointer";
import { CinemaNarrativeDrawer } from "@/components/cartilla/CinemaNarrativeDrawer";
import { useIdleVisibility } from "@/hooks/useIdleVisibility";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useSwipeNav } from "@/hooks/useSwipeNav";

// Lazy load Flipbook for performance
const LazyFlipbookViewer = React.lazy(() =>
  import("@/components/cartilla/FlipbookVerticalViewer").then((module) => ({ default: module.FlipbookVerticalViewer }))
);

export const Route = createFileRoute("/cartilla/teacher/proyectar/$n")({
  component: ProyectarLesson,
  head: ({ params }) => ({
    meta: [
      { title: `Proyección Lección ${params.n} — La Cartilla de Gretel` },
      { name: "description", content: "Modo de proyección libre de distracciones para maestros." },
    ],
  }),
});

function pageToLesson(page: number): CatalogEntry {
  for (const entry of CATALOG) {
    const parts = entry.pages.split("-").map(Number);
    const from = parts[0] ?? page;
    const to = parts[1] ?? from;
    if (page >= from && page <= to) return entry;
  }
  return CATALOG[0]!;
}

function ProyectarLesson() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const initialLessonN = Number(nParam);

  const initialEntry = useMemo(() => {
    return CATALOG.find((e) => e.n === initialLessonN) || CATALOG[0]!;
  }, [initialLessonN]);

  const initialPage = useMemo(() => {
    const parts = initialEntry.pages.split("-").map(Number);
    return parts[0] || 1;
  }, [initialEntry]);

  const [page, setPage] = useState(initialPage);
  const activeLesson = useMemo(() => pageToLesson(page), [page]);

  const [isPointerActive, setIsPointerActive] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Custom Hooks
  const isChromeVisible = useIdleVisibility(2500);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Prefetch next page silently
  useEffect(() => {
    if (page < 92) {
      prefetchPage(page + 1);
    }
  }, [page]);

  // Keyboard navigation
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => Math.min(92, p + 1));
  const firstPageOfLesson = () => {
    const parts = activeLesson.pages.split("-").map(Number);
    setPage(parts[0] || 1);
  };
  const lastPageOfLesson = () => {
    const parts = activeLesson.pages.split("-").map(Number);
    setPage(parts[1] || parts[0] || 1);
  };

  useKeyboardShortcuts({
    onPrevPage: prevPage,
    onNextPage: nextPage,
    onFirstPage: firstPageOfLesson,
    onLastPage: lastPageOfLesson,
    onToggleFullscreen: () => toggleFullscreen(),
    onToggleDrawer: () => setIsDrawerOpen((o) => !o),
    onTogglePointer: () => setIsPointerActive((a) => !a),
    onExit: () => navigate({ to: "/cartilla/leccion/$n", params: { n: String(initialLessonN) } }),
  });

  // Swipe navigation for tablets/mobile
  useSwipeNav({
    onSwipeLeft: nextPage,
    onSwipeRight: prevPage,
  });

  // Style objects (strict compliance with JSX-DOUBLE-BRACE-BAN)
  const mainStyle = {
    backgroundColor: "#0d0a06",
  };
  const headerStyle = {
    opacity: isChromeVisible ? 1 : 0,
    pointerEvents: isChromeVisible ? ("auto" as const) : ("none" as const),
    transition: "opacity 300ms ease-in-out",
  };
  const activeColorStyle = {
    color: activeLesson.color,
  };
  const btnActiveStyle = {
    backgroundColor: `${activeLesson.color}20`,
    borderColor: activeLesson.color,
    color: activeLesson.color,
  };
  const btnInactiveStyle = {
    borderColor: "rgba(255,255,255,0.15)",
    color: "rgba(255,255,255,0.7)",
  };
  const leftArrowStyle = {
    opacity: isChromeVisible && page > 1 ? 0.7 : 0,
    pointerEvents: isChromeVisible && page > 1 ? ("auto" as const) : ("none" as const),
    transition: "opacity 300ms ease-in-out",
  };
  const rightArrowStyle = {
    opacity: isChromeVisible && page < 92 ? 0.7 : 0,
    pointerEvents: isChromeVisible && page < 92 ? ("auto" as const) : ("none" as const),
    transition: "opacity 300ms ease-in-out",
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center select-none" style={mainStyle}>
      {/* Dynamic Pointer Spotlight */}
      <CinemaPointer isActive={isPointerActive} />

      {/* Narrative Drawer guide */}
      <CinemaNarrativeDrawer
        entry={activeLesson}
        isOpen={isDrawerOpen}
        onToggle={() => setIsDrawerOpen((o) => !o)}
      />

      {/* Floating Control Chrome */}
      <header
        className="absolute top-4 inset-x-4 max-w-4xl mx-auto z-40 bg-[#171412]/90 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-2xl backdrop-blur-md"
        style={headerStyle}
      >
        <div className="flex items-center gap-3">
          <Link
            to="/cartilla/student/leccion/$n"
            params={{ n: String(initialLessonN) }}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-white/80 transition"
            aria-label="Salir del modo proyección"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">
              Modo Maestro Proyector
            </span>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white">
                {activeLesson.title}
              </h1>
              <span className="text-xs font-bold" style={activeColorStyle}>
                pág. {page}
              </span>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Pointer Toggle */}
          <button
            onClick={() => setIsPointerActive((a) => !a)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer"
            style={isPointerActive ? btnActiveStyle : btnInactiveStyle}
            aria-label={isPointerActive ? "Desactivar foco" : "Activar foco (P)"}
          >
            <MousePointer className="w-4 h-4" />
            <span className="hidden sm:inline">Puntero</span>
          </button>

          {/* Drawer Toggle */}
          <button
            onClick={() => setIsDrawerOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer"
            style={isDrawerOpen ? btnActiveStyle : btnInactiveStyle}
            aria-label={isDrawerOpen ? "Cerrar guía docente" : "Abrir guía docente (N)"}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Guía</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => toggleFullscreen()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer"
            style={btnInactiveStyle}
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa (F)"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span className="hidden sm:inline">Pantalla</span>
          </button>
        </div>
      </header>

      {/* Centered PDF Viewer Section */}
      <main className="w-full h-full max-w-4xl px-6 py-24 flex items-center justify-center">
        <Suspense
          fallback={
            <div className="text-white/60 font-bold text-sm" aria-busy="true">
              Cargando página del libro…
            </div>
          }
        >
          <LazyFlipbookViewer pageNumber={page} className="w-full h-[85vh]" />
        </Suspense>
      </main>

      {/* Overlay Nav Arrow Left */}
      <button
        onClick={prevPage}
        className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/60 hover:bg-black/80 text-white/90 border border-white/10 hover:scale-105 transition cursor-pointer shadow-xl z-35"
        style={leftArrowStyle}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Overlay Nav Arrow Right */}
      <button
        onClick={nextPage}
        className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/60 hover:bg-black/80 text-white/90 border border-white/10 hover:scale-105 transition cursor-pointer shadow-xl z-35"
        style={rightArrowStyle}
        aria-label="Siguiente página"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
