/**
 * repaso.tsx  — Lane A
 *
 * Shows last 5 lessons the student touched (by lastUpdated in exercise-stats),
 * surfaced as cards with "Repasar" CTA → /cartilla/leccion/:n.
 * Also shows weak lessons (accuracy < 70%).
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, AlertTriangle, BookOpen, Sparkles, RotateCcw, Clock } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { useLessonProgress } from "@/lib/lesson-progress";
import { useExerciseStats, isLessonWeak, lessonAccuracy, resetStats } from "@/lib/exercise-stats";
import { BookArtFigure } from "@/components/cartilla/BookArtFigure";
import "@/styles/cartilla-student.css";

export const Route = createFileRoute("/cartilla/student/repaso")({
  component: Repaso,
  head: () => ({ meta: [{ title: "Modo Repaso — La Cartilla de Gretel" }] }),
});

function Repaso() {
  const { isCompleted, isUnlocked } = useLessonProgress();
  const stats = useExerciseStats();

  // Last 5 touched lessons (by lastUpdated timestamp)
  const lastTouched = useMemo(() => {
    const withTimestamp = CATALOG.map((entry) => {
      const lessonStats = stats[String(entry.n)];
      const lastUpdated = lessonStats
        ? Math.max(...Object.values(lessonStats).map((s) => s.lastUpdated))
        : 0;
      return { entry, lastUpdated };
    })
      .filter(({ lastUpdated }) => lastUpdated > 0)
      .sort((a, b) => b.lastUpdated - a.lastUpdated)
      .slice(0, 5)
      .map(({ entry }) => entry);
    return withTimestamp;
  }, [stats]);

  const weak = CATALOG.filter((e) => isLessonWeak(String(e.n), stats));
  const pending = CATALOG.filter(
    (e) => !isCompleted(e.n) && isUnlocked(e.n) && !weak.find((w) => w.n === e.n),
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 pt-5 pb-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link
            to="/cartilla/lecciones"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
            aria-label="Volver al índice de lecciones"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden /> Lecciones
          </Link>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "¿Olvidar los resultados de tus ejercicios para empezar el repaso de cero?",
                )
              )
                resetStats();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/60 hover:text-destructive"
            aria-label="Reiniciar historial de repaso"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden /> Reiniciar repaso
          </button>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary mb-1">
          <Sparkles className="w-3.5 h-3.5" aria-hidden /> Modo repaso
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          Practica lo que te falta y refuerza lo que fallaste
        </h1>
        <p className="text-foreground/70 mt-1">
          Últimas lecciones que practicaste, ejercicios fallados y lecciones pendientes.
        </p>
      </header>

      <main className="px-4 pb-24 max-w-5xl mx-auto space-y-10">
        {/* ── Últimas 5 lecciones tocadas ── */}
        <Section
          title="Últimas lecciones practicadas"
          icon={<Clock className="w-4 h-4" aria-hidden />}
          tone="text-primary"
          emptyText="Aún no has practicado ninguna lección."
          entries={lastTouched}
          stats={stats}
          ctaLabel="Repasar"
        />

        {/* ── Para reforzar ── */}
        <Section
          title="Para reforzar (acierto < 70%)"
          icon={<AlertTriangle className="w-4 h-4" aria-hidden />}
          tone="text-destructive"
          emptyText="¡Bien hecho! No hay ejercicios fallados pendientes."
          entries={weak}
          stats={stats}
          showAccuracy
          ctaLabel="Repasar"
        />

        {/* ── Pendientes ── */}
        <Section
          title="Pendientes"
          icon={<BookOpen className="w-4 h-4" aria-hidden />}
          tone="text-primary"
          emptyText="Has completado todas las lecciones disponibles."
          entries={pending}
          stats={stats}
          ctaLabel="Empezar"
        />
      </main>
    </div>
  );
}

function Section({
  title,
  icon,
  tone,
  entries,
  emptyText,
  stats,
  showAccuracy,
  ctaLabel,
}: {
  title: string;
  icon: React.ReactNode;
  tone: string;
  entries: typeof CATALOG;
  emptyText: string;
  stats: ReturnType<typeof useExerciseStats>;
  showAccuracy?: boolean;
  ctaLabel: string;
}) {
  return (
    <section aria-labelledby={`section-${title.replace(/\s/g, "-")}`}>
      <h2
        id={`section-${title.replace(/\s/g, "-")}`}
        className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${tone} mb-4`}
      >
        {icon} {title} ({entries.length})
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-foreground/60 italic">{emptyText}</p>
      ) : (
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => {
            const acc = lessonAccuracy(String(entry.n), stats);
            return (
              <li key={entry.n} className="list-none">
                <div
                  className="kid-card overflow-hidden flex flex-col"
                  style={{ borderLeftWidth: 5, borderLeftColor: entry.color }}
                  aria-label={`Lección ${entry.n}: ${entry.title}`}
                >
                  {/* Art */}
                  <div
                    className="w-full h-28 flex items-center justify-center"
                    style={{ backgroundColor: `${entry.color}15` }}
                  >
                    <BookArtFigure lesson={entry.n} role="character" className="h-24 w-auto" />
                  </div>

                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-foreground/50">
                        Lección {entry.n}
                      </span>
                      {showAccuracy && acc !== null && (
                        <span className="text-[11px] font-bold text-destructive">
                          {Math.round(acc * 100)}% acierto
                        </span>
                      )}
                    </div>
                    <h3
                      className="text-base font-bold leading-tight"
                      style={{ color: entry.color }}
                    >
                      {entry.title}
                    </h3>
                    <p className="text-sm text-foreground/70 line-clamp-2">{entry.subtitle}</p>
                    <Link
                      to="/cartilla/leccion/$n"
                      params={{ n: String(entry.n) }}
                      className="mt-auto inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-bold text-white transition hover:-translate-y-0.5"
                      style={{ backgroundColor: entry.color }}
                      aria-label={`${ctaLabel} lección ${entry.n}: ${entry.title}`}
                    >
                      {ctaLabel} →
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
