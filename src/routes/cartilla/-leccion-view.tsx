import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ClipboardList } from "lucide-react";
import { CATALOG, TOTAL_LESSONS, type CatalogEntry } from "@/lib/lesson-catalog";
import { useLessonProgress, isLessonUnlocked, markLessonCompleted } from "@/lib/lesson-progress";
import { recordEvent, useStudentSession } from "@/lib/student-session";
import { LessonTimer } from "@/components/cartilla/LessonTimer";
import {
  getMyAssignmentsWithSession,
  getProgressWithSession,
  saveLastPageWithSession,
} from "@/lib/secure-student-access";
import { useLanguage } from "@/context/LanguageContext";
import { sCopy } from "@/content/student-copy";
import { gretelEvent } from "@/lib/gretel-bus";

import { CurlPageViewer } from "@/components/StudentBook/CurlPageViewer";
import { buildPageArray } from "@/utils/buildPageArray";
import { GretelPresence } from "@/components/gretel/GretelPresence";
import { GardenScene } from "@/components/cartilla/GardenScene";
import { ActivityCarousel } from "@/components/cartilla/ActivityCarousel";
import { KidButton } from "@/components/ui/KidButton";
import "@/styles/interactive-exercises.css";
import "@/styles/gretel.css";

// PLACEMENT PREVIEW (owner-gated, July 2026) — Lección 1 only. Real words +
// illustrationSrc already wired on this lesson's own workbook page
// (src/data/page-layouts.json), reused here rather than invented. Syllables
// are the five vowels themselves, matching this lesson's real subtitle
// ("Las cinco vocales: a, e, i, o, u"). Not rolled out further until the
// owner picks a placement (separate section vs. woven into the page).
const LECCION_1_PREVIEW_WORDS = [
  { word: "abanico", emoji: "🪭", illustrationSrc: "/cartilla/art/faithful/vocal-a/abanico.webp" },
  { word: "anillo", emoji: "💍", illustrationSrc: "/cartilla/art/faithful/vocal-a/anillo.webp" },
  { word: "araña", emoji: "🕷️", illustrationSrc: "/cartilla/art/faithful/vocal-a/arana.webp" },
  { word: "avión", emoji: "✈️", illustrationSrc: "/cartilla/art/faithful/vocal-a/avion.webp" },
  { word: "imán", emoji: "🧲", illustrationSrc: "/cartilla/art/faithful/vocal-i/iman.webp" },
  { word: "isla", emoji: "🏝️", illustrationSrc: "/cartilla/art/faithful/vocal-i/isla.webp" },
  { word: "oso", emoji: "🐻", illustrationSrc: "/cartilla/art/faithful/vocal-o/oso.webp" },
];
const LECCION_1_PREVIEW_SYLLABLES = ["a", "e", "i", "o", "u"];

