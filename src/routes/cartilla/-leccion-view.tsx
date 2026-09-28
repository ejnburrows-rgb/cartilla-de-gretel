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
import { getLessonCinematic } from "@/content/gretel-cinematics";
import { GardenScene } from "@/components/cartilla/GardenScene";
import "@/styles/interactive-exercises.css";
import "@/styles/gretel.css";

export function Leccion() {
  const { lang } = useLanguage();
  const t = sCopy;
  const { n: nParam } = useParams({ from: "/cartilla/leccion/$n" });
  const navigate = useNavigate();
  const n = Number(nParam);
  const [showIntro, setShowIntro] = useState(true);
  useLessonProgress();
  const session = useStudentSession();
  const entry = useMemo<CatalogEntry | undefined>(() => CATALOG.find((e) => e.n === n), [n]);

  // Build page array from page-inventory.json for this specific lesson —
  // real book pages, rendered via FaithfulPageRenderer (book-faithful text +
  // art + tracing/exercises), unchanged. Only the flip-book presentation
  // shell around them changed (see SimplePageViewer).
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
  const pct = Math.round((n / TOTAL_LESSONS) * 100);

  const goNext = () => {
    markLessonCompleted(n);
    recordEvent({ lessonId: String(n), kind: "lesson_completed" });
    gretelEvent("lesson:complete");
    if (isLast) navigate({ to: "/cartilla/lecciones" });
    else navigate({ to: "/cartilla/leccion/$n", params: { n: String(n + 1) } });
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className={`px-4 max-w-3xl w-full mx-auto ${session ? "pt-4" : "pt-20"}`}>
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <Link
            to="/cartilla/lecciones"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> {t.indice[lang]}
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <LessonTimer limitSeconds={assignment?.time_limit_seconds ?? null} />
              <span className="text-xs font-bold text-foreground/60">
                L{n}/{TOTAL_LESSONS}
              </span>
            </div>
          </div>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden border border-foreground/10">
          <div
            className="h-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: entry.color }}
          />
        </div>
        {assignment && (
          <div
            className="mt-3 rounded-xl border-2 px-3 py-2 text-xs font-bold inline-flex items-start gap-2"
            style={{
              borderColor: `color-mix(in srgb, ${entry.color} 30%, transparent)`,
              background: `color-mix(in srgb, ${entry.color} 5%, transparent)`,
              color: entry.color,
            }}
          >
            <ClipboardList className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {t.tareaAsignada[lang]}
              {assignment.title ? `: ${assignment.title}` : ""}.
              {assignment.due_at &&
                ` ${t.entrega[lang]} ${new Date(assignment.due_at).toLocaleDateString()}.`}
              {assignment.time_limit_seconds &&
                ` ${t.limite[lang]} ${Math.round(assignment.time_limit_seconds / 60)} ${t.min[lang]}.`}
            </span>
          </div>
        )}
      </header>
      <main className="flex-1 px-4 pt-6 pb-6 max-w-7xl w-full mx-auto flex flex-col items-center">
        <div className="w-full max-w-3xl text-left mb-4">
          <div className="text-xs font-bold uppercase tracking-wide text-foreground/50">
            {t.leccion[lang]} {n} · {t.paginas[lang].toLowerCase()} {entry.pages}
          </div>
        </div>

        {/* The lesson IS the book's own pages, one at a time, in order — no
            invented sections/tabs/screens around them (locked canon 7/9). */}
        <div className="w-full">
          {progressReady && showIntro && (
            <GretelCinematic
              cinematic={getLessonCinematic(n)}
              onComplete={() => setShowIntro(false)}
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
                bookCompanion={bookCompanion}
              />
            )}
          </GardenScene>

          {/* Placement preview — Lección 1 only, see comment near the top of
              this file. Owner reviews this before any wider rollout. */}
        </div>
      </main>
      {/* Completion controls follow the reader so they cannot cover a page. */}
    </div>
  );
}
