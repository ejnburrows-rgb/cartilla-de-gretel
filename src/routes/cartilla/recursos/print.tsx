import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer, ChevronLeft, BookOpen, FolderOpen } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";

export const Route = createFileRoute("/cartilla/recursos/print")({
  component: TeacherPrint,
  head: () => ({
    meta: [{ title: "Imprimir — La Cartilla de Gretel" }],
  }),
});

function TeacherPrint() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <Link
        to="/cartilla/recursos"
        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-10 text-[#b8311a] hover:text-[#7a1a08] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Volver
      </Link>

      <header className="text-center mb-12">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "#b8311a20", border: "3px solid #b8311a" }}
        >
          <Printer className="w-10 h-10" style={{ color: "#b8311a" }} />
        </div>
        <h1 className="text-4xl font-black mb-3" style={{ color: "#4a1009" }}>
          Imprimir
        </h1>
        <p className="text-lg font-semibold" style={{ color: "#b8311a" }}>
          Fichas de trabajo y materiales listos para el aula
        </p>
      </header>

      {/* Primary actions — full workbook and the teacher binder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        <Link
          to="/cartilla/imprimir/all"
          className="group flex flex-col p-7 rounded-3xl border-2 transition hover:-translate-y-1 hover:shadow-lg"
          style={{ borderColor: "#b8311a", backgroundColor: "#fffaf8" }}
        >
          <BookOpen className="w-10 h-10 mb-3" style={{ color: "#b8311a" }} />
          <h2 className="text-xl font-black mb-1" style={{ color: "#4a1009" }}>
            Cuaderno completo
          </h2>
          <p className="text-sm font-semibold leading-snug" style={{ color: "#7a4030" }}>
            Las 24 lecciones con sus fichas de trabajo, listas para imprimir de una vez.
          </p>
        </Link>

        <Link
          to="/cartilla/binder"
          className="group flex flex-col p-7 rounded-3xl border-2 transition hover:-translate-y-1 hover:shadow-lg"
          style={{ borderColor: "#406c72", backgroundColor: "#f7fbfb" }}
        >
          <FolderOpen className="w-10 h-10 mb-3" style={{ color: "#406c72" }} />
          <h2 className="text-xl font-black mb-1" style={{ color: "#1a2e31" }}>
            Carpeta del Maestro
          </h2>
          <p className="text-sm font-semibold leading-snug" style={{ color: "#3a5a5e" }}>
            Portada, índice, solucionario y hojas de trabajo en tamaño Letter, exportable a PDF.
          </p>
        </Link>
      </div>

      {/* Per-lesson picker */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#7a4030" }}>
          Imprimir una sola lección
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {CATALOG.map((entry) => (
            <Link
              key={entry.n}
              to="/cartilla/imprimir/$n"
              params={{ n: String(entry.n) }}
              className="group flex flex-col rounded-2xl border-2 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95"
              style={{ borderColor: `${entry.color}55` }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                Lección {entry.n}
              </span>
              <span
                className="text-lg font-black leading-tight transition-transform group-hover:scale-105"
                style={{ color: entry.color }}
              >
                {entry.title}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
