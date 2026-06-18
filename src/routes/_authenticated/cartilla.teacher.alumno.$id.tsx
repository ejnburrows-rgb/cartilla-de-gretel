import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, Loader2, BookOpen, Award, Clock, Target, Activity, Plus } from "lucide-react";
import { getStudentProgress, setLessonCompletion } from "@/lib/teacher.functions";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { useLanguage } from "@/context/LanguageContext";
import { tCopy } from "@/content/teacher-copy";

export const Route = createFileRoute("/_authenticated/cartilla/teacher/alumno/$id")({
  component: StudentDetail,
});

function StudentDetail() {
  const { lang } = useLanguage();
  const t = tCopy;
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fetchProgress = useServerFn(getStudentProgress);
  const setCompletion = useServerFn(setLessonCompletion);
  const [pendingLesson, setPendingLesson] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["teacher", "student", id],
    queryFn: () => fetchProgress({ data: { id } }),
  });

  const toggleMut = useMutation({
    mutationFn: (vars: { lessonId: string; completed: boolean }) =>
      setCompletion({ data: { studentId: id, lessonId: vars.lessonId, completed: vars.completed } }),
    onMutate: (vars) => setPendingLesson(vars.lessonId),
    onSettled: () => setPendingLesson(null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher", "student", id] });
      qc.invalidateQueries({ queryKey: ["teacher", "class"] });
    },
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
  if (!data || !summary) return null;

  const fmtMin = (s: number) => `${Math.floor(s / 60)} ${t.min[lang]} ${s % 60} ${t.s[lang]}`;

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
          {t.codigoPersonal[lang]} <span className="font-mono font-bold">{data.student.student_code}</span>
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={BookOpen}
          label={t.leccionesCount[lang]}
          value={`${summary.completedCount}/${TOTAL_LESSONS}`}
        />
        <StatCard
          icon={Target}
          label={t.ejercicios[lang]}
          value={String(Object.values(summary.exerciseStats).reduce((a, s) => a + s.runs, 0))}
        />
        <StatCard icon={Clock} label={t.tiempoTotal[lang]} value={fmtMin(summary.timeTotal)} />
        <StatCard icon={Award} label={t.insignias[lang]} value={String(summary.badges.length)} />
      </section>

      {summary.level && (
        <section className="mt-4 kid-card p-4 inline-flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <div>
            <div className="text-xs uppercase tracking-wide text-foreground/60">
              {t.nivelAdaptativo[lang]}
            </div>
            <div className="font-bold text-lg">{summary.level.value}</div>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-bold mb-1 text-lg">{t.progresoLeccion[lang]}</h2>
        <p className="text-xs text-foreground/50 mb-3">{t.ajusteManual[lang]}</p>
        {toggleMut.error && (
          <p className="text-sm text-destructive mb-3">{t.noSeActualizo[lang]}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATALOG.map((entry) => {
            const lessonKey = String(entry.n);
            const isDone = summary.completedSet.has(lessonKey);
            const ex = summary.exerciseStats[lessonKey];
            const pct = ex ? Math.round((ex.score / ex.total) * 100) : null;
            const isPending = pendingLesson === lessonKey;
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
                      <span className="text-success font-bold">✓ {t.completada[lang]}</span>
                    ) : (
                      <span>{t.pendiente[lang]}</span>
                    )}
                    {ex && (
                      <span className="ml-2">
                        · {ex.runs} {ex.runs > 1 ? t.ejercicioPlural[lang] : t.ejercicioSingular[lang]} ({pct}% {t.acierto[lang]})
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleMut.mutate({ lessonId: lessonKey, completed: !isDone })}
                  disabled={isPending}
                  className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
                    isDone
                      ? "text-foreground/50 hover:bg-destructive/10 hover:text-destructive"
                      : "text-success hover:bg-success/10"
                  }`}
                  aria-label={isDone ? t.quitarCompletada[lang] : t.marcarCompletada[lang]}
                  title={isDone ? t.quitarCompletada[lang] : t.marcarCompletada[lang]}
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isDone ? (
                    t.quitarCompletada[lang]
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> {t.marcarCompletada[lang]}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {summary.badges.length > 0 && (
        <section className="mt-8">
          <h2 className="font-bold mb-3 text-lg">{t.insigniasGanadas[lang]}</h2>
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
        <h2 className="font-bold mb-3 text-lg">{t.actividadReciente[lang]}</h2>
        <ul className="space-y-1.5 text-sm">
          {data.events.slice(0, 30).map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-card border border-foreground/5"
            >
              <span>
                <span className="font-bold text-foreground/70">L{e.lesson_id}</span>{" "}
                <span className="text-foreground/60">{labelEvent(e, lang)}</span>
              </span>
              <span className="text-xs text-foreground/50">
                {new Date(e.created_at).toLocaleString()}
              </span>
            </li>
          ))}
          {data.events.length === 0 && (
            <li className="text-foreground/60">{t.sinActividad[lang]}</li>
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
}, lang: "es" | "en") {
  const t = tCopy;
  switch (e.event_kind) {
    case "lesson_completed":
      return t.evtLeccion[lang];
    case "exercise":
      return `${t.evtEjercicio[lang]} ${e.score ?? 0}/${e.total ?? 0}`;
    case "time":
      return `${e.time_seconds ?? 0} ${t.s[lang]} ${t.evtTiempo[lang]}`;
    case "badge":
      return t.evtInsignia[lang];
    case "level":
      return t.evtNivel[lang];
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
