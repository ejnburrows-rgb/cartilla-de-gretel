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
import { useLessonProgress, isLessonUnlocked, markLessonCompleted } from "@/lib/lesson-progress";
import { recordEvent, useStudentSession } from "@/lib/student-session";
import interactionsData from "@/data/workbook-interactions.json";
import teacherGuideData from "@/data/teacher-guide.json";
import pageInventory from "@/data/page-inventory.json";
import LessonSkeleton from "./_components/LessonSkeleton";
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
import { GretelMascot } from "@/components/gretel/GretelMascot";
import "@/styles/cartilla-student.css";

export const Route = createFileRoute("/cartilla/student/leccion/$n")({
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
  const guideLesson = useMemo(() => teacherGuideData.lessons.find((l) => l.lesson === n), [n]);
  const lessonPages = guideLesson?.pages || [];
  const [showModal, setShowModal] = useState(false);

  const poemInteraction = useMemo(() => {
    return (interactionsData as any[]).find(
      (item) => item.lessonNumber === n && (item.id.includes("poem") || item.id.includes("mini-story"))
    );
  }, [n]);

  const poemLines = useMemo(() => {
    if (!poemInteraction || !poemInteraction.items) return [];
    return poemInteraction.items.map((line: any) => {
      if (typeof line === "string") return line;
      if (line && typeof line === "object" && typeof line.label === "string") return line.label;
      if (line && typeof line === "object" && typeof line.text === "string") return line.text;
      return "";
    });
  }, [poemInteraction]);

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

  if (!unlocked) return null;
  if (!entry || !guideLesson) return <LessonSkeleton />;

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

  const activeLetter =
    entry.kind === "consonant" ? entry.letter : entry.kind === "vowel" ? entry.vowel : "a";
  const letterLower = activeLetter.toLowerCase();
  const letterFolder = letterLower === "s" ? "ss" : letterLower === "r inicial" || letterLower === "rima" ? "rima" : letterLower;
  const pages = pageInventory.workbook.lessons.find((l) => l.lessonId === n)?.pages || [];

  return (
    <>
      <style>{`
        @media print {
          @page { size: letter; margin: 1in; }
          body, html, #root { background: white !important; color: black !important; font-size: 12pt; }
          h1, h2, h3 { font-size: 18pt !important; margin-bottom: 0.5em; color: black !important; }
          nav, header:not(.print-header), footer, button, .interactive-controls, .no-print, .student-exercise-pane, .print-btn-container { display: none !important; }
          .print-only { display: block; }
          .print-vocab-list, .print-sentences-list { padding-left: 1.5em; list-style-type: disc; margin-bottom: 1em; }
          .print-poem-line { margin: 0.2em 0; }
          .print-section { margin-bottom: 2em; }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>
      {/* ── Print-only printable view ── */}
      <div className="print-only">
        <div className="print-content">
          <header className="print-header">
            <p className="print-lesson-num">Lección {n}</p>
            <h1 className="print-letters">
              {entry.kind === "vowel" ? `${entry.vowel.toUpperCase()} ${entry.vowel}` : entry.kind === "consonant" ? `${entry.letter.toUpperCase()} ${entry.letter}` : entry.title}
            </h1>
            {entry.kind === "consonant" && (
              <p className="print-syllables">Sílabas: {entry.data.syllables.join(" - ")}</p>
            )}
          </header>

          <main className="print-body">
            {/* Vocabulary */}
            {entry.kind === "vowel" && entry.lesson.vocab && (
              <section className="print-section">
                <h2>Vocabulario</h2>
                <ul className="print-vocab-list">
                  {entry.lesson.vocab.map((v, i) => (
                    <li key={i} className="print-vocab-item">{v.word}</li>
                  ))}
                </ul>
              </section>
            )}

            {entry.kind === "consonant" && entry.data.examples && (
              <section className="print-section">
                <h2>Vocabulario</h2>
                <ul className="print-vocab-list">
                  {Object.values(entry.data.examples).flat().map((word, i) => (
                    <li key={i} className="print-vocab-item">{word}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Poem */}
            {entry.kind === "vowel" && entry.lesson.characterDesc && (
              <section className="print-section">
                <h2>Poema: {entry.lesson.characterName}</h2>
                <div className="print-poem">
                  {entry.lesson.characterDesc.split(/[–\.\r\n]+/).map((line, i) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;
                    return <p key={i} className="print-poem-line">{trimmed}</p>;
                  })}
                </div>
              </section>
            )}

            {entry.kind === "consonant" && poemLines.length > 0 && (
              <section className="print-section">
                <h2>{poemInteraction?.title || "Poema"}</h2>
                <div className="print-poem">
                  {poemLines.map((line: string, i: number) => (
                    <p key={i} className="print-poem-line">{line}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Sentences */}
            {entry.kind === "consonant" && entry.data.sentences && (
              <section className="print-section">
                <h2>Oraciones</h2>
                <ul className="print-sentences-list">
                  {entry.data.sentences.map((sent, i) => (
                    <li key={i} className="print-sentence-item">{sent}</li>
                  ))}
                </ul>
              </section>
            )}
          </main>
        </div>
      </div>

      <div className="min-h-screen relative flex flex-col overflow-hidden">
      <PageBackground
        letter={activeLetter}
        className="fixed inset-0 -z-10 w-full h-full opacity-60 mix-blend-multiply transition-opacity duration-1000"
      />
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <SparkleField animated={true} className="w-full h-full opacity-50" />
      </div>

      <OfflineBadge />
      {/* ── Header ── */}
      <header className="no-print px-4 pt-4 max-w-3xl w-full mx-auto relative z-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link
            to="/cartilla/student/lecciones"
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
        <div className="text-center mb-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-3">
            Lección {n}
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold leading-tight"
            style={activeColorStyle}
          >
            {entry.title}
          </h1>
          {entry.kind !== "intro" && (
            <p className="text-sm text-foreground/60 mt-3 font-medium italic tracking-wide">{entry.subtitle}</p>
          )}
          <div className="mt-6">
            <button
              onClick={() => typeof window !== "undefined" && window.print()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-stone-50 text-stone-700 font-bold text-sm rounded-full border border-stone-200 shadow-sm hover:shadow transition-all no-print"
              style={{ minHeight: "44px" }}
              type="button"
            >
              🖨 Imprimir esta lección
            </button>
          </div>
        </div>

        {/* PDF page with realistic page-peel flips */}
        <FlipBook entry={entry} initialPageNumber={firstPage} />

        {/* Student exercise pane — key resets all state on lesson change */}
        <StudentExercisePane
          key={lessonId}
          entry={entry}
          lessonId={lessonId}
          timeLimitSeconds={assignment?.time_limit_seconds ?? null}
          onAllCompleted={() => setShowModal(true)}
        />

        {lessonPages.length > 0 && (
          <section aria-label="Páginas del libro de trabajo" className="w-full mt-12 mb-8 mx-auto sm:max-w-[680px]">
            <h2 className="text-3xl font-bold mb-6 text-center" style={activeColorStyle}>Páginas del libro</h2>
            <div className="flex flex-col gap-8 w-full">
              {lessonPages.map((pageNumber: number) => {
                const pad = String(pageNumber).padStart(3, "0");
                return (
                  <img
                    key={pageNumber}
                    src={`/cartilla/art/hd/workbook/page-${pad}.jpg`}
                    alt={`Página ${pageNumber} — Lección ${n}`}
                    loading="lazy"
                    width={2550}
                    height={3301}
                    className="w-full h-auto rounded-xl shadow-lg border border-black/10"
                  />
                );
              })}
            </div>
          </section>
        )}

        {n >= 21 && n <= 24 ? (
          <section aria-label="Páginas del libro de trabajo" className="w-full mt-12 mb-8 mx-auto sm:max-w-[680px] text-center">
            <h2 className="text-3xl font-bold mb-4" style={activeColorStyle}>Páginas del libro</h2>
            <p className="text-foreground/70 font-bold">Tu maestra te dará estas páginas en clase.</p>
          </section>
        ) : pages.length > 0 ? (
          <section aria-label="Páginas del libro de trabajo" className="w-full mt-12 mb-8 mx-auto sm:max-w-[680px]">
            <h2 className="text-3xl font-bold mb-6 text-center px-4" style={activeColorStyle}>Páginas del libro</h2>
            <div className="flex flex-col gap-6 w-full sm:px-4">
              {pages.map((filename: string, index: number) => (
                <picture key={filename} className="w-full block -mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full">
                  <source
                    srcSet={`/cartilla/images/source/${letterFolder}/${filename}.avif`}
                    type="image/avif"
                  />
                  <source
                    srcSet={`/cartilla/images/source/${letterFolder}/${filename}.webp`}
                    type="image/webp"
                  />
                  <img
                    src={`/cartilla/images/source/${letterFolder}/${filename}`}
                    alt={`Página ${index + 1} — Lección ${n}`}
                    width={1240}
                    height={1754}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto sm:rounded-xl sm:shadow-lg sm:border sm:border-black/10 block"
                  />
                </picture>
              ))}
            </div>
          </section>
        ) : null}

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
        className="no-print fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-background/95 via-background/90 to-transparent backdrop-blur-sm pointer-events-none"
        aria-label="Navegación entre lecciones"
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 pointer-events-auto">
          <button
            onClick={() =>
              n > 1
                ? navigate({ to: "/cartilla/leccion/$n", params: { n: String(n - 1) } })
                : navigate({ to: "/cartilla/lecciones" })
            }
            className="lesson-focus-ring px-5 py-2.5 rounded-full bg-white text-stone-600 font-bold text-sm shadow-sm border border-stone-200 hover:bg-stone-50 transition-all flex items-center gap-2"
            aria-label={n > 1 ? `Ir a lección ${n - 1}` : "Volver al índice"}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            {n > 1 ? "Anterior" : "Índice"}
          </button>
          <button
            onClick={goNext}
            disabled={isLast && done}
            className="lesson-focus-ring px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-md disabled:opacity-50 hover:shadow-lg transition-all flex items-center gap-2"
            aria-label={
              isLast
                ? "Marcar lección como terminada"
                : `Marcar lección ${n} y avanzar a la ${n + 1}`
            }
          >
            {isLast
              ? done
                ? "Terminado"
                : "Marcar y terminar"
              : done
                ? "Siguiente Lección"
                : "Marcar y Siguiente"}{" "}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </nav>
      <div className="fixed bottom-24 right-4 z-40">
        <GretelMascot
          pose="point"
          text="¡Excelente! Resolvamos estos divertidos ejercicios juntos. ¡Tú puedes!"
          bubblePosition="left"
          showCloseButton={true}
        />
      </div>
    </div>
    </>
  );
}
