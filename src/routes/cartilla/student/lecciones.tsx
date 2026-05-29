/**
 * lecciones.tsx  — Lane A
 *
 * Horizontal swipeable PDF spread of all 92 pages.
 * Practica pane below syncs to the active lesson.
 * State resets per lesson via key={lesson.n}.
 * Deep-link: ?p=23 → scrolls to page 23 on mount.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Check, Lock, RotateCcw, Sparkles, Zap } from "lucide-react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { hydrateLessonProgress, useLessonProgress } from "@/lib/lesson-progress";
import { getMyProgress } from "@/lib/student.functions";
import { useStudentSession } from "@/lib/student-session";
import { useServerFn } from "@/lib/useServerFn";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { StudentExercisePane } from "@/components/cartilla/StudentExercisePane";
import { BookArtFigure } from "@/components/cartilla/BookArtFigure";
import { InstallPrompt } from "@/components/cartilla/InstallPrompt";
import { PageBackground } from "@/components/art/PageBackground";
import { SparkleField } from "@/components/art/SparkleField";
import { GretelMascot } from "@/components/gretel/GretelMascot";
import "@/styles/cartilla-student.css";

// Search param validation without zod
type LeccionesSearch = { p?: number };

export const Route = createFileRoute("/cartilla/student/lecciones")({
  component: Lecciones,
  validateSearch: (search: Record<string, unknown>): LeccionesSearch => {
    const p = Number(search.p);
    return { p: Number.isFinite(p) && p >= 1 ? Math.floor(p) : undefined };
  },
  head: () => ({ meta: [{ title: "24 Lecciones — La Cartilla de Gretel" }] }),
});

const TOTAL_PDF_PAGES = 92;

/** Map page number → lesson entry (first lesson whose page range contains that page) */
function pageToLesson(page: number) {
  for (const entry of CATALOG) {
    const parts = entry.pages.split("-").map(Number);
    const from = parts[0] ?? page;
    const to = parts[1] ?? from;
    if (page >= from && page <= to) return entry;
  }
  return CATALOG[0]!;
}

