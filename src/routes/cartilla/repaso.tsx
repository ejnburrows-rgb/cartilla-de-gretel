import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle, BookOpen, Sparkles, RotateCcw } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { useLessonProgress } from "@/lib/lesson-progress";
import { useExerciseStats, isLessonWeak, lessonAccuracy, resetStats } from "@/lib/exercise-stats";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { sCopy } from "@/content/student-copy";
import { GardenBackdrop } from "@/components/cartilla/GardenBackdrop";
import { KidButton } from "@/components/ui/KidButton";

export const Route = createFileRoute("/cartilla/repaso")({
  component: Repaso,
  head: () => ({ meta: [{ title: "Modo Repaso — La Cartilla de Gretel" }] }),
});

function Repaso() {
  const { lang } = useLanguage();
  const t = sCopy;
  const { isCompleted, isUnlocked } = useLessonProgress();
  const stats = useExerciseStats();

  const weak = CATALOG.filter((e) => isLessonWeak(String(e.n), stats));
  const pending = CATALOG.filter(
    (e) => !isCompleted(e.n) && isUnlocked(e.n) && !weak.find((w) => w.n === e.n),
  );

  return (
    <div className="min-h-screen relative">
      <GardenBackdrop variant="soft" />
      <div className="relative z-10">
        <header className="px-4 pt-5 pb-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <Link
              to="/cartilla/lecciones"
              className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> {t.lecciones[lang]}
            </Link>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <KidButton
                type="button"
                variant="outline"
                onClick={() => {
                  if (window.confirm(t.olvidarResultados[lang])) resetStats();
                }}
                className="!px-3 !py-1.5 !text-xs !bg-white/50 hover:!bg-red-50 hover:!text-red-600 hover:!border-red-200"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {t.reiniciarRepaso[lang]}
              </KidButton>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary mb-1">
            <Sparkles className="w-3.5 h-3.5" /> {t.modoRepaso[lang]}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{t.practicaFalta[lang]}</h1>
          <p className="text-foreground/70 mt-1">{t.mostramosPrimero[lang]}</p>
        </header>

        <main className="px-4 pb-24 max-w-5xl mx-auto space-y-8">
          <Section
            title={t.paraReforzar[lang]}
            icon={<AlertTriangle className="w-4 h-4" />}
            tone="text-destructive"
            emptyText={t.bienHechoRepaso[lang]}
            entries={weak}
            stats={stats}
            showAccuracy
            lang={lang}
            t={t}
          />
          <Section
            title={t.pendientes[lang]}
            icon={<BookOpen className="w-4 h-4" />}
            tone="text-primary"
            emptyText={t.hasCompletado[lang]}
            entries={pending}
            stats={stats}
            lang={lang}
            t={t}
          />
        </main>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  tone,
  entries,
  emptyText,
  stats,
  showAccuracy,
  lang,
  t,
}: {
  title: string;
  icon: React.ReactNode;
  tone: string;
  entries: typeof CATALOG;
  emptyText: string;
  stats: ReturnType<typeof useExerciseStats>;
  showAccuracy?: boolean;
  lang: "es" | "en";
  t: typeof sCopy;
}) {
  return (
    <section>
      <h2
        className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${tone} mb-3`}
      >
        {icon} {title} ({entries.length})
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-foreground/60 italic">{emptyText}</p>
      ) : (
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {entries.map((entry) => {
            const acc = lessonAccuracy(String(entry.n), stats);
            return (
              <li key={entry.n} className="list-none">
                <Link
                  to="/cartilla/leccion/$n"
                  params={{ n: String(entry.n) }}
                  className="block rounded-2xl border-2 border-foreground/10 bg-card p-4 h-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                  style={{ borderLeftColor: entry.color, borderLeftWidth: 6 }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-foreground/50">
                      {t.leccion[lang]} {entry.n}
                    </span>
                    {showAccuracy && acc !== null && (
                      <span className="text-[11px] font-bold text-destructive">
                        {Math.round(acc * 100)}% {t.acierto[lang]}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold leading-tight" style={{ color: entry.color }}>
                    {entry.title}
                  </h3>
                  <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{entry.subtitle}</p>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
