import { createFileRoute, Link } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";
import { ArrowLeft, Play, BookOpen, Type } from "lucide-react";
import "@/styles/cartilla-student.css";

export const Route = createFileRoute("/cartilla/sesiones")({
  component: SesionesDashboard,
  head: () => ({
    meta: [
      { title: "Consola de Sesiones Docentes — La Cartilla de Gretel" },
      { name: "description", content: "Elige una de las 24 lecciones para lanzar la consola interactiva de clase en vivo." },
    ],
  }),
});

const getEntryStyle = (color: string) => ({
  borderLeftWidth: "6px",
  borderLeftColor: color,
});

const entryBgStyle = (color: string) => ({
  backgroundColor: `${color}10`,
});

const activeColorStyle = (color: string) => ({
  color: color,
});

export function SesionesDashboard() {
  return (
    <div className="min-h-screen bg-background flex flex-col p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <header className="mb-8">
        <Link
          to="/cartilla"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Cartilla Principal
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-stone-850">
          Consola Docente de Sesiones en Vivo
        </h1>
        <p className="text-foreground/60 text-sm mt-1">
          Elige una lección para abrir el panel de control de la clase: proyector PDF, temporizador, audio narrador y controles de accesibilidad.
        </p>
      </header>

      {/* Grid of 24 Lessons */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATALOG.map((entry) => {
          const cardStyle = getEntryStyle(entry.color);
          const bgStyle = entryBgStyle(entry.color);
          const colorStyle = activeColorStyle(entry.color);

          return (
            <div
              key={entry.n}
              style={cardStyle}
              className="bg-white rounded-2xl border-2 border-stone-200 p-5 flex flex-col justify-between hover:shadow-md transition group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Lección {entry.n}
                  </span>
                  <span className="text-[10px] font-bold text-stone-400">
                    págs. {entry.pages}
                  </span>
                </div>

                <h2 className="text-lg font-bold leading-snug group-hover:text-amber-800 transition">
                  {entry.title}
                </h2>
                <p className="text-xs text-stone-500 mt-1 leading-normal truncate">
                  {entry.subtitle}
                </p>
              </div>

              {/* Decorative mini art cover box */}
              <div
                style={bgStyle}
                className="w-full h-16 rounded-xl flex items-center justify-center gap-2 my-4"
              >
                {entry.kind === "consonant" ? (
                  <Type className="w-6 h-6" style={colorStyle} />
                ) : (
                  <BookOpen className="w-6 h-6" style={colorStyle} />
                )}
                <span className="text-[10px] font-bold tracking-wider" style={colorStyle}>
                  {entry.kind === "intro" ? "INTRO" : entry.kind === "vowel" ? "VOCAL" : "CONSONANTE"}
                </span>
              </div>

              <Link
                to="/cartilla/sesion/$n"
                params={{ n: String(entry.n) }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Iniciar Sesión de Clase
              </Link>
            </div>
          );
        })}
      </main>
    </div>
  );
}
