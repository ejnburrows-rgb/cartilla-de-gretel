import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Printer, ChevronLeft, MonitorPlay, BookOpenCheck, FolderOpen } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import "@/styles/teacher-print.css";
import { GuideLayout } from "@/content/guides/GuideLayout";

const guideModules = import.meta.glob("/src/content/guides/lesson-*.tsx", { eager: true });

export const Route = createLazyFileRoute("/cartilla/teacher/guia/$n")({
  component: TeacherGuideLeccion,
});

function TeacherGuideLeccion() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const n = Number(nParam);

  const catalogEntry = CATALOG.find((e) => e.n === n);
  const accentColor = catalogEntry?.color || "#f97316";

  const handleSelectLesson = (newN: number) => {
    navigate({ to: "/cartilla/teacher/guia/$n", params: { n: String(newN) } });
  };

  const componentKey = `/src/content/guides/lesson-${n}.tsx`;
  const mod = guideModules[componentKey] as Record<string, React.ComponentType> | undefined;
  const GuideComponent = mod ? mod[`Lesson${n}Guide`] : null;

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto min-h-[90vh] teacher-guide-page flex flex-col">
      <div className="flex flex-wrap gap-3 items-center justify-between no-print shrink-0 px-2">
        <Link
          to="/cartilla/teacher/crm"
          className="flex items-center gap-1.5 text-xs font-bold text-[var(--tc-ink-soft)] hover:text-[var(--tc-ink)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al Panel
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/cartilla/teacher/guia"
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[var(--tc-paper-soft)] text-[var(--tc-ink)] rounded-xl text-xs font-bold border border-[var(--tc-border)] transition-all"
          >
            <FolderOpen className="w-3.5 h-3.5" /> Carpetas
          </Link>
          <Link
            to="/cartilla/teacher/paginas/$n"
            params={{ n: String(n) }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[var(--tc-paper-soft)] text-[var(--tc-ink)] rounded-xl text-xs font-bold border border-[var(--tc-border)] transition-all"
          >
            <BookOpenCheck className="w-3.5 h-3.5" /> Actividades del estudiante
          </Link>
          <Link
            to="/cartilla/presentar/$n"
            params={{ n: String(n) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all"
            style={{ background: accentColor, color: "white", borderColor: accentColor }}
          >
            <MonitorPlay className="w-3.5 h-3.5" /> Presentar flipchart
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[var(--tc-paper-soft)] text-[var(--tc-ink)] rounded-xl text-sm font-bold border border-[var(--tc-border)] transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir Guía
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <GuideLayout
          selectedLesson={n}
          onSelectLesson={handleSelectLesson}
          accentColor={accentColor}
        >
          {GuideComponent ? (
            <GuideComponent />
          ) : (
            <div className="text-center py-20">
              <h2 className="text-xl font-bold text-[var(--tc-ink-faint)] mb-2">
                Archivo HTML Pendiente
              </h2>
              <p className="text-[var(--tc-ink-soft)] max-w-md mx-auto">
                La guía para la lección {n} aún no ha sido transcrita o no se encuentra el
                componente.
              </p>
            </div>
          )}
        </GuideLayout>
      </div>
    </div>
  );
}
