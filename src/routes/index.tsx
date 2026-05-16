import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, ListChecks, PencilLine, Users } from "lucide-react";
import { CoverInspiredPanel } from "@/components/CoverInspiredPanel";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel - Plataforma escolar" },
      {
        name: "description",
        content:
          "Plataforma digital escolar de La Cartilla de Gretel para lectura, lecciones, practica y seguimiento docente.",
      },
    ],
  }),
});

const primaryActions = [
  {
    to: "/book" as const,
    icon: BookOpen,
    label: "Leer libro",
    desc: "PDF oficial",
    color: "bg-[hsl(197,41%,22%)]",
  },
  {
    to: "/cartilla/lecciones" as const,
    icon: Users,
    label: "Estudiantes",
    desc: "Lecciones",
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

function Landing() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 rounded-3xl border border-foreground/10 bg-white/90 p-3 shadow-xl shadow-primary/10 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="px-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/55">
            Plataforma escolar
          </p>
          <p className="text-lg font-black text-[hsl(197,41%,22%)]">La Cartilla de Gretel</p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {primaryActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group grid min-h-20 grid-cols-[44px_1fr] items-center gap-3 rounded-2xl border border-foreground/10 bg-card p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:outline-primary"
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

      <header className="mx-auto grid max-w-6xl items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <CoverInspiredPanel />
        <div className="text-center lg:text-left">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-vowel-a">
            Lectura inicial en espanol
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-[hsl(197,41%,22%)] sm:text-6xl">
            Una entrada clara para estudiantes y docentes.
          </h1>
          <p className="mt-5 text-xl leading-relaxed text-foreground/75">
            Acceso rapido al libro, a las 24 lecciones, a la practica guiada y al panel de clase
            desde una pantalla sencilla y de alto contraste.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              to="/cartilla/lecciones"
              className="tap-target inline-flex items-center justify-center gap-3 rounded-2xl bg-[hsl(197,41%,22%)] px-6 py-4 text-lg font-black text-white shadow-lg shadow-[hsl(197,41%,22%)]/25"
            >
              <ListChecks className="h-5 w-5" /> Comenzar lecciones
            </Link>
            <Link
              to="/book"
              className="tap-target inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-[hsl(197,41%,22%)] bg-card px-6 py-4 text-lg font-black text-[hsl(197,41%,22%)] shadow-lg shadow-primary/10"
            >
              <BookOpen className="h-5 w-5" /> Abrir libro
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-4 pb-12 md:grid-cols-3">
        {[
          ["Para estudiantes", "Botones grandes, lecciones ordenadas y practica rapida."],
          ["Para docentes", "Panel de clase, codigos de alumnos y seguimiento de progreso."],
          [
            "Para lectura",
            "Lector PDF separado para consultar el libro oficial sin distracciones.",
          ],
        ].map(([title, copy]) => (
          <div key={title} className="kid-card p-6">
            <h2 className="text-xl font-black text-[hsl(197,41%,22%)]">{title}</h2>
            <p className="mt-2 text-base leading-relaxed text-foreground/70">{copy}</p>
          </div>
        ))}
      </section>

      <footer className="pb-8 text-center text-sm font-semibold text-foreground/55">
        <p>La Cartilla de Gretel · Leonor Lopetegui</p>
      </footer>
    </main>
  );
}
