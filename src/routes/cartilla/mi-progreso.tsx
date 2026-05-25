import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Award, BookOpen, Clock, Download, Sparkles, Target } from "lucide-react";
import { getMyProgress } from "@/lib/student.functions";
import { getStudentSession } from "@/lib/student-session";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { SimpleBarChart } from "@/components/cartilla/SimpleBarChart";
import { downloadCSV, toCSV } from "@/lib/csv";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { routePath } from "@/lib/assets";

export const Route = createFileRoute("/cartilla/mi-progreso")({
  component: MyProgress,
  head: () => ({ meta: [{ title: "Mi progreso — La Cartilla de Gretel" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getStudentSession()) {
      throw redirect({ to: "/cartilla/unirse" });
    }
  },
});

type Event = {
  id: string;
  lesson_id: string;
  event_kind: string;
  score: number | null;
  total: number | null;
  time_seconds: number | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

function lessonAccentStyle(color: string) {
  return { borderColor: color, color };
}

function lessonCardStyle(color: string) {
  return { borderLeft: `5px solid ${color}` };
}

function MyProgress() {
  const [data, setData] = useState<{
    student: { display_name: string; student_code: string };
    class: { name: string } | null;
    events: Event[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = getStudentSession();
    if (!s) {
      setError("No hay una sesión de alumno activa. Vuelve a unirte a tu clase.");
      setLoading(false);
      return;
    }
    getMyProgress({ data: { studentId: s.studentId, studentCode: s.studentCode } })
      .then((r) => setData(r as never))
      .catch((e) =>
        setError(
          e instanceof Error
            ? e.message
            : "No se pudo cargar el progreso. Sync no disponible en este momento.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    if (!data) return null;
    const completed = new Set<string>();
    const exByLesson: Record<string, { score: number; total: number; runs: number }> = {};
    const latestExerciseKeys = new Set<string>();
    let timeTotal = 0;
    const badges: string[] = [];
    let level: string | null = null;
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
          const stat = (exByLesson[e.lesson_id] ??= { score: 0, total: 0, runs: 0 });
          stat.score += e.score;
          stat.total += e.total;
          stat.runs += 1;
        }
      }
      if (e.event_kind === "time") timeTotal += e.time_seconds ?? 0;
      if (e.event_kind === "badge") badges.push(String((e.meta ?? {}).name ?? "Insignia"));
      if (e.event_kind === "level" && !level) level = String((e.meta ?? {}).level ?? "—");
    }
    const dbCompleted = (
      (data as { lessonProgress?: Array<{ lesson_id: string; status: string }> }).lessonProgress ??
      []
    )
      .filter((row) => row.status === "completed")
      .map((row) => row.lesson_id);
    dbCompleted.forEach((lessonId) => completed.add(lessonId));
    const weak = Object.entries(exByLesson)
      .filter(([, s]) => s.total >= 3 && s.score / s.total < 0.7)
      .map(([lesson]) => lesson);
    return { completed, exByLesson, timeTotal, badges, level, weak };
  }, [data]);

  const exportCSV = () => {
    if (!data || !summary) return;
    const rows = CATALOG.map((entry) => {
      const ex = summary.exByLesson[String(entry.n)];
      return {
        leccion: entry.n,
        titulo: entry.title,
        completada: summary.completed.has(String(entry.n)) ? "sí" : "no",
        ejercicios: ex?.runs ?? 0,
        aciertos: ex?.score ?? 0,
        intentos: ex?.total ?? 0,
        porcentaje: ex && ex.total > 0 ? Math.round((ex.score / ex.total) * 100) + "%" : "",
      };
    });
    downloadCSV(`mi-progreso-${data.student.student_code}.csv`, toCSV(rows));
  };

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center text-foreground/50">
        Cargando…
      </main>
    );
  if (error)
    return (
      <main className="min-h-screen flex items-center justify-center text-destructive p-6 text-center">
        {error}
      </main>
    );
  if (!data || !summary) return null;

  const fmtMin = (s: number) => `${Math.floor(s / 60)} min ${s % 60} s`;
  const chartBars = CATALOG.slice(0, 12).map((entry) => {
    const ex = summary.exByLesson[String(entry.n)];
    return {
      label: `L${entry.n}`,
      value: ex && ex.total > 0 ? Math.round((ex.score / ex.total) * 100) : 0,
      color: entry.color,
      sub: summary.completed.has(String(entry.n)) ? "✓" : "",
    };
  });

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-4xl mx-auto">
      <Link
        to="/cartilla"
        className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Cartilla
      </Link>

      <header className="mt-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Hola, {data.student.display_name}</h1>
          <p className="text-sm text-foreground/60 mt-1">
            Clase: <strong>{data.class?.name ?? "—"}</strong> · Tu código:{" "}
            <span className="font-mono font-bold">{data.student.student_code}</span>
          </p>
          {!isSupabaseConfigured && (
            <div className="mt-3 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
              Modo demo local: estos datos viven en este navegador. Sync no disponible sin Supabase.
            </div>
          )}
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border-2 border-foreground/10 hover:bg-secondary font-bold"
        >
          <Download className="w-4 h-4" /> CSV
        </button>
      </header>

      <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          icon={BookOpen}
          label="Lecciones"
          value={`${summary.completed.size}/${TOTAL_LESSONS}`}
        />
        <Stat
          icon={Target}
          label="Ejercicios"
          value={String(Object.values(summary.exByLesson).reduce((a, s) => a + s.runs, 0))}
        />
        <Stat icon={Clock} label="Tiempo" value={fmtMin(summary.timeTotal)} />
        <Stat icon={Award} label="Insignias" value={String(summary.badges.length)} />
      </section>

      {summary.weak.length > 0 && (
        <section className="mt-6 rounded-2xl border-2 border-warning/30 bg-warning/5 p-4">
          <h2 className="font-bold inline-flex items-center gap-2 text-warning">
            <Sparkles className="w-4 h-4" /> Te conviene repasar
          </h2>
          <p className="text-sm text-foreground/70 mt-1">
            Tuviste varios errores en estas lecciones. ¡Vuelve a intentarlo!
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {summary.weak.map((lessonId) => {
              const entry = CATALOG.find((e) => String(e.n) === lessonId);
              if (!entry) return null;
              return (
                <a
                  key={lessonId}
                  href={routePath(`/cartilla/leccion/${entry.n}`)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border-2"
                  style={lessonAccentStyle(entry.color)}
                >
                  L{entry.n} — {entry.title}
                </a>
              );
            })}
          </div>
          <Link
            to="/cartilla/repaso"
            className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            Ir al modo repaso →
          </Link>
        </section>
      )}

      <section className="mt-6 kid-card p-4">
        <h2 className="font-bold mb-3">Aciertos por lección (primeras 12)</h2>
        <SimpleBarChart bars={chartBars} max={100} formatValue={(v) => `${v}%`} />
      </section>

      <section className="mt-6">
        <h2 className="font-bold mb-3 text-lg">Tus 24 lecciones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATALOG.map((entry) => {
            const isDone = summary.completed.has(String(entry.n));
            const ex = summary.exByLesson[String(entry.n)];
            const pct = ex && ex.total > 0 ? Math.round((ex.score / ex.total) * 100) : null;
            return (
              <a
                href={routePath(`/cartilla/leccion/${entry.n}`)}
                key={entry.n}
                className="kid-card p-3 flex items-center gap-3 hover:-translate-y-0.5 transition"
                style={lessonCardStyle(entry.color)}
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
                    {pct !== null && <span className="ml-2">· {pct}% acierto</span>}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Stat({
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
