import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, Plus, Trash2, Loader2, Copy, BookOpen, Download, Search, BarChart3, ClipboardList, Calendar, Timer } from "lucide-react";
import { getClass, addStudents, deleteStudent, getClassProgress, findStudentsByName } from "@/lib/teacher.functions";
import { listAssignments, createAssignment, deleteAssignment } from "@/lib/assignments.functions";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { SimpleBarChart } from "@/components/cartilla/SimpleBarChart";
import { downloadCSV, toCSV } from "@/lib/csv";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { routePath } from "@/lib/assets";

export const Route = createFileRoute("/_authenticated/cartilla/teacher/clase/$id")({ component: ClassDetail });

function ClassDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fetchClass = useServerFn(getClass);
  const add = useServerFn(addStudents);
  const del = useServerFn(deleteStudent);
  const fetchProgress = useServerFn(getClassProgress);
  const findStudents = useServerFn(findStudentsByName);
  const fetchAssignments = useServerFn(listAssignments);
  const createAss = useServerFn(createAssignment);
  const delAss = useServerFn(deleteAssignment);
  const [bulkNames, setBulkNames] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; display_name: string; student_code: string }> | null>(null);
  const [searching, setSearching] = useState(false);
  const [assLessonN, setAssLessonN] = useState<string>("1");
  const [assTitle, setAssTitle] = useState("");
  const [assDue, setAssDue] = useState("");
  const [assLimit, setAssLimit] = useState<string>("");

  const { data: classProgress, error: classProgressError } = useQuery({ queryKey: ["teacher", "class", id, "progress"], queryFn: () => fetchProgress({ data: { id } }) });
  const { data, isLoading, error: classError } = useQuery({ queryKey: ["teacher", "class", id], queryFn: () => fetchClass({ data: { id } }) });

  const addMut = useMutation({ mutationFn: (names: string[]) => add({ data: { classId: id, names } }), onSuccess: () => { setBulkNames(""); qc.invalidateQueries({ queryKey: ["teacher", "class", id] }); qc.invalidateQueries({ queryKey: ["teacher", "classes"] }); qc.invalidateQueries({ queryKey: ["teacher", "class", id, "progress"] }); } });
  const delMut = useMutation({ mutationFn: (sid: string) => del({ data: { id: sid } }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["teacher", "class", id] }); qc.invalidateQueries({ queryKey: ["teacher", "classes"] }); qc.invalidateQueries({ queryKey: ["teacher", "class", id, "progress"] }); } });
  const { data: assignments, error: assignmentsError } = useQuery({ queryKey: ["teacher", "class", id, "assignments"], queryFn: () => fetchAssignments({ data: { classId: id } }) });
  const createAssMut = useMutation({ mutationFn: () => createAss({ data: { classId: id, lessonId: assLessonN, title: assTitle.trim() || undefined, dueAt: assDue ? new Date(assDue).toISOString() : null, timeLimitSeconds: assLimit ? Math.max(30, Math.min(3600, Number(assLimit) * 60)) : null } }), onSuccess: () => { setAssTitle(""); setAssDue(""); setAssLimit(""); qc.invalidateQueries({ queryKey: ["teacher", "class", id, "assignments"] }); qc.invalidateQueries({ queryKey: ["teacher", "class", id, "progress"] }); } });
  const delAssMut = useMutation({ mutationFn: (aid: string) => delAss({ data: { id: aid } }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["teacher", "class", id, "assignments"] }); qc.invalidateQueries({ queryKey: ["teacher", "class", id, "progress"] }); } });

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const names = bulkNames.split(/[\n,]/).map((n) => n.trim()).filter((n) => n.length > 0).slice(0, 50);
    if (names.length) addMut.mutate(names);
  };

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    setSearching(true);
    try {
      const r = await findStudents({ data: { q: searchQ.trim(), classId: id } });
      setSearchResults(r as never);
    } finally {
      setSearching(false);
    }
  };

  const exportClassCSV = () => {
    if (!data) return;
    const rows = data.students.map((s) => ({ alumno: s.display_name, codigo: s.student_code, lecciones_completadas: s.lessons, total_lecciones: TOTAL_LESSONS, eventos: s.events, ultima_actividad: s.lastSeen ? new Date(s.lastSeen).toISOString() : "" }));
    downloadCSV(`clase-${data.class.name.replace(/\s+/g, "_")}.csv`, toCSV(rows));
  };

  const lessonChart = useMemo(() => {
    if (!classProgress) return [];
    return CATALOG.map((entry) => {
      const pl = (classProgress.perLesson as Record<string, { completedBy: number; accuracy: number | null }>)[String(entry.n)];
      return { label: `L${entry.n}`, value: pl?.completedBy ?? 0, color: entry.color, sub: pl?.accuracy != null ? `${Math.round(pl.accuracy * 100)}%` : "" };
    });
  }, [classProgress]);

  if (isLoading) return <main className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-foreground/40" /></main>;
  if (classError) return <main className="min-h-screen bg-background px-4 py-6 max-w-4xl mx-auto"><Link to="/cartilla/teacher" className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Mis clases</Link><div className="kid-card mt-6 border-destructive/20 bg-destructive/5 p-6 text-sm font-bold text-destructive">No se pudo cargar esta clase. Revisa la sesión del maestro o vuelve al panel.</div></main>;
  if (!data) return null;

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-4xl mx-auto">
      <Link to="/cartilla/teacher" className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Mis clases</Link>
      <header className="mt-6">
        <h1 className="text-3xl sm:text-4xl font-bold">{data.class.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm"><span className="text-foreground/60">Código de unión:</span><span className="font-mono text-lg font-bold tracking-wider px-3 py-1 rounded-lg bg-secondary">{data.class.join_code}</span><button onClick={() => navigator.clipboard?.writeText(data.class.join_code)} className="inline-flex items-center gap-1 text-foreground/60 hover:text-primary"><Copy className="w-4 h-4" /> Copiar</button></div>
        <p className="text-xs text-foreground/50 mt-2">Comparte el código con tus alumnos. Ellos lo introducen en <span className="font-bold">/cartilla/unirse</span> junto con su código personal.</p>
        {!isSupabaseConfigured && <div className="mt-3 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">Modo local: los cambios de esta clase no salen de este navegador.</div>}
      </header>
      <div className="mt-4 flex flex-wrap gap-2"><button onClick={exportClassCSV} className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border-2 border-foreground/10 hover:bg-secondary font-bold"><Download className="w-4 h-4" /> Exportar CSV</button></div>

      {classProgress && lessonChart.length > 0 && <section className="mt-6 kid-card p-4"><h2 className="font-bold mb-3 inline-flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Alumnos que completaron cada lección</h2><SimpleBarChart bars={lessonChart} max={data.students.length || 1} /><p className="text-[11px] text-foreground/50 mt-2">El subtítulo bajo cada barra es el % promedio de aciertos de la clase en esa lección.</p></section>}
      {classProgressError && <section className="mt-6 kid-card border-warning/20 bg-warning/5 p-4 text-sm font-bold text-warning">No se pudo cargar el resumen de progreso. La lista de alumnos sigue disponible.</section>}

      <section className="mt-6 kid-card p-4">
        <h2 className="font-bold mb-3 inline-flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Tareas asignadas</h2>
        <p className="text-xs text-foreground/60 mb-3">Asigna lecciones específicas con fecha de entrega y tiempo límite. Tus alumnos las verán al abrir la lección.</p>
        <form onSubmit={(e) => { e.preventDefault(); createAssMut.mutate(); }} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select value={assLessonN} onChange={(e) => setAssLessonN(e.target.value)} className="px-3 py-2 rounded-xl border-2 border-foreground/10 bg-background focus:border-primary outline-none font-bold text-sm">{CATALOG.map((entry) => <option key={entry.n} value={String(entry.n)}>L{entry.n} — {entry.title}</option>)}</select>
          <input value={assTitle} onChange={(e) => setAssTitle(e.target.value)} placeholder="Título opcional" className="px-3 py-2 rounded-xl border-2 border-foreground/10 bg-background focus:border-primary outline-none text-sm" />
          <label className="flex items-center gap-2 text-xs font-bold text-foreground/70"><Calendar className="w-3.5 h-3.5" /><input type="date" value={assDue} onChange={(e) => setAssDue(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border-2 border-foreground/10 bg-background focus:border-primary outline-none text-sm font-normal" /></label>
          <label className="flex items-center gap-2 text-xs font-bold text-foreground/70"><Timer className="w-3.5 h-3.5" /><input type="number" min={1} max={60} value={assLimit} onChange={(e) => setAssLimit(e.target.value)} placeholder="Min límite" className="flex-1 px-3 py-2 rounded-xl border-2 border-foreground/10 bg-background focus:border-primary outline-none text-sm font-normal" /></label>
          <button type="submit" disabled={createAssMut.isPending} className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50">{createAssMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Asignar lección</button>
        </form>
        {createAssMut.error && <p className="text-xs text-destructive mt-2">{(createAssMut.error as Error).message}</p>}
        {assignmentsError && <p className="text-xs text-destructive mt-2">No se pudieron cargar las tareas. Sync no disponible para esta vista.</p>}
        {assignments && assignments.length > 0 && (
          <ul className="mt-4 space-y-3">
            {assignments.map((a) => {
              const prog = classProgress?.assignments?.find((pa: { id: string; completed: number; assigned: number; late: number }) => pa.id === a.id);
              const completed = prog ? prog.completed : 0;
              const assigned = prog ? prog.assigned : data.students.length;
              const late = prog ? prog.late : 0;
              const isDue = a.due_at && new Date(a.due_at) < new Date();
              
              return (
                <li key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-secondary/30 border border-foreground/5 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate text-base">L{a.lesson_id} · {CATALOG.find((c) => String(c.n) === a.lesson_id)?.title ?? "Lección"}</div>
                    <div className="text-xs text-foreground/70 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      {a.title && <span>{a.title}</span>}
                      {a.due_at && (
                        <span className={isDue ? "text-destructive font-bold" : ""}>
                          Vence: {new Date(a.due_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-bold uppercase tracking-wider text-foreground/50">Progreso</div>
                      <div className="font-bold">
                        <span className="text-success">{completed}</span> / {assigned}
                      </div>
                      {late > 0 && <div className="text-[10px] text-destructive">{late} atrasadas</div>}
                    </div>
                    <button onClick={() => { if (confirm("¿Eliminar esta tarea?")) delAssMut.mutate(a.id); }} className="p-2 rounded-lg bg-white border shadow-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors" aria-label="Eliminar tarea" title="Eliminar tarea">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-6 kid-card p-4">
        <h2 className="font-bold mb-2 inline-flex items-center gap-2"><Search className="w-4 h-4" /> Buscar código olvidado</h2>
        <p className="text-xs text-foreground/60 mb-2">Si un alumno olvidó su código personal, búscalo por nombre.</p>
        <form onSubmit={runSearch} className="flex gap-2 flex-wrap"><input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Nombre o parte del nombre" className="flex-1 min-w-0 px-3 py-2 rounded-xl border-2 border-foreground/10 bg-background focus:border-primary outline-none" /><button type="submit" disabled={searching || !searchQ.trim()} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold inline-flex items-center gap-2 disabled:opacity-50">{searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar</button></form>
        {searchResults && <ul className="mt-3 space-y-1 text-sm">{searchResults.length === 0 && <li className="text-foreground/60">Sin coincidencias.</li>}{searchResults.map((r) => <li key={r.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-secondary/40"><span className="font-bold">{r.display_name}</span><span className="font-mono font-bold">{r.student_code}</span><button onClick={() => navigator.clipboard?.writeText(r.student_code)} className="p-1.5 rounded hover:bg-foreground/10 text-foreground/60" title="Copiar"><Copy className="w-3.5 h-3.5" /></button></li>)}</ul>}
      </section>

      <section className="mt-6 kid-card p-4"><h2 className="font-bold mb-2 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Agregar alumnos</h2><form onSubmit={submitAdd} className="space-y-2"><textarea value={bulkNames} onChange={(e) => setBulkNames(e.target.value)} placeholder="Un nombre por línea o separados por coma" rows={4} className="w-full px-4 py-3 rounded-xl border-2 border-foreground/10 bg-background focus:border-primary outline-none font-mono text-sm" /><button type="submit" disabled={addMut.isPending || !bulkNames.trim()} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold inline-flex items-center gap-2 disabled:opacity-50">{addMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Agregar</button>{addMut.error && <p className="text-sm text-destructive">{(addMut.error as Error).message}</p>}</form></section>

      <section className="mt-6">
        <h2 className="font-bold mb-3 text-lg">Alumnos ({data.students.length})</h2>
        {data.students.length === 0 ? <div className="kid-card p-6 text-center text-foreground/60">Aún no hay alumnos. Agrega algunos arriba.</div> : <div className="space-y-2">{data.students.map((s) => <div key={s.id} className="kid-card p-3 flex items-center justify-between gap-3"><a href={routePath(`/cartilla/teacher/alumno/${s.id}`)} className="flex-1 min-w-0"><div className="font-bold truncate">{s.display_name}</div><div className="text-xs text-foreground/60 mt-0.5 flex flex-wrap gap-x-3"><span>Código: <span className="font-mono font-bold">{s.student_code}</span></span><span className="inline-flex items-center gap-1"><BookOpen className="w-3 h-3" /> {s.lessons}/{TOTAL_LESSONS} lecciones</span><span>{s.events} eventos</span>{s.lastSeen && <span>· última actividad {new Date(s.lastSeen).toLocaleDateString()}</span>}</div></a><button onClick={() => navigator.clipboard?.writeText(s.student_code)} className="p-2 rounded-lg hover:bg-secondary text-foreground/60" aria-label="Copiar código" title="Copiar código"><Copy className="w-4 h-4" /></button><button onClick={() => { if (confirm(`¿Eliminar a ${s.display_name}? Se borrará su progreso.`)) delMut.mutate(s.id); }} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" aria-label="Eliminar alumno"><Trash2 className="w-4 h-4" /></button></div>)}</div>}
      </section>
    </main>
  );
}
