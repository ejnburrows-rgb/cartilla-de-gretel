import { useState, useEffect, useMemo } from "react";
import {
  User,
  Trash2,
  GraduationCap,
  Award,
  AlertCircle,
  PlusCircle,
  CheckCircle,
  Search,
  Pencil,
  ArchiveRestore,
  Archive,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listClasses,
  getClass,
  createClass,
  addStudents,
  deleteStudent,
  updateStudent,
  archiveStudent,
  restoreStudent,
} from "@/lib/teacher.functions";
import {
  listSeedClasses,
  getSeedClass,
  createSeedClass,
  addSeedStudents,
  deleteSeedStudent,
  isSeedSessionActive,
} from "@/lib/seed-data";

interface RosterStudent {
  id: string;
  display_name: string;
  student_code: string;
  lessons: number;
  lastSeen: string | null;
  archived_at?: string | null;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Synchronously detect if we are using the local seed teacher session
  const isSeed = useMemo(() => isSeedSessionActive(), []);

  // 1. Fetch Classes
  const {
    data: realClasses,
    isLoading: loadingRealClasses,
    refetch: refetchRealClasses,
  } = useQuery({
    queryKey: ["roster-classes"],
    queryFn: () => listClasses(),
    enabled: !isSeed,
  });

  const seedClasses = useMemo(() => {
    // busy is referenced so mutations bump this memo and reread seed storage.
    void busy;
    if (!isSeed) return [];
    try {
      return listSeedClasses() as RosterClass[];
    } catch {
      return [];
    }
  }, [isSeed, busy]);

  const classesList: RosterClass[] = useMemo(
    () => (isSeed ? seedClasses : (realClasses ?? [])),
    [isSeed, seedClasses, realClasses],
  );
  const loadingClasses = !isSeed && loadingRealClasses;

  // Set default class
  useEffect(() => {
    if (classesList.length > 0 && !selectedClassId) {
      setSelectedClassId(classesList[0].id);
    }
  }, [classesList, selectedClassId]);

  // 2. Fetch Students for Selected Class
  const {
    data: realClassData,
    isLoading: loadingRealStudents,
    refetch: refetchRealStudents,
  } = useQuery({
    queryKey: ["roster-students", selectedClassId, showArchived],
    queryFn: () => getClass({ data: { id: selectedClassId, includeArchived: showArchived } }),
    enabled: !isSeed && !!selectedClassId,
  });

  const seedClassData = useMemo(() => {
    void busy;
    if (!isSeed || !selectedClassId) return null;
    try {
      return getSeedClass(selectedClassId);
    } catch {
      return null;
    }
  }, [isSeed, selectedClassId, busy]);

  const activeClass = classesList.find((c) => c.id === selectedClassId);

  const allStudents: RosterStudent[] = useMemo(() => {
    if (isSeed) {
      return (seedClassData?.students ?? []) as RosterStudent[];
    }
    return (realClassData?.students ?? []) as RosterStudent[];
  }, [isSeed, seedClassData, realClassData]);

