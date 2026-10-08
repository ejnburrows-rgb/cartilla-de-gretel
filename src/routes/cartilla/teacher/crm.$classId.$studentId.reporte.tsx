import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clipboard, Link2, Printer } from "lucide-react";
import { isSeedSessionActive } from "@/lib/seed-data";
import { fetchCrmStudentProgress } from "@/lib/crm-student-progress";
import { TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { summarizeStudentProgress } from "@/lib/progress-calculation";
import { buildStudentLearningInsight } from "@/lib/literacy-insights";
import "@/styles/teacher-print.css";

export const Route = createFileRoute("/cartilla/teacher/crm/$classId/$studentId/reporte")({
  component: ReporteFamilias,
  head: () => ({ meta: [{ title: "Reporte para Familias — La Cartilla de Gretel" }] }),
});

function ReporteFamilias() {
  const { classId, studentId } = Route.useParams();
  const [copyMessage, setCopyMessage] = useState("");
  const isSeed = useMemo(() => isSeedSessionActive(), []);

  const { data: progress, isLoading } = useQuery({
    queryKey: ["crm-estudiante", studentId, isSeed],
    queryFn: () => fetchCrmStudentProgress(studentId, isSeed),
  });

  const summary = useMemo(() => {
    if (!progress) return null;
    return summarizeStudentProgress(progress.lessonProgress);
  }, [progress]);

  const insight = useMemo(() => {
    if (!progress) return null;
    const completed = new Set(
      progress.lessonProgress
        .filter((row) => row.status === "completed")
        .map((row) => row.lesson_id),
    );
    return buildStudentLearningInsight(progress.events, completed);
  }, [progress]);

  const recentlyMastered = useMemo(() => {
    if (!progress || !insight) return [];
    const seen = new Set<string>();
    return progress.events
      .filter((event) => event.event_kind === "lesson_completed")
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .filter((event) => {
        if (seen.has(event.lesson_id)) return false;
        seen.add(event.lesson_id);
        return true;
      })
      .map((event) => insight.skills.find((skill) => skill.lessonId === event.lesson_id))
      .filter((skill) => skill?.status === "mastered")
      .slice(0, 4);
  }, [progress, insight]);

  if (isLoading || !progress || !summary || !insight) {
    return (
      <div className="p-12 text-center font-bold text-stone-400 animate-pulse">
        Cargando reporte...
      </div>
    );
  }

  const practiceAreas = insight.skills
    .filter((skill) => skill.status === "needs_review" || skill.status === "practicing")
    .slice(0, 4);
  const currentSkill = insight.recommendation?.exactSkill ?? "Sin práctica pendiente registrada";
  const reportDate = new Date().toLocaleDateString("es-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const recentAccuracy =
    insight.recentAccuracy == null ? "sin suficientes respuestas puntuadas" : `${Math.round(insight.recentAccuracy * 100)}% de aciertos recientes`;
  const lastActive = summary.lastActiveAt
    ? new Date(summary.lastActiveAt).toLocaleDateString("es-US")
    : "sin actividad registrada";
  const fiveMinutePractice = insight.recommendation
    ? `Durante 5 minutos, practica ${insight.recommendation.exactSkill}. Usa la actividad “${insight.recommendation.activity}” y detente después de una ronda corta.`
    : "Durante 5 minutos, repasa oralmente una habilidad ya dominada de la Cartilla.";
  const practiceUrl = insight.recommendation && typeof window !== "undefined"
    ? `${window.location.origin}/cartilla/practica?family=1&lesson=${insight.recommendation.lessonNumber}&activity=${insight.recommendation.activity}`
    : "";
  const qrUrl = practiceUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(practiceUrl)}`
    : "";

  const reportText = [
    `Reporte de progreso — ${progress.student.display_name}`,
    `Fecha: ${reportDate}`,
    `Progreso: ${summary.completedLessons} de ${TOTAL_LESSONS} lecciones completadas (${summary.completionPercent}%).`,
    `Actividad reciente: ${recentAccuracy}; última actividad: ${lastActive}.`,
    `Práctica actual: ${currentSkill}.`,
    recentlyMastered.length
      ? `Recientemente dominado: ${recentlyMastered.map((skill) => `${skill?.title} ${skill?.detail ?? ""}`.trim()).join(", ")}.`
      : "Recientemente dominado: no hay nuevas habilidades con evidencia suficiente en este reporte.",
    practiceAreas.length
      ? `Áreas de práctica: ${practiceAreas.map((skill) => `${skill.title} ${skill.detail}: ${skill.reason}`).join("; ")}.`
      : "Áreas de práctica: no hay señales de repaso con los datos actuales.",
    `Práctica de 5 minutos: ${fiveMinutePractice}`,
    practiceUrl ? `Enlace de práctica: ${practiceUrl}` : "",
  ].filter(Boolean).join("\n");

  const copyText = async (text: string, message: string) => {
    await navigator.clipboard.writeText(text);
    setCopyMessage(message);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/cartilla/teacher/crm/$classId/$studentId"
          params={{ classId, studentId }}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => copyText(reportText, "Reporte copiado")}
            className="min-h-11 px-4 border border-stone-300 bg-white text-stone-700 font-bold text-sm rounded-xl inline-flex items-center gap-2"
          >
            <Clipboard className="w-4 h-4" /> Copiar
          </button>
          <button
            onClick={() => window.print()}
            className="min-h-11 px-4 bg-vowel-a text-white font-bold text-sm rounded-xl shadow-sm inline-flex items-center gap-2 hover:brightness-105 transition"
          >
            <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
          </button>
        </div>
      </div>
      {copyMessage && <p className="no-print text-right text-xs font-bold text-emerald-700">{copyMessage}</p>}

      <div className="print-page bg-white border-2 border-[#e8dcc0] rounded-3xl p-6 sm:p-10 space-y-7">
        <header className="border-b-2 border-[#e8dcc0] pb-6">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-vowel-e mb-1">
            La Cartilla de Gretel
          </div>
          <h1 className="text-2xl font-black text-stone-800">Reporte de Progreso para Familias</h1>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-stone-500">
            <span>{progress.student.display_name}</span>
            <span>{reportDate}</span>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
          <div className="p-4 bg-[hsl(145,60%,97%)] rounded-2xl border border-[hsl(145,60%,90%)]">
            <div className="text-3xl font-black text-[hsl(145,65%,25%)]">{summary.completedLessons}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-500 mt-1">de {TOTAL_LESSONS} lecciones</div>
          </div>
          <div className="p-4 bg-[hsl(198,78%,97%)] rounded-2xl border border-[hsl(198,78%,90%)]">
            <div className="text-3xl font-black text-[hsl(198,78%,35%)]">{summary.completionPercent}%</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-500 mt-1">del recorrido</div>
          </div>
          <div className="col-span-2 p-4 bg-[hsl(48,100%,96%)] rounded-2xl border border-[hsl(48,60%,85%)] sm:col-span-1">
            <div className="text-base font-black text-[#8c6b36]">{recentAccuracy}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-500 mt-1">datos recientes</div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-500 mb-2">Práctica actual</h2>
          <p className="text-lg font-black text-stone-800">{currentSkill}</p>
          {insight.recommendation && (
            <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-600">{insight.recommendation.reason}</p>
          )}
        </section>

        <section>
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-500 mb-3">Recientemente dominado</h2>
          {recentlyMastered.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recentlyMastered.map((skill) => skill && (
                <span key={skill.lessonId} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800">
                  {skill.title} · {skill.detail}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-stone-500">No hay nuevas habilidades con evidencia suficiente en este reporte.</p>
          )}
        </section>

        <section>
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-500 mb-3">Áreas de práctica</h2>
          {practiceAreas.length > 0 ? (
            <div className="space-y-2">
              {practiceAreas.map((skill) => (
                <div key={skill.lessonId} className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-sm font-black text-stone-800">{skill.title} · {skill.detail}</p>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-stone-500">{skill.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-stone-500">No hay señales de repaso con los datos actuales.</p>
          )}
        </section>

        <section className="rounded-2xl border-2 border-[#e8dcc0] bg-[#fffaf1] p-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#8a4c1c]">Resumen factual</h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-700">
            Ha completado {summary.completedLessons} de {TOTAL_LESSONS} lecciones. La última actividad registrada fue {lastActive}. Los datos recientes muestran {recentAccuracy}.
          </p>
        </section>

        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-800">Práctica de 5 minutos en casa</h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-blue-950">{fiveMinutePractice}</p>
          {practiceUrl && (
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px] sm:items-center">
              <div className="no-print space-y-3">
                <a href={practiceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-black text-white">
                  <Link2 className="h-4 w-4" /> Abrir práctica familiar
                </a>
                <button onClick={() => copyText(practiceUrl, "Enlace copiado")} className="ml-2 min-h-11 rounded-xl border border-blue-300 bg-white px-4 text-sm font-black text-blue-800">
                  Copiar enlace
                </button>
                <p className="text-xs font-semibold text-blue-800">El enlace contiene solo la lección y la actividad; no incluye nombre, clase ni código del estudiante.</p>
              </div>
              <div className="flex justify-center">
                <img src={qrUrl} alt="Código QR para abrir la práctica familiar" width="180" height="180" className="rounded-xl border border-blue-200 bg-white p-2" />
              </div>
            </div>
          )}
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
