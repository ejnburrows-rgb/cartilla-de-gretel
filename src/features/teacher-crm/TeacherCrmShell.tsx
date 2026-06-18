import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { BarChart3, MonitorPlay, Printer, GraduationCap, PlusCircle, AlertCircle, User, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import "../../styles/teacher-crm.css";
import { AccountPanel } from "./components/AccountPanel";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { KpiStrip } from "./components/KpiStrip";
import { PipelineBoard, type DashboardStudent } from "./components/PipelineBoard";
import { Sidebar } from "./components/Sidebar";
import { TaskList } from "./components/TaskList";
import { Topbar } from "./components/Topbar";

import { listClasses, getClass, createClass, addStudents } from "@/lib/teacher.functions";
import { 
  listSeedClasses, 
  getSeedClass, 
  createSeedClass, 
  addSeedStudents 
} from "@/lib/seed-data";

export function TeacherCrmShell() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Synchronously detect local seed teacher session
  const isSeed = useMemo(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("cartilla.seed.teacher.v1") || !supabase.auth.getSession();
  }, []);

  // 1. Query Classes
  const { data: realClasses, isLoading: loadingRealClasses, refetch: refetchRealClasses } = useQuery({
    queryKey: ["crm-classes"],
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
  }, [isSeed, busy]);

  const classesList = isSeed ? seedClasses : (realClasses ?? []);
  const loadingClasses = !isSeed && loadingRealClasses;

  // Set default class ID
  useEffect(() => {
    if (classesList.length > 0 && !selectedClassId) {
      setSelectedClassId(classesList[0].id);
    }
  }, [classesList, selectedClassId]);

  // 2. Query Students for Selected Class
  const { data: realClassData, isLoading: loadingRealStudents, refetch: refetchRealStudents } = useQuery({
    queryKey: ["crm-students", selectedClassId],
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

  const studentsList = useMemo(() => {
    if (isSeed) {
      return seedClassData?.students ?? [];
    }
    return realClassData?.students ?? [];
  }, [isSeed, seedClassData, realClassData]);

  const loadingStudents = !isSeed && loadingRealStudents;

  // Convert students to DashboardStudent type
  const dashboardStudents = useMemo<DashboardStudent[]>(() => {
    return studentsList.map((s) => {
      // 24 total lessons in Gretel curriculum
      const progressPct = Math.round(((s.lessons ?? 0) / 24) * 100);
      const daysSinceActive = s.lastSeen ? Math.round((Date.now() - new Date(s.lastSeen).getTime()) / (1000 * 60 * 60 * 24)) : 999;
      
      return {
        id: s.id,
        name: s.display_name,
        progress: progressPct,
        lastActive: s.lastSeen ? new Date(s.lastSeen).toLocaleDateString() : "Nunca",
        alert: progressPct < 40 && daysSinceActive > 3,
      };
    });
  }, [studentsList]);

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

  const needsAttentionCount = dashboardStudents.filter((s) => s.progress < 40).length;
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
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d97706]">Módulo para Profesores</p>
                <h1 className="mt-1 text-4xl font-black text-[#3b2a12] font-fredoka drop-shadow-sm">Centro de Control</h1>
                <p className="mt-2 text-sm font-bold text-[#7a6040] max-w-lg">
                  Gestiona clases, revisa el progreso del cuaderno y prepara reportes de aula de forma fácil y divertida.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Selector */}
                {classesList.length > 0 && (
                  <div className="flex items-center gap-3 bg-white/80 p-2 pl-4 rounded-2xl shadow-sm border border-stone-200">
                    <span className="text-xs font-black text-stone-500 uppercase tracking-widest">Tu Clase:</span>
                    <select
                      value={selectedClassId}
                      onChange={(e) => {
                        setSelectedClassId(e.target.value);
                        setSelectedStudentId(null);
                      }}
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
                  <Link
                    to="/cartilla/teacher/reportes"
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#ea580c] px-5 py-3 text-sm font-black text-white shadow-lg hover:-translate-y-1 hover:shadow-xl hover:bg-[#c2410c] transition-all cursor-pointer"
                  >
                    <BarChart3 className="h-5 w-5" /> Reportes
                  </Link>
                  <Link
                    to="/cartilla/teacher/flipchart/$n"
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
              {msg.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
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
            <div className="kid-card p-12 text-center bg-white/70 max-w-xl mx-auto space-y-6 mt-4">
              <div className="w-16 h-16 rounded-3xl bg-[hsl(48,100%,94%)] text-vowel-e flex items-center justify-center mx-auto shadow-inner float-soft">
                <GraduationCap className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-800 font-fredoka">¡Bienvenido al CRM de Gretel!</h2>
                <p className="text-sm font-semibold text-stone-500 mt-2 leading-relaxed max-w-sm mx-auto">
                  Para ver las métricas de progreso, KPIs y el listado de alumnos, primero debes crear una clase de lectura.
                </p>
              </div>

              <form onSubmit={handleCreateClass} className="flex gap-2 max-w-md mx-auto justify-center items-center">
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ej. Primaria 1° A"
                  maxLength={40}
                  disabled={busy}
                  className="flex-1 px-4 py-3 rounded-2xl border-2 border-[hsl(28,30%,18%)]/10 bg-white text-stone-800 text-sm focus:outline-none focus:border-vowel-a outline-none shadow-xs"
                  required
                />
                <button
                  type="submit"
                  disabled={busy || !newClassName.trim()}
                  className="px-6 py-3 rounded-2xl bg-vowel-o text-white font-black text-sm hover:brightness-105 active:scale-95 shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  Crear Clase
                </button>
              </form>

              <div className="p-4 rounded-2xl bg-[hsl(354,78%,98%)] border text-left text-xs text-[hsl(354,78%,35%)] font-bold flex items-start gap-3" style={alertBoxStyle}>
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  <strong>Sesión:</strong> {isSeed ? "Estás operando en modo local (sin Supabase). Todos los datos se guardan de manera segura en la memoria de este navegador." : "Tu cuenta de maestro está vinculada a la nube. El progreso se sincronizará automáticamente."}
                </p>
              </div>
            </div>
          ) : loadingStudents ? (
            <div className="p-12 text-center font-bold text-stone-400 animate-pulse bg-white border border-stone-200 rounded-[2rem]">
              Cargando alumnos de la clase...
            </div>
          ) : studentsList.length === 0 ? (
            /* Honest Empty State: Class exists, but has no students */
            <div className="kid-card p-12 text-center bg-white/70 max-w-xl mx-auto space-y-6 mt-4">
              <div className="w-16 h-16 rounded-3xl bg-[hsl(198,78%,95%)] text-vowel-i flex items-center justify-center mx-auto shadow-inner">
                <User className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-800 font-fredoka">Esta clase aún no tiene alumnos</h2>
                <p className="text-sm font-semibold text-stone-500 mt-2 leading-relaxed max-w-sm mx-auto">
                  Comparte el código de unión <strong className="font-mono text-vowel-e text-lg">{activeClass?.join_code}</strong> con tus alumnos para que comiencen a jugar.
                </p>
                <p className="text-xs font-bold text-stone-400 mt-1">
                  O añade un alumno manualmente a continuación.
                </p>
              </div>

              <form onSubmit={handleAddStudent} className="flex gap-2 max-w-md mx-auto justify-center items-center">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Nombre completo del alumno"
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
                  Añadir Alumno
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
                  <AccountPanel student={selectedStudent} />
                  <TaskList />
                  <AnalyticsPanel />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
