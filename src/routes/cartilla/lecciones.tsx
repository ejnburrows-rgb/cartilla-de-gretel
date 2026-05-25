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
  const sourceAudit = getSourceAudit();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_32rem),linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.42))]">
      <header className="px-4 pt-5 pb-4 max-w-6xl mx-auto">
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
        <section className="relative overflow-hidden rounded-[2rem] border border-amber-950/15 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 p-5 sm:p-7 shadow-[0_28px_70px_rgba(120,53,15,0.18)]">
          <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-b from-amber-900 via-amber-700 to-amber-950" aria-hidden />
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/45 blur-3xl" aria-hidden />
          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center pl-3">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-amber-900/15 bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-amber-900">
                Del libro físico al CRM de aula
              </div>
              <h1 className="text-3xl sm:text-5xl font-black leading-tight text-[var(--cartilla-title-ink)]">
                Las 24 lecciones de <em>La Cartilla de Gretel</em>
              </h1>
              <p className="text-amber-950/75 mt-3 max-w-3xl text-base sm:text-lg leading-relaxed">
                Índice del Cuaderno del estudiante con ruta de lectura por página, escaneos fuente conectados y avance preparado para aula real.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-black uppercase tracking-wide text-amber-950/70">
                <div className="rounded-2xl border border-amber-900/15 bg-white/65 px-3 py-2">Libro real + CRM</div>
                <div className="rounded-2xl border border-amber-900/15 bg-white/65 px-3 py-2">92 páginas fuente</div>
                <div className="rounded-2xl border border-amber-900/15 bg-white/65 px-3 py-2">Presentación proyectable</div>
              </div>
            </div>
            <div className="rounded-[1.7rem] border border-amber-900/15 bg-white/75 p-4 shadow-inner">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-amber-900/70">Mapa fuente</div>
              <div className="mt-2 text-4xl font-black text-amber-950">{sourceAudit.verified}</div>
              <div className="text-sm font-bold text-amber-950/65">páginas con texto verificado de {sourceAudit.total}</div>
              <div className="mt-3 h-3 overflow-hidden rounded-full border border-amber-900/10 bg-amber-100">
                <div className="h-full rounded-full bg-amber-800" style={progressStyle(sourceAudit.percent)} />
              </div>
              <div className="mt-3 text-xs font-bold text-amber-950/60">
                {sourceAudit.partial} páginas ya tienen escaneo conectado para revisión visual.
              </div>
            </div>
          </div>
        </section>
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
        <div className="mt-5 rounded-3xl border border-foreground/10 bg-card/80 p-4 shadow-sm">
          <div className="flex items-baseline justify-between text-sm font-bold">
            <span className="text-foreground/80">
              Progreso del estudiante: {doneCount} / {TOTAL_LESSONS}
            </span>
            <span className="text-foreground/60">{pct}%</span>
          </div>
          <div className="mt-1.5 h-3 bg-secondary rounded-full overflow-hidden border border-foreground/10">
            <div className="h-full bg-primary transition-all" style={progressStyle(pct)} />
          </div>
        </div>
      </header>
      <main className="px-4 pb-24 max-w-6xl mx-auto">
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
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
                  className="group relative block h-full overflow-hidden rounded-[1.65rem] border border-amber-950/10 bg-gradient-to-br from-card via-card to-amber-50/80 p-4 shadow-[0_14px_38px_rgba(120,53,15,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(120,53,15,0.16)]"
                >
                  <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-amber-800 via-orange-500 to-amber-950 opacity-70" aria-hidden />
                  <div className="pl-2">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-black uppercase tracking-wide text-amber-900">
                        Lección {entry.n}
                      </span>
                      {done ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[11px] font-bold text-success">
                          <Check className="w-3.5 h-3.5" /> Completada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary">
                          <BookOpen className="w-3.5 h-3.5" /> Abierta
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-black leading-tight text-[var(--cartilla-title-ink)] group-hover:text-primary">
                      {entry.title}
                    </h2>
                    <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{entry.subtitle}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-foreground/10 bg-background/80 px-2 py-1 text-[11px] font-bold text-foreground/55">
                        Páginas {entry.pages}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-foreground/10 bg-background/80 px-2 py-1 text-[11px] font-bold text-foreground/55">
                        <Image className="h-3 w-3" /> {statusCopy}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-foreground/10 pt-3 text-xs font-black uppercase tracking-wide text-foreground/45">
                      <span>Libro real + interacción</span>
                      <span className="text-primary transition group-hover:translate-x-1">Abrir →</span>
                    </div>
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

function getSourceAudit() {
  const totals = CATALOG.reduce(
    (acc, entry) => {
      const summary = getWorkbookTranscriptionSummary(entry.n);
      return {
        total: acc.total + summary.total,
        verified: acc.verified + summary.verified,
        partial: acc.partial + summary.partial,
      };
    },
    { total: 0, verified: 0, partial: 0 },
  );
  return {
    ...totals,
    percent: totals.total > 0 ? Math.round((totals.verified / totals.total) * 100) : 0,
  };
}
