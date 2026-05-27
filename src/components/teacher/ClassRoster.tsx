import { useState } from "react";
import { User, MoreHorizontal, Mail, Award, CheckCircle2, CircleDashed } from "lucide-react";

interface Student {
  id: string;
  name: string;
  code: string;
  lastActive: string;
  accuracy: number;
  lessonsCompleted: number;
  status: "active" | "inactive" | "needs_help";
}

// Mock Data
const MOCK_STUDENTS: Student[] = [
  {
    id: "1",
    name: "Ana Maria Lopez",
    code: "AML-01",
    lastActive: "Hoy, 10:30 AM",
    accuracy: 92,
    lessonsCompleted: 14,
    status: "active",
  },
  {
    id: "2",
    name: "Carlos Perez",
    code: "CPE-02",
    lastActive: "Ayer",
    accuracy: 85,
    lessonsCompleted: 10,
    status: "active",
  },
  {
    id: "3",
    name: "Sofía Ramírez",
    code: "SRA-03",
    lastActive: "Hace 3 días",
    accuracy: 65,
    lessonsCompleted: 4,
    status: "needs_help",
  },
  {
    id: "4",
    name: "Diego Fernandez",
    code: "DFE-04",
    lastActive: "Hace 1 semana",
    accuracy: 88,
    lessonsCompleted: 12,
    status: "inactive",
  },
  {
    id: "5",
    name: "Lucia Gomez",
    code: "LGO-05",
    lastActive: "Hoy, 09:15 AM",
    accuracy: 98,
    lessonsCompleted: 15,
    status: "active",
  },
];

export function ClassRoster() {
  const [students] = useState<Student[]>(MOCK_STUDENTS);

  return (
    <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden no-print">
      <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50/50">
        <div>
          <h2 className="text-xl font-black text-stone-800">Miembros de la Clase</h2>
          <p className="text-sm font-bold text-stone-500 mt-1">
            Gestión de alumnos y estado general.
          </p>
        </div>
        <button className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-bold rounded-xl shadow-sm transition">
          + Añadir Alumno
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
            <tr>
              <th className="p-4 pl-6">Alumno</th>
              <th className="p-4">Progreso</th>
              <th className="p-4">Última Actividad</th>
              <th className="p-4">Estado</th>
              <th className="p-4 pr-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-stone-50/80 transition-colors group">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-amber-300 flex items-center justify-center text-orange-800 shadow-inner">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-800">{s.name}</div>
                      <div className="text-xs font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                        {s.code}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
                      <Award className="w-4 h-4 text-emerald-500" /> {s.lessonsCompleted} lecciones
                    </div>
                    <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-400 rounded-full"
                        style={{ width: `${s.accuracy}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-4 text-stone-600 font-medium text-xs">{s.lastActive}</td>
                <td className="p-4">
                  {s.status === "active" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-md border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" /> Activo
                    </span>
                  )}
                  {s.status === "needs_help" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-wider rounded-md border border-red-100">
                      <CircleDashed className="w-3 h-3" /> Requiere Apoyo
                    </span>
                  )}
                  {s.status === "inactive" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 text-stone-600 text-[10px] font-black uppercase tracking-wider rounded-md border border-stone-200">
                      <CircleDashed className="w-3 h-3" /> Inactivo
                    </span>
                  )}
                </td>
                <td className="p-4 pr-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
