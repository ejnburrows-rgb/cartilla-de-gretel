import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  GraduationCap,
  ListOrdered,
  PencilLine,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { CoverInspiredPanel } from "@/components/CoverInspiredPanel";
import { useStudentSession } from "@/lib/student-session";

export const Route = createFileRoute("/cartilla/")({
  component: CartillaHome,
  head: () => ({
    meta: [
      { title: "Cartilla digital - La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "Cartilla digital interactiva: 24 lecciones, ejercicios, evaluaciones y panel de maestro.",
      },
      { property: "og:title", content: "La Cartilla de Gretel - Edicion digital escolar" },
      {
        property: "og:description",
        content: "Metodo fonetico K-2 con 24 lecciones, ejercicios interactivos y panel docente.",
      },
    ],
  }),
});

function CartillaHome() {
  const session = useStudentSession();
  const roleActions = [
    {
      to: "/book" as const,
      icon: BookOpen,
      label: "Leer libro",
      desc: "PDF oficial",
      color: "bg-[hsl(197,41%,22%)]",
    },
    {
      to: session ? ("/cartilla/mi-progreso" as const) : ("/cartilla/unirse" as const),
      icon: User,
      label: "Estudiantes",
      desc: session ? "Mi progreso" : "Unirse a clase",
      color: "bg-vowel-i",
    },
    {
      to: "/cartilla/teacher" as const,
      icon: GraduationCap,
      label: "Docentes",
      desc: "Panel de clase",
      color: "bg-vowel-o",
    },
    {
      to: "/cartilla/practica" as const,
      icon: PencilLine,
      label: "Practica",
      desc: "60 segundos",
      color: "bg-vowel-a",
    },
  ];

  const cards = [
    {
      to: "/cartilla/lecciones" as const,
      icon: ListOrdered,
      title: "Las 24 lecciones",
      desc: "Ruta ordenada para trabajar vocales, consonantes, silabas y palabras.",
      color: "bg-[hsl(197,41%,22%)]",
    },
    {
      to: "/cartilla/practica" as const,
      icon: Zap,
      title: "Practica rapida",
      desc: "Ejercicios cortos para reforzar reconocimiento de silabas.",
      color: "bg-vowel-a",
    },
    ...(session
      ? [
          {
            to: "/cartilla/mi-progreso" as const,
            icon: BarChart3,
            title: "Mi progreso",
            desc: `Hola ${session.studentName} - revisa tus lecciones, aciertos e insignias.`,
            color: "bg-vowel-i",
          },
          {
            to: "/cartilla/repaso" as const,
            icon: Sparkles,
            title: "Modo repaso",
            desc: "Practica las lecciones donde necesitas mas apoyo.",
            color: "bg-vowel-e",
          },
        ]
      : [
          {
            to: "/cartilla/unirse" as const,
            icon: User,
            title: "Soy estudiante",
            desc: "Entra con el codigo de clase y tu codigo personal.",
            color: "bg-vowel-i",
          },
        ]),
    {
      to: "/cartilla/teacher" as const,
      icon: GraduationCap,
      title: "Panel docente",
      desc: "Crea clases, agrega alumnos y revisa el progreso.",
      color: "bg-vowel-o",
    },
    {
      to: "/cartilla/autora" as const,
      icon: User,
      title: "La autora",
      desc: "Conoce a Leonor Lopetegui y el enfoque de la cartilla.",
      color: "bg-vowel-u",
    },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-col gap-3 rounded-3xl border border-foreground/10 bg-white/90 p-3 shadow-xl shadow-primary/10 backdrop-blur md:flex-row md:items-center md:justify-between">
          <Link
            to="/"
            className="inline-flex min-h-14 items-center gap-2 rounded-2xl px-3 text-sm font-black text-foreground/70 hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Inicio
          </Link>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {roleActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="group grid min-h-20 grid-cols-[44px_1fr] items-center gap-3 rounded-2xl border border-foreground/10 bg-card p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
              >
                <span
                  className={`${action.color} flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md shadow-black/10`}
                >
                  <action.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-base font-black leading-tight">{action.label}</span>
                  <span className="block text-sm font-semibold text-foreground/60">
                    {action.desc}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </nav>

        <header className="mt-8 grid items-center gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <CoverInspiredPanel compact />
          <div className="text-center lg:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-vowel-a">
              Plataforma de aula
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-[hsl(197,41%,22%)] sm:text-6xl">
              Lecciones, practica y progreso en un solo lugar.
            </h1>
            <p className="mt-4 text-xl leading-relaxed text-foreground/75">
              Una experiencia clara para estudiantes y docentes, con botones grandes y rutas
              directas para el trabajo diario.
            </p>
          </div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="kid-card group grid min-h-40 grid-cols-[64px_1fr] items-start gap-4 p-6 transition duration-300 hover:-translate-y-1"
            >
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${c.color} text-white transition duration-300 group-hover:scale-105`}
              >
                <c.icon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[hsl(197,41%,22%)]">{c.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-foreground/75">{c.desc}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