function Lecciones() {
  const { p: deepPage } = Route.useSearch();
  const navigate = useNavigate({ from: "/cartilla/lecciones" });
  const session = useStudentSession();
  const fetchMyProgress = useServerFn(getMyProgress);
  const { isCompleted, isUnlocked, completed, reset } = useLessonProgress();

  // Sync cloud progress
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

  // Active page / lesson state
  const [activePage, setActivePage] = useState<number>(deepPage ?? 1);
  const activeLesson = useMemo(() => pageToLesson(activePage), [activePage]);
  const spreadRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setActivePage((p) => Math.min(TOTAL_PDF_PAGES, p + 1));
      if (e.key === "ArrowLeft") setActivePage((p) => Math.max(1, p - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Scroll active page into view when activePage changes
  const scrollToPage = useCallback((page: number) => {
    const el = spreadRef.current?.querySelector<HTMLElement>(`[data-page="${page}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, []);

  useEffect(() => {
    scrollToPage(activePage);
  }, [activePage, scrollToPage]);

  // Update URL search param
  useEffect(() => {
    navigate({ search: { p: activePage }, replace: true }).catch(() => undefined);
  }, [activePage, navigate]);

  const progressStyle = { width: `${pct}%` };
  const activeLessonColorStyle = { color: activeLesson.color };
  const activeLessonBgStyle = { backgroundColor: activeLesson.color };

  const activeLetter =
    activeLesson.kind === "consonant"
      ? activeLesson.letter
      : activeLesson.kind === "vowel"
        ? activeLesson.vowel
        : "a";

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      <PageBackground
        letter={activeLetter}
        className="fixed inset-0 -z-10 w-full h-full opacity-60 mix-blend-multiply transition-opacity duration-1000"
      />
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <SparkleField animated={true} className="w-full h-full opacity-50" />
      </div>

      {/* ── Header ── */}
      <header className="px-4 pt-5 pb-3 max-w-5xl mx-auto w-full relative z-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link
            to="/cartilla"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
            aria-label="Volver a la página principal de la Cartilla"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden /> Cartilla
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/cartilla/student/practica"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-vowel-o hover:underline"
              aria-label="Ir a práctica rápida"
            >
              <Zap className="w-3.5 h-3.5" aria-hidden /> Práctica rápida
            </Link>
            <Link
              to="/cartilla/student/repaso"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              aria-label="Ir a modo repaso"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden /> Modo repaso
            </Link>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Reiniciar tu progreso de las 24 lecciones?")) reset();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/60 hover:text-destructive"
              aria-label="Reiniciar progreso de lecciones"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden /> Reiniciar
            </button>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          Las 24 lecciones de <em>La Cartilla de Gretel</em>
        </h1>
        <p className="text-foreground/70 mt-1 text-sm">
          Desliza para explorar las {TOTAL_PDF_PAGES} páginas · página activa{" "}
          <strong>{activePage}</strong> · lección <strong>{activeLesson.n}</strong>
        </p>
        {/* Overall progress */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between text-sm font-bold mb-1.5">
            <span className="text-foreground/80">
              Progreso: {doneCount} / {TOTAL_LESSONS}
            </span>
            <span className="text-foreground/60">{pct}%</span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden border border-foreground/10">
            <div className="h-full bg-primary transition-all" style={progressStyle} />
          </div>
        </div>
      </header>

      {/* ── Horizontal PDF spread ── */}
      <section
        ref={spreadRef}
        className="lecciones-spread"
        aria-label="Páginas del libro"
        role="region"
      >
        {Array.from({ length: TOTAL_PDF_PAGES }, (_, i) => i + 1).map((page) => {
          const lesson = pageToLesson(page);
          const isActive = page === activePage;
          const pageStyle = isActive ? { borderColor: activeLesson.color } : undefined;
          const labelStyle = { color: lesson.color };
          return (
            <button
              key={page}
              data-page={page}
              className="lecciones-spread__page"
              data-active={isActive ? "true" : "false"}
              onClick={() => setActivePage(page)}
              aria-label={`Página ${page}, lección ${lesson.n}: ${lesson.title}`}
              aria-pressed={isActive}
              style={pageStyle}
            >
              <PdfPage pageNumber={page} />
              <div className="px-2 py-1 text-[11px] font-bold truncate" style={labelStyle}>
                L{lesson.n} · pág. {page}
              </div>
            </button>
          );
        })}
      </section>

      {/* ── Per-lesson exercise pane, key resets on lesson change ── */}
      <section className="px-4 pt-4 pb-28 max-w-3xl w-full mx-auto relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-foreground/50">
              Lección {activeLesson.n} · páginas {activeLesson.pages}
            </div>
            <h2 className="text-2xl font-bold" style={activeLessonColorStyle}>
              {activeLesson.title}
            </h2>
          </div>
          {isUnlocked(activeLesson.n) && (
            <Link
              to="/cartilla/student/leccion/$n"
              params={{ n: String(activeLesson.n) }}
              className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl text-white"
              style={activeLessonBgStyle}
              aria-label={`Abrir lección ${activeLesson.n} completa`}
            >
              <BookOpen className="w-4 h-4" aria-hidden /> Abrir lección
            </Link>
          )}
        </div>

        {isUnlocked(activeLesson.n) ? (
          <StudentExercisePane
            key={activeLesson.n}
            entry={activeLesson}
            lessonId={String(activeLesson.n)}
          />
        ) : (
          <div className="kid-card p-6 text-center">
            <Lock className="w-10 h-10 mx-auto text-foreground/30 mb-3" aria-hidden />
            <p className="text-foreground/60 font-bold">
              Completa la lección anterior para desbloquear esta.
            </p>
          </div>
        )}
      </section>

      {/* ── Lesson grid ── */}
      <section className="px-4 pb-10 max-w-5xl mx-auto w-full relative z-10">
        <h2 className="text-lg font-bold mb-3">Todas las lecciones</h2>
        <ol className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATALOG.map((entry) => {
            const done = isCompleted(entry.n);
            const unlocked = isUnlocked(entry.n);
            const active = entry.n === activeLesson.n;
            const itemStyle = {
              borderLeftWidth: 5,
              borderLeftColor: entry.color,
              borderColor: active ? entry.color : undefined,
            };
            const entryBgStyle = { backgroundColor: `${entry.color}18` };
            const entryColorStyle = { color: unlocked ? entry.color : undefined };
            return (
              <li key={entry.n} className="list-none">
                <button
                  className={`w-full text-left rounded-2xl border-2 p-3 transition ${
                    active
                      ? "shadow-md"
                      : unlocked
                        ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                  }`}
                  style={itemStyle}
                  onClick={() => {
                    const firstP = parseInt(entry.pages.split("-")[0] ?? "1", 10) || 1;
                    setActivePage(firstP);
                    spreadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  disabled={!unlocked}
                  aria-pressed={active}
                  aria-label={`Lección ${entry.n}: ${entry.title}${done ? " — completada" : !unlocked ? " — bloqueada" : ""}`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-foreground/50">
                      L{entry.n}
                    </span>
                    {done ? (
                      <Check className="w-3.5 h-3.5 text-success" aria-hidden />
                    ) : !unlocked ? (
                      <Lock className="w-3.5 h-3.5 text-foreground/30" aria-hidden />
                    ) : null}
                  </div>
                  {/* Aspect-ratio preserving container with rounded corners */}
                  <div
                    className="aspect-[8.5/11] w-full rounded-xl overflow-hidden mb-2 relative flex items-center justify-center"
                    style={entryBgStyle}
                  >
                    <BookArtFigure
                      lesson={entry.n}
                      role="character"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div
                    className="text-sm font-bold leading-tight line-clamp-2"
                    style={entryColorStyle}
                  >
                    {entry.title}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
      <InstallPrompt />
      <div className="fixed bottom-4 right-4 z-40">
        <GretelMascot
          pose="welcome"
          text="¡Start here!\nAbre tu libro o continúa con la siguiente lección."
          bubblePosition="left"
          showCloseButton={true}
        />
      </div>
    </div>
  );
}
