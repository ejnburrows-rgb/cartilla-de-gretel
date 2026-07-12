import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer } from "lucide-react";
import { isSeedSessionActive } from "@/lib/seed-data";
import { fetchCrmStudentProgress } from "@/lib/crm-student-progress";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { summarizeStudentProgress, buildLessonTiles } from "@/lib/progress-calculation";
import "@/styles/teacher-print.css";

export const Route = createFileRoute("/cartilla/teacher/crm/$classId/$studentId/reporte")({
  component: ReporteFamilias,
  head: () => ({ meta: [{ title: "Reporte para Familias — La Cartilla de Gretel" }] }),
});

const ENCOURAGEMENT_BY_TIER = [
  "¡Apenas está comenzando su aventura con la lectura! Cada página es un paso adelante.",
  "¡Va tomando ritmo! La práctica constante en casa ayuda muchísimo en este momento.",
  "¡Excelente avance! Ya domina buena parte de las lecciones — sigan practicando juntos.",
  "¡Un logro increíble! Ha completado casi todo el programa. ¡Celebren este esfuerzo!",
];

function encouragementFor(pct: number): string {
  if (pct >= 90) return ENCOURAGEMENT_BY_TIER[3];
  if (pct >= 50) return ENCOURAGEMENT_BY_TIER[2];
  if (pct >= 15) return ENCOURAGEMENT_BY_TIER[1];
  return ENCOURAGEMENT_BY_TIER[0];
}

function ReporteFamilias() {
  const { classId, studentId } = Route.useParams();

  const isSeed = useMemo(() => isSeedSessionActive(), []);

  const { data: progress, isLoading } = useQuery({
    queryKey: ["crm-estudiante", studentId, isSeed],
    queryFn: () => fetchCrmStudentProgress(studentId, isSeed),
  });

  const summary = useMemo(() => {
    if (!progress) return null;
    return summarizeStudentProgress(progress.lessonProgress);
  }, [progress]);

  const tiles = useMemo(() => {
    if (!progress) return [];
    return buildLessonTiles(progress.lessonProgress, new Set());
  }, [progress]);

  const currentLesson = useMemo(() => {
    const next = tiles.find((t) => t.status !== "completed");
    if (!next) return null;
    return CATALOG.find((c) => c.n === next.lessonNumber) ?? null;
  }, [tiles]);

  const totalTimeMinutes = useMemo(() => {
    if (!progress) return 0;
    const secs = (progress.events ?? [])
      .filter((e: { event_kind: string }) => e.event_kind === "time")
      .reduce((sum: number, e: { time_seconds: number | null }) => sum + (e.time_seconds ?? 0), 0);
    return Math.round(secs / 60);
  }, [progress]);

  if (isLoading || !progress || !summary) {
    return (
      <div className="p-12 text-center font-bold text-stone-400 animate-pulse">Cargando reporte...</div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="no-print flex items-center justify-between">
        <Link
          to="/cartilla/teacher/crm/$classId/$studentId"
          params={{ classId, studentId }}
          className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-vowel-a text-white font-bold text-sm rounded-xl shadow-sm inline-flex items-center gap-2 hover:brightness-105 transition"
        >
          <Printer className="w-4 h-4" /> Imprimir
        </button>
      </div>

      <div className="print-page bg-white border-2 border-[#e8dcc0] rounded-3xl p-10 space-y-8">
        <header className="text-center border-b-2 border-[#e8dcc0] pb-6">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-vowel-e mb-1">
            La Cartilla de Gretel
          </div>
          <h1 className="text-2xl font-black text-stone-800">Reporte de Progreso para Familias</h1>
          <p className="text-sm font-bold text-stone-500 mt-2">{progress.student.display_name}</p>
        </header>

        <section className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-[hsl(145,60%,97%)] rounded-2xl border border-[hsl(145,60%,90%)]">
            <div className="text-3xl font-black text-[hsl(145,65%,25%)]">{summary.completedLessons}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-500 mt-1">
              de {TOTAL_LESSONS} lecciones completas
            </div>
          </div>
          <div className="p-4 bg-[hsl(198,78%,97%)] rounded-2xl border border-[hsl(198,78%,90%)]">
            <div className="text-3xl font-black text-[hsl(198,78%,35%)]">{summary.completionPercent}%</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-500 mt-1">
              del programa
            </div>
          </div>
          <div className="p-4 bg-[hsl(48,100%,96%)] rounded-2xl border border-[hsl(48,60%,85%)]">
            <div className="text-3xl font-black text-[#8c6b36]">{totalTimeMinutes}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-500 mt-1">
              minutos practicados
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-500 mb-2">Lección actual</h2>
          <p className="text-lg font-bold text-stone-800">
            {currentLesson ? currentLesson.title : "¡Ha completado todo el programa!"}
          </p>
        </section>

        <section className="bg-[hsl(48,100%,97%)] border-2 border-[hsl(48,60%,88%)] rounded-2xl p-5">
          <p className="text-sm font-bold text-[#7a6040] leading-relaxed">
            {encouragementFor(summary.completionPercent)}
          </p>
        </section>

        <footer className="text-center pt-6 border-t-2 border-[#e8dcc0] text-[10px] font-bold text-stone-400 space-y-1">
          <p>La Cartilla de Gretel</p>
          <p>Autora: Leonor Lopetegui · Ilustradora: Estela de Armas Plasencia</p>
          <p>Adaptación digital: Emilio Jose Novo</p>
        </footer>
      </div>
    </div>
  );
}
