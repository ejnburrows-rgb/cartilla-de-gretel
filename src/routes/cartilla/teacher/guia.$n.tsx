import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { Printer, ChevronLeft, MonitorPlay, BookOpenCheck, FolderOpen } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { GuideLayout } from "@/content/guides/GuideLayout";

// Eagerly import all guide components. Rooted at /src so keys match the
// componentKey lookup below ("/src/content/guides/lesson-N.tsx") exactly —
// the previous relative pattern produced differently-shaped keys and made
// every lesson's guide unreachable (always fell through to the "pending" state).
const guideModules = import.meta.glob("/src/content/guides/lesson-*.tsx", { eager: true });

export const Route = createFileRoute("/cartilla/teacher/guia/$n")({
  component: TeacherGuideLeccion,
  head: ({ params }) => {
    const n = Number(params.n);
    const catalogEntry = CATALOG.find((e) => e.n === n);
    const title = catalogEntry ? `${catalogEntry.title} — Guía del Maestro` : `Lección ${n} — Guía del Maestro`;
    return {
      meta: [
        { title: `${title} — La Cartilla de Gretel` },
      ],
    };
  },
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/teacher" });
    }
  },
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

  // Dynamically resolve the correct component for the lesson
  const componentKey = `/src/content/guides/lesson-${n}.tsx`;
  const mod = guideModules[componentKey] as any;
  const GuideComponent = mod ? mod[`Lesson${n}Guide`] : null;

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto h-[90vh] flex flex-col">
      {/* Top action row */}
      <div className="flex items-center justify-between no-print shrink-0 px-2">
        <Link
          to="/cartilla/teacher/progreso"
          className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al Panel
        </Link>
        
        <div className="flex items-center gap-2">
          <Link
            to="/cartilla/teacher/guia"
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold border border-stone-200 transition-all"
          >
            <FolderOpen className="w-3.5 h-3.5" /> Carpetas
          </Link>
          <Link
            to="/cartilla/teacher/paginas/$n"
            params={{ n: String(n) }}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold border border-stone-200 transition-all"
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
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-bold border border-stone-200 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir Guía
          </button>
        </div>
      </div>

      {/* Full Master-Detail Curriculum Layout */}
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
              <h2 className="text-xl font-bold text-stone-400 mb-2">Archivo HTML Pendiente</h2>
              <p className="text-stone-500 max-w-md mx-auto">
                La guía para la lección {n} aún no ha sido transcrita o no se encuentra el componente.
              </p>
            </div>
          )}
        </GuideLayout>
      </div>
    </div>
  );
}
