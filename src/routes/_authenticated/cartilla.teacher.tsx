import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  AlertTriangle,
} from "lucide-react";
import { listClasses, createClass, deleteClass, getAllTeacherStudents } from "@/lib/teacher.functions";
import { selectStalledStudents } from "@/lib/needs-attention";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { tCopy } from "@/content/teacher-copy";

export const Route = createFileRoute("/_authenticated/cartilla/teacher")({
  component: TeacherRouteShell,
  head: () => ({ meta: [{ title: "Teacher Dashboard" }] }),
});

function TeacherRouteShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname.replace(/\/$/, "") });
  if (pathname !== "/cartilla/teacher") return <Outlet />;
  return <TeacherDashboard />;
}

function TeacherDashboard() {
  const { lang } = useLanguage();
  const t = tCopy;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(listClasses);
  const create = useServerFn(createClass);
  const del = useServerFn(deleteClass);
  const fetchAllStudents = useServerFn(getAllTeacherStudents);
  const [name, setName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setTeacherEmail(data.user?.email ?? ""));
  }, []);

  const { data: classes, isLoading } = useQuery({
    queryKey: ["teacher", "classes"],
    queryFn: () => list(),
  });

  const { data: allStudents } = useQuery({
    queryKey: ["teacher", "students", "all"],
    queryFn: () => fetchAllStudents({ data: {} }),
  });

  const stalled = useMemo(() => (allStudents ? selectStalledStudents(allStudents) : []), [allStudents]);

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
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/cartilla"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> {t.cartilla[lang]}
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
        <button
          onClick={signOut}
          className="text-sm inline-flex items-center gap-1 text-foreground/60 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" /> {t.salir[lang]}
        </button>
        </div>
      </div>

      <header className="mt-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-primary">
            <GraduationCap className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wide">{t.panel[lang]}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mt-1">{t.misClases[lang]}</h1>
          {teacherEmail && <p className="text-sm text-foreground/60 mt-1">{teacherEmail}</p>}
        </div>
        <Link
          to="/cartilla/teacher/branding"
          className="text-xs font-bold text-foreground/60 hover:text-primary underline whitespace-nowrap"
        >
          {t.marcaTextos[lang]}
        </Link>
      </header>

      {stalled.length > 0 && (
        <section className="mt-6 kid-card p-4 border-2 border-warning/30">
          <h2 className="font-bold mb-3 inline-flex items-center gap-2 text-warning">
            <AlertTriangle className="w-4 h-4" /> {t.necesitanAtencion[lang]}
          </h2>
          <ul className="space-y-1.5 text-sm">
            {stalled.map((s) => (
              <li key={s.id}>
                <Link
                  to="/cartilla/teacher/alumno/$id"
                  params={{ id: s.id }}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-warning/5 hover:bg-warning/10"
                >
                  <span className="font-bold">{s.name}</span>
                  <span className="text-xs text-foreground/60">
                    {s.reason === "never_started"
                      ? t.nuncaEmpezo[lang]
                      : t.inactivoDias[lang].replace("{days}", String(s.daysSinceActive))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 kid-card p-4">
        <h2 className="font-bold mb-2">{t.crearClase[lang]}</h2>
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
            placeholder={t.ejKinder[lang]}
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
            {t.crear[lang]}
          </button>
        </form>
        {createMut.error && (
          <p className="text-sm text-destructive mt-2">{(createMut.error as Error).message}</p>
        )}
      </section>

      <section className="mt-6 space-y-3">
        {isLoading && <div className="text-foreground/60 text-sm">{t.cargando[lang]}</div>}
        {classes?.length === 0 && (
          <div className="kid-card p-6 text-center text-foreground/60">
            {t.sinClases[lang]}
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
                  <Users className="w-3 h-3" /> {c.student_count} {t.alumnosCount[lang]}
                </span>
                <span>
                  {t.codigo[lang]} <span className="font-mono font-bold tracking-wider">{c.join_code}</span>
                </span>
              </div>
            </Link>
            <div className="flex gap-1.5">
              <button
                onClick={() => navigator.clipboard?.writeText(c.join_code)}
                className="p-2 rounded-lg hover:bg-secondary text-foreground/60"
                aria-label={t.copiarCodigo[lang]}
                title={t.copiarCodigo[lang]}
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(t.eliminarClase[lang].replace("{name}", c.name)))
                    delMut.mutate(c.id);
                }}
                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                aria-label="Eliminar"
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
