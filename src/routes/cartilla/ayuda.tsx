import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BookOpen, GraduationCap, Users } from "lucide-react";

export const Route = createFileRoute("/cartilla/ayuda")({
  component: AyudaPage,
  head: () => ({
    meta: [
      { title: "Ayuda — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Instrucciones en español e inglés para estudiantes, familias y docentes.",
      },
    ],
  }),
});

type Audience = "student" | "teacher";
type Lang = "es" | "en";

const COPY = {
  student: {
    es: {
      title: "Ayuda para estudiantes y familias",
      intro:
        "La Cartilla de Gretel es el cuaderno oficial de lectura. Aquí se practica con las páginas reales del libro.",
      steps: [
        "Entra con el código de clase que te da tu maestra o maestro.",
        "Abre «Mis lecciones» y elige la lección que te toca (hay 24).",
        "Lee y practica en las páginas del libro. Algunas páginas tienen ejercicios para tocar, trazar o emparejar.",
        "Si falta una imagen mejorada, la app usa el dibujo restaurado o el escaneo original. No se inventa contenido.",
        "Tu progreso se guarda al completar ejercicios y al marcar la lección como terminada.",
        "«Mi progreso» muestra lo que ya hiciste. Puedes volver a una lección cuando quieras.",
      ],
      tips: [
        "Usa auriculares si practicas en un lugar ruidoso.",
        "Los botones grandes funcionan bien en tablet y teléfono.",
        "Si algo no carga, espera un momento o vuelve a entrar con el mismo código.",
      ],
    },
    en: {
      title: "Help for students and families",
      intro:
        "La Cartilla de Gretel is the official reading workbook. Students practice with the real book pages.",
      steps: [
        "Sign in with the class code from the teacher.",
        "Open “My lessons” and pick the assigned lesson (there are 24).",
        "Read and practice on the book pages. Some pages include tap, trace, or match exercises.",
        "If improved art is missing, the app falls back to a restored page or the original scan. Content is never invented.",
        "Progress is saved when exercises are completed and when a lesson is marked done.",
        "“My progress” shows completed work. Lessons can be revisited anytime.",
      ],
      tips: [
        "Headphones help in noisy places.",
        "Large buttons work well on phones and tablets.",
        "If something fails to load, wait a moment or sign in again with the same code.",
      ],
    },
  },
  teacher: {
    es: {
      title: "Ayuda para docentes",
      intro:
        "El panel del docente (CRM) está separado del camino del estudiante y de la pizarra (flipchart).",
      steps: [
        "Inicia sesión de docente en /login (no uses el código de estudiante).",
        "Crea o selecciona una clase. Comparte el código de unión con las familias.",
        "Asigna lecciones. El tablero muestra estados: no iniciado, en progreso, completado y asignado.",
        "Navega Panel → Clase → Estudiante → Lección para ver el detalle.",
        "Usa «Reporte para Familias» (imprimible) y la exportación CSV cuando necesites un resumen.",
        "La Guía del profesor y los recursos están en el hub del docente; el flipchart es otra ruta aparte.",
      ],
      tips: [
        "Hay un modo de demostración con datos de ejemplo si la nube no está configurada.",
        "Las pruebas de aislamiento entre docentes requieren variables de entorno de Supabase.",
        "No mezcles el camino del estudiante con el CRM: cada uno tiene su entrada.",
      ],
    },
    en: {
      title: "Help for teachers",
      intro: "The teacher CRM is separate from the student lane and the flipchart presenter.",
      steps: [
        "Sign in as a teacher at /login (do not use a student class code).",
        "Create or select a class. Share the join code with families.",
        "Assign lessons. The board shows not started, in progress, completed, and assigned states.",
        "Drill down Panel → Class → Student → Lesson for detail.",
        "Use the printable Family Report and CSV export when you need a summary.",
        "Teacher guide and resources live in the teacher hub; flipchart is a separate route.",
      ],
      tips: [
        "A seeded demo lane works when cloud credentials are not configured.",
        "Teacher-isolation (RLS) checks need Supabase environment variables.",
        "Keep the student path and CRM separate — each has its own entry.",
      ],
    },
  },
} as const;

