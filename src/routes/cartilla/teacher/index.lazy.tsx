import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  MonitorPlay,
  BookOpen,
  Printer,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";

export const Route = createLazyFileRoute("/cartilla/teacher/")({
  component: TeacherHub,
});

function TeacherHub() {
  const [selectedLesson, setSelectedLesson] = useState<number>(1);
  const activeEntry: CatalogEntry = CATALOG.find((e) => e.n === selectedLesson) ?? CATALOG[0];

  const vowelLessons = CATALOG.filter((e) => e.n <= 6);
  const consonantLessons = CATALOG.filter((e) => e.n >= 7);

  return (
    <div className="maestro-minimal-shell">
      <header className="maestro-minimal-header">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              La Cartilla de Gretel · Espacio del Maestro
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              Enseñar en el Aula
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/cartilla/teacher/crm"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-stone-300 px-4 py-2 text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-50"
            >
              <GraduationCap className="w-4 h-4 text-amber-700" /> Mis Alumnos
            </Link>
            <Link
              to="/cartilla/imprimir/all"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-stone-300 px-4 py-2 text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-50"
            >
              <Printer className="w-4 h-4 text-amber-700" /> Imprimir Hojas
            </Link>
          </div>
        </div>
      </header>

      {/* 2-Column Editorial Teacher Workspace */}
      <div className="maestro-grid-workspace">
        {/* Left Sidebar: Lessons selector */}
        <aside className="maestro-sidebar-lessons" aria-label="Seleccionar Lección">
          <div className="sidebar-group-label">Etapa 1 · Las Vocales (1–6)</div>
          <div className="space-y-1">
            {vowelLessons.map((entry) => {
              const isSelected = entry.n === selectedLesson;
              return (
                <button
                  key={entry.n}
                  type="button"
                  onClick={() => setSelectedLesson(entry.n)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition ${
                    isSelected
                      ? "bg-amber-900 text-white shadow-sm"
                      : "bg-white/70 text-stone-700 hover:bg-white hover:text-stone-900"
                  }`}
                >
                  <span className="truncate">
                    {entry.n}. {entry.title}
                  </span>
                  <span className={`text-[10px] ml-2 ${isSelected ? "text-amber-200" : "text-stone-400"}`}>
                    Pág. {entry.pages}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="sidebar-group-label mt-5">Etapa 2 · Consonantes (7–24)</div>
          <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
            {consonantLessons.map((entry) => {
              const isSelected = entry.n === selectedLesson;
              return (
                <button
                  key={entry.n}
                  type="button"
                  onClick={() => setSelectedLesson(entry.n)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition ${
                    isSelected
                      ? "bg-amber-900 text-white shadow-sm"
                      : "bg-white/70 text-stone-700 hover:bg-white hover:text-stone-900"
                  }`}
                >
                  <span className="truncate">
                    {entry.n}. {entry.title}
                  </span>
                  <span className={`text-[10px] ml-2 ${isSelected ? "text-amber-200" : "text-stone-400"}`}>
                    {entry.kind === "consonant" ? entry.data.syllables[0] : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Stage: Selected Lesson Actions */}
        <section className="maestro-main-stage" aria-label="Materiales de la lección seleccionada">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-100">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
                  {activeEntry.n <= 6 ? "Etapa de Vocales" : "Etapa de Consonantes"} · Páginas {activeEntry.pages}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                  Lección {activeEntry.n} — {activeEntry.title}
                </h2>
                <p className="text-xs text-stone-500 font-medium mt-1">
                  {activeEntry.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/cartilla/presentar/$n"
                  params={{ n: String(activeEntry.n) }}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-900 px-5 py-2.5 text-xs font-black text-white shadow-sm hover:bg-amber-800 transition"
                >
                  <MonitorPlay className="w-4 h-4" /> Proyectar en Aula
                </Link>
                <Link
                  to="/cartilla/leccion/$n"
                  params={{ n: String(activeEntry.n) }}
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-black text-stone-800 hover:bg-stone-50 transition"
                >
                  <BookOpen className="w-4 h-4" /> Cuaderno Alumno
                </Link>
              </div>
            </div>

            {/* 3 Clear Classroom Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              {/* Card 1: Rotafolio */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5 flex flex-col justify-between hover:border-amber-700/40 transition">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold mb-3">
                    <MonitorPlay className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-stone-900">1. Rotafolio para Proyectar</h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Lámina oficial a pantalla completa con paso de página superior y poema para lectura compartida frente a la clase.
                  </p>
                </div>
                <Link
                  to="/cartilla/presentar/$n"
                  params={{ n: String(activeEntry.n) }}
                  className="mt-4 inline-flex items-center justify-between w-full rounded-xl bg-white border border-stone-200 px-3.5 py-2 text-xs font-bold text-stone-800 hover:bg-amber-900 hover:text-white transition group"
                >
                  <span>Abrir Rotafolio</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Card 2: Cuaderno de Trabajo */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5 flex flex-col justify-between hover:border-amber-700/40 transition">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold mb-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-stone-900">2. Cuaderno del Alumno</h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Ejercicios interactivos con lápiz de grafito y borrador: rodear en círculo, caligrafía y trazo de renglones.
                  </p>
                </div>
                <Link
                  to="/cartilla/leccion/$n"
                  params={{ n: String(activeEntry.n) }}
                  className="mt-4 inline-flex items-center justify-between w-full rounded-xl bg-white border border-stone-200 px-3.5 py-2 text-xs font-bold text-stone-800 hover:bg-emerald-800 hover:text-white transition group"
                >
                  <span>Ver Cuaderno</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Card 3: Guía y Juegos */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5 flex flex-col justify-between hover:border-amber-700/40 transition">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-stone-900">3. Guía Docente y Actividades</h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Indicaciones didácticas de Leonor Lopetegui, dictados, discriminación auditiva y acceso a los 5 juegos fonéticos.
                  </p>
                </div>
                <Link
                  to="/cartilla/teacher/guia"
                  className="mt-4 inline-flex items-center justify-between w-full rounded-xl bg-white border border-stone-200 px-3.5 py-2 text-xs font-bold text-stone-800 hover:bg-purple-800 hover:text-white transition group"
                >
                  <span>Abrir Guía Docente</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
