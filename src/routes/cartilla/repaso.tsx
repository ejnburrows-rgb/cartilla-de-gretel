import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { ArrowLeft, AlertTriangle, BookOpen, Sparkles, RotateCcw } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { useLessonProgress } from "@/lib/lesson-progress";
import { useExerciseStats, isLessonWeak, lessonAccuracy, resetStats } from "@/lib/exercise-stats";
import { routePath } from "@/lib/assets";

export const Route = createFileRoute("/cartilla/repaso")({
  component: Repaso,
  head: () => ({ meta: [{ title: "Modo Repaso — La Cartilla de Gretel" }] }),
});

function lessonCardStyle(color: string): CSSProperties {
  return { borderColor: color };
}

function lessonTitleStyle(color: string): CSSProperties {
  return { color };
}

function Repaso() {
  const { isCompleted, isUnlocked } = useLessonProgress();
  const stats = useExerciseStats();

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
          >
            <ArrowLeft className="w-4 h-4" /> Lecciones
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
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reiniciar repaso
          </button>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Modo repaso
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          Practica lo que te falta y refuerza lo que fallaste
        </h1>
        <p className="text-foreground/70 mt-1">
          Te mostramos primero las lecciones donde tuviste errores, y después las pendientes.
        </p>
      </header>

      <main className="px-4 pb-24 max-w-5xl mx-auto space-y-8">
        <Section
          title="Para reforzar"
          icon={<AlertTriangle className="w-4 h-4" />}
          tone="text-destructive"
          emptyText="¡Bien hecho! No hay ejercicios fallados pendientes de reforzar."
          entries={weak}
          stats={stats}
          showAccuracy
        />
        <Section
          title="Pendientes"
          icon={<BookOpen className="w-4 h-4" />}
          tone="text-primary"
          emptyText="Has completado todas las lecciones disponibles."
          entries={pending}
          stats={stats}
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
}: {
  title: string;
  icon: React.ReactNode;
  tone: string;
  entries: typeof CATALOG;
  emptyText: string;
  stats: ReturnType<typeof useExerciseStats>;
  showAccuracy?: boolean;
}) {
  return (
    <section>
      <h2
        className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${tone} mb-3`}
      >
        {icon} {title} ({entries.length})
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-foreground/60 italic">{emptyText}</p>
      ) : (
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {entries.map((entry) => {
            const acc = lessonAccuracy(String(entry.n), stats);
            return (
              <li key={entry.n} className="list-none">
                <a
                  href={routePath(`/cartilla/leccion/${entry.n}`)}
                  className="block rounded-2xl border-2 border-foreground/10 bg-card p-4 h-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                  style={lessonCardStyle(entry.color)}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-foreground/50">
                      Lección {entry.n}
                    </span>
                    {showAccuracy && acc !== null && (
                      <span className="text-[11px] font-bold text-destructive">
                        {Math.round(acc * 100)}% acierto
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold leading-tight" style={lessonTitleStyle(entry.color)}>
                    {entry.title}
                  </h3>
                  <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{entry.subtitle}</p>
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
