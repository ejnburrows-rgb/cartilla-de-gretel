import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { Link, createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { getCartillaCrmCssVars, getCartillaCrmTheme } from "@/lib/cartilla-crm-theme";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { useLessonProgress } from "@/lib/lesson-progress";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { StudentExercisePane } from "@/components/cartilla/StudentExercisePane";

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
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    setPageIndex(0);
  }, [n]);

  const cssVars = getCartillaCrmCssVars(n);
  const theme = getCartillaCrmTheme(n);

  const rootStyle: CSSProperties = { ...cssVars, color: theme.titleInk };
  const headerStyle: CSSProperties = {
    backgroundColor: "rgba(255, 250, 232, 0.85)",
    borderBottom: `4px solid ${theme.accent}`,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };
  const inkStyle: CSSProperties = { color: theme.titleInk };
  const accentStyle: CSSProperties = { backgroundColor: theme.accent, color: "#ffffff" };
  const selectStyle: CSSProperties = { borderColor: theme.border, color: theme.titleInk };
  const navStyle: CSSProperties = {
    backgroundColor: "rgba(255, 250, 232, 0.92)",
    borderTopColor: theme.border,
    color: theme.titleInk,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };
  const secondaryButtonStyle: CSSProperties = {
    backgroundColor: theme.accentSoft,
    color: theme.titleInk,
  };

  if (!entry) return null;

  const totalPages = pages.length;
  const activePage = pages[pageIndex];

  const flip = (direction: "next" | "prev") => {
    if (isFlipping) return;
    setIsFlipping(true);
    window.setTimeout(() => {
      if (direction === "next") {
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
      } else {
        if (pageIndex > 0) {
          setPageIndex((p) => p - 1);
        } else if (n > 1) {
          navigate({ to: "/cartilla/leccion/$n", params: { n: String(n - 1) } });
        } else {
          navigate({ to: "/cartilla/lecciones" });
        }
      }
      window.setTimeout(() => setIsFlipping(false), 50);
    }, 160);
  };

  return (
    <div className="flex flex-col min-h-screen cartilla-student-shell" style={rootStyle}>
      <header className="flex-none p-4 shadow-sm" style={headerStyle}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/cartilla/lecciones"
              className="flex items-center gap-1 text-sm font-bold opacity-70 hover:opacity-100 transition"
              style={inkStyle}
            >
              <ArrowLeft className="w-4 h-4" /> Índice
            </Link>
            <div>
              <h1 className="text-xl font-black leading-none" style={inkStyle}>
                {entry.title}
              </h1>
              {entry.subtitle && (
                <p className="text-sm font-semibold opacity-70 mt-1" style={inkStyle}>
                  {entry.subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-full text-sm font-bold shadow-sm" style={accentStyle}>
            Lección {n} de {TOTAL_LESSONS}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start sm:self-center">
          <select
            value={n}
            onChange={(e) =>
              navigate({ to: "/cartilla/leccion/$n", params: { n: e.target.value } })
            }
            className="bg-white border rounded-md px-3 py-1.5 text-sm font-bold shadow-sm focus:outline-none focus:ring-2"
            style={selectStyle}
            aria-label="Saltar a otra lección"
          >
            {CATALOG.map((item) => (
              <option key={item.n} value={item.n}>
                Lección {item.n}: {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full flex flex-col items-stretch">
          {activePage ? (
            <div
              className={`w-full transition-opacity duration-150 ${
                isFlipping ? "opacity-0 scale-[0.985]" : "opacity-100 scale-100"
              }`}
            >
              <PdfPage pageNumber={activePage.pageNumber} />
            </div>
          ) : (
            <div className="text-center opacity-50 font-bold" style={inkStyle}>
              No hay páginas para esta lección.
            </div>
          )}

          <StudentExercisePane entry={entry} />
        </div>
      </main>

      <nav
        className="sticky bottom-0 w-full p-4 border-t shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
        style={navStyle}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => flip("prev")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold shadow-sm transition-transform active:scale-95"
            style={secondaryButtonStyle}
          >
            <ChevronLeft className="w-5 h-5" />
            {pageIndex === 0 ? (n > 1 ? "← Lección anterior" : "← Índice") : "Página anterior"}
          </button>

          <div
            className="hidden sm:block text-sm font-black opacity-60 uppercase tracking-widest"
            style={inkStyle}
          >
            {totalPages > 0 ? `Página ${pageIndex + 1} de ${totalPages}` : ""}
          </div>

          <button
            onClick={() => flip("next")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition-transform active:scale-95"
            style={accentStyle}
          >
            {pageIndex === totalPages - 1 ? "Siguiente lección →" : "Página siguiente"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </div>
  );
}
