import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, BookOpen, Check, Lock, RotateCcw, Sparkles, Zap } from "lucide-react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { hydrateLessonProgress, useLessonProgress } from "@/lib/lesson-progress";
import { getMyProgress } from "@/lib/student.functions";
import { useStudentSession } from "@/lib/student-session";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { sCopy } from "@/content/student-copy";

export const Route = createFileRoute("/cartilla/lecciones")({
  component: Lecciones,
  head: () => ({ meta: [{ title: "24 Lecciones — La Cartilla de Gretel" }] }),
});

function Lecciones() {
  const { lang } = useLanguage();
  const t = sCopy;
  const session = useStudentSession();
  const fetchMyProgress = useServerFn(getMyProgress);
  const { isCompleted, isUnlocked, completed, reset } = useLessonProgress();

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
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <Link
            to="/cartilla"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> {t.cartilla[lang]}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <div className="flex items-center gap-2">
              <Link
                to="/cartilla/practica"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-vowel-o hover:underline"
              >
                <Zap className="w-3.5 h-3.5" /> {t.practicaRapida[lang]}
              </Link>
              <Link
                to="/cartilla/repaso"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" /> {t.modoRepaso[lang]}
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t.reiniciarPregunta[lang])) reset();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/60 hover:text-destructive"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {t.reiniciarProgreso[lang]}
              </button>
            </div>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          {t.las24LeccionesDe[lang]} <em>La Cartilla de Gretel</em>
        </h1>
        <p className="text-foreground/70 mt-1">
          {t.aprendePaso[lang]}
        </p>
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-sm font-bold">
            <span className="text-foreground/80">
              {t.progreso[lang]} {doneCount} / {TOTAL_LESSONS}
            </span>
            <span className="text-foreground/60">{pct}%</span>
          </div>
          <div className="mt-1.5 h-3 bg-secondary rounded-full overflow-hidden border border-foreground/10">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </header>
      <main className="px-4 pb-24 max-w-5xl mx-auto">
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {CATALOG.map((entry) => {
            const done = isCompleted(entry.n);
            const unlocked = isUnlocked(entry.n);
            const cls = `block rounded-2xl border-2 p-4 h-full transition shadow-sm ${unlocked ? "bg-card border-foreground/10 hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : "bg-muted/40 border-foreground/5 cursor-not-allowed opacity-60"}`;
            const inner = (
              <>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-foreground/50">
                    {t.leccion[lang]} {entry.n}
                  </span>
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success">
                      <Check className="w-3.5 h-3.5" /> {t.completada[lang]}
                    </span>
                  ) : !unlocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground/40">
                      <Lock className="w-3.5 h-3.5" /> {t.bloqueada[lang]}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                      <BookOpen className="w-3.5 h-3.5" /> {t.disponible[lang]}
                    </span>
                  )}
                </div>
                <h2
                  className="text-lg font-bold leading-tight"
                  style={{ color: unlocked ? entry.color : undefined }}
                >
                  {entry.title}
                </h2>
                <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{entry.subtitle}</p>
                <div className="text-[11px] text-foreground/50 mt-2">{t.paginas[lang]} {entry.pages}</div>
              </>
            );
            return (
              <li key={entry.n} className="list-none">
                {unlocked ? (
                  <Link
                    to="/cartilla/leccion/$n"
                    params={{ n: String(entry.n) }}
                    className={cls}
                    style={{ borderLeftColor: entry.color, borderLeftWidth: 6 }}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div aria-disabled className={cls}>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}
