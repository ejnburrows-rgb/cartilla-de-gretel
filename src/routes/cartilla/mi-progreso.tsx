/**
 * mi-progreso.tsx  — Lane A
 *
 * CSS-only bar chart of completion per lesson (no chart lib),
 * streak counter, time-on-task total. Pulls from useStudentSession.
 * Anonymous users see local exercise-stats instead of Supabase data.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Clock,
  Download,
  Flame,
  Sparkles,
  Target,
} from "lucide-react";
import { getMyProgress } from "@/lib/student.functions";
import { getStudentSession } from "@/lib/student-session";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { useExerciseStats } from "@/lib/exercise-stats";
import { useLessonProgress } from "@/lib/lesson-progress";
import { downloadCSV, toCSV } from "@/lib/csv";
import { StickerReel } from "@/components/rewards/StickerReel";
import { BadgeGrid } from "@/components/rewards/BadgeGrid";
import { getEarnedStickers, getEarnedBadges } from "@/lib/rewards";
import "@/styles/cartilla-student.css";

export const Route = createFileRoute("/cartilla/mi-progreso")({
  component: MyProgress,
  head: () => ({ meta: [{ title: "Mi progreso — La Cartilla de Gretel" }] }),
});

type CloudEvent = {
  id: string;
  lesson_id: string;
  event_kind: string;
  score: number | null;
  total: number | null;
  time_seconds: number | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

function MyProgress() {
  const session = getStudentSession();
  const localStats = useExerciseStats();
  const { isCompleted, completed } = useLessonProgress();

  const [cloudData, setCloudData] = useState<{
    student: { display_name: string; student_code: string };
    class: { name: string } | null;
    events: CloudEvent[];
  } | null>(null);
  const [loading, setLoading] = useState(!!session);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getMyProgress({ data: { studentId: session.studentId, studentCode: session.studentCode } })
      .then((r) => setCloudData(r as never))
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar datos"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Build summary from cloud events OR fall back to local exercise-stats
  const summary = useMemo(() => {
    let completedSet = new Set<string>([...completed].map(String));
    let exByLesson: Record<string, { score: number; total: number; runs: number }> = {};
    let timeTotal = 0;
    let badges: string[] = [];
    let streakDays = 0;

    if (cloudData) {
      const dbCompleted = (
        (cloudData as { lessonProgress?: Array<{ lesson_id: string; status: string }> })
          .lessonProgress ?? []
      )
        .filter((row) => row.status === "completed")
        .map((row) => row.lesson_id);
      dbCompleted.forEach((id) => completedSet.add(id));

      const seen = new Set<string>();
      const datesSeen = new Set<string>();
      for (const e of cloudData.events) {
        if (e.event_kind === "lesson_completed") completedSet.add(e.lesson_id);
        if (
          e.event_kind === "exercise" &&
          typeof e.score === "number" &&
          typeof e.total === "number"
        ) {
          const meta = (e.meta ?? {}) as Record<string, unknown>;
          const exercise = typeof meta.exercise === "string" ? meta.exercise : "exercise";
          const key = `${e.lesson_id}:${exercise}`;
          if (!seen.has(key)) {
            seen.add(key);
            const stat = (exByLesson[e.lesson_id] ??= { score: 0, total: 0, runs: 0 });
            stat.score += e.score;
            stat.total += e.total;
            stat.runs += 1;
          }
        }
        if (e.event_kind === "time") timeTotal += e.time_seconds ?? 0;
        if (e.event_kind === "badge") badges.push(String((e.meta ?? {}).name ?? "Insignia"));
        const day = e.created_at?.slice(0, 10);
        if (day) datesSeen.add(day);
      }

      // Simple streak: consecutive days ending today
      const sortedDays = [...datesSeen].sort().reverse();
      const today = new Date().toISOString().slice(0, 10);
      let cursor = today;
      for (const d of sortedDays) {
        if (d === cursor) {
          streakDays++;
          const prev = new Date(cursor);
          prev.setDate(prev.getDate() - 1);
          cursor = prev.toISOString().slice(0, 10);
        } else {
          break;
        }
      }
    } else {
      // Anonymous: use local exercise-stats
      for (const [lessonId, exercises] of Object.entries(localStats)) {
        for (const [, s] of Object.entries(exercises)) {
          const stat = (exByLesson[lessonId] ??= { score: 0, total: 0, runs: 0 });
          stat.score += s.hits;
          stat.total += s.attempts;
          stat.runs += s.completedRounds;
        }
      }
    }

    const weak = Object.entries(exByLesson)
      .filter(([, s]) => s.total >= 3 && s.score / s.total < 0.7)
      .map(([lesson]) => lesson);

    return { completedSet, exByLesson, timeTotal, badges, streakDays, weak };
  }, [cloudData, localStats, completed]);

  const exportCSV = () => {
    const rows = CATALOG.map((entry) => {
      const ex = summary.exByLesson[String(entry.n)];
      return {
        leccion: entry.n,
        titulo: entry.title,
        completada: summary.completedSet.has(String(entry.n)) ? "sí" : "no",
        ejercicios: ex?.runs ?? 0,
        aciertos: ex?.score ?? 0,
        intentos: ex?.total ?? 0,
        porcentaje: ex && ex.total > 0 ? Math.round((ex.score / ex.total) * 100) + "%" : "",
      };
    });
    const name = cloudData?.student.student_code ?? "local";
    downloadCSV(`mi-progreso-${name}.csv`, toCSV(rows));
  };

  const fmtMin = (s: number) => `${Math.floor(s / 60)} min ${s % 60} s`;
  const totalExercises = Object.values(summary.exByLesson).reduce((a, s) => a + s.runs, 0);

  // CSS bar chart data — all 24 lessons
  const chartBars = CATALOG.map((entry) => {
    const ex = summary.exByLesson[String(entry.n)];
    const pct = ex && ex.total > 0 ? Math.round((ex.score / ex.total) * 100) : 0;
    return { label: `L${entry.n}`, pct, color: entry.color };
  });

  const [unlockedStickers, setUnlockedStickers] = useState<number[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  useEffect(() => {
    setUnlockedStickers(getEarnedStickers());
    setUnlockedBadges(getEarnedBadges());
  }, []);

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-4xl mx-auto">
      <Link
        to="/cartilla"
        className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
        aria-label="Volver a la Cartilla"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden /> Cartilla
      </Link>

      <header className="mt-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            {cloudData
              ? `Hola, ${cloudData.student.display_name}`
              : "Mi progreso"}
          </h1>
          {cloudData ? (
            <p className="text-sm text-foreground/60 mt-1">
              Clase: <strong>{cloudData.class?.name ?? "—"}</strong> · Código:{" "}
              <span className="font-mono font-bold">{cloudData.student.student_code}</span>
            </p>
          ) : (
            <p className="text-sm text-foreground/60 mt-1">
              Modo local — sin sesión de estudiante activa.{" "}
              <Link to="/cartilla/unirse" className="font-bold text-primary underline">
                Unirse a una clase →
              </Link>
            </p>
          )}
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border-2 border-foreground/10 hover:bg-secondary font-bold"
          aria-label="Exportar progreso como CSV"
        >
          <Download className="w-4 h-4" aria-hidden /> CSV
        </button>
      </header>

      {loading && (
        <div className="mt-8 text-center text-foreground/50" aria-live="polite">
          Cargando progreso…
        </div>
      )}
      {error && (
        <div className="mt-6 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── Stats grid ── */}
      <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="Resumen de progreso">
        <Stat icon={BookOpen} label="Lecciones" value={`${summary.completedSet.size}/${TOTAL_LESSONS}`} />
        <Stat icon={Target} label="Ejercicios" value={String(totalExercises)} />
        <Stat icon={Clock} label="Tiempo" value={fmtMin(summary.timeTotal)} />
        {summary.streakDays > 0 ? (
          <Stat icon={Flame} label="Racha" value={`${summary.streakDays} días`} />
        ) : (
          <Stat icon={Award} label="Insignias" value={String(summary.badges.length)} />
        )}
      </section>

      {/* ── Rewards section ── */}
      <section className="mt-8 space-y-6" aria-label="Recompensas obtenidas">
        <StickerReel earnedIds={unlockedStickers} />
        <BadgeGrid earnedIds={unlockedBadges} />
      </section>

      {/* ── Weak lessons call to action ── */}
      {summary.weak.length > 0 && (
        <section className="mt-6 rounded-2xl border-2 border-warning/30 bg-warning/5 p-4">
          <h2 className="font-bold inline-flex items-center gap-2 text-warning">
            <Sparkles className="w-4 h-4" aria-hidden /> Te conviene repasar
          </h2>
          <p className="text-sm text-foreground/70 mt-1">
            Tuviste varios errores en estas lecciones. ¡Vuelve a intentarlo!
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {summary.weak.map((n) => {
              const entry = CATALOG.find((e) => String(e.n) === n);
              if (!entry) return null;
              return (
                <Link
                  key={n}
                  to="/cartilla/leccion/$n"
                  params={{ n }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border-2"
                  style={{ borderColor: entry.color, color: entry.color }}
                  aria-label={`Repasar lección ${n}: ${entry.title}`}
                >
                  L{entry.n} — {entry.title}
                </Link>
              );
            })}
          </div>
          <Link
            to="/cartilla/repaso"
            className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            aria-label="Ir al modo repaso"
          >
            Ir al modo repaso →
          </Link>
        </section>
      )}

      {/* ── CSS-only bar chart ── */}
      <section className="mt-6 kid-card p-4" aria-label="Gráfica de aciertos por lección">
        <h2 className="font-bold mb-4">Aciertos por lección (%)</h2>
        <div
          className="css-bar-chart"
          role="list"
          aria-label="Barras de aciertos por lección"
        >
          {chartBars.map(({ label, pct, color }) => (
            <div
              key={label}
              className="css-bar-chart__col"
              role="listitem"
              aria-label={`${label}: ${pct}%`}
            >
              <div
                className="css-bar-chart__bar"
                style={{
                  height: `${Math.max(2, pct)}%`,
                  backgroundColor: pct > 0 ? color : "hsl(var(--foreground)/0.08)",
                }}
                title={`${pct}%`}
              />
              <div className="css-bar-chart__label">{label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-foreground/50 mt-2 text-center">
          Cada barra muestra el porcentaje de aciertos en ejercicios de esa lección.
        </p>
      </section>

      {/* ── Full lesson list ── */}
      <section className="mt-6" aria-label="Lista completa de lecciones">
        <h2 className="font-bold mb-3 text-lg">Tus 24 lecciones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATALOG.map((entry) => {
            const isDone = summary.completedSet.has(String(entry.n)) || isCompleted(entry.n);
            const ex = summary.exByLesson[String(entry.n)];
            const pct = ex && ex.total > 0 ? Math.round((ex.score / ex.total) * 100) : null;
            return (
              <Link
                to="/cartilla/leccion/$n"
                params={{ n: String(entry.n) }}
                key={entry.n}
                className="kid-card p-3 flex items-center gap-3 hover:-translate-y-0.5 transition"
                style={{ borderLeftWidth: 4, borderLeftColor: entry.color }}
                aria-label={`Lección ${entry.n}: ${entry.title}${isDone ? " — completada" : ""}${pct !== null ? `, ${pct}% acierto` : ""}`}
              >
                <div className="text-xs font-bold w-8 text-foreground/50 shrink-0">{entry.n}</div>
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
                  {pct !== null && (
                    <div
                      className="student-progress-bar mt-1.5"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${pct}% de acierto en lección ${entry.n}`}
                    >
                      <div
                        className="student-progress-bar__fill"
                        style={{ width: `${pct}%`, backgroundColor: entry.color }}
                      />
                    </div>
                  )}
                </div>
              </Link>
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
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-foreground/60">{label}</div>
        <div className="font-bold truncate">{value}</div>
      </div>
    </div>
  );
}
