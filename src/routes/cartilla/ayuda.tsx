import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Users,
  HelpCircle,
  Keyboard,
  Shield,
  Sparkles,
} from "lucide-react";
import { GRETEL_HERO } from "@/components/gretel/gretelPoses";

export const Route = createFileRoute("/cartilla/ayuda")({
  component: AyudaPage,
  head: () => ({
    meta: [
      { title: "Ayuda — La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "Instrucciones en español e inglés para estudiantes, familias y docentes. Cómo entrar, practicar y usar el panel del docente.",
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
        "La Cartilla de Gretel es el cuaderno oficial de lectura. Aquí se practica con las páginas reales del libro — no se inventa contenido.",
      steps: [
        "Entra con el código de clase que te da tu maestra o maestro (ruta «Unirse»).",
        "Abre «Mis lecciones» y elige la lección que te toca (hay 24 lecciones).",
        "Lee y practica en las páginas del libro. Algunas páginas tienen ejercicios para tocar, trazar o emparejar.",
        "Si falta una imagen mejorada, la app usa el dibujo restaurado o el escaneo original. Nunca se inventa arte.",
        "Tu progreso se guarda al completar ejercicios y al marcar la lección como terminada.",
        "«Mi progreso» muestra lo que ya hiciste. Puedes volver a una lección cuando quieras.",
      ],
      tips: [
        "Usa auriculares si practicas en un lugar ruidoso.",
        "Los botones grandes (al menos 44×44 px) funcionan bien en tablet y teléfono.",
        "Si algo no carga, espera un momento o vuelve a entrar con el mismo código.",
        "Gretel habla para animarte cuando aciertas o necesitas intentar de nuevo — no tapa el cuaderno.",
      ],
      faq: [
        {
          q: "¿Necesito una cuenta de correo?",
          a: "Los estudiantes entran con el código de clase. Las familias no crean una cuenta separada.",
        },
        {
          q: "¿Puedo usar el teléfono?",
          a: "Sí. La app está pensada para tablet y teléfono; los botones son grandes y fáciles de tocar.",
        },
        {
          q: "¿Qué pasa si pierdo el progreso?",
          a: "Vuelve a entrar con el mismo código y el mismo nombre de la lista. El progreso se guarda en la nube cuando está configurada.",
        },
        {
          q: "¿Quién es Gretel?",
          a: "Gretel es la guía del libro: cabello rubio ondulado, moño rojo y delantal azul. Te anima cuando practicas.",
        },
      ],
      a11yTitle: "Accesibilidad",
      a11y: [
        "Navegación con teclado: Tab y Enter en botones y enlaces.",
        "Foco visible en todos los controles interactivos.",
        "Respeta «reducir movimiento» del sistema (menos animaciones).",
        "Textos de ayuda y etiquetas en español primero.",
      ],
    },
    en: {
      title: "Help for students and families",
      intro:
        "La Cartilla de Gretel is the official reading workbook. Students practice with the real book pages — content is never invented.",
      steps: [
        "Sign in with the class code from the teacher (“Join” route).",
        "Open “My lessons” and pick the assigned lesson (there are 24).",
        "Read and practice on the book pages. Some pages include tap, trace, or match exercises.",
        "If improved art is missing, the app falls back to a restored page or the original scan. Art is never invented.",
        "Progress is saved when exercises are completed and when a lesson is marked done.",
        "“My progress” shows completed work. Lessons can be revisited anytime.",
      ],
      tips: [
        "Headphones help in noisy places.",
        "Large buttons (at least 44×44 px) work well on phones and tablets.",
        "If something fails to load, wait a moment or sign in again with the same code.",
        "Gretel speaks to encourage you — she never covers the workbook page.",
      ],
      faq: [
        {
          q: "Do I need an email account?",
          a: "Students join with a class code. Families do not create a separate account.",
        },
        {
          q: "Can I use a phone?",
          a: "Yes. The app is designed for tablets and phones with large touch targets.",
        },
        {
          q: "What if progress is missing?",
          a: "Sign in again with the same class code and student name from the roster. Progress saves to the cloud when configured.",
        },
        {
          q: "Who is Gretel?",
          a: "Gretel is the book’s guide: golden wavy hair, red bow, and blue overalls. She cheers you on while you practice.",
        },
      ],
      a11yTitle: "Accessibility",
      a11y: [
        "Keyboard: Tab and Enter on buttons and links.",
        "Visible focus on interactive controls.",
        "Honors system “reduce motion” (fewer animations).",
        "Help text and labels are Spanish-first.",
      ],
    },
  },
  teacher: {
    es: {
      title: "Ayuda para docentes",
      intro:
        "El panel del docente (CRM) está separado del camino del estudiante y de la pizarra (flipchart). No mezcles las entradas.",
      steps: [
        "Inicia sesión de docente en /login (no uses el código de estudiante).",
        "Crea o selecciona una clase. Comparte el código de unión con las familias.",
        "Asigna lecciones. El tablero muestra estados: no iniciado, en progreso, completado y asignado.",
        "Navega Panel → Clase → Estudiante → Lección para ver el detalle.",
        "Usa «Reporte para Familias» (imprimible) y la exportación CSV cuando necesites un resumen.",
        "La Guía del profesor y los recursos están en el hub del docente; el flipchart es otra ruta aparte (presentar).",
      ],
      tips: [
        "Hay un modo de demostración con datos de ejemplo si la nube no está configurada.",
        "Las pruebas de aislamiento entre docentes requieren variables de entorno de Supabase.",
        "No pongas a Gretel sobre pantallas de datos del CRM — el avatar vive en el camino del estudiante.",
        "Desde el menú lateral del CRM puedes abrir esta Ayuda en cualquier momento.",
      ],
      faq: [
        {
          q: "¿Dónde está el flipchart?",
          a: "En la ruta de presentación del docente (presentar), no dentro del CRM de progreso.",
        },
        {
          q: "¿Cómo veo el progreso de un alumno?",
          a: "Tablero → clase → estudiante → lección. También hay reportes y exportación CSV.",
        },
        {
          q: "¿El estudiante y el docente usan la misma entrada?",
          a: "No. Estudiantes: código de clase. Docentes: /login con cuenta de maestro.",
        },
        {
          q: "¿Puedo imprimir para las familias?",
          a: "Sí — «Reporte para Familias» está pensado para imprimir o compartir.",
        },
      ],
      a11yTitle: "Accesibilidad en el panel",
      a11y: [
        "Enlaces del menú con altura mínima de 44 px.",
        "Iconos decorativos marcados como aria-hidden; texto visible al lado.",
        "Contraste de texto sobre fondos claros del CRM.",
        "Foco visible en botones y campos de formulario.",
      ],
    },
    en: {
      title: "Help for teachers",
      intro:
        "The teacher CRM is separate from the student lane and the flipchart presenter. Keep entry points separate.",
      steps: [
        "Sign in as a teacher at /login (do not use a student class code).",
        "Create or select a class. Share the join code with families.",
        "Assign lessons. The board shows not started, in progress, completed, and assigned states.",
        "Drill down Panel → Class → Student → Lesson for detail.",
        "Use the printable Family Report and CSV export when you need a summary.",
        "Teacher guide and resources live in the teacher hub; flipchart is a separate present route.",
      ],
      tips: [
        "A seeded demo lane works when cloud credentials are not configured.",
        "Teacher-isolation (RLS) checks need Supabase environment variables.",
        "Do not place Gretel over CRM data screens — the avatar belongs on the student path.",
        "Open this Help page anytime from the CRM sidebar.",
      ],
      faq: [
        {
          q: "Where is the flipchart?",
          a: "On the teacher present route — not inside the progress CRM.",
        },
        {
          q: "How do I see one student’s progress?",
          a: "Board → class → student → lesson. Reports and CSV export are also available.",
        },
        {
          q: "Do students and teachers share the same entry?",
          a: "No. Students: class code. Teachers: /login with a teacher account.",
        },
        {
          q: "Can I print for families?",
          a: "Yes — the Family Report is designed to print or share.",
        },
      ],
      a11yTitle: "Accessibility in the panel",
      a11y: [
        "Sidebar links use a minimum 44 px height.",
        "Decorative icons are aria-hidden with visible text labels.",
        "Text contrast on light CRM backgrounds.",
        "Visible focus on buttons and form fields.",
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
                    : "bg-white border-stone-300 text-stone-900"
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <header className="flex flex-col sm:flex-row sm:items-start gap-4">
          <img
            src={GRETEL_HERO.cutout}
            alt=""
            width={112}
            height={140}
            className="w-24 h-auto object-contain shrink-0 mx-auto sm:mx-0"
            decoding="async"
            loading="lazy"
            aria-hidden="true"
          />
          <div className="space-y-2 text-center sm:text-left">
            <p className="text-sm font-bold uppercase tracking-wide text-stone-600">
              La Cartilla de Gretel
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-stone-900">{copy.title}</h1>
            <p className="text-lg text-stone-800">{copy.intro}</p>
          </div>
        </header>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          role="tablist"
          aria-label={lang === "es" ? "Audiencia" : "Audience"}
        >
          <button
            type="button"
            role="tab"
            id="tab-student"
            aria-controls="ayuda-panel"
            aria-selected={audience === "student"}
            onClick={() => setAudience("student")}
            className={`min-h-14 flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 ${
              audience === "student"
                ? "bg-emerald-700 text-white border-emerald-800"
                : "bg-white border-stone-300 text-stone-900"
            }`}
          >
            <Users className="w-6 h-6 shrink-0" aria-hidden="true" />
            {lang === "es" ? "Estudiante / Familia" : "Student / Family"}
          </button>
          <button
            type="button"
            role="tab"
            id="tab-teacher"
            aria-controls="ayuda-panel"
            aria-selected={audience === "teacher"}
            onClick={() => setAudience("teacher")}
            className={`min-h-14 flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 ${
              audience === "teacher"
                ? "bg-sky-800 text-white border-sky-900"
                : "bg-white border-stone-300 text-stone-900"
            }`}
          >
            <GraduationCap className="w-6 h-6 shrink-0" aria-hidden="true" />
            {lang === "es" ? "Docente" : "Teacher"}
          </button>
        </div>

        <div id="ayuda-panel" role="tabpanel" aria-labelledby={audience === "student" ? "tab-student" : "tab-teacher"} className="space-y-6">
          <section className="rounded-3xl border-2 border-stone-200 bg-white p-6 space-y-4 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 text-stone-900">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              {lang === "es" ? "Pasos" : "Steps"}
            </h2>
            <ol className="list-decimal pl-6 space-y-3 text-base leading-relaxed text-stone-800">
              {copy.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-6 space-y-3">
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              {lang === "es" ? "Consejos" : "Tips"}
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-stone-800">
              {copy.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border-2 border-stone-200 bg-white p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-stone-900">
              <HelpCircle className="w-5 h-5" aria-hidden="true" />
              FAQ
            </h2>
            <dl className="space-y-4">
              {copy.faq.map((item) => (
                <div key={item.q}>
                  <dt className="font-bold text-stone-900">{item.q}</dt>
                  <dd className="mt-1 text-stone-700 leading-relaxed">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/60 p-6 space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2 text-stone-900">
              <Keyboard className="w-5 h-5" aria-hidden="true" />
              {copy.a11yTitle}
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-stone-800">
              {copy.a11y.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border-2 border-stone-200 bg-white p-6 space-y-2 text-sm text-stone-700">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Shield className="w-5 h-5" aria-hidden="true" />
              {lang === "es" ? "Créditos" : "Credits"}
            </h2>
            <p>
              {lang === "es" ? "Autora" : "Author"}: Leonor Lopetegui ·{" "}
              {lang === "es" ? "Ilustradora" : "Illustrator"}: Estela de Armas Plasencia
            </p>
            <p>
              {lang === "es" ? "Colaboradoras" : "Contributors"}: Silvia Diez, Aída Fernández
            </p>
            <p>
              {lang === "es" ? "Adaptación digital" : "Digital adaptation"}: Emilio José Novo ·
              LANY Books
            </p>
          </section>
        </div>

        <nav
          className="flex flex-wrap gap-3 pb-10"
          aria-label={lang === "es" ? "Enlaces útiles" : "Useful links"}
        >
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
          <Link
            to="/cartilla/unirse"
            className="min-h-12 inline-flex items-center px-5 py-3 rounded-2xl border-2 border-stone-300 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400"
          >
            {lang === "es" ? "Unirse con código" : "Join with code"}
          </Link>
        </nav>
      </div>
    </main>
  );
}
