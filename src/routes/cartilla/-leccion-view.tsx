import { DemoStudentBanner } from "@/components/cartilla/DemoStudentBanner";
import { getDemoStudentSession } from "@/lib/demo-student-session";
import { listSeedStudentAssignments } from "@/lib/seed-data";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft } from "lucide-react";
import { CATALOG, TOTAL_LESSONS, type CatalogEntry } from "@/lib/lesson-catalog";
import { useLessonProgress, isLessonUnlocked, markLessonCompleted } from "@/lib/lesson-progress";
import { recordEvent, useStudentSession } from "@/lib/student-session";
import { listMyAssignments } from "@/lib/assignments.functions";
import { getMyProgress, saveLastPage } from "@/lib/student.functions";
import { useLanguage } from "@/context/LanguageContext";
import { sCopy } from "@/content/student-copy";
import { useLearnerScope } from "@/lib/learner-storage";
import { readLearnerResume, saveLearnerResume } from "@/lib/learner-resume";
import { gretelEvent } from "@/lib/gretel-bus";

import { NativeLessonViewer } from "@/components/StudentBook/NativeLessonViewer";
import "@/styles/lesson-fit.css";
// Wave 1 (2026-10-19): page-scoped cutoff fixes for L11/L12/L16 only.
import "@/styles/lesson-cutoff-fixes.css";
import { exitLessonFullscreen, requestLessonFullscreen } from "@/lib/lesson-fullscreen";
import { buildPageArray } from "@/utils/buildPageArray";
import { PIANO_LESSONS, PianoLessonSection } from "@/components/cartilla/PianoLessonSection";
import { ActivityCarousel } from "@/components/cartilla/ActivityCarousel";
import { getPracticePictureWords } from "@/lib/vocabulary-sources";
import { GretelCinematic } from "@/components/gretel/GretelCinematic";
import { getCompletionCinematic, getLessonCinematic, type GretelCinematic as GretelCinematicSpec } from "@/content/gretel-cinematics";
import { GardenScene } from "@/components/cartilla/GardenScene";
import "@/styles/interactive-exercises.css";
import "@/styles/gretel.css";

