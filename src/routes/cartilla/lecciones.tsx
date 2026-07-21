import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, BookOpen, Check, Lock, RotateCcw, Sparkles, Zap } from "lucide-react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { hydrateLessonProgress, useLessonProgress } from "@/lib/lesson-progress";
import { getMyProgress } from "@/lib/student.functions";
import { useStudentSession } from "@/lib/student-session";
import { useLanguage } from "@/context/LanguageContext";
import { sCopy } from "@/content/student-copy";
import { GardenBackdrop } from "@/components/cartilla/GardenBackdrop";
import { GretelPresence } from "@/components/gretel/GretelPresence";
import { playUiTick } from "@/lib/piano-audio";

export const Route = createFileRoute("/cartilla/lecciones")({
  component: Lecciones,
  head: () => ({ meta: [{ title: "24 Lecciones — La Cartilla de Gretel" }] }),
});

function Lecciones() {
  const { lang } = useLanguage();
  const t = sCopy;
  const session = useStudentSession();
  const fetchMyProgress = useServerFn(getMyProgress);
  const { isCompleted, isUnlocked, completed, reset } = useLessonProgress();

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

  return (
    <div className="min-h-screen bg-stone-50 overflow-hidden relative pb-32">
      <GretelPresence variant="home" className="fixed bottom-0 right-0 z-50 pointer-events-none" />
      {/* Background decoration */}
      <GardenBackdrop variant="soft" />

      <header className="px-4 pt-8 pb-4 max-w-2xl mx-auto relative z-10 text-center">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/cartilla"
            className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> {t.cartilla[lang]}
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black leading-tight text-stone-800">
          Tu Camino de Aprendizaje
        </h1>
        <p className="text-stone-500 font-medium mt-2">{t.aprendePaso[lang]}</p>

        {/* Progress Bar */}
        <div className="mt-8 max-w-sm mx-auto bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
          <div className="flex items-baseline justify-between text-sm font-black mb-2">
            <span className="text-orange-500 uppercase tracking-widest text-[10px]">
              {t.progreso[lang]}
            </span>
            <span className="text-stone-800">
              {doneCount} / {TOTAL_LESSONS}
            </span>
          </div>
          <div className="h-4 bg-stone-100 rounded-full overflow-hidden border border-stone-200 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      <main className="px-4 max-w-2xl mx-auto relative mt-12">
        {/* The Path Line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-[var(--book-teal)] rounded-full -translate-x-1/2 opacity-50 shadow-inner"></div>

        <div className="flex flex-col items-center gap-10">
          {CATALOG.map((entry, i) => {
            const done = isCompleted(entry.n);
            const unlocked = isUnlocked(entry.n);

            // Calculate a zig-zag offset (Duolingo style)
            const offsetX = Math.sin(i * 1.5) * 80;

            const nodeColor = entry.color || "#f97316";

            return (
              <div
                key={entry.n}
                className="relative flex flex-col items-center group z-10"
                style={{ transform: `translateX(${offsetX}px)` }}
              >
                {unlocked ? (
                  <Link
                    to="/cartilla/leccion/$n"
                    params={{ n: String(entry.n) }}
                    onClick={() => playUiTick()}
                    className={`relative w-24 h-24 rounded-[var(--student-radius,999px)] flex flex-col items-center justify-center text-white font-black text-2xl transition-all duration-300 shadow-xl border-b-8 active:border-b-0 active:translate-y-2 hover:scale-105 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 ${done ? "opacity-100" : "pulse-soft"}`}
                    style={{
                      backgroundColor: nodeColor,
                      borderColor: `color-mix(in srgb, ${nodeColor} 20%, black)`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  >
                    {done ? <Check className="w-10 h-10 drop-shadow-md" /> : <span>{entry.n}</span>}

                    {/* Floating Label */}
                    <div
                      className={`absolute top-full mt-3 px-4 py-1.5 bg-white rounded-xl shadow-md border border-stone-200 text-xs font-black uppercase tracking-wider text-stone-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      {entry.title}
                    </div>
                  </Link>
                ) : (
                  <div className="relative w-20 h-20 rounded-full bg-[var(--book-paper)] flex items-center justify-center shadow-sm border-4 border-[var(--book-teal)] cursor-not-allowed opacity-80">
                    <Lock className="w-8 h-8 text-stone-400" />

                    {/* Floating Label */}
                    <div className="absolute top-full mt-3 px-3 py-1 bg-stone-100 rounded-lg text-[10px] font-bold text-stone-400 whitespace-nowrap">
                      Bloqueado
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
