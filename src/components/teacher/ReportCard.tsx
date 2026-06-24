import { useQuery } from "@tanstack/react-query";
import { getStudentProgress, getClassProgress } from "@/lib/teacher.functions";
import { ClipboardList, Award, BookOpen, Clock, AlertTriangle, FileSpreadsheet, Check } from "lucide-react";
import { crmService } from "@/services/crm";
import { TOTAL_LESSONS } from "@/lib/lesson-catalog";
interface ReportCardProps {
  classId: string;
  studentId: string | null;
}

const cardClass = "bg-white border border-gray-200 rounded-md p-6 shadow-sm";
const metricBoxClass = "flex items-center gap-4 p-4 rounded-md bg-white border border-gray-200";
const metricValClass = "text-[24px] font-normal text-gray-800";
const metricLblClass = "text-[12px] font-medium text-gray-500 uppercase tracking-wide";
const headerTitleClass = "text-[20px] font-normal text-gray-800 flex items-center gap-2";

export function ReportCard({ classId, studentId }: ReportCardProps) {
  // 1. Fetch Student Progress if selected
  const { data: studentData, isLoading: loadingStudent } = useQuery({
    queryKey: ["teacher-student-progress", studentId],
    queryFn: () => getStudentProgress({ data: { id: studentId! } }),
    enabled: !!studentId,
  });

  // 2. Fetch Class Progress if no student selected
  const { data: classProgressData, isLoading: loadingClass } = useQuery({
    queryKey: ["teacher-class-progress", classId],
    queryFn: () => getClassProgress({ data: { id: classId } }),
    enabled: !studentId && !!classId,
  });

  const loading = studentId ? loadingStudent : loadingClass;

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-md animate-pulse">
        Cargando métricas y analíticas de reportes...
      </div>
    );
  }

  // ── Render Individual Student Report ──
  if (studentId && studentData) {
    const { student, class: classObj, events } = studentData;
    
    // Aggregations
    const completedLessons = events.filter((e: any) => e.event_kind === "lesson_completed");
    const exerciseEvents = events.filter((e: any) => e.event_kind === "exercise");
    const totalScore = exerciseEvents.reduce((sum: number, e: any) => sum + (e.score || 0), 0);
    const totalPossible = exerciseEvents.reduce((sum: number, e: any) => sum + (e.total || 0), 0);
    const accuracy = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : null;
    const totalTimeSecs = events.filter((e: any) => e.event_kind === "time").reduce((sum: number, e: any) => sum + (e.time_seconds || 0), 0);
    const totalTimeMins = Math.round(totalTimeSecs / 60);

    return (
      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-200 pb-6 mb-6">
          <div>
            <h2 className={headerTitleClass}>
              <Award className="w-6 h-6 text-gray-500" />
              Reporte de Logros: {student.display_name}
            </h2>
            <p className="text-[13px] text-gray-500 mt-1">
              Código Alumno: <span className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{student.student_code}</span> | Clase: {classObj?.name}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium uppercase tracking-wide px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              IEP & Adaptaciones
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={metricBoxClass}>
            <div className="p-3 bg-stone-100 rounded-xl text-stone-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className={metricValClass}>{completedLessons.length}</div>
              <div className={metricLblClass}>Lecciones Completas</div>
            </div>
          </div>

          <div className={metricBoxClass}>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className={metricValClass}>{accuracy !== null ? `${accuracy}%` : "—"}</div>
              <div className={metricLblClass}>Precisión Promedio</div>
            </div>
          </div>

          <div className={metricBoxClass}>
            <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className={metricValClass}>{totalTimeMins} min</div>
              <div className={metricLblClass}>Tiempo en Tarea</div>
            </div>
          </div>
        </div>

        {/* Activity Logs / IEP details */}
        <div>
          <h3 className="text-[13px] font-medium text-gray-500 uppercase tracking-wide mb-3">Historial de Progreso Reciente</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Evento</th>
                  <th className="py-3 px-4">Lección</th>
                  <th className="py-3 px-4">Puntuación / Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {events.slice(0, 10).map((e: any) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[13px] text-gray-600">{new Date(e.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 capitalize font-medium text-gray-800">{e.event_kind}</td>
                    <td className="py-3 px-4 text-gray-600">Lección {e.lesson_id}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {e.event_kind === "exercise" && e.total > 0
                        ? `${e.score}/${e.total} (${Math.round((e.score/e.total)*100)}%)`
                        : e.event_kind === "time"
                          ? `${e.time_seconds} seg`
                          : "Completada"}
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      Sin eventos registrados aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Class Report ──
  if (classProgressData) {
    const { perStudent, perLesson, assignments } = classProgressData;
    const allProgresos = crmService.getAllProgresos();

    return (
      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-200 pb-6 mb-6">
          <div>
            <h2 className={headerTitleClass}>
              <ClipboardList className="w-6 h-6 text-gray-500" />
              Análisis y Progreso Grupal de la Clase
            </h2>
            <p className="text-[13px] text-gray-500 mt-1">
              Consolidado de rendimiento académico para todas las lecciones.
            </p>
          </div>
        </div>

        {/* Student metrics table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-medium text-gray-500 uppercase tracking-wide">Desempeño Individual por Alumno</h3>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Nombre Alumno</th>
                  <th className="py-3 px-4">Lecciones Completas</th>
                  <th className="py-3 px-4">Precisión General</th>
                  <th className="py-3 px-4">Tiempo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {perStudent.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{s.name}</td>
                    <td className="py-3 px-4 text-gray-600">{s.lessonsCount}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {s.accuracy !== null ? `${Math.round(s.accuracy * 100)}%` : "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{Math.round(s.timeSeconds / 60)} mins</td>
                  </tr>
                ))}
                {perStudent.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No hay alumnos registrados en esta clase.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 24-Lesson Grid */}
        <div className="space-y-6 mt-12">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-medium text-gray-500 uppercase tracking-wide">Matriz de Lecciones Completadas</h3>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 sticky left-0 z-10 bg-gray-50 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">Alumno</th>
                  {Array.from({ length: TOTAL_LESSONS }).map((_, i) => (
                    <th key={i} className="py-3 px-4 text-center min-w-[2.5rem] font-mono text-[12px]">L{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {perStudent.map((s: any) => {
                  const prog = allProgresos.find(p => p.alumnoId === s.id)?.leccionesCompletadas || [];
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-800 sticky left-0 z-10 bg-white group-hover:bg-gray-50 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                        {s.name}
                      </td>
                      {Array.from({ length: TOTAL_LESSONS }).map((_, i) => {
                        const l = i + 1;
                        const isComplete = prog.includes(l);
                        return (
                          <td key={l} className="p-2 text-center border-l border-gray-100">
                            {isComplete ? (
                              <Check className="w-4 h-4 text-green-600 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {perStudent.length === 0 && (
                  <tr>
                    <td colSpan={TOTAL_LESSONS + 1} className="py-8 text-center text-gray-400">
                      No hay alumnos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
