import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/lib/useServerFn";
import {
  ArrowLeft,
  Plus,
  GraduationCap,
  LogOut,
  Users,
  Trash2,
  Copy,
  Loader2,
  MonitorPlay,
} from "lucide-react";
import { listClasses, createClass, deleteClass } from "@/lib/teacher.functions";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { getDemoTeacher, signOutDemoTeacher, exportDemoStateRaw, importDemoStateRaw, resetDemoStateRaw } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/cartilla/teacher")({
  component: TeacherRouteShell,
  head: () => ({ meta: [{ title: "Panel de Maestro — La Cartilla de Gretel" }] }),
});

function TeacherRouteShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname.replace(/\/$/, "") });
  if (pathname !== "/cartilla/teacher") return <Outlet />;
  return <TeacherDashboard />;
}

function TeacherDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(listClasses);
  const create = useServerFn(createClass);
  const del = useServerFn(deleteClass);
  const [name, setName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState<string>("");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const teacher = getDemoTeacher();
      setTeacherEmail(teacher ? `${teacher.name} · ${teacher.email}` : "");
      return;
    }
    supabase.auth.getUser().then(({ data }) => setTeacherEmail(data.user?.email ?? ""));
  }, []);

  const { data: classes, isLoading, error: classesError } = useQuery({
    queryKey: ["teacher", "classes"],
    queryFn: () => list(),
  });

  const createMut = useMutation({
    mutationFn: (n: string) => create({ data: { name: n } }),
    onSuccess: () => {
      setName("");
      qc.invalidateQueries({ queryKey: ["teacher", "classes"] });
    },
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher", "classes"] }),
  });

  const signOut = async () => {
    if (!isSupabaseConfigured) signOutDemoTeacher();
    else await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/cartilla"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Cartilla
        </Link>
        <button
          onClick={signOut}
          className="text-sm inline-flex items-center gap-1 text-foreground/60 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </div>

      <header className="mt-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-primary">
            <GraduationCap className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wide">Panel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mt-1">Mis clases</h1>
          {teacherEmail && <p className="text-sm text-foreground/60 mt-1">{teacherEmail}</p>}
          {!isSupabaseConfigured && (
            <div className="mt-3 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
              Modo demo local: clases, alumnos y progreso se guardan en este navegador.
            </div>
          )}
        </div>
        <Link
          to="/cartilla/teacher/branding"
          className="text-xs font-bold text-foreground/60 hover:text-primary underline whitespace-nowrap"
        >
          Marca y textos
        </Link>
      </header>

      <section className="mt-6 kid-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="inline-flex items-center gap-2 text-lg font-bold">
              <MonitorPlay className="h-5 w-5 text-primary" /> Presentación docente
            </h2>
            <p className="mt-1 text-sm text-foreground/60">
              Vista de presentación basada en la estructura verificada del libro.
            </p>
          </div>
          <Link
            to="/cartilla/teacher/presentacion"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Abrir presentación
          </Link>
        </div>
      </section>

      <section className="mt-6 kid-card p-4">
        <h2 className="font-bold mb-2">Crear nueva clase</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) createMut.mutate(name.trim());
          }}
          className="flex gap-2 flex-wrap"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Kinder A 2026"
            maxLength={80}
            className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border-2 border-foreground/10 bg-background focus:border-primary outline-none"
          />
          <button
            type="submit"
            disabled={createMut.isPending || !name.trim()}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold inline-flex items-center gap-2 disabled:opacity-50"
          >
            {createMut.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Crear
          </button>
        </form>
        {createMut.error && (
          <p className="text-sm text-destructive mt-2">{(createMut.error as Error).message}</p>
        )}
      </section>

      {!isSupabaseConfigured && (
        <section className="mt-6 kid-card p-4 border border-warning/20 bg-warning/5">
          <h2 className="font-bold mb-2 text-warning flex items-center gap-2">
            Control de datos Demo Local
          </h2>
          <p className="text-xs text-foreground/60 mb-3">
            Dado que estás en modo demo, puedes exportar, importar o restablecer el estado completo de las clases y el progreso.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const data = exportDemoStateRaw();
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `cartilla-demo-state-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1.5 rounded-xl border border-foreground/15 hover:bg-secondary text-xs font-bold text-foreground"
            >
              Exportar estado (JSON)
            </button>
            <label className="px-3 py-1.5 rounded-xl border border-foreground/15 hover:bg-secondary text-xs font-bold text-foreground cursor-pointer">
              Importar estado
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const str = evt.target?.result as string;
                    if (importDemoStateRaw(str)) {
                      alert("¡Estado demo importado con éxito!");
                      qc.invalidateQueries({ queryKey: ["teacher", "classes"] });
                    } else {
                      alert("Error al importar el archivo JSON.");
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
            <button
              onClick={() => {
                if (confirm("¿Estás seguro de restablecer el estado demo? Se borrarán todas las clases y progresos creados.")) {
                  resetDemoStateRaw();
                  qc.invalidateQueries({ queryKey: ["teacher", "classes"] });
                  alert("Estado restablecido al demo inicial.");
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-destructive/20 hover:bg-destructive/10 text-xs font-bold text-destructive"
            >
              Restablecer demo inicial
            </button>
          </div>
        </section>
      )}

      <section className="mt-6 space-y-3">
        {isLoading && <div className="text-foreground/60 text-sm">Cargando…</div>}
        {classesError && (
          <div className="kid-card border-destructive/20 bg-destructive/5 p-4 text-sm font-bold text-destructive">
            No se pudieron cargar las clases.{" "}
            {!isSupabaseConfigured
              ? "Modo demo local no disponible en este navegador."
              : "Revisa la sesion de maestro o la conexion a Supabase."}
          </div>
        )}
        {classes?.length === 0 && (
          <div className="kid-card p-6 text-center text-foreground/60">
            Aún no tienes clases. Crea una para empezar.
          </div>
        )}
        {classes?.map((c) => (
          <div
            key={c.id}
            className="kid-card p-4 flex items-center justify-between gap-3 flex-wrap"
          >
            <Link to="/cartilla/teacher/clase/$id" params={{ id: c.id }} className="flex-1 min-w-0">
              <div className="font-bold text-lg truncate">{c.name}</div>
              <div className="text-xs text-foreground/60 mt-0.5 inline-flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3 h-3" /> {c.student_count} alumnos
                </span>
                <span>
                  Código: <span className="font-mono font-bold tracking-wider">{c.join_code}</span>
                </span>
              </div>
            </Link>
            <div className="flex gap-1.5">
              <button
                onClick={() => navigator.clipboard?.writeText(c.join_code)}
                className="p-2 rounded-lg hover:bg-secondary text-foreground/60"
                aria-label="Copiar código"
                title="Copiar código"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar la clase "${c.name}" y todos sus alumnos?`))
                    delMut.mutate(c.id);
                }}
                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                aria-label="Eliminar clase"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
