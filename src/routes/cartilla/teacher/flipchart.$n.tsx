import React, { useEffect, useState, useMemo, Suspense } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Maximize, Minimize, X, BookOpen } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { TeacherNoteField } from "@/components/teacher/TeacherNoteField";
import { getLesson } from "@/content/lesson-meta";
import { wordsForLesson } from "@/content/word-bank";
import { InteractiveFlipchartOverlay } from "@/components/cartilla/InteractiveFlipchartOverlay";

const LazyFlipbookViewer = React.lazy(() =>
  import("@/components/cartilla/FlipbookVerticalViewer").then((module) => ({ default: module.FlipbookVerticalViewer }))
);

export const Route = createFileRoute("/cartilla/teacher/flipchart/$n")({
  component: FlipchartLeccion,
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/teacher/flipchart" });
    }
  },
});

function FlipchartLeccion() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const n = Number(nParam);
  
  const lesson = getLesson(n);
  const words = wordsForLesson(n);

  const initialPage = useMemo(() => {
    if (!lesson) return 1;
    const parts = lesson.pages.split("-").map(Number);
    return parts[0] || 1;
  }, [lesson]);

  const lastPage = useMemo(() => {
    if (!lesson) return 1;
    const parts = lesson.pages.split("-").map(Number);
    return parts[1] || parts[0] || 1;
  }, [lesson]);

  const [page, setPage] = useState(initialPage);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Reset page when lesson changes
  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "f") toggleFullscreen();
      if (e.key === "t") setSidebarOpen(prev => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [n, page, lastPage]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const goNext = () => {
    if (page < lastPage) {
      setPage(p => p + 1);
    } else if (n < CATALOG.length) {
      navigate({ to: "/cartilla/teacher/flipchart/$n", params: { n: String(n + 1) } });
    }
  };

  const goPrev = () => {
    if (page > initialPage) {
      setPage(p => p - 1);
    } else if (n > 1) {
      navigate({ to: "/cartilla/teacher/flipchart/$n", params: { n: String(n - 1) } });
    }
  };

  if (!lesson) return null;

  return (
    <div className="fixed inset-0 bg-stone-900 flex flex-col md:flex-row overflow-hidden font-display select-none">
      <main className="flex-1 relative flex items-center justify-center bg-[#1a1a1a]">
        
        {/* The 100% Faithful Flipchart Viewer */}
        <div className="relative w-full max-w-4xl h-[85vh] shadow-2xl flex items-center justify-center bg-black/20">
          <Suspense
            fallback={
              <div className="text-white/60 font-bold text-sm" aria-busy="true">
                Cargando rotafolio original…
              </div>
            }
          >
            <LazyFlipbookViewer pageNumber={page} className="w-full h-full" />
          </Suspense>
          
          {/* Interactive Overlay to bring cropped figures to life */}
          <InteractiveFlipchartOverlay pageNumber={page} words={words} />
        </div>

        {/* Overlay controls */}
        <div className="absolute top-4 left-4 flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity z-50">
          <Link to="/cartilla/teacher/flipchart" className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-700" title="Volver al selector">
            <X className="w-6 h-6" />
          </Link>
          <button onClick={toggleFullscreen} className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-700" title="Pantalla Completa (F)">
            {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`flex items-center gap-2 px-4 py-3 font-bold rounded-full transition-colors ${sidebarOpen ? 'bg-orange-500 text-white' : 'bg-stone-800 text-white hover:bg-stone-700'}`}>
            <BookOpen className="w-5 h-5" />
            <span className="hidden md:inline">Notas (T)</span>
          </button>
        </div>

        {/* Navigation arrows overlay */}
        <button onClick={goPrev} disabled={n <= 1 && page === initialPage} className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/30 hover:bg-black/60 disabled:opacity-20 text-white rounded-full transition-colors z-50">
          <ArrowLeft className="w-10 h-10" />
        </button>
        
        <button onClick={goNext} disabled={n >= CATALOG.length && page === lastPage} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/30 hover:bg-black/60 disabled:opacity-20 text-white rounded-full transition-colors z-50">
          <ArrowRight className="w-10 h-10" />
        </button>
        
        {/* Page indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white font-bold rounded-full text-sm z-50">
          Lección {n} — Pág. {page}
        </div>
      </main>

      {/* Teacher Notes Sidebar */}
      {sidebarOpen && (
        <aside className="w-full md:w-96 bg-white border-l border-stone-200 flex flex-col h-full z-10 shadow-2xl">
          <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
            <h2 className="text-lg font-black text-stone-800">Notas para L{n}</h2>
            <button onClick={() => setSidebarOpen(false)} className="text-stone-400 hover:text-stone-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-[#fdfbf7]">
            <TeacherNoteField lessonId={String(n)} />
          </div>
        </aside>
      )}
    </div>
  );
}

