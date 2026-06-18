import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { Printer, ChevronLeft } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { GuideLayout } from "@/content/guides/GuideLayout";
import { Lesson1Guide } from "@/content/guides/lesson-1";

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
        
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-bold border border-stone-200 transition-all shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Imprimir Guía
        </button>
      </div>

      {/* Full Master-Detail Curriculum Layout */}
      <div className="flex-1 min-h-0">
        <GuideLayout 
          selectedLesson={n} 
          onSelectLesson={handleSelectLesson}
          accentColor={accentColor}
        >
          {n === 1 ? (
            <Lesson1Guide />
          ) : (
            <div className="text-center py-20">
              <h2 className="text-xl font-bold text-stone-400 mb-2">Archivo HTML Pendiente</h2>
              <p className="text-stone-500 max-w-md mx-auto">
                La guía para la lección {n} está lista para ser transcrita. Copia el archivo `src/content/guides/lesson-1.tsx` y cámbiale el nombre a `lesson-{n}.tsx` para comenzar a editar su contenido en HTML limpio.
              </p>
            </div>
          )}
        </GuideLayout>
      </div>
    </div>
  );
}
