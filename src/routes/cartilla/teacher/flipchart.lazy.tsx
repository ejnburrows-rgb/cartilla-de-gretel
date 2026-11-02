import { useState } from "react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { Maximize2 } from "lucide-react";
import { LessonCatalog } from "@/features/teacher-crm/components/LessonCatalog";
import { DemoControlCenter } from "@/components/cartilla/DemoControlCenter";
import { FlipchartHdPanel } from "@/components/cartilla/FlipchartHdPanel";
import { CATALOG } from "@/lib/lesson-catalog";
import "@/styles/teacher-crm.css";
import "@/styles/flipchart-presenter.css";

export const Route = createLazyFileRoute("/cartilla/teacher/flipchart")({
  component: TeacherFlipchartPage,
});

function TeacherFlipchartPage() {
  const [lessonNumber, setLessonNumber] = useState(1);
  const currentEntry = CATALOG.find((entry) => entry.n === lessonNumber) ?? CATALOG[0];

  return (
    <div className="space-y-6">
      <DemoControlCenter currentLesson={lessonNumber} floating />

      <section
        aria-label="Rotafolio de Aula en Vivo"
        className="rounded-3xl border border-stone-200/90 bg-[#fdfbf7] p-3 sm:p-4 shadow-md"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-2.5">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800">
              Rotafolio Oficial del Maestro · Vista de Aula
            </span>
            <h2 className="text-lg font-extrabold text-stone-900">
              Lección {currentEntry.n}: {currentEntry.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <label className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <span>Lección:</span>
              <select
                aria-label="Seleccionar lección del rotafolio"
                value={String(lessonNumber)}
                onChange={(e) => setLessonNumber(Number(e.target.value) || 1)}
                className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-900 shadow-2xs"
              >
                {CATALOG.map((item) => (
                  <option key={item.n} value={String(item.n)}>
                    Lección {item.n} — {item.title}
                  </option>
                ))}
              </select>
            </label>

            <Link
              to="/cartilla/presentar/$n"
              params={{ n: String(lessonNumber) }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-teal-900"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Proyectar Pantalla Completa
            </Link>
          </div>
        </div>

        <div className="h-[78dvh] min-h-[560px] w-full overflow-hidden rounded-2xl bg-[#f5f1e8] p-2">
          <FlipchartHdPanel
            lessonNumber={lessonNumber}
            accentColor={currentEntry.color}
            chrome="full"
          />
        </div>
      </section>

      <LessonCatalog />
    </div>
  );
}
