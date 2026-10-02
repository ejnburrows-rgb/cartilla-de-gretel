import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { CATALOG, TOTAL_LESSONS, type CatalogEntry } from "@/lib/lesson-catalog";
import { useLessonProgress, isLessonUnlocked, markLessonCompleted } from "@/lib/lesson-progress";
import { recordEvent, useStudentSession } from "@/lib/student-session";
import { LessonTimer } from "@/components/cartilla/LessonTimer";
import { listMyAssignments } from "@/lib/assignments.functions";
import { getMyProgress, saveLastPage } from "@/lib/student.functions";
import { useLanguage } from "@/context/LanguageContext";
import { sCopy } from "@/content/student-copy";
import { gretelEvent } from "@/lib/gretel-bus";

import { NativeLessonViewer } from "@/components/StudentBook/NativeLessonViewer";
import { buildPageArray } from "@/utils/buildPageArray";
import { GretelPresence } from "@/components/gretel/GretelPresence";
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
  const showIntro = false;
  const [completionCinematic, setCompletionCinematic] = useState<GretelCinematicSpec | null>(null);
  useLessonProgress();
  const session = useStudentSession();
  const entry = useMemo<CatalogEntry | undefined>(() => CATALOG.find((e) => e.n === n), [n]);

  // Build this lesson from the canonical structured workbook page data.
  // All instructional pages render through the native learning surface.
  const pages = useMemo(() => buildPageArray(n), [n]);

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
    if (!session) return 0;
    const lessonProgress =
      (
        progressData as {
          lessonProgress?: Array<{ lesson_id: string; last_page?: number | null }>;
        } | null
      )?.lessonProgress ?? [];
    const row = lessonProgress.find((p) => p.lesson_id === String(n));
    return row?.last_page ?? 0;
  }, [session, progressData, n]);

  const gardenRef = useRef<HTMLDivElement>(null);
  const saveLastPageFn = useServerFn(saveLastPage);
  const handlePageChange = (index: number) => {
    // Slight page-movement parallax on the garden scene — set imperatively so
    // the workbook and its interactive flip never re-render. CSS caps + eases
    // it and disables it under prefers-reduced-motion (garden-scene.css).
    gardenRef.current?.style.setProperty("--garden-parallax", String(index));
    if (!session) return;
    void saveLastPageFn({
      data: {
        studentId: session.studentId,
        studentCode: session.studentCode,
        lessonId: String(n),
        page: index,
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

  const advanceAfterCompletion = () => {
    setCompletionCinematic(null);
    if (isLast) navigate({ to: "/cartilla/lecciones" });
    else navigate({ to: "/cartilla/leccion/$n", params: { n: String(n + 1) } });
  };

  const goNext = () => {
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

  const bookCompanion = (
    <GretelPresence
      key={`gretel-${n}`}
      lesson={{
        n: entry.n, kind: entry.kind, title: entry.title, subtitle: entry.subtitle,
        letter: entry.kind === "consonant" ? entry.letter : undefined,
        vowel: entry.kind === "vowel" ? entry.vowel : undefined,
      }}
      autoIntro bookMode hideChrome
    />
  );

  return (
    <div className="lc-lesson-shell min-h-screen flex flex-col">
      <header className="lc-lesson-header">
        <Link
          to="/cartilla/lecciones"
          className="lc-lesson-header__back"
        >
          <ArrowLeft className="w-5 h-5" /> Mis lecciones
        </Link>
      </header>
      <main className="flex-1 px-3 pb-6 max-w-7xl w-full mx-auto flex flex-col items-center">
        <div className="w-full max-w-3xl text-left mb-4">
          <div className="text-xs font-bold uppercase tracking-wide text-foreground/50">
            {t.leccion[lang]} {n} · {t.paginas[lang].toLowerCase()} {entry.pages}
          </div>
        </div>

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
            {progressReady && (
              <NativeLessonViewer
                key={n}
                pages={pages}
                chapterLabel={`${t.leccion[lang]} ${n} · ${entry.kind === "consonant" ? `${entry.letter.toUpperCase()}${entry.letter}` : entry.title}`}
                initialPage={initialPage}
                onPageChange={handlePageChange}
                onFinish={goNext}
                lessonNumber={n}
                bookCompanion={bookCompanion}
              />
            )}
          </GardenScene>

        </div>
      </main>
      {/* Completion controls never cover the learning page. */}
    </div>
  );
}