export function Leccion() {
  const { lang } = useLanguage();
  const t = sCopy;
  const { n: nParam } = useParams({ from: "/cartilla/leccion/$n" });
  const navigate = useNavigate();
  const n = Number(nParam);
  const { isCompleted } = useLessonProgress();
  const session = useStudentSession();
  const entry = useMemo<CatalogEntry | undefined>(() => CATALOG.find((e) => e.n === n), [n]);

  // Build page array from page-inventory.json for this specific lesson —
  // real book pages, rendered via FaithfulPageRenderer (book-faithful text +
  // art + tracing/exercises), unchanged. Only the flip-book presentation
  // shell around them changed (see SimplePageViewer).
  const pages = useMemo(() => buildPageArray(n), [n]);

  const { data: assignments } = useQuery({
    queryKey: ["my-assignments", session?.classId],
    queryFn: () =>
      session ? getMyAssignmentsWithSession(session, session.studentId) : Promise.resolve([]),
    enabled: !!session,
  });
  const assignment = useMemo(
    () => (assignments ?? []).find((a: { lesson_id: string }) => a.lesson_id === String(n)),
    [assignments, n],
  );

  const {
    data: progressData,
    isFetched,
    isError,
  } = useQuery({
    queryKey: ["my-progress", session?.studentId],
    queryFn: () =>
      session ? getProgressWithSession(session, session.studentId) : Promise.resolve(null),
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
  const handlePageChange = (index: number) => {
    // Slight page-movement parallax on the garden scene — set imperatively so
    // the workbook and its interactive flip never re-render. CSS caps + eases
    // it and disables it under prefers-reduced-motion (garden-scene.css).
    gardenRef.current?.style.setProperty("--garden-parallax", String(index));
    if (!session) return;
    void saveLastPageWithSession(session, {
      studentId: session.studentId,
      lessonId: String(n),
      page: index,
    }).catch(() => {
      // Best-effort: last-page persistence is a resume convenience, never
      // blocks reading. getProgressWithSession remains the source of truth next load.
    });
  };

  const unlocked = typeof window === "undefined" || isLessonUnlocked(n);
  const startedAt = useRef<number>(Date.now());

  // Gretel must never be covered by the fixed bottom nav (hard rule — see
  // "Characters must be ALIVE" in CLAUDE.md). The nav is viewport-fixed, so a
  // one-time bottom-padding buffer on <main> only protects the very end of
  // the page, not the mid-scroll moment the Gretel panel itself passes behind
  // that same strip. Measure the real overlap on every scroll/resize and
  // fade the nav out whenever it would visually intersect her panel.
  const gretelWrapRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [navObscuresGretel, setNavObscuresGretel] = useState(false);

  useEffect(() => {
    let rafId = 0;
    const measure = () => {
      rafId = 0;
      const gretelEl = gretelWrapRef.current;
      const navEl = navRef.current;
      if (!gretelEl || !navEl) return;
      const g = gretelEl.getBoundingClientRect();
      const nv = navEl.getBoundingClientRect();
      const overlapY = Math.min(g.bottom, nv.bottom) - Math.max(g.top, nv.top);
      setNavObscuresGretel(overlapY > 0 && g.height > 0);
    };
    const onScrollOrResize = () => {
      if (!rafId) rafId = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [n]);

  useEffect(() => {
    if (entry && !unlocked) navigate({ to: "/cartilla/lecciones" });
  }, [entry, navigate, unlocked]);

  useEffect(() => {
    gretelEvent("lesson:start");
    startedAt.current = Date.now();
    return () => {
      const secs = Math.round((Date.now() - startedAt.current) / 1000);
      if (secs >= 5) recordEvent({ lessonId: String(n), kind: "time", timeSeconds: secs });
    };
  }, [n]);

  if (!entry || !unlocked) return null;

  const done = isCompleted(n);
  const isLast = n >= TOTAL_LESSONS;
  const pct = Math.round((n / TOTAL_LESSONS) * 100);

  const goNext = () => {
    markLessonCompleted(n);
    recordEvent({ lessonId: String(n), kind: "lesson_completed" });
    gretelEvent("lesson:complete");
    if (isLast) navigate({ to: "/cartilla/lecciones" });
    else navigate({ to: "/cartilla/leccion/$n", params: { n: String(n + 1) } });
  };

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
      <main className="flex-1 px-4 pt-6 pb-28 max-w-7xl w-full mx-auto flex flex-col items-center">
        <div className="w-full max-w-3xl text-left mb-4">
          <div className="text-xs font-bold uppercase tracking-wide text-foreground/50">
            {t.leccion[lang]} {n} · {t.paginas[lang].toLowerCase()} {entry.pages}
          </div>
        </div>

        {/* The lesson IS the book's own pages, one at a time, in order — no
            invented sections/tabs/screens around them (locked canon 7/9). */}
        <div className="w-full">
          <GardenScene ref={gardenRef}>
            {!session && (
              <div className="fixed top-4 left-4 z-[200]">
                <Link
                  to="/cartilla/lecciones"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800/90 hover:bg-stone-800 text-white font-bold rounded-xl shadow-lg backdrop-blur transition hover:-translate-y-0.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver a mis lecciones
                </Link>
              </div>
            )}
            {progressReady && (
              <div className="gretel-presence-layout w-full">
                <CurlPageViewer
                  key={n}
                  pages={pages}
                  initialPage={initialPage}
                  onPageChange={handlePageChange}
                  accent={entry.color}
                />
                {/* Full-presence host — continuous layered life + little-girl Spanish TTS */}
                {entry && (
                  <div ref={gretelWrapRef}>
                    <GretelPresence
                      key={`gretel-${n}`}
                      lesson={{
                        n: entry.n,
                        kind: entry.kind,
                        title: entry.title,
                        subtitle: entry.subtitle,
                        letter: entry.kind === "consonant" ? entry.letter : undefined,
                        vowel: entry.kind === "vowel" ? entry.vowel : undefined,
                      }}
                      autoIntro
                    />
                  </div>
                )}
              </div>
            )}
          </GardenScene>

          {/* Placement preview — Lección 1 only, see comment near the top of
              this file. Owner reviews this before any wider rollout. */}
          {progressReady && entry && n === 1 && (
            <div className="w-full max-w-3xl mx-auto mt-6">
              <ActivityCarousel
                lessonNumber={n}
                syllables={LECCION_1_PREVIEW_SYLLABLES}
                words={LECCION_1_PREVIEW_WORDS}
                letter=""
                color={entry.color}
                lessonId={String(n)}
                activities={entry.activities}
              />
            </div>
          )}
        </div>
      </main>
      {/* z-50 keeps this bar above the page body. The garden page body is
          `position: relative; z-index: 1` (faithful-page.css), so without an
          explicit z-index this fixed bar painted *underneath* the lesson
          content: an "ilustración pendiente" placeholder sitting at the foot
          of a page swallowed the taps on "Marcar y siguiente", leaving the
          child unable to finish the lesson. The fade-out below still hides the
          bar whenever it would cover Gretel. */}
      <nav
        ref={navRef}
        aria-hidden={navObscuresGretel}
        className={`fixed bottom-0 inset-x-0 z-50 p-3 bg-background/95 backdrop-blur border-t-2 border-foreground/10 transition-opacity duration-200 ${
          navObscuresGretel ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <KidButton
            variant="outline"
            accent={entry.color}
            onClick={() =>
              n > 1
                ? navigate({ to: "/cartilla/leccion/$n", params: { n: String(n - 1) } })
                : navigate({ to: "/cartilla/lecciones" })
            }
          >
            <ArrowLeft className="w-5 h-5 inline mr-1" />{" "}
            {n > 1 ? t.anterior[lang] : t.indice[lang]}
          </KidButton>
          <KidButton accent={entry.color} onClick={goNext} disabled={isLast && done}>
            {isLast
              ? done
                ? t.terminado[lang]
                : t.marcarTerminar[lang]
              : done
                ? t.siguiente[lang]
                : t.marcarSiguiente[lang]}{" "}
            <ArrowRight className="w-5 h-5 inline ml-1" />
          </KidButton>
        </div>
      </nav>
    </div>
  );
}
