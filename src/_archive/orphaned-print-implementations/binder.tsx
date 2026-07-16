import { useState } from "react";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";
import { BinderCover } from "@/components/print/BinderCover";
import { BinderTOC } from "@/components/print/BinderTOC";
import { LessonBinderSheet } from "@/components/print/LessonBinderSheet";
import { exportBinderToPdf } from "@/lib/binder-export";
import { ArrowLeft, CheckSquare, Printer, Square } from "lucide-react";
import "@/styles/cartilla-student.css";
import "@/styles/print.css";

export const Route = createFileRoute("/cartilla/binder")({
  component: TeacherBinderLayout,
  head: () => ({
    meta: [
      { title: "Carpeta del Maestro (PDF) — La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "Generador de binder de clase: páginas de texto, solucionario y hojas de trabajo en Letter.",
      },
    ],
  }),
});

const binderContainerStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#fdfcfa",
  display: "flex",
  flexDirection: "column",
  padding: "1.5rem",
  maxWidth: "1080px",
  margin: "0 auto",
  width: "100%",
};

const pageHeaderStyle: React.CSSProperties = {
  marginBottom: "1.5rem",
};

const actionBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#ffffff",
  padding: "1rem",
  borderRadius: "1.25rem",
  border: "2px solid #ecdac3",
  marginBottom: "1.5rem",
  flexWrap: "wrap",
  gap: "1rem",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)",
};

const cardGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
  gap: "0.85rem",
  marginTop: "0.5rem",
  marginBottom: "2rem",
};

const lessonCardStyle = (color: string, isSelected: boolean): React.CSSProperties => ({
  backgroundColor: "#ffffff",
  border: isSelected ? `2.5px solid ${color}` : "2px solid #e7e5e4",
  borderRadius: "1.1rem",
  padding: "0.85rem",
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  cursor: "pointer",
  transition: "all 0.15s ease",
  boxShadow: isSelected ? `${color}15 0px 4px 12px` : "none",
  userSelect: "none",
});

const checkWrapperStyle = (color: string, isSelected: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: isSelected ? color : "#a8a29e",
});

const exportBtnStyle = (disabled: boolean): React.CSSProperties => ({
  backgroundColor: disabled ? "#a8a29e" : "#78350f",
  color: "#ffffff",
  padding: "0.75rem 1.5rem",
  borderRadius: "1rem",
  fontWeight: "bold",
  fontSize: "0.85rem",
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  boxShadow: disabled ? "none" : "0 4px 12px rgba(120, 53, 15, 0.2)",
  transition: "all 0.1s ease",
});

const outlineBtnStyle: React.CSSProperties = {
  border: "2px solid #e7e5e4",
  backgroundColor: "#ffffff",
  padding: "0.5rem 1rem",
  borderRadius: "0.75rem",
  fontWeight: "bold",
  fontSize: "0.75rem",
  color: "#57534e",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  transition: "all 0.1s ease",
};

function getPagesArray(pagesStr: string): number[] {
  const parts = pagesStr.split("-").map(Number);
  const from = parts[0] || 1;
  const to = parts[1] || from;
  const pages: number[] = [];
  for (let i = from; i <= to; i += 1) {
    pages.push(i);
  }
  return pages;
}

export function TeacherBinderLayout() {
  const location = useLocation();
  const isIndex =
    location.pathname === "/cartilla/binder" || location.pathname === "/cartilla/binder/";

  if (!isIndex) {
    return <Outlet />;
  }

  return <TeacherBinderDashboard />;
}

export function TeacherBinderDashboard() {
  const [selectedLessons, setSelectedLessons] = useState<Set<number>>(new Set([7]));

  const handleToggleLesson = (n: number) => {
    setSelectedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(n)) {
        next.delete(n);
      } else {
        next.add(n);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedLessons(new Set(CATALOG.map((entry) => entry.n)));
  };

  const handleDeselectAll = () => {
    setSelectedLessons(new Set());
  };

  const handleExport = () => {
    if (selectedLessons.size === 0) return;
    exportBinderToPdf();
  };

  const isAllSelected = selectedLessons.size === CATALOG.length;
  const hasSelection = selectedLessons.size > 0;

  return (
    <div style={binderContainerStyle}>
      <div className="no-print">
        <header style={pageHeaderStyle}>
          <Link
            to="/cartilla/lecciones"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-900 hover:text-amber-700 mb-4 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200/50"
          >
            <ArrowLeft className="w-4 h-4" /> Panel de Lecciones
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-amber-950">
            Carpeta del Maestro
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Selecciona las lecciones de la Cartilla que deseas exportar. El sistema compilará un
            cuaderno en tamaño Carta listo para imprimir que incluye la portada del docente, el
            índice del cuaderno, y para cada lección seleccionada: la página original, la hoja de
            respuestas detallada, una ficha de ejercicios y el talón de tarea escolar para padres.
          </p>
        </header>

        <div style={actionBarStyle}>
          <div className="flex items-center gap-2">
            <button
              onClick={isAllSelected ? handleDeselectAll : handleSelectAll}
              style={outlineBtnStyle}
              aria-label="Alternar selección de todas las lecciones"
            >
              <CheckSquare className="w-4 h-4" />
              {isAllSelected ? "Deseleccionar todo" : "Seleccionar todo"}
            </button>
            {hasSelection && !isAllSelected && (
              <button onClick={handleDeselectAll} style={outlineBtnStyle}>
                Deseleccionar todo
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-stone-600 font-mono">
              {selectedLessons.size} lección(es) seleccionada(s)
            </span>
            <button
              onClick={handleExport}
              disabled={!hasSelection}
              style={exportBtnStyle(!hasSelection)}
              aria-label="Exportar material en PDF"
            >
              <Printer className="w-4 h-4 fill-white" />
              Imprimir Binder
            </button>
          </div>
        </div>

        <main style={cardGridStyle}>
          {CATALOG.map((entry) => {
            const isSelected = selectedLessons.has(entry.n);
            const accent = entry.color;
            const cardStyle = lessonCardStyle(accent, isSelected);
            const chkStyle = checkWrapperStyle(accent, isSelected);

            return (
              <div
                key={entry.n}
                style={cardStyle}
                onClick={() => handleToggleLesson(entry.n)}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    handleToggleLesson(entry.n);
                  }
                }}
                className="hover:scale-[1.01] hover:shadow-sm"
              >
                <div style={chkStyle}>
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Lección {entry.n}
                    </span>
                    <span className="text-[9px] font-bold text-stone-400 font-mono">
                      p. {entry.pages}
                    </span>
                  </div>
                  <h3
                    className="text-xs font-bold text-stone-850 truncate mt-0.5"
                    title={entry.title}
                  >
                    {entry.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </main>
      </div>

      <div className="print-only-container">
        <BinderCover />
        <BinderTOC />
        {CATALOG.filter((entry) => selectedLessons.has(entry.n)).map((entry) => {
          const pages = getPagesArray(entry.pages);
          return pages.map((pageNumber) => (
            <LessonBinderSheet
              key={`${entry.n}-${pageNumber}`}
              entry={entry}
              pageNumber={pageNumber}
            />
          ));
        })}
      </div>
    </div>
  );
}
