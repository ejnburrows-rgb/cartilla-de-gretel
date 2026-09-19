import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { listClasses, getClassProgress } from "@/lib/teacher.functions";
import { isSeedSessionActive, listSeedClasses, getSeedClassProgress } from "@/lib/seed-data";
import { TOTAL_LESSONS } from "@/lib/lesson-catalog";

export const Route = createFileRoute("/cartilla/teacher/progreso")({
  component: TeacherProgressPage,
  head: () => ({
    meta: [{ title: "Progreso — La Cartilla de Gretel CRM" }],
  }),
});

type StudentProgressRow = { id: string; name: string; completedLessonIds: string[] };

function TeacherProgressPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Synchronously detect if we are using the local seed teacher session — same
  // pattern as ClassRoster.tsx / ReportCard.tsx, needed because listClasses and
  // getClassProgress are real Supabase-only calls with no demo-mode fallback of
  // their own.
  const isSeed = useMemo(() => isSeedSessionActive(), []);

  // 1. Fetch Classes
  const { data: realClasses, isLoading: loadingRealClasses } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => listClasses(),
    enabled: !isSeed,
  });

  const seedClasses = useMemo(() => {
    if (!isSeed) return [];
    try {
      return listSeedClasses();
    } catch {
      return [];
    }
  }, [isSeed]);

  const classes = isSeed ? seedClasses : realClasses;
  const loadingClasses = !isSeed && loadingRealClasses;

  // 2. Fetch REAL per-student progress for the selected class. This replaces the
  // old local-only crmService toggle: the grid is now a read-only reflection of
  // the lessons each student has actually completed (logged to Supabase / seed
  // store as they work), same data source the Reportes page uses.
  const { data: realClassProgress, isLoading: loadingRealProgress } = useQuery({
    queryKey: ["teacher-class-progress", selectedClassId],
    queryFn: () => getClassProgress({ data: { id: selectedClassId } }),
    enabled: !isSeed && !!selectedClassId,
  });

  const seedClassProgress = useMemo(() => {
    if (!isSeed || !selectedClassId) return null;
    try {
      return getSeedClassProgress(selectedClassId);
    } catch {
      return null;
    }
  }, [isSeed, selectedClassId]);

  const classProgress = isSeed ? seedClassProgress : realClassProgress;
  const loadingProgress = !isSeed && loadingRealProgress;
  const perStudent: StudentProgressRow[] = classProgress?.perStudent ?? [];

  // Default class
  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  return (
    <div className="w-full space-y-6">
      <header className="no-print">
        <h1 className="text-3xl font-black text-stone-800">Progreso de la Clase</h1>
        <p className="text-sm font-bold text-stone-500 mt-1">
          Lecciones que cada alumno ha completado, registradas automáticamente a medida que
          trabajan.
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

      {loadingProgress ? (
        <div className="p-12 text-center font-bold text-stone-400 animate-pulse bg-white border border-stone-200 rounded-[2rem]">
          Cargando progreso de la clase...
        </div>
      ) : perStudent.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-[2rem]">
          <h2 className="text-xl font-bold text-stone-800">No hay alumnos</h2>
          <p className="text-stone-500 mt-2">
            Agrega alumnos a esta clase desde el Roster para ver su progreso.
          </p>
        </div>
      ) : (
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
              {perStudent.map((s) => {
                const prog = s.completedLessonIds ?? [];
                return (
                  <tr key={s.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 pl-6 font-extrabold text-stone-800 sticky left-0 z-10 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                      {s.name}
                    </td>
                    {Array.from({ length: TOTAL_LESSONS }).map((_, i) => {
                      const l = i + 1;
                      const isComplete = prog.includes(String(l));
                      return (
                        <td key={l} className="p-2 text-center">
                          <div
                            className={`w-10 h-10 m-auto rounded-xl flex items-center justify-center ${
                              isComplete
                                ? "bg-emerald-100 text-emerald-600 shadow-sm"
                                : "bg-stone-100 text-stone-300"
                            }`}
                            aria-label={`Lección ${l} de ${s.name}: ${
                              isComplete ? "completada" : "pendiente"
                            }`}
                          >
                            {isComplete ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <span className="text-stone-300">—</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
