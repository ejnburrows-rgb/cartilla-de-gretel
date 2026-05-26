import { Search, UserRoundCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { findStudentsByName } from "@/lib/teacher.functions";

type StudentSearchResult = Awaited<ReturnType<typeof findStudentsByName>>[number];

type StudentPickerProps = {
  classId?: string;
  selectedStudentId?: string;
  onSelect: (student: StudentSearchResult) => void;
};

function getClassName(student: StudentSearchResult) {
  const classes = student.classes;
  if (!classes) return "Clase sin nombre";
  if (Array.isArray(classes)) return classes[0]?.name ?? "Clase sin nombre";
  return classes.name ?? "Clase sin nombre";
}

export function StudentPicker({ classId, selectedStudentId, onSelect }: StudentPickerProps) {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<StudentSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      setIsLoading(true);
      setError(null);
      try {
        const results = await findStudentsByName({ data: { q: effectiveQuery, classId } });
        if (!cancelled) setStudents(results);
      } catch (err) {
        if (!cancelled) {
          setStudents([]);
          setError(err instanceof Error ? err.message : "No se pudieron cargar alumnos.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadStudents();
    return () => {
      cancelled = true;
    };
  }, [classId, effectiveQuery]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <label className="text-sm font-bold uppercase tracking-wide text-slate-600" htmlFor="student-search">
        Buscar alumno
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          id="student-search"
          className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nombre, codigo o clase"
        />
      </div>

      <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-slate-200">
        {isLoading && <p className="p-3 text-sm font-semibold text-slate-500">Cargando alumnos...</p>}
        {error && <p className="p-3 text-sm font-semibold text-rose-700">{error}</p>}
        {!isLoading && !error && students.length === 0 && (
          <p className="p-3 text-sm font-semibold text-slate-500">No hay alumnos para mostrar.</p>
        )}
        {!isLoading &&
          !error &&
          students.map((student) => {
            const isSelected = student.id === selectedStudentId;
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelect(student)}
                className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-3 text-left last:border-b-0 hover:bg-slate-50 ${
                  isSelected ? "bg-sky-50" : "bg-white"
                }`}
              >
                <span>
                  <span className="block text-sm font-black text-slate-950">{student.display_name}</span>
                  <span className="block text-xs font-semibold text-slate-500">
                    {student.student_code} · {getClassName(student)}
                  </span>
                </span>
                {isSelected && <UserRoundCheck className="h-5 w-5 shrink-0 text-sky-700" />}
              </button>
            );
          })}
      </div>
    </section>
  );
}
