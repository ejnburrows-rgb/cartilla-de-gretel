import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, Printer, Award, Loader2, Star } from "lucide-react";
import { getStudentProgress } from "@/lib/teacher.functions";
import { TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { summarizeStudentEvents } from "@/lib/student-summary";
import { BRANDING } from "@/lib/branding";
import { useLanguage } from "@/context/LanguageContext";
import { tCopy } from "@/content/teacher-copy";

export const Route = createFileRoute("/_authenticated/cartilla/teacher/alumno/$id/certificado")({
  component: StudentCertificate,
});

function StudentCertificate() {
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

  const dateStr = new Date().toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-background px-4 py-6 print:bg-white print:px-0 print:py-0">
      <div className="print:hidden flex items-center justify-between gap-3 max-w-3xl mx-auto mb-6">
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

      <div
        className="max-w-3xl mx-auto p-10 text-center print:p-0"
        style={{ border: "10px solid #3b82f6", borderRadius: "1.5rem" }}
      >
        <div className="flex justify-center gap-2 text-primary mb-2">
          <Star className="w-6 h-6" />
          <Award className="w-8 h-8" />
          <Star className="w-6 h-6" />
        </div>
        <div className="text-sm font-bold uppercase tracking-widest text-foreground/50">
          {BRANDING.productName}
        </div>
        <h1 className="text-4xl font-bold mt-4 text-primary">{t.felicidades[lang]}</h1>
        <p className="text-sm text-foreground/60 mt-4">{t.otorgadoA[lang]}</p>
        <h2 className="text-3xl font-bold mt-1">{data.student.display_name}</h2>
        <p className="mt-6 text-base max-w-lg mx-auto">
          {summary.completedCount} {summary.completedCount === 1 ? t.leccion[lang] : t.leccionesCount[lang]}
          {" "}/{" "}{TOTAL_LESSONS} {t.certificaQueObtuvo[lang]}
        </p>

        {summary.badges.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {summary.badges.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold"
              >
                <Award className="w-4 h-4" /> {b.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-4 text-sm text-foreground/60">
          <div>
            {t.fecha[lang]}: {dateStr}
          </div>
          <div>{BRANDING.author}</div>
        </div>
      </div>
    </main>
  );
}
