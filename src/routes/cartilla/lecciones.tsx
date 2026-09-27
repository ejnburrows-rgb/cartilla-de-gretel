import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@/lib/useServerFn";
import {
  ArrowLeft,
  Check,
  Lock,
} from "lucide-react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import {
  hydrateLessonProgress,
  useLessonProgress,
} from "@/lib/lesson-progress";
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
  const { isCompleted, isUnlocked, completed } = useLessonProgress();

  useEffect(() => {
    if (!session) return;
    fetchMyProgress({
      data: { studentId: session.studentId, studentCode: session.studentCode },
    })
      .then((data) => {
        const fromRows = (
          (
            data as {
              lessonProgress?: Array<{ lesson_id: string; status: string }>;
            }
          ).lessonProgress ?? []
        )
          .filter((row) => row.status === "completed")
          .map((row) => Number(row.lesson_id))
          .filter((n) => Number.isFinite(n));
        const fromEvents = (
          (
            data as {
              events?: Array<{ lesson_id: string; event_kind: string }>;
            }
          ).events ?? []
        )
          .filter((event) => event.event_kind === "lesson_completed")
          .map((event) => Number(event.lesson_id))
          .filter((n) => Number.isFinite(n));
        hydrateLessonProgress(
          Array.from(new Set([...fromRows, ...fromEvents])),
        );
      })
      .catch(() => undefined);
  }, [fetchMyProgress, session]);
  const doneCount = [...completed].filter(
    (n) => n >= 1 && n <= TOTAL_LESSONS,
  ).length;
  const pct = Math.round((doneCount / TOTAL_LESSONS) * 100);

  return (
    <div className="min-h-screen bg-stone-50 overflow-hidden relative pb-32">
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
        <p className="text-stone-500 font-medium mt-2">{import.meta.env.VITE_CRM_REVIEW === "true" ? "Elige cualquiera de las 24 lecciones y practica a tu ritmo." : t.aprendePaso[lang]}</p>

        <GretelPresence
          variant="home"
          className="cartilla-journey-gretel"
        />

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

      <main className="px-4 max-w-2xl mx-auto relative z-10 mt-8">
        <div className="relative space-y-4 pb-8">
          <div
            className="absolute top-8 bottom-8 left-7 w-1 rounded-full bg-[var(--book-teal)]/30"
            aria-hidden="true"
          />
          {CATALOG.map((entry) => {
            const done = isCompleted(entry.n);
            const unlocked =
              import.meta.env.VITE_CRM_REVIEW === "true" || isUnlocked(entry.n);
            const accent = entry.color || "#f97316";
            const chapter = (
              <div
                className={`relative flex min-h-24 items-center gap-4 rounded-2xl border-2 bg-[#fffaf0] p-4 pl-5 shadow-[0_5px_0_rgba(89,74,61,0.12)] transition-transform ${unlocked ? "hover:-translate-y-1" : "opacity-75"}`}
                style={{ borderColor: unlocked ? accent : "#d6d3d1" }}
              >
                <div
                  className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 bg-white text-lg font-black shadow-sm"
                  style={{ borderColor: unlocked ? accent : "#a8a29e", color: unlocked ? accent : "#78716c" }}
                >
                  {done ? <Check className="h-7 w-7" aria-hidden="true" /> : unlocked ? entry.n : <Lock className="h-6 w-6" aria-hidden="true" />}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: unlocked ? accent : "#78716c" }}>
                    Lección {entry.n}
                  </span>
                  <h2 className="text-base font-black leading-tight text-stone-800">{entry.title}</h2>
                  <p className="mt-1 text-xs text-stone-600">{entry.subtitle}</p>
                </div>
                <span
                  className="shrink-0 rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wide"
                  style={{
                    borderColor: unlocked ? accent : "#a8a29e",
                    color: unlocked ? accent : "#78716c",
                    backgroundColor: unlocked ? `color-mix(in srgb, ${accent} 10%, white)` : "#f5f5f4",
                  }}
                >
                  {done ? "Completada" : unlocked ? "Disponible" : "Bloqueada"}
                </span>
              </div>
            );
            return unlocked ? (
              <Link
                key={entry.n}
                to="/cartilla/leccion/$n"
                params={{ n: String(entry.n) }}
                onClick={() => playUiTick()}
                className="block rounded-2xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2"
                style={{ outlineColor: accent }}
                aria-label={`Lección ${entry.n}: ${entry.title}. ${done ? "Completada" : "Disponible"}`}
              >
                {chapter}
              </Link>
            ) : (
              <div key={entry.n} aria-label={`Lección ${entry.n}: ${entry.title}. Bloqueada`}>
                {chapter}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
