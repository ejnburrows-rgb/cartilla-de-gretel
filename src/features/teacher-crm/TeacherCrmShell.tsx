import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  MonitorPlay,
  Printer,
  GraduationCap,
  PlusCircle,
  AlertCircle,
  User,
  CheckCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import "../../styles/teacher-crm.css";
import { AccountPanel } from "./components/AccountPanel";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { KpiStrip } from "./components/KpiStrip";
import { PipelineBoard, type DashboardStudent } from "./components/PipelineBoard";
import { Sidebar } from "./components/Sidebar";
import { TaskList } from "./components/TaskList";
import { Topbar } from "./components/Topbar";

import {
  listClasses,
  getClass,
  createClass,
  addStudents,
  updateStudent,
} from "@/lib/teacher.functions";
import { needsAttention } from "@/lib/progress-calculation";
import {
  listSeedClasses,
  getSeedClass,
  createSeedClass,
  addSeedStudents,
  updateSeedStudent,
  isSeedSessionActive,
} from "@/lib/seed-data";

export function TeacherCrmShell() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Synchronously detect local seed teacher session
  const isSeed = useMemo(() => isSeedSessionActive(), []);

  // Bumped every time the demo/seed store is written. The seed layer already
  // announces its own writes with a "cartilla:seed-data" event; listening to it
  // is what makes a newly created class or student show up straight away.
  // (Before this, the reads below keyed off `busy`, but the seed branches are
  // synchronous — React batches the true/false pair into no visible change, so
  // the dashboard kept showing "create your first class" until a manual
  // reload, and a teacher could easily create the same class twice.)
  const [seedVersion, setSeedVersion] = useState(0);
  useEffect(() => {
    if (!isSeed) return;
    const bump = () => setSeedVersion((v) => v + 1);
    window.addEventListener("cartilla:seed-data", bump);
    return () => window.removeEventListener("cartilla:seed-data", bump);
  }, [isSeed]);

  // 1. Query Classes
  const {
    data: realClasses,
    isLoading: loadingRealClasses,
    refetch: refetchRealClasses,
  } = useQuery({
    queryKey: ["crm-classes"],
    queryFn: () => listClasses(),
    enabled: !isSeed,
  });

  const seedClasses = useMemo(() => {
    // seedVersion is referenced so every write to the seed store rereads it.
    void seedVersion;
    if (!isSeed) return [];
    try {
      return listSeedClasses();
    } catch {
      return [];
    }
  }, [isSeed, seedVersion]);

  const classesList = useMemo(
    () => (isSeed ? seedClasses : (realClasses ?? [])),
    [isSeed, seedClasses, realClasses],
  );
  const loadingClasses = !isSeed && loadingRealClasses;

  // Set default class ID
  useEffect(() => {
    if (classesList.length > 0 && !selectedClassId) {
      setSelectedClassId(classesList[0].id);
    }
  }, [classesList, selectedClassId]);

  // 2. Query Students for Selected Class
  const {
    data: realClassData,
    isLoading: loadingRealStudents,
    refetch: refetchRealStudents,
  } = useQuery({
    queryKey: ["crm-students", selectedClassId],
    queryFn: () => getClass({ data: { id: selectedClassId } }),
    enabled: !isSeed && !!selectedClassId,
  });

  const seedClassData = useMemo(() => {
    void seedVersion;
    if (!isSeed || !selectedClassId) return null;
    try {
      return getSeedClass(selectedClassId);
    } catch {
      return null;
    }
  }, [isSeed, selectedClassId, seedVersion]);

  const activeClass = classesList.find((c) => c.id === selectedClassId);

  const studentsList = useMemo(() => {
    if (isSeed) {
      return seedClassData?.students ?? [];
    }
    return realClassData?.students ?? [];
  }, [isSeed, seedClassData, realClassData]);

  const loadingStudents = !isSeed && loadingRealStudents;

  // Convert students to DashboardStudent type — reuses the exact same
  // completionPercent already computed by getClass/getAllTeacherStudents
  // via the shared progress-calculation module, so this dashboard's number
  // never disagrees with the roster or student detail page for the same
  // student.
  const dashboardStudents = useMemo<DashboardStudent[]>(() => {
    return studentsList.map((s) => {
      const withStats = s as {
        lessons?: number;
        completionPercent?: number;
        teacher_notes?: string | null;
      };
      const progressPct = isSeed
        ? Math.round(((withStats.lessons ?? 0) / 24) * 100)
        : (withStats.completionPercent ?? 0);
      return {
        id: s.id,
        name: s.display_name,
        progress: progressPct,
        lastActive: s.lastSeen ? new Date(s.lastSeen).toLocaleDateString() : "Nunca",
        alert: needsAttention({ completionPercent: progressPct, lastActiveAt: s.lastSeen ?? null }),
        teacher_notes: withStats.teacher_notes ?? undefined,
      };
    });
  }, [studentsList, isSeed]);

  // Default selected student ID
  useEffect(() => {
    if (dashboardStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(dashboardStudents[0].id);
    } else if (dashboardStudents.length === 0) {
      setSelectedStudentId(null);
    }
  }, [dashboardStudents, selectedStudentId]);

  const selectedStudent = dashboardStudents.find((s) => s.id === selectedStudentId) ?? null;

  // Calculate real metrics
  const activeStudentsCount = dashboardStudents.length;
  const averageProgressPct = useMemo(() => {
    if (dashboardStudents.length === 0) return "0%";
    const total = dashboardStudents.reduce((sum, s) => sum + s.progress, 0);
    return `${Math.round(total / dashboardStudents.length)}%`;
  }, [dashboardStudents]);

  const needsAttentionCount = dashboardStudents.filter((s) => s.alert).length;
  // Dynamic metrics of total completed exercises/lessons
  const totalCompletedLessons = useMemo(() => {
    return studentsList.reduce((sum, s) => sum + (s.lessons ?? 0), 0);
  }, [studentsList]);

  // Actions
  const showMessage = (text: string, type: "success" | "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setBusy(true);
    try {
      if (isSeed) {
        const newCls = createSeedClass(newClassName.trim());
        setSelectedClassId(newCls.id);
        showMessage(`Clase "${newClassName}" creada localmente.`, "success");
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

  const handleUpdateStudent = async (id: string, updates: Partial<DashboardStudent>) => {
    try {
      if (isSeed) {
        updateSeedStudent(id, { teacher_notes: updates.teacher_notes });
        showMessage("Cambios guardados localmente.", "success");
        setBusy((prev) => !prev); // force re-evaluation of seed data
      } else {
        await updateStudent({ data: { id, teacherNotes: updates.teacher_notes ?? null } });
        showMessage("Cambios guardados en la nube.", "success");
        await refetchRealStudents();
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Error guardando cambios", "error");
    }
  };

  // Hoisted alert borders to satisfy the double-brace ban
  const alertBoxStyle: React.CSSProperties = {
    borderColor: "hsl(var(--vowel-a) / 0.15)",
  };

  return (
    <div
      className="crm-app"
      style={{
        background: "radial-gradient(circle at top left, #fdf3e0 0%, #f5e8c8 50%, #ecdaaa 100%)",
      }}
    >
      <Sidebar />
      <main className="crm-main flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />

        <div className="crm-content flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Actions & Class Selector Bar */}
          <section className="rounded-3xl border-4 border-white bg-white/60 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[hsl(48,100%,80%)] rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute right-20 -bottom-10 w-32 h-32 bg-[hsl(198,78%,80%)] rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d97706]">
                  Módulo para Profesores
                </p>
                <h1 className="mt-1 text-4xl font-black text-[#3b2a12] font-fredoka drop-shadow-sm">
                  Centro de Control
                </h1>
                <p className="mt-2 text-sm font-bold text-[#7a6040] max-w-lg">
                  Gestiona clases, revisa el progreso del cuaderno y prepara reportes de aula de
                  forma fácil y divertida.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Selector */}
                {classesList.length > 0 && (
                  <div className="flex items-center gap-3 bg-white/80 p-2 pl-4 rounded-2xl shadow-sm border border-stone-200">
                    <span className="text-xs font-black text-stone-500 uppercase tracking-widest">
                      Tu Clase:
                    </span>
                    <select
                      value={selectedClassId}
                      onChange={(e) => {
                        setSelectedClassId(e.target.value);
                        setSelectedStudentId(null);
                      }}
                      aria-label="Tu clase"
                      className="px-4 py-2 rounded-xl border-2 border-[hsl(28,30%,18%)]/10 bg-white text-stone-800 font-bold text-sm focus:outline-none focus:border-[#d97706] cursor-pointer transition-colors shadow-sm"
                    >
                      {classesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-3">
                  {selectedClassId && (
                    <Link
                      to="/cartilla/teacher/crm/$classId"
                      params={{ classId: selectedClassId }}
                      className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-[#8da47e] px-5 py-3 text-sm font-black text-white shadow-lg hover:-translate-y-1 hover:shadow-xl hover:bg-[#7a9169] transition-all cursor-pointer"
                    >
                      Ver clase completa
                    </Link>
                  )}
                  <Link
                    to="/cartilla/teacher/reportes"
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#ea580c] px-5 py-3 text-sm font-black text-white shadow-lg hover:-translate-y-1 hover:shadow-xl hover:bg-[#c2410c] transition-all cursor-pointer"
                  >
                    <BarChart3 className="h-5 w-5" /> Reportes
                  </Link>
                  <Link
                    to="/cartilla/presentar/$n"
                    params={{ n: "1" }}
                    className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-[#0284c7] px-5 py-3 text-sm font-black text-white shadow-lg hover:-translate-y-1 hover:shadow-xl hover:bg-[#0369a1] transition-all cursor-pointer"
                  >
                    <MonitorPlay className="h-5 w-5" /> Flipchart Mágico
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Messages Alert */}
          {msg && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
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

          {/* Load / Empty States */}
          {loadingClasses ? (
            <div className="p-12 text-center font-bold text-stone-400 animate-pulse bg-white border border-stone-200 rounded-[2rem]">
              Cargando tablero CRM...
            </div>
          ) : classesList.length === 0 ? (
            /* Honest Empty State: No Classes */
            <div className="kid-card p-12 text-center bg-white/70 max-w-xl mx-auto space-y-6 mt-4 border-4 border-dashed border-[#e8e2d9]">
              <div className="w-16 h-16 rounded-3xl bg-[#fdf3e0] text-[#d97706] flex items-center justify-center mx-auto shadow-inner float-soft">
                <GraduationCap className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#3b2a12] font-fredoka">
                  ¡Bienvenido al CRM de Gretel!
                </h2>
                <p className="text-sm font-bold text-[#7a6040] mt-2 leading-relaxed max-w-sm mx-auto">
                  Crea una clase para empezar a añadir estudiantes y seguir su progreso mágicamente.
                </p>
              </div>

              <form
                onSubmit={handleCreateClass}
                className="flex gap-3 max-w-md mx-auto justify-center items-center mt-6"
              >
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ej. Primaria 1° A"
                  maxLength={40}
                  disabled={busy}
                  className="flex-1 px-5 py-4 rounded-2xl border-2 border-stone-200 bg-white text-stone-800 text-sm font-bold focus:outline-none focus:border-[#d97706] outline-none shadow-inner"
                  required
                />
                <button
                  type="submit"
                  disabled={busy || !newClassName.trim()}
                  className="px-8 py-4 rounded-2xl bg-[#ea580c] text-white font-black text-sm hover:-translate-y-1 shadow-lg hover:shadow-xl transition disabled:opacity-50 cursor-pointer"
                >
                  Crear
                </button>
              </form>
            </div>
          ) : loadingStudents ? (
            <div className="p-12 text-center font-bold text-stone-400 animate-pulse bg-white border border-stone-200 rounded-[2rem]">
              Cargando alumnos...
            </div>
          ) : studentsList.length === 0 ? (
            /* Honest Empty State: Class exists, but has no students */
            <div className="kid-card p-12 text-center bg-white/70 max-w-xl mx-auto space-y-6 mt-4 border-4 border-dashed border-[#e8e2d9]">
              <div className="w-16 h-16 rounded-3xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center mx-auto shadow-inner">
                <User className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#3b2a12] font-fredoka">No hay alumnos</h2>
                <p className="text-sm font-bold text-[#7a6040] mt-2 leading-relaxed max-w-sm mx-auto">
                  Código de unión para tu clase: <br />
                  <strong className="font-mono text-[#0284c7] text-2xl bg-[#e0f2fe] px-4 py-2 rounded-xl mt-2 inline-block shadow-inner">
                    {activeClass?.join_code}
                  </strong>
                </p>
              </div>

              <form
                onSubmit={handleAddStudent}
                className="flex gap-3 max-w-md mx-auto justify-center items-center mt-6"
              >
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Añadir alumno manualmente..."
                  maxLength={50}
                  disabled={busy}
                  className="flex-1 px-5 py-4 rounded-2xl border-2 border-stone-200 bg-white text-stone-800 text-sm font-bold focus:outline-none focus:border-[#0284c7] outline-none shadow-inner"
                  required
                />
                <button
                  type="submit"
                  disabled={busy || !newStudentName.trim()}
                  className="px-6 py-4 rounded-2xl bg-[#0284c7] text-white font-black text-sm hover:-translate-y-1 shadow-lg hover:shadow-xl transition disabled:opacity-50 cursor-pointer"
                >
                  Añadir
                </button>
              </form>
            </div>
          ) : (
            /* Main Dashboard Render with Live Data */
            <>
              <KpiStrip
                activeStudents={activeStudentsCount}
                averageProgress={averageProgressPct}
                needsAttention={needsAttentionCount}
                lessonsCompletedThisWeek={totalCompletedLessons}
              />

              <div className="crm-grid">
                <div className="space-y-6">
                  <PipelineBoard
                    students={dashboardStudents}
                    selectedStudentId={selectedStudentId}
                    onSelectStudent={setSelectedStudentId}
                  />
                </div>
                <div className="space-y-6">
                  <AccountPanel student={selectedStudent} onUpdate={handleUpdateStudent} />
                  {isSeed ? (
                    <div className="bg-white rounded-3xl border border-stone-100 p-6 text-sm font-bold text-stone-400 text-center">
                      Las asignaciones reales no están disponibles en modo de práctica local.
                    </div>
                  ) : (
                    <TaskList classId={selectedClassId} />
                  )}
                  <AnalyticsPanel classId={selectedClassId} isSeed={isSeed} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
