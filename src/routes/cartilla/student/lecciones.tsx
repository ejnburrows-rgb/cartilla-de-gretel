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

  const [visitedLessons, setVisitedLessons] = useState<number[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("gretel-completedLessons");
      if (raw) setVisitedLessons(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

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
              to="/cartilla/leccion/$n"
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

      {/* ── El Mapa de Aventuras (Gamified Grid) ── */}
      <section className="px-4 pb-20 max-w-5xl mx-auto w-full relative z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-4 border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#fde047] to-[#fef08a] rounded-full blur-3xl opacity-40 -z-10 -translate-y-1/2 translate-x-1/2" />
          
          <h2 className="text-3xl md:text-5xl font-black mb-2 text-[#3b2a12] font-fredoka flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#eab308]" /> El Mapa de Gretel
          </h2>
          <p className="text-[#7a6040] font-bold mb-8 max-w-lg">
            ¡Sigue el camino, completa los retos y gana estrellas doradas!
          </p>

          <ol className="flex flex-wrap justify-center gap-6 md:gap-10">
            {CATALOG.map((entry, i) => {
              const done = isCompleted(entry.n);
              const unlocked = isUnlocked(entry.n);
              const active = entry.n === activeLesson.n;
              
              // Gamification: Randomize 1-3 stars if completed, 0 otherwise for demo
              // Real data could pull from progress events
              const stars = done ? (entry.n % 3) + 1 : 0; 
              
              return (
                <li key={entry.n} className="list-none relative group">
                  {/* Connecting Line (except last) */}
                  {i < CATALOG.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-10 w-10 h-2 border-t-4 border-dashed border-[#e2e8f0] -z-10" />
                  )}

                  <button
                    className={`relative w-28 h-28 md:w-36 md:h-36 rounded-full border-4 transition-all duration-300 flex flex-col items-center justify-center gap-1 shadow-lg ${
                      active
                        ? "scale-110 shadow-2xl z-20 ring-8 ring-white"
                        : unlocked
                          ? "hover:scale-105 hover:-translate-y-2 cursor-pointer bg-white"
                          : "opacity-60 cursor-not-allowed bg-stone-100 grayscale-[0.5]"
                    }`}
                    style={{
                      borderColor: active || unlocked ? entry.color : '#cbd5e1',
                      backgroundColor: active ? `${entry.color}15` : undefined,
                    }}
                    onClick={() => {
                      if (!unlocked) return;
                      const firstP = parseInt(entry.pages.split("-")[0] ?? "1", 10) || 1;
                      setActivePage(firstP);
                      spreadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    disabled={!unlocked}
                    aria-pressed={active}
                    aria-label={`Nivel ${entry.n}: ${entry.title}${done ? " — completado" : !unlocked ? " — bloqueado" : ""}`}
                  >
                    {/* Character/Icon inside the bubble */}
                    <div className="w-12 h-12 md:w-16 md:h-16 relative">
                      <BookArtFigure
                        lesson={entry.n}
                        role="character"
                        className={`w-full h-full object-contain ${!unlocked && "opacity-50"}`}
                      />
                      {!unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-stone-500 bg-white/80 rounded-full p-1 shadow-sm" />
                        </div>
                      )}
                      {done && (
                        <div className="absolute -top-2 -right-2 bg-[#22c55e] text-white rounded-full p-1 shadow-md">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <span 
                      className="text-xs md:text-sm font-black uppercase tracking-widest px-2 text-center truncate w-full"
                      style={{ color: unlocked ? entry.color : '#64748b' }}
                    >
                      Nivel {entry.n}
                    </span>
                    
                    {/* Star Rewards */}
                    {unlocked && (
                      <div className="flex gap-0.5 mt-1 absolute -bottom-3 bg-white px-2 py-1 rounded-full shadow-md border-2 border-stone-100">
                        {[1, 2, 3].map((starIdx) => (
                          <svg 
                            key={starIdx} 
                            className={`w-3 h-3 md:w-4 md:h-4 ${starIdx <= stars ? 'text-[#eab308] fill-[#eab308]' : 'text-stone-200 fill-stone-100'}`} 
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    )}
                  </button>
                  
                  {/* Title Tooltip on Hover */}
                  {unlocked && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
                      {entry.title}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-900 rotate-45" />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>
      <InstallPrompt />
      {/* Corner sticker Gretel removed — full-presence Gretel lives on the lesson page. */}
    </div>
  );
}
