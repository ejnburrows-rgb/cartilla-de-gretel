import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, Loader2, BookOpen, Award, Clock, Target, Activity } from "lucide-react";
import { getStudentProgress } from "@/lib/teacher.functions";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/cartilla/teacher/alumno/$id")({
  component: StudentDetail,
});

function StudentDetail() {
  const { id } = Route.useParams();
  const fetchProgress = useServerFn(getStudentProgress);
  const { data, isLoading, error } = useQuery({
    queryKey: ["teacher", "student", id],
    queryFn: () => fetchProgress({ data: { id } }),
  });

  const summary = useMemo(() => {
    if (!data) return null;
    const completed = new Set<string>();
    const exerciseStats: Record<string, { score: number; total: number; runs: number }> = {};
    const latestExerciseKeys = new Set<string>();
    let timeTotal = 0;
    const badges: Array<{ name: string; at: string }> = [];
    let level: { value: string; at: string } | null = null;

    for (const e of data.events) {
      if (e.event_kind === "lesson_completed") completed.add(e.lesson_id);
      if (
        e.event_kind === "exercise" &&
        typeof e.score === "number" &&
        typeof e.total === "number"
      ) {
        const meta = (e.meta ?? {}) as Record<string, unknown>;
        const exercise = typeof meta.exercise === "string" ? meta.exercise : "exercise";
        const key = `${e.lesson_id}:${exercise}`;
        if (!latestExerciseKeys.has(key)) {
          latestExerciseKeys.add(key);
          const stat = (exerciseStats[e.lesson_id] ??= { score: 0, total: 0, runs: 0 });
          stat.score += e.score;
          stat.total += e.total;
          stat.runs += 1;
        }
      }
      if (e.event_kind === "time" && typeof e.time_seconds === "number")
        timeTotal += e.time_seconds;
      if (e.event_kind === "badge")
        badges.push({
          name: String((e.meta as Record<string, unknown> | null)?.name ?? "Insignia"),
          at: e.created_at,
        });
      if (e.event_kind === "level" && !level)
        level = {
          value: String((e.meta as Record<string, unknown> | null)?.level ?? "—"),
          at: e.created_at,
        };
    }

    return {
      completedSet: completed,
      completedCount: completed.size,
      exerciseStats,
      timeTotal,
      badges,
      level,
    };
  }, [data]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-foreground/40" />
      </main>
    );
  }
  if (error) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 max-w-4xl mx-auto">
        <Link
          to="/cartilla/teacher"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Mis clases
        </Link>
        <div className="kid-card mt-6 border-destructive/20 bg-destructive/5 p-6 text-sm font-bold text-destructive">
          No se pudo cargar el progreso del alumno. Revisa la sesion del maestro o la conexion.
        </div>
      </main>
    );
  }
  if (!data || !summary) return null;

  const fmtMin = (s: number) => `${Math.floor(s / 60)} min ${s % 60} s`;

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-4xl mx-auto">
      <Link
        to="/cartilla/teacher/clase/$id"
        params={{ id: data.student.class_id }}
        className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> {data.class?.name ?? "Clase"}
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl sm:text-4xl font-bold">{data.student.display_name}</h1>
        <p className="text-sm text-foreground/60 mt-1">
          Código personal: <span className="font-mono font-bold">{data.student.student_code}</span>
        </p>
        {!isSupabaseConfigured && (
          <div className="mt-3 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
            Modo demo local: progreso leÃ­do desde este navegador.
          </div>
        )}
      </header>

      <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={BookOpen}
          label="Lecciones"
          value={`${summary.completedCount}/${TOTAL_LESSONS}`}
        />
        <StatCard
          icon={Target}
          label="Ejercicios"
          value={String(Object.values(summary.exerciseStats).reduce((a, s) => a + s.runs, 0))}
        />
        <StatCard icon={Clock} label="Tiempo total" value={fmtMin(summary.timeTotal)} />
        <StatCard icon={Award} label="Insignias" value={String(summary.badges.length)} />
      </section>

      {summary.level && (
        <section className="mt-4 kid-card p-4 inline-flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <div>
            <div className="text-xs uppercase tracking-wide text-foreground/60">
              Nivel adaptativo actual
            </div>
            <div className="font-bold text-lg">{summary.level.value}</div>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-bold mb-3 text-lg">Progreso por lección</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATALOG.map((entry) => {
            const isDone = summary.completedSet.has(String(entry.n));
            const ex = summary.exerciseStats[String(entry.n)];
            const pct = ex ? Math.round((ex.score / ex.total) * 100) : null;
            return (
              <div
                key={entry.n}
                className="kid-card p-3 flex items-center gap-3"
                style={{ borderLeftWidth: 4, borderLeftColor: entry.color }}
              >
                <div className="text-xs font-bold w-8 text-foreground/50">{entry.n}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{entry.title}</div>
                  <div className="text-xs text-foreground/60 mt-0.5">
                    {isDone ? (
                      <span className="text-success font-bold">✓ completada</span>
                    ) : (
                      <span>pendiente</span>
                    )}
                    {ex && (
                      <span className="ml-2">
                        · {ex.runs} ejercicio{ex.runs > 1 ? "s" : ""} ({pct}% acierto)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {summary.badges.length > 0 && (
        <section className="mt-8">
          <h2 className="font-bold mb-3 text-lg">Insignias ganadas</h2>
          <ul className="flex flex-wrap gap-2">
            {summary.badges.map((b, i) => (
              <li key={i} className="kid-card p-2 px-3 inline-flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-primary" /> {b.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-bold mb-3 text-lg">Actividad reciente</h2>
        <ul className="space-y-1.5 text-sm">
          {data.events.slice(0, 30).map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-card border border-foreground/5"
            >
              <span>
                <span className="font-bold text-foreground/70">L{e.lesson_id}</span>{" "}
                <span className="text-foreground/60">{labelEvent(e)}</span>
              </span>
              <span className="text-xs text-foreground/50">
                {new Date(e.created_at).toLocaleString()}
              </span>
            </li>
          ))}
          {data.events.length === 0 && (
            <li className="text-foreground/60">Sin actividad todavía.</li>
          )}
        </ul>
      </section>
    </main>
  );
}

function labelEvent(e: {
  event_kind: string;
  score: number | null;
  total: number | null;
  time_seconds: number | null;
}) {
  switch (e.event_kind) {
    case "lesson_completed":
      return "lección completada";
    case "exercise":
      return `ejercicio ${e.score ?? 0}/${e.total ?? 0}`;
    case "time":
      return `${e.time_seconds ?? 0} s de estudio`;
    case "badge":
      return "insignia ganada";
    case "level":
      return "cambio de nivel";
    default:
      return e.event_kind;
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="kid-card p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-foreground/60">{label}</div>
        <div className="font-bold truncate">{value}</div>
      </div>
    </div>
  );
}
