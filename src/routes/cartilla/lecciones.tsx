import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { getFullWorkbookPages } from "@/lib/book-faithful";
import { getCartillaCrmCssVars, getCartillaCrmTheme } from "@/lib/cartilla-crm-theme";
import { useStudentSession } from "@/lib/student-session";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cartilla/lecciones")({
  component: ContinuousWorkbookReader,
});

function ContinuousWorkbookReader() {
  const session = useStudentSession();
  const pages = getFullWorkbookPages();
  const totalPages = pages.length;

  const [pageIndex, setPageIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate last-page from localStorage
  useEffect(() => {
    let initialPage = 0;
    const localLast = localStorage.getItem("cartilla:workbook:lastPage");
    if (localLast) {
      const p = parseInt(localLast, 10);
      if (!isNaN(p) && p >= 0 && p < totalPages) initialPage = p;
    }
    setPageIndex(initialPage);
    setIsLoaded(true);
  }, [totalPages]);

  // Persist page on change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("cartilla:workbook:lastPage", pageIndex.toString());
    if (session && isSupabaseConfigured) {
      supabase
        .from("students")
        // @ts-expect-error - cartilla_workbook_page column may not exist yet; localStorage is the source of truth
        .update({ cartilla_workbook_page: pageIndex })
        .eq("id", session.studentId);
    }
  }, [pageIndex, session, isLoaded]);

  // Preload next 2 scans for snappy flipping
  useEffect(() => {
    for (let i = 1; i <= 2; i++) {
      const nextRef = pages[pageIndex + i]?.imageScanReference;
      if (nextRef) {
        const img = new Image();
        img.src = "/" + nextRef;
      }
    }
  }, [pageIndex, pages]);

  if (!isLoaded) return null;

  const activePage = pages[pageIndex];
  if (!activePage) return null;

  const cssVars = getCartillaCrmCssVars(activePage.lesson);
  const theme = getCartillaCrmTheme(activePage.lesson);

  const rootStyle: CSSProperties = {
    ...cssVars,
    background: theme.studentBackdrop,
    color: theme.titleInk,
  };
  const inkStyle: CSSProperties = { color: theme.titleInk };
  const accentStyle: CSSProperties = { backgroundColor: theme.accent, color: "#ffffff" };
  const paperCardStyle: CSSProperties = {
    backgroundColor: theme.pagePaper,
    border: `1px solid ${theme.border}`,
  };
  const dashedPlaceholderStyle: CSSProperties = {
    borderColor: theme.border,
    color: theme.titleInk,
  };
  const secondaryButtonStyle: CSSProperties = {
    backgroundColor: theme.accentSoft,
    color: theme.titleInk,
  };
  const navStyle: CSSProperties = {
    backgroundColor: theme.pagePaper,
    borderTopColor: theme.border,
    color: theme.titleInk,
  };
  const headerStyle: CSSProperties = { borderBottom: `4px solid ${theme.accent}` };
  const progressBarStyle: CSSProperties = {
    width: `${Math.round(((pageIndex + 1) / totalPages) * 100)}%`,
    backgroundColor: theme.accent,
  };

  const goPrev = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  const goNext = () => {
    if (pageIndex < totalPages - 1) setPageIndex(pageIndex + 1);
  };

  const handleLessonJump = (lessonStr: string) => {
    const l = Number(lessonStr);
    const idx = pages.findIndex((p) => p.lesson === l);
    if (idx !== -1) setPageIndex(idx);
  };

  return (
    <div
      className="flex flex-col min-h-screen transition-colors duration-500"
      style={rootStyle}
    >
      <header
        className="flex-none p-4 shadow-sm bg-white/80 backdrop-blur"
        style={headerStyle}
      >
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/cartilla"
            className="flex items-center gap-1 text-sm font-bold opacity-70 hover:opacity-100 transition"
            style={inkStyle}
          >
            <ArrowLeft className="w-4 h-4" /> Inicio
          </Link>
          <div className="flex items-center gap-4">
            <select
              value={activePage.lesson}
              onChange={(e) => handleLessonJump(e.target.value)}
              className="border-0 rounded-full px-4 py-1.5 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 appearance-none cursor-pointer"
              style={accentStyle}
              aria-label="Salta a la lección"
            >
              {CATALOG.map((c) => (
                <option key={c.n} value={c.n}>
                  Lección {c.n} — {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-[720px] flex-1 flex flex-col items-center justify-center min-h-[50vh]">
          <div
            className="w-full rounded-[2rem] p-4 sm:p-8 shadow-2xl flex flex-col items-center justify-center transition-colors duration-500"
            style={paperCardStyle}
          >
            {activePage.imageScanReference ? (
              <img
                src={"/" + activePage.imageScanReference}
                loading="lazy"
                alt={`Página ${activePage.page}`}
                className="w-full max-h-[75vh] object-contain rounded-md shadow-md ring-1 ring-black/5"
              />
            ) : (
              <div
                className="py-24 px-8 text-center border-2 border-dashed rounded-2xl w-full"
                style={dashedPlaceholderStyle}
              >
                <h2 className="text-xl font-bold opacity-60" style={inkStyle}>
                  Página {activePage.page} · escaneo pendiente
                </h2>
              </div>
            )}
          </div>
        </div>
      </main>

      <nav
        className="sticky bottom-0 w-full p-4 border-t shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md"
        style={navStyle}
      >
        <div className="max-w-[720px] mx-auto">
          <div className="flex justify-between items-center mb-3">
            <span
              className="text-xs font-black uppercase tracking-widest opacity-60"
              style={inkStyle}
            >
              Página {pageIndex + 1} de {totalPages}
            </span>
            <span
              className="text-xs font-black uppercase tracking-widest opacity-60"
              style={inkStyle}
            >
              {activePage.section}
            </span>
          </div>
          <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden mb-4">
            <div className="h-full transition-all duration-300" style={progressBarStyle} />
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={pageIndex === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              style={secondaryButtonStyle}
            >
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>

            <button
              onClick={goNext}
              disabled={pageIndex === totalPages - 1}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition-transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              style={accentStyle}
            >
              Siguiente
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
