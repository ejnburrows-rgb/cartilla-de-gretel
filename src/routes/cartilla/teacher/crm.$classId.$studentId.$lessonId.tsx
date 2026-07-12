import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Award, CheckCircle2 } from "lucide-react";
import { isSeedSessionActive } from "@/lib/seed-data";
import { fetchCrmStudentProgress } from "@/lib/crm-student-progress";
import { CATALOG } from "@/lib/lesson-catalog";
import { CrmBreadcrumbs } from "@/features/teacher-crm/components/CrmBreadcrumbs";

export const Route = createFileRoute("/cartilla/teacher/crm/$classId/$studentId/$lessonId")({
  component: LeccionDetail,
  head: () => ({ meta: [{ title: "Lección — La Cartilla de Gretel CRM" }] }),
});

const EVENT_KIND_LABELS: Record<string, string> = {
  exercise: "Ejercicio",
  time: "Tiempo",
  lesson_completed: "Lección completada",
};

function LeccionDetail() {
  const { classId, studentId, lessonId } = Route.useParams();

  const isSeed = useMemo(() => isSeedSessionActive(), []);

  const { data: progress, isLoading } = useQuery({
    queryKey: ["crm-estudiante", studentId, isSeed],
    queryFn: () => fetchCrmStudentProgress(studentId, isSeed),
  });

  const entry = CATALOG.find((c) => String(c.n) === lessonId);
  const lessonEvents = useMemo(
    () => (progress?.events ?? []).filter((e) => e.lesson_id === lessonId),
    [progress, lessonId],
  );

  const completed = lessonEvents.some((e: { event_kind: string }) => e.event_kind === "lesson_completed");
  const exerciseEvents = lessonEvents.filter((e: { event_kind: string }) => e.event_kind === "exercise");
  const totalScore = exerciseEvents.reduce((sum: number, e: { score: number | null }) => sum + (e.score ?? 0), 0);
  const totalPossible = exerciseEvents.reduce((sum: number, e: { total: number | null }) => sum + (e.total ?? 0), 0);
  const accuracy = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : null;
  const totalTimeSecs = lessonEvents
    .filter((e: { event_kind: string }) => e.event_kind === "time")
    .reduce((sum: number, e: { time_seconds: number | null }) => sum + (e.time_seconds ?? 0), 0);
  const lastActivity = lessonEvents[0]?.created_at ?? null;

  return (
    <div className="w-full space-y-6">
      <CrmBreadcrumbs
        items={[
          { label: "Panel", to: "/cartilla/teacher/crm" },
          { label: "Clase", to: "/cartilla/teacher/crm/$classId", params: { classId } },
          {
            label: progress?.student.display_name ?? "Alumno",
            to: "/cartilla/teacher/crm/$classId/$studentId",
            params: { classId, studentId },
          },
          { label: entry?.title ?? `Lección ${lessonId}` },
        ]}
      />

      {isLoading || !progress ? (
        <div className="p-12 text-center font-bold text-stone-400 animate-pulse bg-white border border-stone-200 rounded-[2rem]">
          Cargando lección...
        </div>
      ) : (
        <>
          <header className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-stone-800">{entry?.title ?? `Lección ${lessonId}`}</h1>
            {completed && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#dce7d5] text-[#2c3e20] text-xs font-black rounded-full uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completada
              </span>
            )}
          </header>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-stone-800">{accuracy !== null ? `${accuracy}%` : "—"}</div>
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Precisión</div>
              </div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-stone-800">{Math.round(totalTimeSecs / 60)} min</div>
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Tiempo total</div>
              </div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="text-sm font-black text-stone-800">
                {lastActivity ? new Date(lastActivity).toLocaleDateString() : "Sin actividad"}
              </div>
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mt-1">
                Última actividad
              </div>
            </div>
          </div>

          <section className="bg-white border border-stone-200 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-stone-200">
              <h2 className="text-sm font-black text-stone-700 uppercase tracking-wider">Intentos de actividad</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3 pl-6">Fecha</th>
                    <th className="p-3">Evento</th>
                    <th className="p-3">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {lessonEvents.map(
                    (
                      e: {
                        id?: string;
                        event_kind: string;
                        score: number | null;
                        total: number | null;
                        time_seconds: number | null;
                        created_at: string;
                      },
                      i: number,
                    ) => (
                      <tr key={e.id ?? i}>
                        <td className="p-3 pl-6 font-mono text-xs">
                          {new Date(e.created_at).toLocaleString()}
                        </td>
                        <td className="p-3 font-bold">{EVENT_KIND_LABELS[e.event_kind] ?? e.event_kind}</td>
                        <td className="p-3">
                          {e.event_kind === "exercise" && (e.total ?? 0) > 0
                            ? `${e.score}/${e.total} (${Math.round(((e.score ?? 0) / (e.total ?? 1)) * 100)}%)`
                            : e.event_kind === "time"
                              ? `${e.time_seconds} seg`
                              : "—"}
                        </td>
                      </tr>
                    ),
                  )}
                  {lessonEvents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center font-bold text-stone-400">
                        Sin intentos registrados para esta lección todavía.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
