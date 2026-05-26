import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import type { CSSProperties } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { getFullWorkbookPages } from "@/lib/book-faithful";
import { getCartillaCrmCssVars, getCartillaCrmTheme } from "@/lib/cartilla-crm-theme";
import { useStudentSession } from "@/lib/student-session";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { StudentExercisePane } from "@/components/cartilla/StudentExercisePane";

export const Route = createFileRoute("/cartilla/lecciones")({
  component: ContinuousWorkbookReader,
});

function ContinuousWorkbookReader() {
  const session = useStudentSession();
  const pages = getFullWorkbookPages();
  const totalPages = pages.length;

  const [pageIndex, setPageIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

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

  const activePage = pages[pageIndex];
  const lessonEntry = useMemo(
    () => (activePage ? CATALOG.find((c) => c.n === activePage.lesson) : undefined),
    [activePage],
  );

  if (!isLoaded) return null;
  if (!activePage) return null;

  const cssVars = getCartillaCrmCssVars(activePage.lesson);
  const theme = getCartillaCrmTheme(activePage.lesson);

  const rootStyle: CSSProperties = { ...cssVars, color: theme.titleInk };
  const inkStyle: CSSProperties = { color: theme.titleInk };
  const accentStyle: CSSProperties = { backgroundColor: theme.accent, color: "#ffffff" };
  const secondaryButtonStyle: CSSProperties = {
    backgroundColor: theme.accentSoft,
    color: theme.titleInk,
  };
  const navStyle: CSSProperties = {
    backgroundColor: "rgba(255, 250, 232, 0.92)",
    borderTopColor: theme.border,
    color: theme.titleInk,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };
  const headerStyle: CSSProperties = {
    backgroundColor: "rgba(255, 250, 232, 0.85)",
    borderBottom: `4px solid ${theme.accent}`,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };
  const progressBarStyle: CSSProperties = {
    width: `${Math.round(((pageIndex + 1) / totalPages) * 100)}%`,
    backgroundColor: theme.accent,
  };

  const flip = (direction: "next" | "prev") => {
    if (isFlipping) return;
    if (direction === "next" && pageIndex >= totalPages - 1) return;
    if (direction === "prev" && pageIndex <= 0) return;
    setIsFlipping(true);
    window.setTimeout(() => {
      setPageIndex((p) => p + (direction === "next" ? 1 : -1));
      window.setTimeout(() => setIsFlipping(false), 50);
    }, 160);
  };

  const handleLessonJump = (lessonStr: string) => {
    const l = Number(lessonStr);
    const idx = pages.findIndex((p) => p.lesson === l);
    if (idx !== -1) setPageIndex(idx);
  };

  return (
    <div
      className="flex flex-col min-h-screen cartilla-student-shell transition-colors duration-500"
      style={rootStyle}
    >
      <header className="flex-none p-4 shadow-sm" style={headerStyle}>
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

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-8 flex flex-col items-stretch">
        <div className="w-full">
          <div
            className={`w-full transition-opacity duration-150 ${
              isFlipping ? "opacity-0 scale-[0.985]" : "opacity-100 scale-100"
            }`}
          >
            <PdfPage pageNumber={activePage.page} />
          </div>

          {lessonEntry ? (
            <StudentExercisePane key={lessonEntry.n} entry={lessonEntry} />
          ) : null}
        </div>
      </main>

      <nav
        className="sticky bottom-0 w-full p-4 border-t shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
        style={navStyle}
      >
        <div className="max-w-[760px] mx-auto">
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
              onClick={() => flip("prev")}
              disabled={pageIndex === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              style={secondaryButtonStyle}
            >
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>

            <button
              onClick={() => flip("next")}
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
