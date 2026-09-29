import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/useServerFn";
import { CATALOG, TOTAL_LESSONS, type CatalogEntry } from "@/lib/lesson-catalog";
import { useLessonProgress, isLessonUnlocked, markLessonCompleted } from "@/lib/lesson-progress";
import { recordEvent, useStudentSession } from "@/lib/student-session";
import { getMyProgress, saveLastPage } from "@/lib/student.functions";
import { gretelEvent } from "@/lib/gretel-bus";

import { NativeLessonViewer } from "@/components/StudentBook/NativeLessonViewer";
import { buildPageArray } from "@/utils/buildPageArray";
import { GretelCinematic } from "@/components/gretel/GretelCinematic";
import { getCompletionCinematic, getLessonCinematic, type GretelCinematic as GretelCinematicSpec } from "@/content/gretel-cinematics";
import "@/styles/interactive-exercises.css";
import "@/styles/gretel.css";

export function Leccion() {
  const { n: nParam } = useParams({ from: "/cartilla/leccion/$n" });
  const navigate = useNavigate();
  const n = Number(nParam);
  const [showIntro, setShowIntro] = useState(true);
  const [completionCinematic, setCompletionCinematic] = useState<GretelCinematicSpec | null>(null);
  useLessonProgress();
  const session = useStudentSession();
  const entry = useMemo<CatalogEntry | undefined>(() => CATALOG.find((e) => e.n === n), [n]);

  // The physical workbook is the page design. Each lesson now uses the locked
  // canonical full-page source image; only the whole page scales.
  const pages = useMemo(() => buildPageArray(n), [n]);

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
    retry: 1,
  });

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

  const saveLastPageFn = useServerFn(saveLastPage);
  const handlePageChange = (index: number) => {
    if (!session) return;
    void saveLastPageFn({
      data: {
        studentId: session.studentId,
        studentCode: session.studentCode,
        lessonId: String(n),
        page: index,
      },
    }).catch(() => {
      // Resume persistence is best-effort and never blocks reading.
    });
  };

  const unlocked = typeof window === "undefined" || isLessonUnlocked(n);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (entry && !unlocked) navigate({ to: "/cartilla/lecciones" });
  }, [entry, navigate, unlocked]);

  useEffect(() => {
    setShowIntro(true);
  }, [n]);

  useEffect(() => {
    startedAt.current = Date.now();
    return () => {
      const secs = Math.round((Date.now() - startedAt.current) / 1000);
      if (secs >= 5) recordEvent({ lessonId: String(n), kind: "time", timeSeconds: secs });
    };
  }, [n]);

  if (!entry || !unlocked) return null;

  const isLast = n >= TOTAL_LESSONS;

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

  return (
    <div className="min-h-screen bg-white">
      <main className="workbook-lesson-exact-shell">
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
        {progressReady && (
          <NativeLessonViewer
            key={n}
            exactReplica
            pages={pages}
            chapterLabel={`Lección ${n}`}
            initialPage={initialPage}
            onPageChange={handlePageChange}
            onFinish={goNext}
          />
        )}
      </main>
    </div>
  );
}
