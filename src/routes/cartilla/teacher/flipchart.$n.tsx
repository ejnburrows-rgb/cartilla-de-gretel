import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Maximize, Minimize, X } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { TeacherNoteField } from "@/components/teacher/TeacherNoteField";

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
  
  const workbookPages = getWorkbookPagesForLesson(n);
  const pages = workbookPages.map((p) => p.pageNumber);
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const currentPageNumber = pages[currentPageIndex] || 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "f") toggleFullscreen();
      if (e.key === "t") setSidebarOpen(prev => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [n, currentPageIndex, pages.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const goNext = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else if (n < CATALOG.length) {
      navigate({ to: "/cartilla/teacher/flipchart/$n", params: { n: String(n + 1) } });
    }
  };

  const goPrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    } else if (n > 1) {
      navigate({ to: "/cartilla/teacher/flipchart/$n", params: { n: String(n - 1) } });
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900 flex flex-col md:flex-row overflow-hidden">
      {/* Main projection area */}
      <main className="flex-1 relative flex items-center justify-center bg-black">
        {/* The book page image */}
        <img
          src={
            currentPageNumber <= 92
              ? `/art/remastered/page-${currentPageNumber}.webp`
              : `/art/hd/page-${currentPageNumber}.png`
          }
          alt={`Página ${currentPageNumber}`}
          className="max-w-full max-h-full object-contain"
        />

        {/* Overlay controls (hidden when idle/fullscreen, but for now just subtle) */}
        <div className="absolute top-4 left-4 flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
          <Link
            to="/cartilla/teacher/flipchart"
            className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-700"
            title="Volver al selector"
          >
            <X className="w-6 h-6" />
          </Link>
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-700"
            title="Pantalla Completa (F)"
          >
            {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`px-4 py-2 font-bold rounded-full ${sidebarOpen ? 'bg-orange-500 text-white' : 'bg-stone-800 text-white'}`}
          >
            Notas (T)
          </button>
        </div>

        {/* Navigation arrows overlay */}
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/30 hover:bg-black/60 text-white rounded-full transition-colors"
        >
          <ArrowLeft className="w-10 h-10" />
        </button>
        
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/30 hover:bg-black/60 text-white rounded-full transition-colors"
        >
          <ArrowRight className="w-10 h-10" />
        </button>
        
        {/* Page indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white font-bold rounded-full text-sm">
          Lección {n} — Página {currentPageNumber}
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
