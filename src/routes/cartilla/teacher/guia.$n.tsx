import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Printer, ChevronLeft } from "lucide-react";
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

  const goNext = () => {
    if (n < CATALOG.length) {
      navigate({ to: "/cartilla/teacher/guia/$n", params: { n: String(n + 1) } });
    }
  };

  const goPrev = () => {
    if (n > 1) {
      navigate({ to: "/cartilla/teacher/guia/$n", params: { n: String(n - 1) } });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/50 pb-5 no-print">
        <div className="flex items-center gap-3">
          <Link
            to="/cartilla/teacher/progreso"
            className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al Panel
          </Link>
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-bold border border-stone-200 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir Guía
          </button>
        </div>
      </div>

      {/* Lesson Header Card */}
      <header className="premium-glass rounded-2xl border border-stone-200 bg-white/80 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span 
              className="text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              Lección {n}
            </span>
            {catalogEntry?.pages && (
              <span className="text-stone-400 text-xs font-bold">
                Pág. {catalogEntry.pages} del libro
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-800 leading-tight">
            {catalogEntry?.title || `Lección ${n}`}
          </h1>
          {catalogEntry?.subtitle && (
            <p className="text-sm font-bold text-stone-500">{catalogEntry.subtitle}</p>
          )}
        </div>

        {/* Previous / Next buttons */}
        <div className="flex items-center gap-3 no-print">
          <button
            onClick={goPrev}
            disabled={n <= 1}
            className="p-3 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:hover:bg-stone-100 text-stone-700 rounded-xl border border-stone-200 transition-colors shadow-sm"
            title="Lección Anterior"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={goNext}
            disabled={n >= CATALOG.length}
            className="p-3 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:hover:bg-stone-100 text-stone-700 rounded-xl border border-stone-200 transition-colors shadow-sm"
            title="Lección Siguiente"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main HTML Document Layout */}
      <GuideLayout accentColor={accentColor}>
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
  );
}
