import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, BookOpen, Check, RotateCcw, Sparkles, Zap } from "lucide-react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { getWorkbookPagesForLesson, getSightWordsForLesson } from "@/lib/book-faithful";
import { getCartillaCrmTheme, getBookSectionForLesson } from "@/lib/cartilla-crm-theme";
import { hydrateLessonProgress, useLessonProgress } from "@/lib/lesson-progress";
import { getMyProgress } from "@/lib/student.functions";
import { useProgressSyncStatus, useStudentSession } from "@/lib/student-session";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { routePath } from "@/lib/assets";

export const Route = createFileRoute("/cartilla/lecciones")({
  component: Lecciones,
  head: () => ({ meta: [{ title: "24 Lecciones — La Cartilla de Gretel" }] }),
});

function Lecciones() {
  const session = useStudentSession();
  const syncStatus = useProgressSyncStatus();
  const fetchMyProgress = useServerFn(getMyProgress);
  const { isCompleted, completed, reset } = useLessonProgress();

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

  let lastSection = "";

  return (
    <div className="min-h-screen cartilla-crm-bg text-[var(--cartilla-title-ink)] py-2">
      <header className="px-4 pt-5 pb-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link
            to="/cartilla"
            className="inline-flex items-center gap-2 text-sm font-black text-amber-950/70 hover:text-amber-950"
          >
            <ArrowLeft className="w-4 h-4" /> Cartilla
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/cartilla/practica"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:underline"
            >
              <Zap className="w-3.5 h-3.5" /> Práctica rápida
            </Link>
            <Link
              to="/cartilla/repaso"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" /> Modo repaso
            </Link>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Reiniciar tu progreso de las 24 lecciones?")) reset();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950/60 hover:text-destructive"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reiniciar progreso
            </button>
          </div>
        </div>
        
        {/* Clean Hero Panel */}
        <section className="rounded-3xl border border-amber-950/15 bg-white p-6 shadow-sm mb-4">
          <h1 className="text-3xl font-black text-[var(--cartilla-title-ink)]">
            Las 24 lecciones de La Cartilla de Gretel
          </h1>
          <p className="mt-2 text-lg font-medium text-amber-950/70">
            Aprende a leer y escribir paso a paso con las páginas del libro oficial.
          </p>
          
          <div className="mt-6">
            <div className="flex items-baseline justify-between text-sm font-bold">
              <span className="text-amber-950/80">
                Tu progreso: {doneCount} / {TOTAL_LESSONS}
              </span>
              <span className="text-amber-950/60">{pct}%</span>
            </div>
            <div className="mt-2 h-3 bg-amber-950/10 rounded-full overflow-hidden border border-amber-900/10">
              <div className="h-full bg-amber-800 transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </section>

        {!isSupabaseConfigured && session && (
          <div className="mt-3 inline-flex rounded-full border border-amber-900/15 bg-white/60 px-3 py-1 text-xs font-bold text-amber-900">
            Modo local: progreso guardado en este navegador para {session.studentName}.
          </div>
        )}
        {session && syncStatus.state !== "idle" && (
          <div
            className={syncStatus.state === "error" ? "mt-2 inline-flex rounded-full border border-destructive/25 bg-destructive/5 px-3 py-1 text-xs font-bold text-destructive" : "mt-2 inline-flex rounded-full border border-success/25 bg-success/5 px-3 py-1 text-xs font-bold text-success"}
          >
            {syncStatus.message}
          </div>
        )}
      </header>

      <main className="px-4 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">
          {CATALOG.map((entry) => {
            const done = isCompleted(entry.n);
            const theme = getCartillaCrmTheme(entry.n);
            const sightWords = getSightWordsForLesson(entry.n).slice(0, 3);
            const firstPageImage = getWorkbookPagesForLesson(entry.n)[0]?.imageScanReference;
            const section = getBookSectionForLesson(entry.n);
            
            let isNewSection = false;
            if (section !== lastSection) {
              isNewSection = true;
              lastSection = section;
            }

            const sectionLabel = section === "vowels" ? "Vocales" : section === "consonants" ? "Consonantes" : "Introducción";

            return (
              <div key={entry.n} className="contents">
                {isNewSection && (
                  <h3 className="col-span-full mt-6 mb-2 text-xl font-black uppercase tracking-widest text-amber-900/60">
                    {sectionLabel}
                  </h3>
                )}
                
                <a
                  href={routePath(`/cartilla/leccion/${entry.n}`)}
                  className="group flex flex-col bg-white overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-stone-200"
                  style={{ borderLeft: `8px solid ${theme.accent}` }}
                >
                  {/* Thumbnail */}
                  <div className="w-full aspect-[4/3] bg-stone-100 border-b border-stone-100 flex items-center justify-center overflow-hidden p-3">
                    {firstPageImage ? (
                      <img 
                        src={"/" + firstPageImage} 
                        loading="lazy" 
                        alt={entry.title}
                        className="w-full h-full object-cover rounded-md shadow-sm opacity-90 group-hover:opacity-100 transition-opacity" 
                      />
                    ) : (
                      <div className="w-full h-full rounded-md shadow-sm" style={{ backgroundColor: theme.accent, opacity: 0.15 }} />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span 
                        className="rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white shadow-xs"
                        style={{ backgroundColor: theme.accent }}
                      >
                        L{entry.n}
                      </span>
                      {done ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          <Check className="w-3 h-3 stroke-[3]" /> Hecho
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[11px] font-bold text-stone-600">
                          <BookOpen className="w-3 h-3 stroke-[2.5]" /> Abrir
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-lg font-black leading-tight text-stone-800 group-hover:text-amber-900 transition-colors">
                      {entry.title}
                    </h2>
                    <p className="text-sm text-stone-500 mt-1 line-clamp-1">
                      {entry.subtitle}
                    </p>
                    
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-bold text-stone-500">
                        Pág. {entry.pages}
                      </span>
                      {sightWords.map((sw, i) => (
                        <span key={i} className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100">
                          {sw}
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
