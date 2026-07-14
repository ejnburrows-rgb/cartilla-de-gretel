import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { updateStudent } from "@/lib/teacher.functions";
import { updateSeedStudent, listSeedAssignments, isSeedSessionActive } from "@/lib/seed-data";
import { listAssignments } from "@/lib/assignments.functions";
import { fetchCrmStudentProgress } from "@/lib/crm-student-progress";
import { summarizeStudentProgress, buildLessonTiles } from "@/lib/progress-calculation";
import { CrmBreadcrumbs } from "@/features/teacher-crm/components/CrmBreadcrumbs";
import { LessonTileGrid, LessonTileLegend } from "@/features/teacher-crm/components/LessonTileGrid";
import { AccountPanel } from "@/features/teacher-crm/components/AccountPanel";
import type { DashboardStudent } from "@/features/teacher-crm/components/PipelineBoard";

export const Route = createFileRoute("/cartilla/teacher/crm/$classId/$studentId/")({
  component: EstudianteDetail,
  head: () => ({ meta: [{ title: "Alumno — La Cartilla de Gretel CRM" }] }),
});

function EstudianteDetail() {
  const { classId, studentId } = Route.useParams();
  const qc = useQueryClient();

  const isSeed = useMemo(() => isSeedSessionActive(), []);

  const { data: progress, isLoading: loadingProgress, refetch } = useQuery({
    queryKey: ["crm-estudiante", studentId, isSeed],
    queryFn: () => fetchCrmStudentProgress(studentId, isSeed),
  });

  const { data: assignments } = useQuery({
    queryKey: ["crm-estudiante-assignments", classId, isSeed],
    queryFn: () => (isSeed ? Promise.resolve(listSeedAssignments(classId)) : listAssignments({ data: { classId } })),
  });

  const assignedLessonIds = useMemo(
    () => new Set((assignments ?? []).map((a) => a.lesson_id)),
    [assignments],
  );

  const summary = useMemo(() => {
    if (!progress) return null;
    return summarizeStudentProgress(progress.lessonProgress);
  }, [progress]);

  const tiles = useMemo(() => {
    if (!progress) return [];
    return buildLessonTiles(progress.lessonProgress, assignedLessonIds);
  }, [progress, assignedLessonIds]);

  const dashboardStudent: DashboardStudent | null = useMemo(() => {
    if (!progress || !summary) return null;
    return {
      id: progress.student.id,
      name: progress.student.display_name,
      progress: summary.completionPercent,
      lastActive: summary.lastActiveAt ? new Date(summary.lastActiveAt).toLocaleDateString() : "Nunca",
      teacher_notes: progress.student.teacher_notes ?? undefined,
    };
  }, [progress, summary]);

  const handleUpdate = async (id: string, updates: Partial<DashboardStudent>) => {
    if (isSeed) {
      updateSeedStudent(id, { teacher_notes: updates.teacher_notes });
    } else {
      await updateStudent({ data: { id, teacherNotes: updates.teacher_notes ?? null } });
    }
    qc.invalidateQueries({ queryKey: ["crm-estudiante", studentId] });
    refetch();
  };

  return (
    <div className="w-full space-y-6">
      <CrmBreadcrumbs
        items={[
          { label: "Panel", to: "/cartilla/teacher/crm" },
          { label: "Clase", to: "/cartilla/teacher/crm/$classId", params: { classId } },
          { label: progress?.student.display_name ?? "Alumno" },
        ]}
      />

      {loadingProgress || !progress ? (
        <div className="p-12 text-center font-bold text-stone-400 animate-pulse bg-white border border-stone-200 rounded-[2rem]">
          Cargando alumno...
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-6">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-stone-800">{progress.student.display_name}</h1>
                <p className="text-sm font-bold text-stone-500 mt-1">
                  Código: <span className="font-mono text-vowel-e">{progress.student.student_code}</span>
                </p>
              </div>
              <Link
                to="/cartilla/teacher/crm/$classId/$studentId/reporte"
                params={{ classId, studentId }}
                className="px-4 py-2 bg-vowel-a text-white font-bold text-sm rounded-xl shadow-sm inline-flex items-center gap-2 hover:brightness-105 transition"
              >
                <FileText className="w-4 h-4" /> Reporte para Familias
              </Link>
            </header>

            <section className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-stone-700 uppercase tracking-wider">
                  Progreso de las 24 lecciones
                </h2>
                <LessonTileLegend />
              </div>
              <LessonTileGrid tiles={tiles} classId={classId} studentId={studentId} />
            </section>
          </div>

          <AccountPanel student={dashboardStudent} onUpdate={handleUpdate} />
        </div>
      )}
    </div>
  );
}
