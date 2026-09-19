import { useEffect, useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  MonitorPlay,
  Plus,
  Users,
} from "lucide-react";
import { addStudents, createClass, getClass, listClasses } from "@/lib/teacher.functions";
import { listAssignments } from "@/lib/assignments.functions";
import {
  addSeedStudents,
  createSeedClass,
  getSeedClass,
  isSeedSessionActive,
  listSeedAssignments,
  listSeedClasses,
} from "@/lib/seed-data";
import { fetchCrmStudentProgress } from "@/lib/crm-student-progress";
import { buildStudentLearningInsight } from "@/lib/literacy-insights";
import { CATALOG } from "@/lib/lesson-catalog";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import "../../styles/teacher-crm.css";

function lessonTitle(lessonId: string) {
  const entry = CATALOG.find((item) => String(item.n) === lessonId);
  return entry ? `L${entry.n} · ${entry.title}` : `Lección ${lessonId}`;
}

function familyPracticeHref(lessonNumber: number, activity: string) {
  return `/cartilla/practica?family=1&lesson=${lessonNumber}&activity=${activity}`;
}

export function TeacherDailyHome() {
  const isSeed = useMemo(() => isSeedSessionActive(), []);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [className, setClassName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [seedVersion, setSeedVersion] = useState(0);

  useEffect(() => {
    if (!isSeed) return;
    const bump = () => setSeedVersion((value) => value + 1);
    window.addEventListener("cartilla:seed-data", bump);
    return () => window.removeEventListener("cartilla:seed-data", bump);
  }, [isSeed]);

  const realClasses = useQuery({
    queryKey: ["daily-classes"],
    queryFn: () => listClasses(),
    enabled: !isSeed,
  });

  const seedClasses = useMemo(() => {
    void seedVersion;
    if (!isSeed) return [];
    try {
      return listSeedClasses();
    } catch {
      return [];
    }
  }, [isSeed, seedVersion]);

  const classes = isSeed ? seedClasses : (realClasses.data ?? []);

  useEffect(() => {
    if (!selectedClassId && classes[0]) setSelectedClassId(classes[0].id);
    if (selectedClassId && !classes.some((item) => item.id === selectedClassId)) {
      setSelectedClassId(classes[0]?.id ?? "");
    }
  }, [classes, selectedClassId]);

  const realClass = useQuery({
    queryKey: ["daily-class", selectedClassId],
    queryFn: () => getClass({ data: { id: selectedClassId } }),
    enabled: !isSeed && Boolean(selectedClassId),
  });

  const seedClass = useMemo(() => {
    void seedVersion;
    if (!isSeed || !selectedClassId) return null;
    try {
      return getSeedClass(selectedClassId);
    } catch {
      return null;
    }
  }, [isSeed, selectedClassId, seedVersion]);

  const classData = isSeed ? seedClass : realClass.data;
  const students = classData?.students ?? [];
  const activeClass = classes.find((item) => item.id === selectedClassId) ?? null;

  const assignmentsQuery = useQuery({
    queryKey: ["daily-assignments", selectedClassId, isSeed, seedVersion],
    queryFn: () =>
      isSeed
        ? Promise.resolve(listSeedAssignments(selectedClassId))
        : listAssignments({ data: { classId: selectedClassId } }),
    enabled: Boolean(selectedClassId),
  });
  const assignments = assignmentsQuery.data ?? [];

  const progressQueries = useQueries({
    queries: students.map((student) => ({
      queryKey: ["daily-student-progress", student.id, isSeed, seedVersion],
      queryFn: () => fetchCrmStudentProgress(student.id, isSeed),
      staleTime: 15_000,
    })),
  });

  const studentLearning = students.map((student, index) => {
    const progress = progressQueries[index]?.data;
    if (!progress) return { student, progress: null, insight: null };
    const completed = new Set(
      progress.lessonProgress
        .filter((row) => row.status === "completed")
        .map((row) => row.lesson_id),
    );
    return {
      student,
      progress,
      insight: buildStudentLearningInsight(progress.events, completed, assignments),
    };
  });

  const attentionRows = studentLearning
    .filter((row) => row.insight?.attention.length)
    .map((row) => ({ ...row, flag: row.insight?.attention[0] ?? null }))
    .filter((row) => row.flag)
    .slice(0, 8);

  const recentCompletions = studentLearning
    .flatMap((row) =>
      (row.progress?.events ?? [])
        .filter((event) => event.event_kind === "lesson_completed")
        .map((event) => ({
          studentId: row.student.id,
          studentName: row.student.display_name,
          lessonId: event.lesson_id,
          createdAt: event.created_at,
        })),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const assignmentRows = assignments.map((assignment) => ({
    ...assignment,
    completed: studentLearning.filter((row) =>
      row.progress?.lessonProgress.some(
        (lesson) => lesson.lesson_id === assignment.lesson_id && lesson.status === "completed",
      ),
    ).length,
  }));

  const nextAction = attentionRows[0] ?? studentLearning.find((row) => row.insight?.recommendation);
  const loading =
    (!isSeed && realClasses.isLoading) ||
    (!isSeed && Boolean(selectedClassId) && realClass.isLoading) ||
    progressQueries.some((query) => query.isLoading);

  const createNewClass = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!className.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      if (isSeed) {
        const created = createSeedClass(className.trim());
        setSelectedClassId(created.id);
      } else {
        const created = await createClass({ data: { name: className.trim() } });
        await realClasses.refetch();
        setSelectedClassId(created.id);
      }
      setClassName("");
      setMessage("Clase creada.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo crear la clase.");
    } finally {
      setBusy(false);
    }
  };

  const addNewStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!studentName.trim() || !selectedClassId) return;
    setBusy(true);
    setMessage("");
    try {
      if (isSeed) {
        addSeedStudents(selectedClassId, [studentName.trim()]);
      } else {
        await addStudents({ data: { classId: selectedClassId, names: [studentName.trim()] } });
        await realClass.refetch();
      }
      setStudentName("");
      setMessage("Estudiante añadido.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo añadir el estudiante.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="crm-app bg-[#f7f2e8]">
      <Sidebar />
      <main className="crm-main flex min-h-screen flex-1 flex-col overflow-hidden">
        <Topbar />
        <div className="crm-content flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <header className="rounded-[2rem] border border-[#eadfc8] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a45d22]">La Cartilla de Gretel · Docente</p>
                  <h1 className="mt-1 text-3xl font-black text-[#332616]">Hoy en tu clase</h1>
                  <p className="mt-2 max-w-2xl text-sm font-semibold text-stone-600">Atención, práctica y progreso basados únicamente en lo registrado en la Cartilla.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {classes.length > 0 && (
                    <select
                      aria-label="Clase activa"
                      value={selectedClassId}
                      onChange={(event) => setSelectedClassId(event.target.value)}
                      className="min-h-11 rounded-xl border border-stone-300 bg-white px-4 text-sm font-bold text-stone-800"
                    >
                      {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  )}
                  <Link
                    to="/cartilla/presentar/$n"
                    params={{ n: "1" }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#176b87] px-4 py-2 text-sm font-black text-white"
                  >
                    <MonitorPlay className="h-4 w-4" /> Presentar
                  </Link>
                </div>
              </div>
              {message && <p className="mt-4 text-sm font-bold text-stone-600">{message}</p>}
            </header>

            {classes.length === 0 ? (
              <section className="rounded-[2rem] border border-[#eadfc8] bg-white p-8 text-center shadow-sm">
                <Users className="mx-auto h-10 w-10 text-[#a45d22]" />
                <h2 className="mt-3 text-2xl font-black text-stone-800">Crea tu primera clase</h2>
                <form onSubmit={createNewClass} className="mx-auto mt-5 flex max-w-md gap-2">
                  <input value={className} onChange={(event) => setClassName(event.target.value)} placeholder="Nombre de la clase" maxLength={80} className="min-h-12 flex-1 rounded-xl border border-stone-300 px-4 font-semibold" />
                  <button disabled={busy || !className.trim()} className="min-h-12 rounded-xl bg-[#a45d22] px-5 font-black text-white disabled:opacity-50">Crear</button>
                </form>
              </section>
            ) : (
              <>
                <section className="rounded-[2rem] border border-[#eadfc8] bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-black text-stone-800">{activeClass?.name}</h2>
                      <p className="mt-1 text-sm font-semibold text-stone-500">{students.length} estudiantes · Código {activeClass?.join_code}</p>
                    </div>
                    <form onSubmit={addNewStudent} className="flex w-full gap-2 md:max-w-md">
                      <input value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Añadir estudiante" maxLength={60} className="min-h-11 flex-1 rounded-xl border border-stone-300 px-3 text-sm font-semibold" />
                      <button aria-label="Añadir estudiante" disabled={busy || !studentName.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#356b43] px-4 text-sm font-black text-white disabled:opacity-50"><Plus className="h-4 w-4" /> Añadir</button>
                    </form>
                  </div>
                </section>

                {loading ? (
                  <div className="rounded-[2rem] border border-[#eadfc8] bg-white p-10 text-center font-bold text-stone-400">Leyendo el progreso registrado…</div>
                ) : students.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-[#d8c8aa] bg-white p-10 text-center font-bold text-stone-500">Añade un estudiante para comenzar a registrar aprendizaje.</div>
                ) : (
                  <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
                    <div className="space-y-6">
                      <section className="rounded-[2rem] border border-[#eadfc8] bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-[#b45309]" /><div><h2 className="text-xl font-black text-stone-800">Necesitan atención</h2><p className="text-xs font-semibold text-stone-500">Cada señal muestra el dato exacto que la activó.</p></div></div>
                        <div className="mt-5 space-y-3">
                          {attentionRows.length === 0 ? (
                            <p className="rounded-2xl bg-[#f1f7f1] p-4 text-sm font-bold text-[#356b43]">No hay señales determinísticas de atención con los datos actuales.</p>
                          ) : attentionRows.map((row) => {
                            const flag = row.flag;
                            if (!flag) return null;
                            return (
                              <article key={row.student.id} className="rounded-2xl border border-[#f0dfc4] bg-[#fffaf1] p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div><p className="text-base font-black text-stone-900">{row.student.display_name}</p><p className="mt-1 text-sm font-black text-[#8a4c1c]">{flag.exactSkill}</p><p className="mt-1 text-sm font-semibold text-stone-700">{flag.reason}</p><p className="mt-1 text-xs font-semibold leading-relaxed text-stone-500">{flag.supportingData}</p></div>
                                  <div className="flex shrink-0 flex-wrap gap-2">
                                    <a href={`/cartilla/teacher/crm/${selectedClassId}/${row.student.id}`} className="inline-flex min-h-10 items-center rounded-xl border border-stone-300 bg-white px-3 text-xs font-black text-stone-700">Abrir alumno</a>
                                    {flag.lessonNumber && <a href={familyPracticeHref(flag.lessonNumber, flag.activity)} className="inline-flex min-h-10 items-center rounded-xl bg-[#a45d22] px-3 text-xs font-black text-white">Abrir práctica</a>}
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </section>

                      <section className="rounded-[2rem] border border-[#eadfc8] bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3"><ClipboardList className="h-5 w-5 text-[#4759a6]" /><h2 className="text-xl font-black text-stone-800">Asignado</h2></div>
                        <div className="mt-4 space-y-2">
                          {assignmentRows.length === 0 ? <p className="text-sm font-semibold text-stone-500">No hay lecciones asignadas a esta clase.</p> : assignmentRows.map((assignment) => (
                            <div key={assignment.id} className="flex items-center justify-between gap-4 rounded-xl bg-[#f7f7fb] px-4 py-3">
                              <div><p className="text-sm font-black text-stone-800">{assignment.title || lessonTitle(assignment.lesson_id)}</p><p className="mt-0.5 text-xs font-semibold text-stone-500">{assignment.completed} de {students.length} completaron{assignment.due_at ? ` · vence ${new Date(assignment.due_at).toLocaleDateString("es")}` : ""}</p></div>
                              <a href={`/cartilla/leccion/${assignment.lesson_id}`} className="text-xs font-black text-[#4759a6]">Abrir</a>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-6">
                      <section className="rounded-[2rem] border border-[#eadfc8] bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-[#356b43]" /><h2 className="text-xl font-black text-stone-800">Completado recientemente</h2></div>
                        <div className="mt-4 space-y-3">
                          {recentCompletions.length === 0 ? <p className="text-sm font-semibold text-stone-500">Aún no hay lecciones completadas registradas.</p> : recentCompletions.map((item) => (
                            <div key={`${item.studentId}-${item.lessonId}-${item.createdAt}`} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0"><p className="text-sm font-black text-stone-800">{item.studentName}</p><p className="text-xs font-semibold text-stone-500">{lessonTitle(item.lessonId)} · {new Date(item.createdAt).toLocaleDateString("es")}</p></div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-[2rem] border-2 border-[#d8c8aa] bg-[#fffaf1] p-6 shadow-sm">
                        <div className="flex items-center gap-3"><BookOpenCheck className="h-5 w-5 text-[#8a4c1c]" /><h2 className="text-xl font-black text-stone-800">Qué hacer ahora</h2></div>
                        {nextAction?.insight?.recommendation ? (
                          <div className="mt-4"><p className="text-sm font-black text-stone-900">{nextAction.student.display_name}</p><p className="mt-1 text-base font-black text-[#8a4c1c]">{nextAction.insight.recommendation.exactSkill}</p><p className="mt-2 text-sm font-semibold leading-relaxed text-stone-600">{nextAction.insight.recommendation.reason}</p><a href={familyPracticeHref(nextAction.insight.recommendation.lessonNumber, nextAction.insight.recommendation.activity)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#a45d22] px-4 text-sm font-black text-white">Abrir práctica recomendada <ArrowRight className="h-4 w-4" /></a></div>
                        ) : <p className="mt-4 text-sm font-semibold text-stone-600">No hay una práctica pendiente con los datos registrados.</p>}
                      </section>

                      <a href={`/cartilla/teacher/crm/${selectedClassId}`} className="flex min-h-12 items-center justify-between rounded-2xl border border-[#eadfc8] bg-white px-5 text-sm font-black text-stone-700 shadow-sm">Ver clase y progreso completo <ArrowRight className="h-4 w-4" /></a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
