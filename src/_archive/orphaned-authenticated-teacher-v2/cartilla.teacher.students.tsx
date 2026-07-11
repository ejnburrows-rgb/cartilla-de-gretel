import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/useServerFn";
import { getAllTeacherStudents } from "@/lib/teacher.functions";
import { Loader2, ArrowLeft, User, Calendar, BookOpen } from "lucide-react";
import { TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { useLanguage } from "@/context/LanguageContext";
import { tCopy } from "@/content/teacher-copy";

export const Route = createFileRoute("/_authenticated/cartilla/teacher/students")({
  component: StudentsOverview,
  head: () => ({
    meta: [{ title: "Estudiantes — La Cartilla de Gretel CRM" }],
  }),
});

function StudentsOverview() {
  const { lang } = useLanguage();
  const t = tCopy;
  const fetchStudents = useServerFn(getAllTeacherStudents);
  const { data: students, isLoading } = useQuery({
    queryKey: ["teacher", "all-students"],
    queryFn: () => fetchStudents({ data: {} }),
  });

  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[#fdfbf7] p-6 max-w-4xl mx-auto flex flex-col gap-4 animate-pulse">
        <div className="h-8 w-32 bg-stone-200 rounded-lg mb-4" />
        <div className="h-24 w-full bg-stone-200 rounded-[2rem]" />
        <div className="h-24 w-full bg-stone-200 rounded-[2rem]" />
        <div className="h-24 w-full bg-stone-200 rounded-[2rem]" />
      </main>
    );
  }

  const sortedStudents = [...(students || [])].sort((a, b) => {
    if (!a.lastSeen) return 1;
    if (!b.lastSeen) return -1;
    return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
  });

  return (
    <main className="min-h-[100dvh] bg-[#fdfbf7] px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto w-full">
      <Link
        to="/cartilla/teacher"
        className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors h-11"
      >
        <ArrowLeft className="w-4 h-4" /> {t.volverDashboard[lang]}
      </Link>
      
      <header className="mt-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-stone-800 font-fredoka">{t.todosLosAlumnos[lang] ?? "Todos los Alumnos"}</h1>
        <p className="text-sm font-bold text-stone-500 mt-1">{t.vistaGeneralAlumnos[lang] ?? "Vista general del avance de tus alumnos en todas las clases."}</p>
      </header>

      {sortedStudents.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-[2rem] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-stone-800 font-fredoka mb-2">{t.aunNoHayEstudiantes[lang] ?? "Aún no hay estudiantes en tu clase."}</h2>
          <p className="text-sm font-bold text-stone-500">
            {t.anadeEstudiantes[lang] ?? "Añade estudiantes en el panel principal para ver su progreso aquí."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedStudents.map(s => (
            <li key={s.id}>
              <Link
                to="/cartilla/teacher/alumno/$id"
                params={{ id: s.id }}
                className="bg-white border-2 border-stone-100 p-5 rounded-[2rem] block hover:border-[#8da47e] transition-colors shadow-sm h-full"
              >
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex justify-between items-start gap-4">
                    <div className="font-black text-lg text-stone-800 flex items-center gap-2 line-clamp-1 flex-1">
                      <div className="w-8 h-8 rounded-full bg-[hsl(198,78%,95%)] text-[#4da8da] flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="truncate">{s.display_name}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-1 font-black bg-stone-100 px-2.5 py-1.5 rounded-xl shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      {s.lastSeen ? new Date(s.lastSeen).toLocaleDateString() : t.nunca[lang]}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="flex justify-between text-xs font-black text-stone-600">
                      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-[#8da47e]"/> {t.leccionesCompletadas[lang]}</span>
                      <span>{s.lessons} / {TOTAL_LESSONS}</span>
                    </div>
                    <div className="h-3.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/50">
                      <div 
                        className="h-full bg-gradient-to-r from-[#a3bd93] to-[#8da47e] transition-all duration-500 ease-out" 
                        style={{ width: `${Math.min(100, (s.lessons / TOTAL_LESSONS) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
