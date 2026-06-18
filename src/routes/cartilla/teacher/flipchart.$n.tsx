import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Maximize, Minimize, X } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { TeacherNoteField } from "@/components/teacher/TeacherNoteField";
import { getLesson } from "@/content/lesson-meta";
import { wordsForLesson } from "@/content/word-bank";
import { sentencesForLesson } from "@/content/sentence-bank";

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
  const sentences = sentencesForLesson(n);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "f") toggleFullscreen();
      if (e.key === "t") setSidebarOpen(prev => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [n]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const goNext = () => {
    if (n < CATALOG.length) {
      navigate({ to: "/cartilla/teacher/flipchart/$n", params: { n: String(n + 1) } });
    }
  };

  const goPrev = () => {
    if (n > 1) {
      navigate({ to: "/cartilla/teacher/flipchart/$n", params: { n: String(n - 1) } });
    }
  };

  if (!lesson) return null;

  return (
    <div className="fixed inset-0 bg-stone-900 flex flex-col md:flex-row overflow-hidden font-display">
      <main className="flex-1 relative flex items-center justify-center bg-[#1a1a1a]">
        
        {/* The HTML Flipchart Easel */}
        <div className="relative w-full max-w-[600px] h-[85vh] bg-[#f8f9fa] shadow-2xl rounded-sm flex flex-col transform origin-bottom border-b-[12px] border-[#2c3e50]" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          {/* Spiral Binding Simulation */}
          <div className="absolute top-[-10px] w-full flex justify-around px-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="w-3 h-8 rounded-full border-2 border-stone-400 bg-gradient-to-b from-stone-100 to-stone-300 shadow-sm z-10" style={{ transform: 'rotate(-5deg)' }} />
            ))}
          </div>

          <div className="absolute top-2 w-full flex justify-around px-4">
             {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="w-3 h-4 bg-[#1a1a1a] rounded-b-full opacity-30 z-0" />
            ))}
          </div>

          {/* Flipchart Content Canvas */}
          <div className="flex-1 mt-6 p-8 md:p-12 flex flex-col gap-8 overflow-hidden bg-white mx-2 mb-2 border border-stone-200">
            {/* Header: Letter and Syllables */}
            <div className="flex justify-between items-start border-b-2 border-red-100 pb-6">
              <h1 className="text-7xl md:text-8xl font-bold text-red-500 tracking-tight" style={{ fontFamily: '"Century Gothic", "Avant Garde", Arial, sans-serif' }}>
                {lesson.letter !== "—" ? lesson.letter : lesson.titleEs}
              </h1>
              
              {lesson.syllables.length > 0 && (
                <div className="flex flex-col gap-2 bg-stone-50 p-4 rounded-xl">
                  <div className="flex gap-4 text-3xl font-bold text-stone-700 justify-end" style={{ fontFamily: '"Century Gothic", "Avant Garde", Arial, sans-serif' }}>
                    {lesson.syllables.map(s => <span key={s}>{s}</span>)}
                  </div>
                  <div className="flex gap-4 text-2xl font-bold text-red-400 justify-end opacity-80" style={{ fontFamily: '"Century Gothic", "Avant Garde", Arial, sans-serif' }}>
                    {/* Reverse syllables slightly shifted to match the flipchart's aesthetic of repeating patterns */}
                    {lesson.syllables.slice().reverse().map(s => <span key={s+"-rev"}>{s}</span>)}
                  </div>
                </div>
              )}
            </div>

            {/* Word Lists */}
            {words.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 pt-4">
                {words.map((w, i) => (
                  <div key={i} className="text-2xl md:text-3xl text-stone-800" style={{ fontFamily: '"Century Gothic", "Avant Garde", Arial, sans-serif' }}>
                    {w}
                  </div>
                ))}
              </div>
            )}

            {/* Sentences / Poem */}
            {sentences.length > 0 && (
              <div className="mt-auto pt-8 border-t-2 border-stone-100 flex flex-col gap-4">
                {sentences.map((s, i) => (
                  <div key={i} className="text-2xl md:text-3xl text-stone-800 leading-relaxed text-center" style={{ fontFamily: '"Century Gothic", "Avant Garde", Arial, sans-serif' }}>
                    {s.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overlay controls */}
        <div className="absolute top-4 left-4 flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity z-50">
          <Link to="/cartilla/teacher/flipchart" className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-700" title="Volver al selector">
            <X className="w-6 h-6" />
          </Link>
          <button onClick={toggleFullscreen} className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-700" title="Pantalla Completa (F)">
            {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`px-4 py-2 font-bold rounded-full ${sidebarOpen ? 'bg-orange-500 text-white' : 'bg-stone-800 text-white'}`}>
            Notas (T)
          </button>
        </div>

        {/* Navigation arrows overlay */}
        <button onClick={goPrev} disabled={n <= 1} className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/30 hover:bg-black/60 disabled:opacity-20 text-white rounded-full transition-colors z-50">
          <ArrowLeft className="w-10 h-10" />
        </button>
        
        <button onClick={goNext} disabled={n >= CATALOG.length} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/30 hover:bg-black/60 disabled:opacity-20 text-white rounded-full transition-colors z-50">
          <ArrowRight className="w-10 h-10" />
        </button>
        
        {/* Page indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white font-bold rounded-full text-sm z-50">
          Lección {n} — Rotafolio
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

