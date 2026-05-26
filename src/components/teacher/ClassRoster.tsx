import { ChevronRight, UsersRound } from "lucide-react";

type ClassStudent = {
  id: string;
  display_name: string;
  student_code?: string | null;
  events?: number;
  lessons?: number;
  lastSeen?: string | null;
};

type ClassRosterProps = {
  students: ClassStudent[];
  selectedStudentId?: string;
  onSelect: (student: ClassStudent) => void;
};

function formatLastSeen(value?: string | null) {
  if (!value) return "Sin actividad";
  return new Intl.DateTimeFormat("es", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ClassRoster({ students, selectedStudentId, onSelect }: ClassRosterProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Roster de clase</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{students.length} alumnos visibles</p>
        </div>
        <UsersRound className="h-5 w-5 text-slate-500" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-black">Alumno</th>
              <th className="px-4 py-3 font-black">Codigo</th>
              <th className="px-4 py-3 font-black">Lecciones</th>
              <th className="px-4 py-3 font-black">Eventos</th>
              <th className="px-4 py-3 font-black">Ultima vez</th>
              <th className="teacher-report-no-print px-4 py-3 font-black">Abrir</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const isSelected = student.id === selectedStudentId;
              return (
                <tr key={student.id} className={isSelected ? "bg-sky-50" : "bg-white"}>
                  <td className="border-t border-slate-100 px-4 py-3 font-black text-slate-950">
                    {student.display_name}
                  </td>
                  <td className="border-t border-slate-100 px-4 py-3 font-semibold text-slate-600">
                    {student.student_code ?? "-"}
                  </td>
                  <td className="border-t border-slate-100 px-4 py-3 font-semibold text-slate-700">
                    {student.lessons ?? 0}
                  </td>
                  <td className="border-t border-slate-100 px-4 py-3 font-semibold text-slate-700">
                    {student.events ?? 0}
                  </td>
                  <td className="border-t border-slate-100 px-4 py-3 font-semibold text-slate-600">
                    {formatLastSeen(student.lastSeen)}
                  </td>
                  <td className="teacher-report-no-print border-t border-slate-100 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onSelect(student)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-800"
                      aria-label={`Abrir reporte de ${student.display_name}`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-sm font-semibold text-slate-500" colSpan={6}>
                  Todavia no hay alumnos en esta clase.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
