import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import teacherGuide from "@/data/teacher-guide.json";
import "@/styles/cartilla-student.css";

const STORAGE_KEY = "gretel_completed_lessons";

function readCompleted() {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function writeCompleted(lessons: number[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
}

export const Route = createFileRoute("/cartilla/student/progress")({
  component: ProgressPage,
  head: () => ({ meta: [{ title: "Mi progreso — La Cartilla de Gretel" }] }),
});

function ProgressPage() {
  const [completed, setCompleted] = useState<number[]>(() => readCompleted());
  const [pendingReset, setPendingReset] = useState(false);

  const lessons = useMemo(() => {
    const teacherLessons = (teacherGuide as { lessons: Array<{ lesson: number; title: string }> }).lessons;
    const map = new Map(teacherLessons.map((l) => [l.lesson, l.title]));
    return CATALOG.map((entry) => ({
      n: entry.n,
      title: map.get(entry.n) ?? entry.title,
      color: entry.color,
      kind: entry.kind,
    }));
  }, []);

  const nextIncomplete = useMemo(() => {
    for (let i = 1; i <= TOTAL_LESSONS; i++) {
      if (!completed.includes(i)) return i;
    }
    return null;
  }, [completed]);

  const completedCount = completed.length;

  const markVisited = (n: number) => {
    setCompleted((prev) => {
      const next = prev.includes(n) ? prev : [...prev, n];
      writeCompleted(next);
      return next;
    });
  };

  const handleReset = () => {
    if (pendingReset) {
      writeCompleted([]);
      setCompleted([]);
      setPendingReset(false);
    } else {
      setPendingReset(true);
      setTimeout(() => setPendingReset(false), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-3xl mx-auto">
      <Link
        to="/cartilla/student/lecciones"
        className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
        aria-label="Volver al índice"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden /> Lecciones
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl sm:text-4xl font-bold">Tu progreso</h1>
        <p className="mt-2 text-base text-foreground/70">
          {completedCount} / {TOTAL_LESSONS} lecciones completadas
        </p>
        {nextIncomplete !== null && (
          <p className="text-sm text-foreground/60 mt-1">
            Siguiente lección sugerida: <strong>L{nextIncomplete}</strong>
          </p>
        )}
      </header>

      <section className="mt-8" aria-label="Mapa de lecciones">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {lessons.map((lesson) => {
            const isDone = completed.includes(lesson.n);
            const isCurrent = nextIncomplete === lesson.n;
            const opacity = isDone ? "opacity-100" : "opacity-70";
            const ring = isCurrent ? "ring-2 ring-primary ring-offset-2" : "";
            return (
              <Link
                key={lesson.n}
                to="/cartilla/student/leccion/$n"
                params={{ n: String(lesson.n) }}
                onClick={() => markVisited(lesson.n)}
                className={`min-h-11 rounded-2xl border-2 p-3 flex items-center gap-2 bg-card hover:-translate-y-0.5 transition ${opacity} ${ring}`}
                style={{ borderColor: isDone ? lesson.color : "hsl(var(--foreground)/0.12)" }}
                aria-label={`Lección ${lesson.n}: ${lesson.title}${isDone ? " — completada" : ""}`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    backgroundColor: isDone ? lesson.color : "hsl(var(--foreground)/0.08)",
                    color: isDone ? "hsl(var(--card))" : "hsl(var(--foreground))",
                  }}
                >
                  {isDone ? <Check className="w-4 h-4" aria-hidden /> : lesson.n}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{lesson.n} — {lesson.title}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-10 flex justify-center">
        <button
          onClick={handleReset}
          type="button"
          className={`inline-flex items-center gap-2 min-h-11 rounded-xl border-2 px-4 py-2 text-sm font-bold transition ${
            pendingReset
              ? "border-destructive text-destructive"
              : "border-foreground/15 text-foreground/70 hover:bg-secondary"
          }`}
          aria-label="Borrar progreso local"
        >
          <RotateCcw className="w-4 h-4" aria-hidden />
          {pendingReset ? "Confirmar borrado" : "Borrar progreso"}
        </button>
      </div>

      {pendingReset && (
        <p className="text-xs text-center text-foreground/60 mt-2">
          Pulsa de nuevo para confirmar. Tu progreso local se eliminará.
        </p>
      )}
    </main>
  );
}
