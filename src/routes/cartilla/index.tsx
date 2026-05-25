import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  GraduationCap,
  ListOrdered,
  Presentation,
  UserPlus,
} from "lucide-react";
import { CoverInspiredPanel } from "@/components/CoverInspiredPanel";
import { useStudentSession } from "@/lib/student-session";

export const Route = createFileRoute("/cartilla/")({
  component: CartillaHome,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel - plataforma de aula" },
      {
        name: "description",
        content:
          "Plataforma de aula para La Cartilla de Gretel: cuaderno del estudiante, panel docente y presentación del maestro.",
      },
      { property: "og:title", content: "La Cartilla de Gretel - plataforma de aula" },
      {
        property: "og:description",
        content:
          "Cuaderno del estudiante, panel docente y presentación del maestro en un solo sistema.",
      },
    ],
  }),
});

function CartillaHome() {
  const session = useStudentSession();

  const primaryCards = [
    {
      to: "/cartilla/lecciones" as const,
      icon: BookOpen,
      title: "Cuaderno del estudiante",
      desc: "Abrir las 24 lecciones del cuaderno. Puedes explorar sin iniciar sesión.",
      color: "bg-[hsl(197,41%,22%)]",
    },
    {
      to: "/cartilla/teacher" as const,
      icon: GraduationCap,
      title: "Panel docente",
      desc: "Gestionar clases, alumnos, asignaciones y progreso.",
      color: "bg-vowel-o",
    },
    {
      to: "/cartilla/teacher/flipchart" as const,
      icon: Presentation,
      title: "Presentación del maestro",
      desc: "Abrir el flipchart para seguir la clase en pantalla.",
      color: "bg-vowel-a",
    },
  ];

  const secondaryCards = [
    {
      to: session ? ("/cartilla/mi-progreso" as const) : ("/cartilla/unirse" as const),
      icon: session ? BarChart3 : UserPlus,
      title: session ? "Mi progreso" : "Unirse a una clase",
      desc: session
        ? `Hola ${session.studentName}. Revisa tu progreso guardado.`
        : "Opcional: usa un código de clase si tu maestro te lo dio.",
      color: "bg-vowel-i",
    },
    {
      to: "/book" as const,
      icon: ListOrdered,
      title: "PDF oficial",
      desc: "Consultar el PDF del libro cuando haga falta.",
      color: "bg-[hsl(197,41%,22%)]",
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
          <div className="flex flex-wrap gap-2">
            <Link
              to="/cartilla/lecciones"
              className="rounded-2xl bg-[hsl(197,41%,22%)] px-4 py-3 text-sm font-black text-white shadow-sm"
            >
              Cuaderno
            </Link>
            <Link
              to="/cartilla/teacher"
              className="rounded-2xl border border-foreground/10 bg-card px-4 py-3 text-sm font-black text-foreground/75 shadow-sm"
            >
              Docentes
            </Link>
            <Link
              to="/cartilla/teacher/flipchart"
              className="rounded-2xl border border-foreground/10 bg-card px-4 py-3 text-sm font-black text-foreground/75 shadow-sm"
            >
              Flipchart
            </Link>
          </div>
        </nav>

        <header className="mt-8 grid items-center gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <CoverInspiredPanel compact />
          <div className="text-center lg:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-vowel-a">
              Plataforma de aula
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-[hsl(197,41%,22%)] sm:text-6xl">
              Cuaderno, panel docente y presentación en un solo sistema.
            </h1>
            <p className="mt-4 text-xl leading-relaxed text-foreground/75">
              Explora el cuaderno sin iniciar sesión. Únete a una clase solo si tu maestro
              te dio un código para guardar progreso y recibir asignaciones.
            </p>
          </div>
        </header>

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          {primaryCards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="kid-card group grid min-h-48 grid-cols-[72px_1fr] items-start gap-4 p-6 transition duration-300 hover:-translate-y-1"
            >
              <div
                className={`flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl ${c.color} text-white transition duration-300 group-hover:scale-105`}
              >
                <c.icon className="h-9 w-9" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[hsl(197,41%,22%)]">{c.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-foreground/75">{c.desc}</p>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {secondaryCards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="rounded-3xl border border-foreground/10 bg-white/85 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${c.color} text-white`}>
                  <c.icon className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[hsl(197,41%,22%)]">{c.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/70">{c.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
