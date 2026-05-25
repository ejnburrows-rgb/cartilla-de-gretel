import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, BookOpen, Check, Image, RotateCcw, Sparkles, Zap } from "lucide-react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { getWorkbookTranscriptionSummary } from "@/lib/book-faithful";
import { hydrateLessonProgress, useLessonProgress } from "@/lib/lesson-progress";
import { getMyProgress } from "@/lib/student.functions";
import { useProgressSyncStatus, useStudentSession } from "@/lib/student-session";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { routePath } from "@/lib/assets";

export const Route = createFileRoute("/cartilla/lecciones")({
  component: Lecciones,
  head: () => ({ meta: [{ title: "24 Lecciones — La Cartilla de Gretel" }] }),
});

function Lecciones() {
  const session = useStudentSession();
  const syncStatus = useProgressSyncStatus();
  const fetchMyProgress = useServerFn(getMyProgress);
  const { isCompleted, completed, reset } = useLessonProgress();

  useEffect(() => {
    if (!session) return;
    fetchMyProgress({ data: { studentId: session.studentId, studentCode: session.studentCode } })
      .then((data) => {
        const fromRows = (
          (data as { lessonProgress?: Array<{ lesson_id: string; status: string }> })
            .lessonProgress ?? []
        )
          .filter((row) => row.status === "completed")
          .map((row) => Number(row.lesson_id))
          .filter((n) => Number.isFinite(n));
        const fromEvents = (
          (data as { events?: Array<{ lesson_id: string; event_kind: string }> }).events ?? []
        )
          .filter((event) => event.event_kind === "lesson_completed")
          .map((event) => Number(event.lesson_id))
          .filter((n) => Number.isFinite(n));
        hydrateLessonProgress(Array.from(new Set([...fromRows, ...fromEvents])));
      })
      .catch(() => undefined);
  }, [fetchMyProgress, session]);

  const doneCount = [...completed].filter((n) => n >= 1 && n <= TOTAL_LESSONS).length;
  const pct = Math.round((doneCount / TOTAL_LESSONS) * 100);

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 pt-5 pb-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link
            to="/cartilla"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Cartilla
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/cartilla/practica"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-vowel-o hover:underline"
            >
              <Zap className="w-3.5 h-3.5" /> Práctica rápida
            </Link>
            <Link
              to="/cartilla/repaso"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" /> Modo repaso
            </Link>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Reiniciar tu progreso de las 24 lecciones?")) reset();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/60 hover:text-destructive"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reiniciar progreso
            </button>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          Las 24 lecciones de <em>La Cartilla de Gretel</em>
        </h1>
        <p className="text-foreground/70 mt-1">
          Todas las lecciones están abiertas para avanzar rápido. El progreso se guarda cuando hay sesión de alumno.
        </p>
        {!isSupabaseConfigured && session && (
          <div className="mt-3 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
            Modo local: progreso guardado en este navegador para {session.studentName}.
          </div>
        )}
        {session && syncStatus.state !== "idle" && (
          <div
            className={syncStatus.state === "error" ? "mt-2 inline-flex rounded-full border border-destructive/25 bg-destructive/5 px-3 py-1 text-xs font-bold text-destructive" : "mt-2 inline-flex rounded-full border border-success/25 bg-success/5 px-3 py-1 text-xs font-bold text-success"}
          >
            {syncStatus.message}
          </div>
        )}
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-sm font-bold">
            <span className="text-foreground/80">
              Progreso: {doneCount} / {TOTAL_LESSONS}
            </span>
            <span className="text-foreground/60">{pct}%</span>
          </div>
          <div className="mt-1.5 h-3 bg-secondary rounded-full overflow-hidden border border-foreground/10">
            <div className="h-full bg-primary transition-all" style={progressStyle(pct)} />
          </div>
        </div>
      </header>
      <main className="px-4 pb-24 max-w-5xl mx-auto">
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {CATALOG.map((entry) => {
            const done = isCompleted(entry.n);
            const summary = getWorkbookTranscriptionSummary(entry.n);
            const statusCopy = summary.verified > 0
              ? `${summary.verified}/${summary.total} páginas con texto verificado`
              : summary.partial > 0
                ? `${summary.partial}/${summary.total} escaneos conectados`
                : `${summary.total} páginas por verificar`;
            return (
              <li key={entry.n} className="list-none">
                <a
                  href={routePath(`/cartilla/leccion/${entry.n}`)}
                  className="block rounded-2xl border-2 p-4 h-full transition shadow-sm bg-card border-foreground/10 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-foreground/50">
                      Lección {entry.n}
                    </span>
                    {done ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success">
                        <Check className="w-3.5 h-3.5" /> Completada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                        <BookOpen className="w-3.5 h-3.5" /> Abierta
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold leading-tight text-[var(--cartilla-title-ink)]">
                    {entry.title}
                  </h2>
                  <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{entry.subtitle}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-foreground/10 bg-background/70 px-2 py-1 text-[11px] font-bold text-foreground/50">
                      Páginas {entry.pages}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-foreground/10 bg-background/70 px-2 py-1 text-[11px] font-bold text-foreground/50">
                      <Image className="h-3 w-3" /> {statusCopy}
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}

function progressStyle(pct: number) {
  return { width: `${pct}%` };
}
