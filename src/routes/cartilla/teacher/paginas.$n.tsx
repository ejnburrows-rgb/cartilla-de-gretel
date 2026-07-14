import React, { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Maximize, Minimize, X, BookOpen, ScanLine } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { getLessonPageNumbers } from "@/lib/cartilla-crm-theme";
import { TeacherNoteField } from "@/components/teacher/TeacherNoteField";
import { FaithfulPageRenderer } from "@/components/cartilla/FaithfulPageRenderer";

export const Route = createFileRoute("/cartilla/teacher/paginas/$n")({
  component: PaginasLeccion,
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/teacher" });
    }
  },
});

function PaginasLeccion() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const n = Number(nParam);

  const catalogEntry = useMemo(() => CATALOG.find((e) => e.n === n), [n]);
  const globalPageNumbers = useMemo(
    () => (catalogEntry ? getLessonPageNumbers(catalogEntry.pages) : []),
    [catalogEntry],
  );

  const [pageIndex, setPageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Reset to first page when lesson changes
  useEffect(() => {
    setPageIndex(0);
  }, [n]);

  const currentGlobalPage = globalPageNumbers[pageIndex] ?? globalPageNumbers[0] ?? 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "f") toggleFullscreen();
      if (e.key === "t") setSidebarOpen((prev) => !prev);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, pageIndex, globalPageNumbers]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const goNext = () => {
    if (pageIndex < globalPageNumbers.length - 1) {
      setPageIndex((i) => i + 1);
    } else if (n < CATALOG.length) {
      navigate({ to: "/cartilla/teacher/paginas/$n", params: { n: String(n + 1) } });
    }
  };

  const goPrev = () => {
    if (pageIndex > 0) {
      setPageIndex((i) => i - 1);
    } else if (n > 1) {
      navigate({ to: "/cartilla/teacher/paginas/$n", params: { n: String(n - 1) } });
    }
  };

  if (globalPageNumbers.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-stone-900 flex flex-col md:flex-row overflow-hidden font-display select-none">
      <main className="flex-1 relative flex items-center justify-center bg-[#1a1a1a]">
        <div
          className="relative h-[85vh] max-w-full shadow-2xl overflow-hidden rounded-sm"
          style={{ aspectRatio: "612 / 792" }}
        >
          <FaithfulPageRenderer pageNumber={currentGlobalPage} lessonNumber={n} />
        </div>

        {/* Overlay controls */}
        <div className="absolute top-4 left-4 flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity z-50">
          <Link
            to="/cartilla/teacher/guia/$n"
            params={{ n: String(n) }}
            className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-700"
            title="Volver a la guía de esta lección"
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
            className={`flex items-center gap-2 px-4 py-3 font-bold rounded-full transition-colors ${
              sidebarOpen ? "bg-orange-500 text-white" : "bg-stone-800 text-white hover:bg-stone-700"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="hidden md:inline">Notas (T)</span>
          </button>
        </div>

        {/* Switch to original scans */}
        <div className="absolute top-20 right-4 z-50">
          <Link
            to="/cartilla/presentar/$n"
            params={{ n: String(n) }}
            className="flex items-center gap-2 px-4 py-3 bg-stone-800/80 hover:bg-stone-700 text-white font-bold rounded-full transition-colors text-sm"
            title="Ver los escaneos originales del libro"
          >
            <ScanLine className="w-5 h-5" />
            <span className="hidden md:inline">Ver escaneos originales</span>
          </Link>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goPrev}
          disabled={n <= 1 && pageIndex === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/30 hover:bg-black/60 disabled:opacity-20 text-white rounded-full transition-colors z-50"
        >
          <ArrowLeft className="w-10 h-10" />
        </button>
        <button
          onClick={goNext}
          disabled={n >= CATALOG.length && pageIndex === globalPageNumbers.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/30 hover:bg-black/60 disabled:opacity-20 text-white rounded-full transition-colors z-50"
        >
          <ArrowRight className="w-10 h-10" />
        </button>

        {/* Page indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white font-bold rounded-full text-sm z-50">
          Lección {n} — Pág. {pageIndex + 1} / {globalPageNumbers.length} (página {currentGlobalPage} del libro)
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