export function Leccion() {
  const { lang } = useLanguage();
  const t = sCopy;
  const { n: nParam } = useParams({ from: "/cartilla/leccion/$n" });
  const navigate = useNavigate();
  const n = Number(nParam);
  const [showIntro, setShowIntro] = useState(false);
  const [lessonTab, setLessonTab] = useState<"book" | "piano" | "review">("book");
  const [reviewStarted, setReviewStarted] = useState(false);
  const [completionCinematic, setCompletionCinematic] = useState<GretelCinematicSpec | null>(null);
  useLessonProgress();
  const session = useStudentSession();
  const demo = getDemoStudentSession();
  const scope = useLearnerScope();
  const entry = useMemo<CatalogEntry | undefined>(() => CATALOG.find((e) => e.n === n), [n]);

  // Build this lesson from the canonical structured workbook page data.
  // All instructional pages render through the native learning surface.
  const pages = useMemo(() => buildPageArray(n), [n]);

  const fetchAssignments = useServerFn(listMyAssignments);
  const { data: assignments } = useQuery({
    queryKey: ["my-assignments", demo?.classId ?? session?.classId, demo?.studentId ?? session?.studentId],
    queryFn: () =>
      demo ? Promise.resolve(listSeedStudentAssignments(demo)) : session
        ? fetchAssignments({
            data: {
              classId: session.classId,
              studentId: session.studentId,
              studentCode: session.studentCode,
            },
          })
        : Promise.resolve([]),
    enabled: !!session || !!demo,
  });
  const assignment = useMemo(
    () => (assignments ?? []).find((a: { lesson_id: string }) => a.lesson_id === String(n)),
    [assignments, n],
  );

  const fetchProgress = useServerFn(getMyProgress);
  const {
    data: progressData,
    isFetched,
    isError,
  } = useQuery({
    queryKey: ["my-progress", session?.studentId],
    queryFn: () =>
      session
        ? fetchProgress({
            data: { studentId: session.studentId, studentCode: session.studentCode },
          })
        : Promise.resolve(null),
    enabled: !!session,
    // Never block the workbook forever when Supabase is down / session is stale.
    retry: 1,
  });
  // Without a session, render immediately. With a session, wait until the
  // query settles (success OR error) so a dead backend can't blank the page.
  const progressReady = !session || isFetched || isError;
  const initialPage = useMemo(() => {
    // Old lesson-24 bookmarks numbered the missing page 87 at index 0. New
    // bookmarks carry the printed page, so this fallback migration runs once.
    const resolveSavedIndex = (savedIndex: number, printedPage?: number) => {
      if (typeof printedPage === "number" && Number.isInteger(printedPage)) {
        const matching = pages.findIndex((page) => page.pageNumber === printedPage);
        if (matching >= 0) return matching;
      }
      const migrated = n === 24 ? Math.max(0, savedIndex - 1) : savedIndex;
      return Math.min(Math.max(0, migrated), Math.max(0, pages.length - 1));
    };
    const local = readLearnerResume(n);
    if (local) return resolveSavedIndex(local.page, local.printedPage);
    if (!session) return 0;
    const lessonProgress =
      (
        progressData as {
          lessonProgress?: Array<{ lesson_id: string; last_page?: number | null }>;
        } | null
      )?.lessonProgress ?? [];
    const row = lessonProgress.find((p) => p.lesson_id === String(n));
    return resolveSavedIndex(row?.last_page ?? 0);
  // The local bookmark depends on learner scope, not just backend session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, session, progressData, n, pages.length]);

  useEffect(() => { if (progressReady) saveLearnerResume(n, initialPage, pages[initialPage]?.pageNumber); }, [scope, n, progressReady, initialPage, pages]);
  useEffect(() => {
    setLessonTab("book");
    setReviewStarted(false);
  }, [n]);
  // Laptop full screen (owner decision 2026-10-12). Opening a lesson from the
  // lesson list already asks for it; if the lesson was opened another way,
  // the first tap on the page paper (not on an activity) asks once. Leaving
  // the lesson returns the browser to normal.
  useEffect(() => {
    const onFirstPaperTap = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest?.("button, a, input, textarea, select, canvas, svg, [role='button']")) return;
      document.removeEventListener("pointerdown", onFirstPaperTap);
      requestLessonFullscreen();
    };
    document.addEventListener("pointerdown", onFirstPaperTap);
    return () => {
      document.removeEventListener("pointerdown", onFirstPaperTap);
      // Leave full screen only when the child really leaves the lessons (not
      // when React re-mounts this view or opens the next lesson).
      window.setTimeout(() => {
        if (!window.location.pathname.startsWith("/cartilla/leccion/")) exitLessonFullscreen();
      }, 0);
    };
  }, []);
  const [saveFailed, setSaveFailed] = useState(false);
  useEffect(() => {
    const fail = () => setSaveFailed(true);
    window.addEventListener("cartilla:work-save-failed", fail);
    return () => window.removeEventListener("cartilla:work-save-failed", fail);
  }, []);

  const gardenRef = useRef<HTMLDivElement>(null);
  const saveLastPageFn = useServerFn(saveLastPage);
  const handlePageChange = (index: number) => {
    // Slight page-movement parallax on the garden scene — set imperatively so
    // the workbook and its interactive flip never re-render. CSS caps + eases
    // it and disables it under prefers-reduced-motion (garden-scene.css).
    gardenRef.current?.style.setProperty("--garden-parallax", String(index));
    saveLearnerResume(n, index, pages[index]?.pageNumber);
    if (!session) return;
    void saveLastPageFn({
      data: {
        studentId: session.studentId,
        studentCode: session.studentCode,
        lessonId: String(n),
        page: n === 24 ? index + 1 : index,
      },
    }).catch(() => {
      // Best-effort: last-page persistence is a resume convenience, never
      // blocks reading. getMyProgress remains the source of truth next load.
    });
  };

  const unlocked = typeof window === "undefined" || isLessonUnlocked(n);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (entry && !unlocked) navigate({ to: "/cartilla/lecciones" });
  }, [entry, navigate, unlocked]);


  useEffect(() => {
    startedAt.current = Date.now();
    return () => {
      const secs = Math.round((Date.now() - startedAt.current) / 1000);
      if (secs >= 5) recordEvent({ lessonId: String(n), kind: "time", timeSeconds: secs });
    };
  }, [n]);

  if (!entry || !unlocked) return null;

  const isLast = n >= TOTAL_LESSONS;
  const pct = Math.round((n / TOTAL_LESSONS) * 100);
  const reviewWords = getPracticePictureWords(n);
  const reviewSyllables = entry.kind === "intro"
    ? ["a", "e", "i", "o", "u"]
    : entry.kind === "vowel"
      ? [entry.vowel]
      : entry.data.syllables;
  const reviewLetter = entry.kind === "consonant" ? entry.letter : entry.kind === "vowel" ? entry.vowel : "";

  const advanceAfterCompletion = () => {
    setCompletionCinematic(null);
    if (isLast) navigate({ to: "/cartilla/lecciones" });
    else navigate({ to: "/cartilla/leccion/$n", params: { n: String(n + 1) } });
  };

  const goNext = () => {
    if (!reviewStarted) {
      setReviewStarted(true);
      setLessonTab("review");
      return;
    }
    markLessonCompleted(n);
    recordEvent({ lessonId: String(n), kind: "lesson_completed" });
    gretelEvent("lesson:complete");
    const cinematic = getCompletionCinematic(n);
    if (cinematic) {
      setCompletionCinematic(cinematic);
      return;
    }
    advanceAfterCompletion();
  };

  return (
    <div className={`lc-lesson-shell lc-lesson-shell--fit ${n === 16 ? "lc-lesson-16" : ""} min-h-screen flex flex-col`}>
      <DemoStudentBanner />
      <header className="lc-lesson-header">
        <Link
          to="/cartilla/lecciones"
          className="lc-lesson-header__back"
        >
          <ArrowLeft className="w-5 h-5" /> Mis lecciones
        </Link>
      </header>
      {saveFailed && <p role="alert" className="mx-3 rounded-xl bg-amber-100 p-3 text-amber-950">No se pudo guardar tu trabajo. Mantén esta página abierta y libera espacio en este navegador antes de salir.</p>}
      <main className="lc-lesson-main flex-1 px-3 pb-6 max-w-7xl w-full mx-auto flex flex-col items-center">
        <div className="lc-lesson-main__intro w-full max-w-3xl text-left mb-4">
          <div className="text-xs font-bold uppercase tracking-wide text-foreground/50">
            {t.leccion[lang]} {n} · {t.paginas[lang].toLowerCase()} {entry.pages}
          </div>
        </div>

        {(PIANO_LESSONS.has(n) || reviewStarted) && (
          <nav className="mb-4 flex w-full max-w-3xl gap-2" aria-label="Vista de la lección">
            <button
              type="button"
              aria-pressed={lessonTab === "book"}
              onClick={() => setLessonTab("book")}
              className={`min-h-11 flex-1 rounded-xl border px-3 py-2 text-sm font-bold ${lessonTab === "book" ? "border-amber-700 bg-amber-50 text-amber-950" : "border-stone-300 bg-white text-stone-700"}`}
            >
              Vista Página Oficial
            </button>
            {PIANO_LESSONS.has(n) && <button
              type="button"
              aria-pressed={lessonTab === "piano"}
              onClick={() => setLessonTab("piano")}
              className={`min-h-11 flex-1 rounded-xl border px-3 py-2 text-sm font-bold ${lessonTab === "piano" ? "border-amber-700 bg-amber-50 text-amber-950" : "border-stone-300 bg-white text-stone-700"}`}
            >
              Cancionero / Piano
            </button>}
            {reviewStarted && <button
              type="button"
              aria-pressed={lessonTab === "review"}
              onClick={() => setLessonTab("review")}
              className={`min-h-11 flex-1 rounded-xl border px-3 py-2 text-sm font-bold ${lessonTab === "review" ? "border-amber-700 bg-amber-50 text-amber-950" : "border-stone-300 bg-white text-stone-700"}`}
            >
              Repaso final
            </button>}
          </nav>
        )}

        {/* Native workbook pages remain in the canonical lesson order. */}
        <div className="w-full">
          {progressReady && showIntro && (
            <GretelCinematic
              cinematic={getLessonCinematic(n)}
              onComplete={() => setShowIntro(false)}
            />
          )}
          {progressReady && completionCinematic && (
            <GretelCinematic
              cinematic={completionCinematic}
              onComplete={advanceAfterCompletion}
            />
          )}
          <GardenScene ref={gardenRef}>
            {progressReady && lessonTab === "book" && (
              <NativeLessonViewer
                key={`${n}:${scope}`}
                pages={pages}
                chapterLabel={`${t.leccion[lang]} ${n} · ${entry.kind === "consonant" ? `${entry.letter.toUpperCase()}${entry.letter}` : entry.title}`}
                initialPage={initialPage}
                onPageChange={handlePageChange}
                onFinish={goNext}
                lessonNumber={n}
                autoTurn
                swipe
              />
            )}
            {progressReady && lessonTab === "piano" && (
              <div className="mx-auto w-full max-w-5xl rounded-3xl bg-[#FBF7EE] p-3 sm:p-6">
                <PianoLessonSection lessonNumber={n} showAvailabilityMessage />
              </div>
            )}
            {progressReady && lessonTab === "review" && (
              <section className="mx-auto w-full max-w-5xl space-y-4 rounded-3xl bg-[#FBF7EE] p-3 sm:p-6" aria-label="Repaso final de la lección">
                <div className="rounded-2xl bg-white p-4 sm:p-6">
                  <h2 className="text-xl font-black text-stone-900">Repaso final · {entry.title}</h2>
                  <p className="mt-1 text-sm text-stone-600" data-vocab-source={reviewWords.book}>{reviewWords.sourceLabel}</p>
                  <ActivityCarousel
                    lessonNumber={n}
                    syllables={reviewSyllables}
                    words={reviewWords.items}
                    letter={reviewLetter}
                    color={entry.color}
                    lessonId={String(n)}
                  />
                </div>
                <button type="button" onClick={goNext} className="min-h-12 w-full rounded-xl bg-amber-700 px-5 py-3 font-black text-white">
                  Terminar lección
                </button>
              </section>
            )}
          </GardenScene>

        </div>
      </main>
      {/* Completion controls never cover the learning page. */}
    </div>
  );
}
