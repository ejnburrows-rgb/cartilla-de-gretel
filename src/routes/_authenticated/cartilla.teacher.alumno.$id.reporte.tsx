import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, Printer, BookOpen, Award, Clock, Target, Loader2 } from "lucide-react";
import { getStudentProgress } from "@/lib/teacher.functions";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { summarizeStudentEvents } from "@/lib/student-summary";
import { BRANDING, copyrightLine } from "@/lib/branding";
import { useLanguage } from "@/context/LanguageContext";
import { tCopy } from "@/content/teacher-copy";

export const Route = createFileRoute("/_authenticated/cartilla/teacher/alumno/$id/reporte")({
  component: StudentReport,
});

function StudentReport() {
  const { lang } = useLanguage();
  const t = tCopy;
  const { id } = Route.useParams();
  const fetchProgress = useServerFn(getStudentProgress);
  const { data, isLoading } = useQuery({
    queryKey: ["teacher", "student", id],
    queryFn: () => fetchProgress({ data: { id } }),
  });

  const summary = useMemo(() => (data ? summarizeStudentEvents(data.events) : null), [data]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-foreground/40" />
      </main>
    );
  }
  if (!data || !summary) return null;

  const fmtMin = (s: number) => `${Math.floor(s / 60)} ${t.min[lang]} ${s % 60} ${t.s[lang]}`;
  const generatedAt = new Date().toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-3xl mx-auto print:bg-white print:text-black print:px-0 print:py-0 print:max-w-none">
      <div className="print:hidden flex items-center justify-between gap-3 mb-6">
        <Link
          to="/cartilla/teacher/alumno/$id"
          params={{ id }}
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> {data.student.display_name}
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold"
        >
          <Printer className="w-4 h-4" /> {t.imprimirGuardarPDF[lang]}
        </button>
      </div>

      <div className="kid-card p-8 print:p-0 print:shadow-none print:border-none">
        <header className="flex items-center justify-between gap-4 border-b-2 border-foreground/10 pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-primary">
              {BRANDING.productName}
            </div>
            <h1 className="text-2xl font-bold mt-1">
              {t.reportePara[lang]} {data.student.display_name}
            </h1>
            <p className="text-sm text-foreground/60 mt-1">
              {data.class?.name ?? ""} · {t.generadoEl[lang]} {generatedAt}
            </p>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ReportStat icon={BookOpen} label={t.leccionesCount[lang]} value={`${summary.completedCount}/${TOTAL_LESSONS}`} />
          <ReportStat
            icon={Target}
            label={t.ejercicios[lang]}
            value={String(Object.values(summary.exerciseStats).reduce((a, s) => a + s.runs, 0))}
          />
          <ReportStat icon={Clock} label={t.tiempoTotal[lang]} value={fmtMin(summary.timeTotal)} />
          <ReportStat icon={Award} label={t.insignias[lang]} value={String(summary.badges.length)} />
        </section>

        <section className="mt-8">
          <h2 className="font-bold mb-3 text-lg">{t.resumenLecciones[lang]}</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-foreground/60 border-b border-foreground/10">
                <th className="py-1.5 pr-2">#</th>
                <th className="py-1.5 pr-2">{t.leccion[lang]}</th>
                <th className="py-1.5 pr-2">{t.completada[lang]}</th>
                <th className="py-1.5">{t.acierto[lang]}</th>
              </tr>
            </thead>
            <tbody>
              {CATALOG.map((entry) => {
                const lessonKey = String(entry.n);
                const isDone = summary.completedSet.has(lessonKey);
                const ex = summary.exerciseStats[lessonKey];
                const pct = ex ? Math.round((ex.score / ex.total) * 100) : null;
                return (
                  <tr key={entry.n} className="border-b border-foreground/5">
                    <td className="py-1.5 pr-2 text-foreground/50">{entry.n}</td>
                    <td className="py-1.5 pr-2">{entry.title}</td>
                    <td className="py-1.5 pr-2">{isDone ? "✓" : "—"}</td>
                    <td className="py-1.5">{pct != null ? `${pct}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {summary.badges.length > 0 && (
          <section className="mt-8">
            <h2 className="font-bold mb-3 text-lg">{t.insigniasGanadas[lang]}</h2>
            <ul className="flex flex-wrap gap-2">
              {summary.badges.map((b, i) => (
                <li key={i} className="kid-card print:border print:border-foreground/20 p-2 px-3 inline-flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-primary" /> {b.name}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-10 pt-4 border-t border-foreground/10 text-xs text-foreground/50">
          {copyrightLine()}
        </footer>
      </div>
    </main>
  );
}

function ReportStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="kid-card print:border print:border-foreground/20 p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center print:hidden">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-foreground/60">{label}</div>
        <div className="font-bold truncate">{value}</div>
      </div>
    </div>
  );
}
