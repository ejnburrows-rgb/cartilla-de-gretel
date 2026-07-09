import { useEffect, useMemo, useRef } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, ArrowRight, ClipboardList } from "lucide-react";
import { CATALOG, TOTAL_LESSONS, type CatalogEntry } from "@/lib/lesson-catalog";
import { useLessonProgress, isLessonUnlocked, markLessonCompleted } from "@/lib/lesson-progress";
import { recordEvent, useStudentSession } from "@/lib/student-session";
import { LessonTimer } from "@/components/cartilla/LessonTimer";
import { listMyAssignments } from "@/lib/assignments.functions";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { sCopy } from "@/content/student-copy";
import { gretelEvent } from "@/lib/gretel-bus";

import { SimplePageViewer } from "@/components/StudentBook/SimplePageViewer";
import { buildPageArray } from "@/utils/buildPageArray";
import { GretelLiveAvatar } from "@/components/gretel/GretelLiveAvatar";
import { GardenScene } from "@/components/cartilla/GardenScene";
import "@/styles/interactive-exercises.css";
import "@/styles/gretel.css";

export const Route = createFileRoute("/cartilla/leccion/$n")({
  component: Leccion,
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
  },
});

function Leccion() {
  const { lang } = useLanguage();
  const t = sCopy;
  const { n: nParam } = Route.useParams();
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

  const unlocked = typeof window === "undefined" || isLessonUnlocked(n);
  const startedAt = useRef<number>(Date.now());

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
      <header className="px-4 pt-4 max-w-3xl w-full mx-auto">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <Link
            to="/cartilla/lecciones"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> {t.indice[lang]}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
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
          <div className="mt-3 rounded-xl border-2 border-primary/30 bg-primary/5 px-3 py-2 text-xs font-bold text-primary inline-flex items-start gap-2">
            <ClipboardList className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {t.tareaAsignada[lang]}{assignment.title ? `: ${assignment.title}` : ""}.
              {assignment.due_at &&
                ` ${t.entrega[lang]} ${new Date(assignment.due_at).toLocaleDateString()}.`}
              {assignment.time_limit_seconds &&
                ` ${t.limite[lang]} ${Math.round(assignment.time_limit_seconds / 60)} ${t.min[lang]}.`}
            </span>
          </div>
        )}
      </header>
      <main className="flex-1 px-4 pt-6 pb-28 max-w-5xl w-full mx-auto flex flex-col items-center">
        <div className="w-full max-w-3xl text-left mb-4">
          <div className="text-xs font-bold uppercase tracking-wide text-foreground/50">
            {t.leccion[lang]} {n} · {t.paginas[lang].toLowerCase()} {entry.pages}
          </div>
        </div>

        {/* The lesson IS the book's own pages, one at a time, in order — no
            invented sections/tabs/screens around them (locked canon 7/9). */}
        <div className="w-full">
          <GardenScene>
            {!session && (
              <div className="fixed top-4 left-4 z-[200]">
                <Link
                  to="/cartilla/teacher/lecciones"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800/90 hover:bg-stone-800 text-white font-bold rounded-xl shadow-lg backdrop-blur transition hover:-translate-y-0.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Salir al CRM
                </Link>
              </div>
            )}
            <SimplePageViewer pages={pages} initialPage={0} />
          </GardenScene>
        </div>

        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[100] pointer-events-none">
          <GretelLiveAvatar size="md" bubblePosition="left" />
        </div>
      </main>
      <nav className="fixed bottom-0 inset-x-0 p-3 bg-background/95 backdrop-blur border-t-2 border-foreground/10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() =>
              n > 1
                ? navigate({ to: "/cartilla/leccion/$n", params: { n: String(n - 1) } })
                : navigate({ to: "/cartilla/lecciones" })
            }
            className="px-5 py-3 rounded-2xl border-2 border-foreground/15 font-bold hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5 inline mr-1" /> {n > 1 ? t.anterior[lang] : t.indice[lang]}
          </button>
          <button
            onClick={goNext}
            disabled={isLast && done}
            className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 hover:translate-y-px"
          >
            {isLast
              ? done
                ? t.terminado[lang]
                : t.marcarTerminar[lang]
              : done
                ? t.siguiente[lang]
                : t.marcarSiguiente[lang]}{" "}
            <ArrowRight className="w-5 h-5 inline ml-1" />
          </button>
        </div>
      </nav>
    </div>
  );
}
