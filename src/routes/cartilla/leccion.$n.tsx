/**
 * leccion.$n.tsx  — Lane A
 *
 * Single-lesson view:
 *   top    → PdfPage (responsive)
 *   below  → StudentExercisePane (BookArtFigure + SyllableTap + WordMatch + DragBuildWord + sticky timer)
 * Bottom fixed nav: ← prev | Mark & next →
 *
 * All exercises get key={lessonId} so state resets on lesson change.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, ArrowRight, Check, ClipboardList, Printer, Tv } from "lucide-react";
import { CATALOG, TOTAL_LESSONS, type CatalogEntry } from "@/lib/lesson-catalog";
import {
  useLessonProgress,
  isLessonUnlocked,
  markLessonCompleted,
} from "@/lib/lesson-progress";
import { recordEvent, useStudentSession } from "@/lib/student-session";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { FlipBook } from "@/components/cartilla/FlipBook";
import { OfflineBadge } from "@/components/cartilla/OfflineBadge";
import { StudentExercisePane } from "@/components/cartilla/StudentExercisePane";
import { StudentProgressBar } from "@/components/cartilla/StudentProgressBar";
import { BookArtFigure } from "@/components/cartilla/BookArtFigure";
import { LessonCompleteModal } from "@/components/cartilla/LessonCompleteModal";
import { listMyAssignments } from "@/lib/assignments.functions";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { InstallPrompt } from "@/components/cartilla/InstallPrompt";
import { PageBackground } from "@/components/art/PageBackground";
import { SparkleField } from "@/components/art/SparkleField";
import "@/styles/cartilla-student.css";

export const Route = createFileRoute("/cartilla/leccion/$n")({
  component: Leccion,
  head: ({ params }) => ({
    meta: [
      {
        title: `Lección ${params.n} — La Cartilla de Gretel`,
      },
    ],
  }),
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
  },
});

function Leccion() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const n = Number(nParam);
  const lessonId = String(n);
  const { isCompleted } = useLessonProgress();
  const session = useStudentSession();
  const entry = useMemo<CatalogEntry | undefined>(() => CATALOG.find((e) => e.n === n), [n]);
  const [showModal, setShowModal] = useState(false);

  const fetchAssignments = useServerFn(listMyAssignments);
  const { data: assignments } = useQuery({
    queryKey: ["my-assignments", session?.classId],
    queryFn: () =>
      session
        ? fetchAssignments({
            data: {
              classId: session.classId,
              studentId: session.studentId,
              studentCode: session.studentCode,
            },
          })
        : Promise.resolve([]),
    enabled: !!session,
  });
  const assignment = useMemo(
    () => (assignments ?? []).find((a: { lesson_id: string }) => a.lesson_id === lessonId),
    [assignments, lessonId],
  );

  const unlocked = typeof window === "undefined" || isLessonUnlocked(n);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (entry && !unlocked) navigate({ to: "/cartilla/lecciones" });
  }, [entry, navigate, unlocked]);

  useEffect(() => {
    startedAt.current = Date.now();
    return () => {
      const secs = Math.round((Date.now() - startedAt.current) / 1000);
      if (secs >= 5) recordEvent({ lessonId, kind: "time", timeSeconds: secs });
    };
  }, [n, lessonId]);

  if (!entry || !unlocked) return null;

  const done = isCompleted(n);
  const isLast = n >= TOTAL_LESSONS;
  const pct = Math.round((n / TOTAL_LESSONS) * 100);

  // PDF page number: use the first page of the lesson's pages range
  const firstPage = parseInt(entry.pages.split("-")[0] ?? "1", 10) || 1;

  const goNext = () => {
    setShowModal(false);
    markLessonCompleted(n);
    recordEvent({ lessonId, kind: "lesson_completed" });
    if (isLast) navigate({ to: "/cartilla/lecciones" });
    else navigate({ to: "/cartilla/leccion/$n", params: { n: String(n + 1) } });
  };

  const activeColorStyle = { color: entry.color };
  const heroBgStyle = { backgroundColor: `${entry.color}15` };

  const activeLetter = entry.kind === "consonant" ? entry.letter : entry.kind === "vowel" ? entry.vowel : "a";

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      <PageBackground letter={activeLetter} className="fixed inset-0 -z-10 w-full h-full opacity-60 mix-blend-multiply transition-opacity duration-1000" />
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <SparkleField animated={true} className="w-full h-full opacity-50" />
      </div>

      <OfflineBadge />
      {/* ── Header ── */}
      <header className="no-print px-4 pt-4 max-w-3xl w-full mx-auto relative z-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link
            to="/cartilla/lecciones"
            className="lesson-focus-ring inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
            aria-label="Volver al índice de lecciones"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden /> Índice
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/cartilla/teacher/proyectar/$n"
              params={{ n: lessonId }}
              className="lesson-focus-ring inline-flex items-center gap-1 text-xs font-bold text-foreground/50 hover:text-foreground"
              aria-label={`Proyectar lección ${n} para la clase`}
            >
              <Tv className="w-3.5 h-3.5" aria-hidden />
              Proyectar
            </Link>
            <Link
              to="/print/$lessonId"
              params={{ lessonId }}
              className="lesson-focus-ring inline-flex items-center gap-1 text-xs font-bold text-foreground/50 hover:text-foreground"
              aria-label={`Imprimir lección ${n}`}
            >
              <Printer className="w-3.5 h-3.5" aria-hidden />
              Imprimir
            </Link>
            {!isOnline && (
              <span className="text-[10px] px-2 py-0.5 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold rounded-full animate-pulse border border-red-200 dark:border-red-900/50">
                Sin conexión
              </span>
            )}
            <span className="text-xs font-bold text-foreground/60">
              L{n}/{TOTAL_LESSONS}
            </span>
          </div>
        </div>

        <StudentProgressBar
          value={pct}
          color={entry.color}
          label={`Progreso general: lección ${n} de ${TOTAL_LESSONS}`}
          className="mb-3"
        />

        {assignment && (
          <div className="mb-3 rounded-xl border-2 border-primary/30 bg-primary/5 px-3 py-2 text-xs font-bold text-primary inline-flex items-start gap-2">
            <ClipboardList className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
            <span>
              Tarea asignada{assignment.title ? `: ${assignment.title}` : ""}.
              {assignment.due_at &&
                ` Entrega: ${new Date(assignment.due_at).toLocaleDateString("es")}.`}
              {assignment.time_limit_seconds &&
                ` Límite ${Math.round(assignment.time_limit_seconds / 60)} min.`}
            </span>
          </div>
        )}
      </header>

      {/* ── Main ── */}
      <main className="flex-1 px-4 pt-4 pb-28 max-w-3xl w-full mx-auto space-y-6 relative z-10">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-foreground/50">
            Lección {n} · páginas {entry.pages}
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold leading-tight mt-1"
            style={activeColorStyle}
          >
            {entry.title}
          </h1>
          {entry.kind !== "intro" && (
            <p className="text-sm text-foreground/65 mt-1">{entry.subtitle}</p>
          )}
        </div>

        {/* Hero Band: Desktop only (hidden sm:flex) */}
        <div className="hidden sm:flex items-center gap-5 p-5 rounded-3xl border border-foreground/10" style={heroBgStyle}>
          <div className="w-20 h-20 shrink-0 flex items-center justify-center rounded-2xl bg-white/40 overflow-hidden">
            <BookArtFigure lesson={n} role="character" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-foreground/50">
              Lección {n}
            </div>
            <h2 className="text-2xl font-bold" style={activeColorStyle}>
              {entry.title}
            </h2>
            {entry.kind !== "intro" && (
              <p className="text-sm text-foreground/75 mt-0.5">{entry.subtitle}</p>
            )}
          </div>
        </div>

        {/* PDF page with page-peel flips */}
        <FlipBook entry={entry} initialPageNumber={firstPage} />

        {/* Student exercise pane — key resets all state on lesson change */}
        <StudentExercisePane
          key={lessonId}
          entry={entry}
          lessonId={lessonId}
          timeLimitSeconds={assignment?.time_limit_seconds ?? null}
          onAllCompleted={() => setShowModal(true)}
        />

        {done && (
          <div className="inline-flex items-center gap-2 text-sm font-bold text-success">
            <Check className="w-4 h-4" aria-hidden /> Ya completaste esta lección
          </div>
        )}
        <InstallPrompt />
        {showModal && <LessonCompleteModal lessonId={lessonId} onNext={goNext} />}
      </main>

      {/* ── Bottom nav ── */}
      <nav
        className="no-print fixed bottom-0 inset-x-0 p-3 bg-background/95 backdrop-blur border-t-2 border-foreground/10"
        aria-label="Navegación entre lecciones"
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() =>
              n > 1
                ? navigate({ to: "/cartilla/leccion/$n", params: { n: String(n - 1) } })
                : navigate({ to: "/cartilla/lecciones" })
            }
            className="lesson-focus-ring px-5 py-3 rounded-2xl border-2 border-foreground/15 font-bold hover:bg-secondary"
            aria-label={n > 1 ? `Ir a lección ${n - 1}` : "Volver al índice"}
          >
            <ArrowLeft className="w-5 h-5 inline mr-1" aria-hidden />
            {n > 1 ? "Anterior" : "Índice"}
          </button>
          <button
            onClick={goNext}
            disabled={isLast && done}
            className="lesson-focus-ring px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 hover:translate-y-px"
            aria-label={isLast ? "Marcar lección como terminada" : `Marcar lección ${n} y avanzar a la ${n + 1}`}
          >
            {isLast
              ? done
                ? "Terminado"
                : "Marcar y terminar"
              : done
                ? "Siguiente"
                : "Marcar y siguiente"}{" "}
            <ArrowRight className="w-5 h-5 inline ml-1" aria-hidden />
          </button>
        </div>
      </nav>
    </div>
  );
}