  const studentsList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allStudents;
    return allStudents.filter((s) => s.display_name.toLowerCase().includes(q));
  }, [allStudents, searchQuery]);

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
    if (!window.confirm(`¿Seguro que deseas eliminar a ${name}? Se perderá todo su progreso.`))
      return;
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

  const startEditing = (s: RosterStudent) => {
    setEditingId(s.id);
    setEditingName(s.display_name);
  };

  const handleSaveRename = async (studentId: string) => {
    const name = editingName.trim();
    if (!name) return;
    setEditingId(null);
    if (isSeed) {
      showMessage("Renombrar no está disponible en modo local todavía.", "error");
      return;
    }
    try {
      await updateStudent({ data: { id: studentId, displayName: name } });
      await refetchRealStudents();
      showMessage("Nombre actualizado.", "success");
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Error renombrando alumno", "error");
    }
  };

  const handleArchiveToggle = async (s: RosterStudent) => {
    if (isSeed) {
      showMessage("Archivar no está disponible en modo local todavía.", "error");
      return;
    }
    setBusy(true);
    try {
      if (s.archived_at) {
        await restoreStudent({ data: { id: s.id } });
        showMessage("Alumno restaurado.", "success");
      } else {
        await archiveStudent({ data: { id: s.id } });
        showMessage("Alumno archivado.", "success");
      }
      await refetchRealStudents();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Error archivando alumno", "error");
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
          className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
            msg.type === "success"
              ? "bg-[hsl(145,60%,97%)] border-[hsl(145,60%,90%)] text-[hsl(145,65%,25%)]"
              : "bg-[hsl(354,78%,97%)] border-[hsl(354,78%,90%)] text-[hsl(354,78%,35%)]"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Class Selector Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-5 bg-[hsl(48,100%,96%)] border border-[hsl(28,30%,18%)]/8 rounded-[2rem] shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1 mb-1">
              Clase Activa
            </span>
            {loadingClasses ? (
              <span className="text-sm text-stone-400 font-bold px-3 py-2">Cargando...</span>
            ) : classesList.length === 0 ? (
              <span className="text-sm text-stone-400 font-bold px-3 py-2 italic">Sin clases</span>
            ) : (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-4 py-2.5 rounded-2xl border-2 border-[hsl(28,30%,18%)]/10 bg-white text-stone-800 font-extrabold text-sm focus:outline-none focus:border-vowel-a shadow-xs cursor-pointer"
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
            <div className="flex flex-col mt-2 sm:mt-4 ml-1">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                Código de la clase
              </span>
              <span className="text-lg font-black text-vowel-e font-mono mt-0.5">
                {activeClass.join_code}
              </span>
            </div>
          )}
        </div>

        {/* Create Class Form */}
        <form onSubmit={handleCreateClass} className="flex gap-2 items-end">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1 mb-1">
              Nueva clase
            </span>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Ej. Primaria 1° A"
              maxLength={40}
              disabled={busy}
              className="px-4 py-2 rounded-2xl border-2 border-[hsl(28,30%,18%)]/10 bg-white text-stone-800 text-sm focus:outline-none focus:border-vowel-a outline-none w-44"
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy || !newClassName.trim()}
            className="px-4 py-2.5 rounded-2xl bg-vowel-o text-white font-black text-sm hover:brightness-105 active:scale-95 shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Crear
          </button>
        </form>
      </div>

      {/* Main Content Area */}
      {classesList.length === 0 ? (
        /* Honest Empty State: No Classes */
        <div className="kid-card p-12 text-center bg-white/70 max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-[hsl(48,100%,94%)] text-vowel-e flex items-center justify-center mx-auto shadow-inner float-soft">
            <GraduationCap className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-stone-800 font-fredoka">
              Aún no tienes clases creadas
            </h2>
            <p className="text-sm font-semibold text-stone-500 mt-2 max-w-sm mx-auto leading-relaxed">
              Crea tu primera clase usando el formulario de arriba para comenzar a gestionar alumnos
              y ver el progreso.
            </p>
          </div>
          <div
            className="p-4 rounded-2xl bg-[hsl(354,78%,98%)] border text-left text-xs text-[hsl(354,78%,35%)] font-bold flex items-start gap-3"
            style={alertBoxStyle}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              <strong>Nota sobre la cuenta:</strong>{" "}
              {isSeed
                ? "Estás operando en modo local (sin Supabase). Todos los datos se guardan de manera segura en la memoria de este navegador."
                : "Tu cuenta de maestro está vinculada a la nube. El progreso se sincronizará automáticamente."}
            </p>
          </div>
        </div>
      ) : loadingStudents ? (
        <div className="p-12 text-center font-bold text-stone-400 animate-pulse bg-white border border-stone-200 rounded-3xl">
          Cargando listado de alumnos...
        </div>
      ) : allStudents.length === 0 ? (
        /* Honest Empty State: Class exists, but has no students */
        <div className="kid-card p-12 text-center bg-white/70 max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[hsl(198,78%,95%)] text-vowel-i flex items-center justify-center mx-auto shadow-inner">
            <User className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-stone-800 font-fredoka">
              Esta clase está vacía
            </h2>
            <p className="text-sm font-semibold text-stone-500 mt-2 leading-relaxed">
              Pídeles a tus alumnos que entren a{" "}
              <strong className="text-vowel-i">/cartilla/unirse</strong> y escriban el código de
              clase <strong className="font-mono text-vowel-e">{activeClass?.join_code}</strong>.
            </p>
            <p className="text-xs font-bold text-stone-400 mt-1.5">
              O añade un alumno manualmente en el siguiente formulario.
            </p>
          </div>

          <form
            onSubmit={handleAddStudent}
            className="flex gap-2 max-w-md mx-auto justify-center items-center"
          >
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="Nombre del alumno"
              maxLength={50}
              disabled={busy}
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-[hsl(28,30%,18%)]/10 bg-white text-stone-800 text-sm focus:outline-none focus:border-vowel-a outline-none shadow-xs"
              required
            />
            <button
              type="submit"
              disabled={busy || !newStudentName.trim()}
              className="px-6 py-3 rounded-2xl bg-vowel-a text-white font-black text-sm hover:brightness-105 active:scale-95 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              + Añadir Alumno
            </button>
          </form>
        </div>
      ) : (
        /* Dynamic Student Table */
        <div className="bg-white border border-stone-200 rounded-[2rem] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[hsl(48,100%,99%)]">
            <div>
              <h2 className="text-xl font-black text-stone-800">Miembros de la Clase</h2>
              <p className="text-sm font-semibold text-stone-500 mt-1">
                Lista oficial de alumnos inscritos en {activeClass?.name}.
              </p>
            </div>

            {/* Quick Add Form inside Header */}
            <form onSubmit={handleAddStudent} className="flex gap-2 items-center w-full sm:w-auto">
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Añadir alumno nuevo..."
                maxLength={45}
                disabled={busy}
                className="px-4 py-2 rounded-2xl border-2 border-[hsl(28,30%,18%)]/10 bg-white text-stone-800 text-xs focus:outline-none focus:border-vowel-a outline-none shadow-inner flex-1 sm:w-48"
                required
              />
              <button
                type="submit"
                disabled={busy || !newStudentName.trim()}
                className="px-4 py-2 rounded-2xl bg-vowel-a text-white font-black text-xs hover:brightness-105 active:scale-95 shadow-sm transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                + Añadir
              </button>
            </form>
          </div>

          <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar alumno por nombre…"
                className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-stone-200 text-sm font-medium focus:outline-none focus:border-vowel-a"
              />
            </div>
            {!isSeed && (
              <label className="flex items-center gap-2 text-xs font-bold text-stone-500 cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="w-4 h-4"
                />
                Mostrar archivados
              </label>
            )}
          </div>

          {studentsList.length === 0 ? (
            <div className="p-8 text-center text-sm font-bold text-stone-400">
              Ningún alumno coincide con &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50/70 text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="p-4 pl-6">Alumno</th>
                    <th className="p-4">Código Personal</th>
                    <th className="p-4">Lecciones Completas</th>
                    <th className="p-4">Última Actividad</th>
                    <th className="p-4 pr-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {studentsList.map((s) => (
                    <tr
                      key={s.id}
                      className={`hover:bg-stone-50/50 transition-colors group ${s.archived_at ? "opacity-50" : ""}`}
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(28,87%,88%)] to-[hsl(48,95%,85%)] flex items-center justify-center text-orange-800 shadow-inner shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          {editingId === s.id ? (
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onBlur={() => handleSaveRename(s.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveRename(s.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              autoFocus
                              maxLength={50}
                              className="font-extrabold text-stone-800 text-sm px-2 py-1 rounded-lg border-2 border-vowel-a focus:outline-none w-40"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditing(s)}
                              disabled={isSeed}
                              className="font-extrabold text-stone-800 text-sm text-left hover:underline decoration-dotted underline-offset-2 disabled:no-underline disabled:cursor-default cursor-pointer"
                              title={isSeed ? undefined : "Editar nombre"}
                            >
                              {s.display_name}
                              {s.archived_at && (
                                <span className="ml-2 text-[10px] font-black uppercase tracking-wide text-stone-400 align-middle">
                                  Archivado
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/50">
                          {s.student_code}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
                          <Award className="w-4 h-4 text-emerald-500" /> {s.lessons} lecciones
                        </div>
                      </td>
                      <td className="p-4 text-stone-600 font-semibold text-xs">
                        {s.lastSeen
                          ? new Date(s.lastSeen).toLocaleDateString()
                          : "Ninguna registrada"}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEditing(s)}
                            disabled={busy || isSeed}
                            className="p-2 text-stone-400 hover:text-vowel-a hover:bg-[hsl(48,100%,97%)] rounded-xl transition duration-200 cursor-pointer disabled:opacity-50"
                            title="Renombrar Alumno"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchiveToggle(s)}
                            disabled={busy || isSeed}
                            className="p-2 text-stone-400 hover:text-vowel-o hover:bg-[hsl(198,78%,97%)] rounded-xl transition duration-200 cursor-pointer disabled:opacity-50"
                            title={s.archived_at ? "Restaurar Alumno" : "Archivar Alumno"}
                          >
                            {s.archived_at ? (
                              <ArchiveRestore className="w-4 h-4" />
                            ) : (
                              <Archive className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id, s.display_name)}
                            disabled={busy}
                            className="p-2 text-stone-400 hover:text-[hsl(354,78%,56%)] hover:bg-[hsl(354,78%,98%)] rounded-xl transition duration-200 cursor-pointer disabled:opacity-50"
                            title="Eliminar Alumno"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
