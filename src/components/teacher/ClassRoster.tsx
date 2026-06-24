import { useState, useEffect, useMemo } from "react";
import { User, Trash2, GraduationCap, Award, BookOpen, AlertCircle, PlusCircle, CheckCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { listClasses, getClass, createClass, addStudents, deleteStudent } from "@/lib/teacher.functions";
import { 
  getSeedTeacher, 
  listSeedClasses, 
  getSeedClass, 
  createSeedClass, 
  addSeedStudents, 
  deleteSeedStudent 
} from "@/lib/seed-data";

interface RosterStudent {
  id: string;
  display_name: string;
  student_code: string;
  lessons: number;
  lastSeen: string | null;
}

interface RosterClass {
  id: string;
  name: string;
  join_code: string;
  student_count: number;
}

export function ClassRoster() {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [newClassName, setNewClassName] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Synchronously detect if we are using the local seed teacher session
  const isSeed = useMemo(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("cartilla.seed.teacher.v1") || !supabase.auth.getSession();
  }, []);

  // 1. Fetch Classes
  const { data: realClasses, isLoading: loadingRealClasses, refetch: refetchRealClasses } = useQuery({
    queryKey: ["roster-classes"],
    queryFn: () => listClasses(),
    enabled: !isSeed,
  });

  const seedClasses = useMemo(() => {
    if (!isSeed) return [];
    try {
      return listSeedClasses() as RosterClass[];
    } catch {
      return [];
    }
  }, [isSeed, busy]);

  const classesList: RosterClass[] = isSeed ? seedClasses : (realClasses ?? []);
  const loadingClasses = !isSeed && loadingRealClasses;

  // Set default class
  useEffect(() => {
    if (classesList.length > 0 && !selectedClassId) {
      setSelectedClassId(classesList[0].id);
    }
  }, [classesList, selectedClassId]);

  // 2. Fetch Students for Selected Class
  const { data: realClassData, isLoading: loadingRealStudents, refetch: refetchRealStudents } = useQuery({
    queryKey: ["roster-students", selectedClassId],
    queryFn: () => getClass({ data: { id: selectedClassId } }),
    enabled: !isSeed && !!selectedClassId,
  });

  const seedClassData = useMemo(() => {
    if (!isSeed || !selectedClassId) return null;
    try {
      return getSeedClass(selectedClassId);
    } catch {
      return null;
    }
  }, [isSeed, selectedClassId, busy]);

  const activeClass = classesList.find((c) => c.id === selectedClassId);
  
  const studentsList: RosterStudent[] = useMemo(() => {
    if (isSeed) {
      return (seedClassData?.students ?? []) as RosterStudent[];
    }
    return (realClassData?.students ?? []) as RosterStudent[];
  }, [isSeed, seedClassData, realClassData]);

  const loadingStudents = !isSeed && loadingRealStudents;

  // Helpers
  const showMessage = (text: string, type: "success" | "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  // Actions
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setBusy(true);
    try {
      if (isSeed) {
        const newCls = createSeedClass(newClassName.trim());
        setSelectedClassId(newCls.id);
        showMessage(`Clase "${newClassName}" creada correctamente.`, "success");
      } else {
        const newCls = await createClass({ data: { name: newClassName.trim() } });
        await refetchRealClasses();
        if (newCls) setSelectedClassId(newCls.id);
        showMessage(`Clase "${newClassName}" creada en la nube.`, "success");
      }
      setNewClassName("");
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Error creando clase", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedClassId) return;
    setBusy(true);
    try {
      if (isSeed) {
        addSeedStudents(selectedClassId, [newStudentName.trim()]);
        showMessage(`Estudiante "${newStudentName}" añadido correctamente.`, "success");
      } else {
        await addStudents({ data: { classId: selectedClassId, names: [newStudentName.trim()] } });
        await refetchRealStudents();
        showMessage(`Estudiante "${newStudentName}" añadido a la nube.`, "success");
      }
      setNewStudentName("");
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Error añadiendo alumno", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a ${name}? Se perderá todo su progreso.`)) return;
    setBusy(true);
    try {
      if (isSeed) {
        deleteSeedStudent(studentId);
        showMessage("Alumno eliminado localmente.", "success");
      } else {
        await deleteStudent({ data: { id: studentId } });
        await refetchRealStudents();
        showMessage("Alumno eliminado de la nube.", "success");
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Error eliminando alumno", "error");
    } finally {
      setBusy(false);
    }
  };

  // Hoisted styles to satisfy the JSX double-brace styling ban
  const alertBoxStyle: React.CSSProperties = {
    borderColor: "hsl(var(--vowel-a) / 0.15)",
  };

  return (
    <div className="space-y-6">
      {/* Messages banner */}
      {msg && (
        <div 
          className={`p-4 rounded-md border text-sm font-medium flex items-center gap-2 ${
            msg.type === "success" 
              ? "bg-[#e6f4ea] border-[#ceead6] text-[#137333]" 
              : "bg-[#fce8e6] border-[#fad2cf] text-[#c5221f]"
          }`}
        >
          {msg.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Class Selector Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 bg-white border border-gray-200 rounded-md shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 mb-1">Clase Activa</span>
            {loadingClasses ? (
              <span className="text-sm text-gray-400 font-medium px-3 py-2">Cargando...</span>
            ) : classesList.length === 0 ? (
              <span className="text-sm text-gray-400 font-medium px-3 py-2 italic">Sin clases</span>
            ) : (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {classesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.student_count} alumnos)
                  </option>
                ))}
              </select>
            )}
          </div>
          {activeClass && (
            <div className="flex flex-col mt-2 sm:mt-0">
              <span className="text-[12px] font-medium text-gray-500">Código de la clase</span>
              <span className="text-[15px] font-mono text-gray-800">{activeClass.join_code}</span>
            </div>
          )}
        </div>

        {/* Create Class Form */}
        <form onSubmit={handleCreateClass} className="flex gap-2 items-end">
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 mb-1">Nueva clase</span>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Ej. Primaria 1° A"
              maxLength={40}
              disabled={busy}
              className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none w-44"
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy || !newClassName.trim()}
            className="px-4 py-2 rounded-md bg-[#1a73e8] text-white font-medium text-sm hover:bg-[#1557b0] transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Crear
          </button>
        </form>
      </div>

      {/* Main Content Area */}
      {classesList.length === 0 ? (
        /* Honest Empty State: No Classes */
        <div className="p-12 text-center bg-white border border-gray-200 rounded-md max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[18px] font-medium text-gray-800">Aún no tienes clases creadas</h2>
            <p className="text-[14px] text-gray-600 mt-2 max-w-sm mx-auto leading-relaxed">
              Crea tu primera clase usando el formulario de arriba para comenzar a gestionar alumnos y ver el progreso.
            </p>
          </div>
          <div className="p-4 rounded-md bg-[#e8f0fe] border border-[#d2e3fc] text-left text-[13px] text-[#1967d2] flex items-start gap-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              <strong>Nota sobre la cuenta:</strong> {isSeed ? "Estás operando en modo local (sin Supabase). Todos los datos se guardan de manera segura en la memoria de este navegador." : "Tu cuenta de maestro está vinculada a la nube. El progreso se sincronizará automáticamente."}
            </p>
          </div>
        </div>
      ) : loadingStudents ? (
        <div className="p-12 text-center text-gray-500 animate-pulse bg-white border border-gray-200 rounded-md">
          Cargando listado de alumnos...
        </div>
      ) : studentsList.length === 0 ? (
        /* Honest Empty State: Class exists, but has no students */
        <div className="p-12 text-center bg-white border border-gray-200 rounded-md max-w-xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[18px] font-medium text-gray-800">Esta clase está vacía</h2>
            <p className="text-[14px] text-gray-600 mt-2 leading-relaxed">
              Pídeles a tus alumnos que entren a <strong>/cartilla/unirse</strong> y escriban el código de clase <strong className="font-mono text-gray-800">{activeClass?.join_code}</strong>.
            </p>
            <p className="text-[13px] text-gray-500 mt-1">
              O añade un alumno manualmente en el siguiente formulario.
            </p>
          </div>

          <form onSubmit={handleAddStudent} className="flex gap-2 max-w-md mx-auto justify-center items-center">
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="Nombre del alumno"
              maxLength={50}
              disabled={busy}
              className="flex-1 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={busy || !newStudentName.trim()}
              className="px-4 py-2 rounded-md bg-[#1a73e8] text-white font-medium text-sm hover:bg-[#1557b0] transition disabled:opacity-50 cursor-pointer"
            >
              + Añadir
            </button>
          </form>
        </div>
      ) : (
        /* Dynamic Student Table */
        <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-[16px] font-medium text-gray-800">Miembros de la Clase</h2>
              <p className="text-[13px] text-gray-500 mt-1">
                Lista de alumnos inscritos en {activeClass?.name}.
              </p>
            </div>
            
            {/* Quick Add Form inside Header */}
            <form onSubmit={handleAddStudent} className="flex gap-2 items-center w-full sm:w-auto">
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Añadir alumno..."
                maxLength={45}
                disabled={busy}
                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:w-48"
                required
              />
              <button
                type="submit"
                disabled={busy || !newStudentName.trim()}
                className="px-3 py-1.5 rounded-md bg-[#1a73e8] text-white font-medium text-sm hover:bg-[#1557b0] transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                + Añadir
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 text-gray-500 font-medium text-[13px] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 pl-6">Alumno</th>
                  <th className="py-3 px-4">Código Personal</th>
                  <th className="py-3 px-4">Lecciones Completas</th>
                  <th className="py-3 px-4">Última Actividad</th>
                  <th className="py-3 px-4 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {studentsList.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-3 px-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-[14px]">{s.display_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[13px] font-mono text-gray-600">
                        {s.student_code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                        <Award className="w-4 h-4 text-green-600" /> {s.lessons}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-[13px]">
                      {s.lastSeen ? new Date(s.lastSeen).toLocaleDateString() : "Ninguna registrada"}
                    </td>
                    <td className="py-3 px-4 pr-6 text-right">
                      <button
                         onClick={() => handleDeleteStudent(s.id, s.display_name)}
                        disabled={busy}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition duration-200 cursor-pointer disabled:opacity-50"
                        title="Eliminar Alumno"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
