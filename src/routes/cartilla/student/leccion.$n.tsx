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
  useCloudLessonHydration,
} from "@/lib/lesson-progress";
import { recordEvent, useStudentSession } from "@/lib/student-session";
import interactionsData from "@/data/workbook-interactions.json";
import teacherGuideData from "@/data/teacher-guide.json";
import pageInventory from "@/data/page-inventory.json";
import LessonSkeleton from "./_components/LessonSkeleton";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { getBookPageImage } from "@/lib/bookImages";
import { FlipBook } from "@/components/cartilla/FlipBook";
import { StudentExercisePane } from "@/components/cartilla/StudentExercisePane";
import { StudentProgressBar } from "@/components/cartilla/StudentProgressBar";
import { BookArtFigure } from "@/components/cartilla/BookArtFigure";
import { LessonCompleteModal } from "@/components/cartilla/LessonCompleteModal";
import { listMyAssignments } from "@/lib/assignments.functions";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { InstallPrompt } from "@/components/cartilla/InstallPrompt";
import { PageBackground } from "@/components/art/PageBackground";
import { SparkleField } from "@/components/art/SparkleField";
import { GretelGuide } from "@/components/gretel/GretelGuide";
import { gretelEvent } from "@/lib/gretel-bus";
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
  const lessonNumber = n;
  const lessonId = String(n);
  const { isCompleted } = useLessonProgress();
  const session = useStudentSession();
  useCloudLessonHydration(session);
  const entry = useMemo<CatalogEntry | undefined>(() => CATALOG.find((e) => e.n === n), [n]);
  const guideLesson = useMemo(() => teacherGuideData.lessons.find((l) => l.lesson === n), [n]);
  const lessonPages = guideLesson?.pages || [];
  const [showModal, setShowModal] = useState(false);

  const poemInteraction = useMemo(() => {
    return (interactionsData.interactions as any[]).find(
      (item) => (item.lessonNumber === n || item.lessonId === n) && (item.id.includes("poem") || item.id.includes("mini-story"))
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
    gretelEvent("lesson:start");
  }, [n]);

  useEffect(() => {
    startedAt.current = Date.now();
    return () => {
      const secs = Math.round((Date.now() - startedAt.current) / 1000);
      if (secs >= 5) recordEvent({ lessonId, kind: "time", timeSeconds: secs });
    };
  }, [n, lessonId]);

  const lessonInteractions = useMemo(() => {
    return (interactionsData.interactions as any[])
      .filter((i) => i.lessonNumber === n || i.lessonId === n)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [n]);

  useEffect(() => {
    try {
      const key = "gretel-completedLessons";
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr) && !arr.includes(lessonNumber)) {
        arr.push(lessonNumber);
        localStorage.setItem(key, JSON.stringify(arr));
      }
    } catch {
      // ignore silently
    }
  }, [lessonNumber]);

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
      {/* ── Skip Link ── */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white px-4 py-2 rounded-xl shadow-lg border border-stone-200 font-bold text-stone-800">
        Saltar al contenido principal
      </a>
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
              to="/cartilla/recursos/proyectar/$n"
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
      <main id="main-content" className="flex-1 px-4 pt-4 pb-28 max-w-3xl w-full mx-auto space-y-6 relative z-10">
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

        {lessonInteractions.length > 0 && (
          <section className="w-full mt-12 mb-8 mx-auto sm:max-w-[680px]">
            <h2 className="text-3xl font-bold mb-6 text-center" style={activeColorStyle}>Actividades del Libro</h2>
            {lessonInteractions.map((interaction, i) => (
              <InteractionRenderer key={interaction.id || i} interaction={interaction} />
            ))}
          </section>
        )}

        {lessonPages.length > 0 && (
          <section aria-label="Páginas del libro de trabajo" className="w-full mt-12 mb-8 mx-auto sm:max-w-[680px]">
            <h2 className="text-3xl font-bold mb-6 text-center" style={activeColorStyle}>Páginas del libro</h2>
            <div className="flex flex-col gap-8 w-full">
              {lessonPages.map((pageNumber: number) => {
                return (
                  <img
                    key={pageNumber}
                    src={getBookPageImage(pageNumber)}
                    alt={`Página ${pageNumber} - Lección ${n}`}
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
        className="no-print"
        style={{
          position: "sticky",
          bottom: 0,
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          padding: "var(--space-3) var(--space-4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "60px",
          zIndex: 10,
        }}
        aria-label="Navegación entre lecciones"
      >
        <Link
          to="/cartilla/student/leccion/$n"
          params={{ n: String(lessonNumber - 1) }}
          disabled={lessonNumber === 1}
          className="inline-flex items-center justify-center font-bold rounded-xl transition-colors"
          style={{
            minHeight: "44px",
            minWidth: "44px",
            padding: "0 0.75rem",
            fontSize: "var(--text-sm)",
            ...(lessonNumber === 1 ? { opacity: 0.4, pointerEvents: "none" } : {}),
          }}
          aria-label={lessonNumber === 1 ? undefined : `Ir a lección ${lessonNumber - 1}`}
        >
          ← Lección anterior
        </Link>

        <span
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
          }}
        >
          Lección {lessonNumber} de 24
        </span>

        <Link
          to="/cartilla/student/leccion/$n"
          params={{ n: String(lessonNumber + 1) }}
          disabled={lessonNumber >= 24}
          className="inline-flex items-center justify-center font-bold rounded-xl transition-colors"
          style={{
            minHeight: "44px",
            minWidth: "44px",
            padding: "0 0.75rem",
            fontSize: "var(--text-sm)",
            ...(lessonNumber >= 24 ? { opacity: 0.4, pointerEvents: "none" } : {}),
          }}
          aria-label={lessonNumber >= 24 ? undefined : `Ir a lección ${lessonNumber + 1}`}
        >
          Lección siguiente →
        </Link>
      </nav>
      <div className="fixed bottom-24 right-4 z-40">
        <GretelGuide bubblePosition="left" />
      </div>
    </div>
    </>
  );
}

function WordBank({ interaction }: { interaction: any }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const toggle = (i: number) => {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelected(next);
  };
  return (
    <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 shadow-sm my-6">
      <h3 className="text-xl font-bold text-stone-800 mb-4">{interaction.title || "Banco de Palabras"}</h3>
      {interaction.prompt && <p className="text-sm text-stone-500 mb-4">{interaction.prompt}</p>}
      <div className="flex flex-wrap gap-3">
        {interaction.items?.map((item: any, i: number) => {
          const text = typeof item === "string" ? item : item.text || item.label || "";
          const isSelected = selected.has(i);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              aria-pressed={isSelected}
              aria-label={`Palabra: ${text}`}
              style={{
                padding: "var(--space-2) var(--space-4)",
                borderRadius: "var(--radius-full)",
                background: isSelected ? "var(--color-primary)" : "var(--color-surface-2)",
                color: isSelected ? "var(--color-text-inverse)" : "inherit",
                border: isSelected ? "1px solid transparent" : "1px solid var(--color-border)",
                minHeight: "44px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="font-bold text-lg transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-stone-400"
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniStory({ interaction }: { interaction: any }) {
  return (
    <div
      className="border border-stone-200 shadow-sm my-6"
      style={{
        backgroundColor: "var(--color-surface-2)",
        padding: "var(--space-6)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <h3
        className="font-bold text-stone-800 mb-6 text-center"
        style={{ fontSize: "var(--text-lg)" }}
      >
        {interaction.title || "Mini Cuento"}
      </h3>
      {interaction.prompt && <p className="text-sm text-stone-500 mb-4 text-center">{interaction.prompt}</p>}
      <div className="space-y-4 max-w-lg mx-auto">
        {interaction.items?.map((item: any, i: number) => {
          const text = typeof item === "string" ? item : item.text || item.label || "";
          return (
            <p
              key={i}
              className="text-stone-700 leading-relaxed text-center"
              style={{ fontSize: "var(--text-base)" }}
            >
              {text}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function TapObj({ interaction }: { interaction: any }) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const toggle = (i: number) => {
    const next = new Set(tapped);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setTapped(next);
  };
  return (
    <div className="p-6 rounded-3xl bg-sky-50 border border-sky-100 shadow-sm my-6">
      <h3 className="text-xl font-bold text-sky-900 mb-4 text-center">{interaction.title || "Toca el objeto"}</h3>
      {interaction.prompt && <p className="text-sm text-sky-700 mb-6 text-center">{interaction.prompt}</p>}
      <div className="flex flex-wrap justify-center gap-6">
        {interaction.items?.map((item: any, i: number) => {
          const text = typeof item === "string" ? item : item.text || item.label || "";
          const isTapped = tapped.has(i);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              aria-pressed={isTapped}
              aria-label={`Objeto: ${text}`}
              style={{
                minWidth: "80px",
                minHeight: "80px",
                backgroundColor: isTapped ? "var(--color-primary-highlight)" : "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
              className="relative p-4 rounded-2xl shadow-sm flex items-center justify-center overflow-hidden transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-sky-400"
            >
              <span
                className="font-bold text-sky-800 text-center"
                style={{ fontSize: "var(--text-base)" }}
              >
                {text}
              </span>
              {isTapped && (
                <div className="absolute inset-0 bg-sky-500/10 flex items-center justify-center">
                  <Check className="w-10 h-10 text-sky-600 drop-shadow-sm stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LetterTracing({ interaction }: { interaction: any }) {
  const letters = useMemo(() => {
    if (!interaction.items) return "Aa";
    return interaction.items.map((item: any) => typeof item === "string" ? item : item.label || item.text || "").join(" ");
  }, [interaction]);

  return (
    <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-sm my-6 flex flex-col items-center justify-center">
      <h3 className="text-xl font-bold text-stone-800 mb-2">{interaction.title || "Traza la letra"}</h3>
      <div
        className="leading-none font-bold text-stone-800 tracking-widest my-6 text-center select-none focus:outline-none focus:ring-4 focus:ring-stone-400 rounded-lg px-4"
        style={{
          fontSize: "var(--text-hero)",
          fontFamily: "var(--font-display)"
        }}
        tabIndex={0}
        role="img"
        aria-label={`Letras para trazar: ${letters}`}
      >
        {letters}
      </div>
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)"
        }}
        className="font-medium tracking-wide"
      >
        Traza la letra con tu dedo
      </p>
    </div>
  );
}

function FlipPoem({ interaction }: { interaction: any }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 shadow-sm text-center my-6">
      <h3 className="text-xl font-bold text-amber-900 mb-4">{interaction.title || "Poema"}</h3>
      <button
        onClick={() => setFlipped(!flipped)}
        className="px-6 py-12 w-full max-w-sm mx-auto bg-white rounded-2xl shadow border border-amber-100 flex items-center justify-center transition-all cursor-pointer"
      >
        {flipped ? (
          <div className="space-y-2">
            {interaction.items?.map((item: any, i: number) => (
              <p key={i} className="text-amber-950 font-medium">
                {typeof item === "string" ? item : item.text || item.label || ""}
              </p>
            ))}
          </div>
        ) : (
          <span className="text-amber-800 font-bold italic">Toca para leer el poema</span>
        )}
      </button>
    </div>
  );
}

function EvalCloze({ interaction }: { interaction: any }) {
  const words = interaction.wordBank || [];
  const exercises = interaction.exercises || [];

  return (
    <div className="p-6 rounded-3xl bg-blue-50 border border-blue-200 shadow-sm my-6">
      <h3 className="text-xl font-bold text-blue-900 mb-4 text-center">{interaction.title || "Completa la oración"}</h3>
      {interaction.prompt && <p className="text-sm text-blue-700 mb-4 text-center">{interaction.prompt}</p>}
      
      {words.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6 p-4 bg-white/60 rounded-2xl border border-blue-100/50">
          {words.map((word: string, idx: number) => (
            <span key={idx} className="px-3 py-1.5 bg-white border border-blue-200 text-blue-800 rounded-lg text-sm font-semibold animate-fade-in">
              {word}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 max-w-md mx-auto">
        {exercises.map((text: string, i: number) => {
          return (
            <div
              key={i}
              tabIndex={0}
              aria-label={`Oración ${i + 1}: ${text.replace(/_+/g, "espacio en blanco")}`}
              className="p-4 bg-white rounded-xl shadow-sm text-blue-800 font-medium text-left border border-blue-100 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <span className="w-6 h-6 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold" aria-hidden="true">{i + 1}</span>
              <span aria-hidden="true">{text.replace(/_+/g, "_____")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InteractionRenderer({ interaction }: { interaction: any }) {
  switch (interaction.kind) {
    case "letter-tracing":
      return <LetterTracing interaction={interaction} />;
    case "mini-story":
      return <MiniStory interaction={interaction} />;
    case "tap-object":
    case "tap-obj":
      return <TapObj interaction={interaction} />;
    case "read-aloud":
    case "listen-and-tap":
    case "drag-word-to-image":
    case "word-bank":
      return <WordBank interaction={interaction} />;
    case "flip-poem":
      return <FlipPoem interaction={interaction} />;
    case "cloze-sentence":
    case "eval-cloze":
      return <EvalCloze interaction={interaction} />;
    case "drag-syllable-to-slot":
    case "drag-build-word":
      // Ignored here, normally handled by StudentExercisePane if it's the core exercise
      return null;
    default:
      if (!interaction.kind) return null;
      return <div className="p-4 border border-dashed border-stone-300 rounded-xl bg-stone-50 text-stone-500 text-sm my-4 text-center">TODO: {interaction.kind}</div>;
  }
}
