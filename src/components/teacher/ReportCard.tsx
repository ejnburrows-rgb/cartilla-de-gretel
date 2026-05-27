import { useQuery } from "@tanstack/react-query";
import { getStudentProgress, getClassProgress } from "@/lib/teacher.functions";
import { ClipboardList, Award, BookOpen, Clock, AlertTriangle, FileSpreadsheet } from "lucide-react";

interface ReportCardProps {
  classId: string;
  studentId: string | null;
}

const cardClass = "bg-white border border-stone-200 rounded-3xl p-6 shadow-sm";
const metricBoxClass = "flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:bg-stone-100/50 transition-colors";
const metricValClass = "text-2xl font-black text-stone-800";
const metricLblClass = "text-[10px] font-bold text-stone-500 uppercase tracking-widest";
const headerTitleClass = "text-2xl font-black text-stone-800 flex items-center gap-2";

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
      <div className="p-8 text-center text-stone-500 font-bold bg-white border border-stone-200 rounded-3xl animate-pulse">
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
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-stone-150 pb-6 mb-6">
          <div>
            <h2 className={headerTitleClass}>
              <Award className="w-6 h-6 text-orange-400" />
              Reporte de Logros: {student.display_name}
            </h2>
            <p className="text-xs font-bold text-stone-500 mt-1">
              Código Alumno: <span className="font-mono text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">{student.student_code}</span> | Clase: {classObj?.name}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full border border-orange-200/50">
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
          <h3 className="text-sm font-black text-stone-700 uppercase tracking-wider mb-3">Historial de Progreso Reciente</h3>
          <div className="overflow-x-auto border border-stone-200 rounded-2xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Evento</th>
                  <th className="p-3">Lección</th>
                  <th className="p-3">Puntuación / Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {events.slice(0, 10).map((e: any) => (
                  <tr key={e.id}>
                    <td className="p-3 font-mono text-xs">{new Date(e.created_at).toLocaleDateString()}</td>
                    <td className="p-3 capitalize font-bold text-stone-700">{e.event_kind}</td>
                    <td className="p-3">Lección {e.lesson_id}</td>
                    <td className="p-3">
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
                    <td colSpan={4} className="p-8 text-center font-bold text-stone-400">
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

    return (
      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-stone-150 pb-6 mb-6">
          <div>
            <h2 className={headerTitleClass}>
              <ClipboardList className="w-6 h-6 text-orange-400" />
              Análisis y Progreso Grupal de la Clase
            </h2>
            <p className="text-xs font-bold text-stone-500 mt-1">
              Consolidado de rendimiento académico para todas las lecciones.
            </p>
          </div>
        </div>

        {/* Student metrics table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-stone-700 uppercase tracking-wider">Desempeño Individual por Alumno</h3>
          </div>
          <div className="overflow-x-auto border border-stone-200 rounded-2xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3">Nombre Alumno</th>
                  <th className="p-3">Lecciones Completas</th>
                  <th className="p-3">Precisión General</th>
                  <th className="p-3">Tiempo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {perStudent.map((s: any) => (
                  <tr key={s.id}>
                    <td className="p-3 font-bold text-stone-800">{s.name}</td>
                    <td className="p-3">{s.lessonsCount}</td>
                    <td className="p-3 font-bold">
                      {s.accuracy !== null ? `${Math.round(s.accuracy * 100)}%` : "—"}
                    </td>
                    <td className="p-3">{Math.round(s.timeSeconds / 60)} mins</td>
                  </tr>
                ))}
                {perStudent.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center font-bold text-stone-400">
                      No hay alumnos registrados en esta clase.
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