function AyudaPage() {
  const [audience, setAudience] = useState<Audience>("student");
  const [lang, setLang] = useState<Lang>("es");
  const copy = COPY[audience][lang];

  return (
    <main className="min-h-screen bg-[#faf8f5] text-stone-900">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/cartilla"
            className="inline-flex items-center gap-2 min-h-12 min-w-12 px-4 py-3 rounded-2xl border-2 border-stone-300 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            {lang === "es" ? "Volver" : "Back"}
          </Link>
          <div
            className="flex gap-2"
            role="group"
            aria-label={lang === "es" ? "Idioma" : "Language"}
          >
            {(["es", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={`min-h-12 min-w-12 px-4 py-3 rounded-2xl border-2 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 ${
                  lang === code
                    ? "bg-amber-500 text-white border-amber-600"
                    : "bg-white border-stone-300"
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <header className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-wide text-stone-500">
            La Cartilla de Gretel
          </p>
          <h1 className="text-3xl md:text-4xl font-black">{copy.title}</h1>
          <p className="text-lg text-stone-700">{copy.intro}</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="tablist" aria-label="Audience">
          <button
            type="button"
            role="tab"
            aria-selected={audience === "student"}
            onClick={() => setAudience("student")}
            className={`min-h-14 flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 ${
              audience === "student"
                ? "bg-emerald-600 text-white border-emerald-700"
                : "bg-white border-stone-300"
            }`}
          >
            <Users className="w-6 h-6 shrink-0" aria-hidden="true" />
            {lang === "es" ? "Estudiante / Familia" : "Student / Family"}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={audience === "teacher"}
            onClick={() => setAudience("teacher")}
            className={`min-h-14 flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 ${
              audience === "teacher"
                ? "bg-sky-700 text-white border-sky-800"
                : "bg-white border-stone-300"
            }`}
          >
            <GraduationCap className="w-6 h-6 shrink-0" aria-hidden="true" />
            {lang === "es" ? "Docente" : "Teacher"}
          </button>
        </div>

        <section className="rounded-3xl border-2 border-stone-200 bg-white p-6 space-y-4 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5" aria-hidden="true" />
            {lang === "es" ? "Pasos" : "Steps"}
          </h2>
          <ol className="list-decimal pl-6 space-y-3 text-base leading-relaxed">
            {copy.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-6 space-y-3">
          <h2 className="text-xl font-bold">{lang === "es" ? "Consejos" : "Tips"}</h2>
          <ul className="list-disc pl-6 space-y-2">
            {copy.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border-2 border-stone-200 bg-white p-6 space-y-2 text-sm text-stone-600">
          <h2 className="text-lg font-bold text-stone-900">
            {lang === "es" ? "Créditos" : "Credits"}
          </h2>
          <p>
            {lang === "es" ? "Autora" : "Author"}: Leonor Lopetegui ·{" "}
            {lang === "es" ? "Ilustradora" : "Illustrator"}: Estela de Armas Plasencia
          </p>
          <p>{lang === "es" ? "Colaboradoras" : "Contributors"}: Silvia Diez, Aída Fernández</p>
          <p>{lang === "es" ? "Adaptación digital" : "Digital adaptation"}: Emilio José Novo</p>
        </section>

        <nav className="flex flex-wrap gap-3 pb-10">
          <Link
            to="/cartilla/lecciones"
            className="min-h-12 inline-flex items-center px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400"
          >
            {lang === "es" ? "Ir a lecciones" : "Go to lessons"}
          </Link>
          <Link
            to="/cartilla/teacher/crm"
            className="min-h-12 inline-flex items-center px-5 py-3 rounded-2xl border-2 border-stone-300 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400"
          >
            {lang === "es" ? "Panel docente" : "Teacher panel"}
          </Link>
          <Link
            to="/login"
            className="min-h-12 inline-flex items-center px-5 py-3 rounded-2xl border-2 border-stone-300 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400"
          >
            Login
          </Link>
        </nav>
      </div>
    </main>
  );
}
