import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { listClasses, getClass } from "@/lib/teacher.functions";
import { crmService } from "@/services/crm";
import { TOTAL_LESSONS } from "@/lib/lesson-catalog";

export const Route = createFileRoute("/cartilla/teacher/progreso")({
  component: TeacherProgressPage,
  head: () => ({
    meta: [{ title: "Progreso — La Cartilla de Gretel CRM" }],
  }),
});

function TeacherProgressPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0); // Trigger re-render on local storage update

  // 1. Fetch Classes
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => listClasses(),
  });

  // 2. Fetch Students for Selected Class
  const { data: classData, isLoading: loadingStudents } = useQuery({
    queryKey: ["teacher-class-students", selectedClassId],
    queryFn: () => getClass({ data: { id: selectedClassId } }),
    enabled: !!selectedClassId,
  });

  // Default class
  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    const handleUpdate = () => setRefreshKey((k) => k + 1);
    window.addEventListener("cartilla-crm-updated", handleUpdate);
    return () => window.removeEventListener("cartilla-crm-updated", handleUpdate);
  }, []);

  const handleToggle = (studentId: string, lessonNum: number) => {
    crmService.toggleLeccion(studentId, lessonNum);
  };

  const allProgresos = crmService.getAllProgresos();

  return (
    <div className="w-full space-y-6">
      <header className="no-print">
        <h1 className="text-3xl font-black text-stone-800">Progreso de la Clase</h1>
        <p className="text-sm font-bold text-stone-500 mt-1">
          Marca manualmente las lecciones completadas por cada alumno. Toca en una celda para
          alternar.
        </p>
      </header>

      {/* Class Selector */}
      <div className="flex gap-4 p-5 bg-stone-50 border border-stone-200 rounded-3xl no-print shadow-sm">
        <div className="flex-1 max-w-sm">
          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 ml-1">
            Clase
          </label>
          {loadingClasses ? (
            <div className="text-sm font-bold text-stone-400 py-2">Cargando clases...</div>
          ) : (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 cursor-pointer text-sm"
            >
              {classes?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.student_count} alumnos)
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loadingStudents ? (
        <div className="p-12 text-center font-bold text-stone-400 animate-pulse bg-white border border-stone-200 rounded-[2rem]">
          Cargando listado de alumnos...
        </div>
      ) : classData?.students?.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-[2rem]">
          <h2 className="text-xl font-bold text-stone-800">No hay alumnos</h2>
          <p className="text-stone-500 mt-2">
            Agrega alumnos a esta clase desde el Roster para marcar su progreso.
          </p>
        </div>
      ) : classData?.students ? (
        <div className="bg-white border border-stone-200 rounded-[2rem] shadow-xs overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-stone-50/70 text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="p-4 pl-6 sticky left-0 z-10 bg-stone-50/95 backdrop-blur shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                  Alumno
                </th>
                {Array.from({ length: TOTAL_LESSONS }).map((_, i) => (
                  <th key={i} className="p-4 text-center min-w-[3rem]">
                    L{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {classData.students.map((s) => {
                const prog =
                  allProgresos.find((p) => p.alumnoId === s.id)?.leccionesCompletadas || [];
                return (
                  <tr key={s.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 pl-6 font-extrabold text-stone-800 sticky left-0 z-10 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                      {s.display_name}
                    </td>
                    {Array.from({ length: TOTAL_LESSONS }).map((_, i) => {
                      const l = i + 1;
                      const isComplete = prog.includes(l);
                      return (
                        <td key={l} className="p-2 text-center">
                          <button
                            onClick={() => handleToggle(s.id, l)}
                            className={`w-10 h-10 min-w-[48px] min-h-[48px] m-auto rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                              isComplete
                                ? "bg-emerald-100 text-emerald-600 shadow-sm scale-100"
                                : "bg-stone-100 text-stone-300 hover:bg-stone-200 scale-95 hover:scale-100"
                            }`}
                            aria-label={`Marcar lección ${l} de ${s.display_name}`}
                          >
                            {isComplete ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <X className="w-4 h-4 opacity-0 hover:opacity-100" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
