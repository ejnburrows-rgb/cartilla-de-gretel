import { useState, useEffect } from "react";
import { Link, createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { getCartillaCrmCssVars, getCartillaCrmTheme } from "@/lib/cartilla-crm-theme";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { useLessonProgress } from "@/lib/lesson-progress";

export const Route = createFileRoute("/cartilla/leccion/$n")({
  component: LeccionScanRoute,
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
  },
});

function LeccionScanRoute() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const n = Number(nParam);
  
  const entry = CATALOG.find((e) => e.n === n);
  const pages = getWorkbookPagesForLesson(n);
  const { markCompleted } = useLessonProgress();
  
  const [pageIndex, setPageIndex] = useState(0);

  // Reset page index when lesson changes
  useEffect(() => {
    setPageIndex(0);
  }, [n]);

  if (!entry) return null;

  const totalPages = pages.length;
  const activePage = pages[pageIndex];

  const goNext = () => {
    if (pageIndex < totalPages - 1) {
      setPageIndex((p) => p + 1);
    } else {
      markCompleted(n);
      if (n < TOTAL_LESSONS) {
        navigate({ to: "/cartilla/leccion/$n", params: { n: String(n + 1) } });
      } else {
        navigate({ to: "/cartilla/lecciones" });
      }
    }
  };

  const goPrev = () => {
    if (pageIndex > 0) {
      setPageIndex((p) => p - 1);
    } else {
      if (n > 1) {
        navigate({ to: "/cartilla/leccion/$n", params: { n: String(n - 1) } });
      } else {
        navigate({ to: "/cartilla/lecciones" });
      }
    }
  };

  const cssVars = getCartillaCrmCssVars(n);

  return (
    <div 
      className="flex flex-col min-h-screen" 
      style={{ ...cssVars, background: "var(--cartilla-student-backdrop)" }}
    >
      {/* Top bar */}
      <header className="flex-none p-4 shadow-sm" style={{ borderBottom: `4px solid var(--cartilla-accent)`, backgroundColor: "white" }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/cartilla/lecciones"
              className="flex items-center gap-1 text-sm font-bold opacity-70 hover:opacity-100 transition"
              style={{ color: "var(--cartilla-title-ink)" }}
            >
              <ArrowLeft className="w-4 h-4" /> Índice
            </Link>
            <div>
              <h1 className="text-xl font-black leading-none" style={{ color: "var(--cartilla-title-ink)" }}>
                {entry.title}
              </h1>
              {entry.subtitle && (
                <p className="text-sm font-semibold opacity-70 mt-1" style={{ color: "var(--cartilla-title-ink)" }}>
                  {entry.subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-full text-sm font-bold text-white shadow-sm" style={{ backgroundColor: "var(--cartilla-accent)" }}>
            Lección {n} de {TOTAL_LESSONS}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8 flex flex-col items-center">
        {/* Jump to lesson select */}
        <div className="mb-6 self-start sm:self-center">
          <select 
            value={n} 
            onChange={(e) => navigate({ to: "/cartilla/leccion/$n", params: { n: e.target.value } })}
            className="bg-white border rounded-md px-3 py-1.5 text-sm font-bold shadow-sm focus:outline-none focus:ring-2"
            style={{ color: "var(--cartilla-title-ink)", borderColor: "var(--cartilla-accent)" }}
          >
            {CATALOG.map((item) => (
              <option key={item.n} value={item.n}>Lección {item.n}: {item.title}</option>
            ))}
          </select>
        </div>

        {/* Active Page Card */}
        <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[50vh]">
          {activePage ? (
            <div className="w-full max-w-[860px] mx-auto rounded-[2rem] p-4 sm:p-8 shadow-2xl flex flex-col items-center gap-6" style={{ backgroundColor: "var(--cartilla-page-paper)" }}>
              {activePage.imageScanReference ? (
                <div className="w-full flex flex-col items-center">
                  <img 
                    src={"/" + activePage.imageScanReference} 
                    loading="lazy" 
                    alt={`Página ${activePage.pageNumber}`}
                    className="max-w-full max-h-[70vh] object-contain rounded-md shadow-md ring-1 ring-black/5"
                  />
                  {activePage.verifiedTextBlocks.length > 0 && (
                    <div className="mt-6 w-full text-center max-w-2xl">
                      {activePage.verifiedTextBlocks.map((block, i) => (
                        <p key={i} className="text-sm sm:text-base font-medium opacity-60 mb-2 leading-relaxed" style={{ color: "var(--cartilla-title-ink)" }}>
                          {block}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-24 px-8 text-center border-2 border-dashed rounded-2xl" style={{ borderColor: "var(--cartilla-accent)" }}>
                  <h2 className="text-xl font-bold opacity-50" style={{ color: "var(--cartilla-title-ink)" }}>
                    Página {activePage.pageNumber} · escaneo pendiente
                  </h2>
                </div>
              )}
            </div>
          ) : (
             <div className="text-center opacity-50 font-bold" style={{ color: "var(--cartilla-title-ink)" }}>
               No hay páginas para esta lección.
             </div>
          )}
        </div>
      </main>

      {/* Sticky Bottom Nav */}
      <nav className="sticky bottom-0 w-full p-4 border-t shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md" style={{ backgroundColor: "rgba(255, 255, 255, 0.85)", borderColor: "var(--cartilla-accent)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={goPrev}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold shadow-sm transition-transform active:scale-95"
            style={{ backgroundColor: "var(--cartilla-page-paper)", color: "var(--cartilla-title-ink)" }}
          >
            <ChevronLeft className="w-5 h-5" /> 
            {pageIndex === 0 ? (n > 1 ? "← Lección anterior" : "← Índice") : "Página anterior"}
          </button>

          <div className="hidden sm:block text-sm font-black opacity-60 uppercase tracking-widest" style={{ color: "var(--cartilla-title-ink)" }}>
            {totalPages > 0 ? `Página ${pageIndex + 1} de ${totalPages}` : ""}
          </div>

          <button
            onClick={goNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-transform active:scale-95"
            style={{ backgroundColor: "var(--cartilla-accent)" }}
          >
            {pageIndex === totalPages - 1 ? "Siguiente lección →" : "Página siguiente"} 
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </div>
  );
}
