import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Users, ArrowRight, FileSpreadsheet } from "lucide-react";
import { getClass, getClassProgress } from "@/lib/teacher.functions";
import { getSeedClass, getSeedClassProgress, isSeedSessionActive } from "@/lib/seed-data";
import { TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { CrmBreadcrumbs } from "@/features/teacher-crm/components/CrmBreadcrumbs";
import { exportClassProgressCsv } from "@/lib/csv-export";

export const Route = createFileRoute("/cartilla/teacher/crm/$classId/")({
  // NOTE: this route now lives at crm.$classId.index.tsx — crm.$classId.tsx
  // itself became a pure <Outlet/> layout once crm.$classId.$studentId.tsx
  // (and its own children) needed to nest under it.
  component: ClaseOverview,
  head: () => ({ meta: [{ title: "Clase — La Cartilla de Gretel CRM" }] }),
});

interface ClaseStudent {
  id: string;
  display_name: string;
  lessons: number;
  completionPercent: number | null;
}

interface ClaseData {
  className: string;
  joinCode: string;
  students: ClaseStudent[];
}

interface RecentEvent {
  studentName: string;
  lessonId: string;
  eventKind: string;
  score: number | null;
  total: number | null;
  createdAt: string;
}

interface ClaseProgressData {
  attentionByStudent: Record<string, { flagged: boolean; reasons: string[] } | undefined>;
  perLesson: Record<string, { completedBy: number; accuracy: number | null } | undefined>;
  recentEvents: RecentEvent[];
  perStudent: Array<{
    id: string;
    name: string;
    lessonsCount: number;
    accuracy: number | null;
    timeSeconds: number;
  }>;
}

async function fetchClaseData(classId: string, isSeed: boolean): Promise<ClaseData> {
  if (isSeed) {
    const raw = getSeedClass(classId);
    return {
      className: raw.class.name,
      joinCode: raw.class.join_code,
      students: raw.students.map((s) => ({
        id: s.id,
        display_name: s.display_name,
        lessons: s.lessons,
        completionPercent: null,
      })),
    };
  }
  const raw = await getClass({ data: { id: classId } });
  return {
    className: raw.class.name,
    joinCode: raw.class.join_code,
    students: raw.students.map((s) => ({
      id: s.id,
      display_name: s.display_name,
      lessons: s.lessons,
      completionPercent: s.completionPercent,
    })),
  };
}

async function fetchClaseProgress(classId: string, isSeed: boolean): Promise<ClaseProgressData> {
  const raw = isSeed
    ? getSeedClassProgress(classId)
    : await getClassProgress({ data: { id: classId } });
  return {
    attentionByStudent: raw.attentionByStudent,
    perLesson: raw.perLesson,
    recentEvents: raw.recentEvents,
    perStudent: raw.perStudent,
  };
}

function ClaseOverview() {
  const { classId } = Route.useParams();

  const isSeed = useMemo(() => isSeedSessionActive(), []);

  const { data: classData, isLoading: loadingClass } = useQuery({
    queryKey: ["crm-clase", classId, isSeed],
    queryFn: () => fetchClaseData(classId, isSeed),
  });

  const { data: progressData, isLoading: loadingProgress } = useQuery({
    queryKey: ["crm-clase-progress", classId, isSeed],
    queryFn: () => fetchClaseProgress(classId, isSeed),
  });

  const loading = loadingClass || loadingProgress;
  const className = classData?.className ?? "Clase";
  const students = classData?.students ?? [];

  const attentionList = useMemo(() => {
    if (!progressData) return [];
    return students
      .map((s) => ({ student: s, attention: progressData.attentionByStudent[s.id] }))
      .filter((row) => row.attention?.flagged);
  }, [progressData, students]);

  const lessonBars = useMemo(() => {
    if (!progressData) return [];
    const total = students.length || 1;
    return Array.from({ length: TOTAL_LESSONS }, (_, i) => {
      const lessonId = String(i + 1);
      const cell = progressData.perLesson[lessonId];
      const completedBy = cell?.completedBy ?? 0;
      return { lessonNumber: i + 1, completedBy, pct: Math.round((completedBy / total) * 100) };
    });
  }, [progressData, students]);

  return (
    <div className="w-full space-y-6">
      <CrmBreadcrumbs
        items={[{ label: "Panel", to: "/cartilla/teacher/crm" }, { label: className }]}
      />

      {loading ? (
        <div className="p-12 text-center font-bold text-stone-400 animate-pulse bg-white border border-stone-200 rounded-[2rem]">
          Cargando clase...
        </div>
      ) : (
        <>
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-stone-800">{className}</h1>
              <p className="text-sm font-bold text-stone-500 mt-1">
                {students.length} alumno{students.length === 1 ? "" : "s"} · Código:{" "}
                <span className="font-mono text-vowel-e">{classData?.joinCode}</span>
              </p>
            </div>
            <button
              onClick={() =>
                progressData && exportClassProgressCsv(className, students, progressData)
              }
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-sm rounded-xl shadow-sm inline-flex items-center gap-2 transition"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar CSV
            </button>
          </header>

          {/* Students needing attention — surfaced first */}
          {attentionList.length > 0 && (
            <section className="bg-[hsl(354,78%,98%)] border-2 border-[hsl(354,78%,90%)] rounded-3xl p-5">
              <h2 className="text-sm font-black text-[hsl(354,78%,35%)] uppercase tracking-wider flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4" /> Necesitan atención ({attentionList.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {attentionList.map(({ student, attention }) => (
                  <Link
                    key={student.id}
                    to="/cartilla/teacher/crm/$classId/$studentId"
                    params={{ classId, studentId: student.id }}
                    className="bg-white rounded-2xl border border-[hsl(354,78%,90%)] p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="font-bold text-sm text-stone-800">{student.display_name}</div>
                    <div className="text-xs text-[hsl(354,78%,45%)] font-bold mt-1">
                      {attention?.reasons.join(" · ")}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Per-lesson class completion bar */}
          <section className="bg-white border border-stone-200 rounded-3xl p-6">
            <h2 className="text-sm font-black text-stone-700 uppercase tracking-wider mb-4">
              Completado por lección (toda la clase)
            </h2>
            <div className="flex items-end gap-1.5">
              {lessonBars.map((bar) => (
                <div
                  key={bar.lessonNumber}
                  className="flex-1 flex flex-col items-center gap-1 group relative"
                >
                  <div className="w-full h-24 bg-stone-100 rounded-t-md flex items-end overflow-hidden">
                    <div
                      className="w-full bg-[#8da47e] rounded-t-md transition-all"
                      style={{ height: `${Math.max(bar.pct, bar.completedBy > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-stone-400">{bar.lessonNumber}</span>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {bar.completedBy}/{students.length}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Weekly activity feed */}
          <section className="bg-white border border-stone-200 rounded-3xl p-6">
            <h2 className="text-sm font-black text-stone-700 uppercase tracking-wider mb-4">
              Actividad de esta semana
            </h2>
            {(progressData?.recentEvents?.length ?? 0) === 0 ? (
              <p className="text-sm font-bold text-stone-400 text-center py-6">
                Todavía no hay actividad registrada en esta clase.
              </p>
            ) : (
              <ul className="space-y-2">
                {progressData!.recentEvents.map((e, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm py-2 border-b border-stone-100 last:border-0"
                  >
                    <span className="font-bold text-stone-700">
                      {e.studentName}{" "}
                      <span className="font-medium text-stone-500">
                        {e.eventKind === "lesson_completed"
                          ? `completó la Lección ${e.lessonId}`
                          : e.eventKind === "exercise"
                            ? `practicó la Lección ${e.lessonId}${e.total ? ` (${e.score}/${e.total})` : ""}`
                            : `estudió la Lección ${e.lessonId}`}
                      </span>
                    </span>
                    <span className="text-xs font-bold text-stone-400 shrink-0 ml-3">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Roster */}
          <section className="bg-white border border-stone-200 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-stone-200">
              <h2 className="text-sm font-black text-stone-700 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" /> Alumnos
              </h2>
            </div>
            <div className="divide-y divide-stone-100">
              {students.map((s) => (
                <Link
                  key={s.id}
                  to="/cartilla/teacher/crm/$classId/$studentId"
                  params={{ classId, studentId: s.id }}
                  className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors group"
                >
                  <div>
                    <div className="font-bold text-stone-800">{s.display_name}</div>
                    <div className="text-xs font-bold text-stone-400 mt-0.5">
                      {s.completionPercent !== null
                        ? `${s.completionPercent}% completado`
                        : `${s.lessons} lecciones`}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-vowel-a group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
              {students.length === 0 && (
                <div className="p-8 text-center text-sm font-bold text-stone-400">
                  Sin alumnos todavía.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
