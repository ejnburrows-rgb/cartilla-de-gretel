import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  User,
  ListOrdered,
  ArrowLeft,
  BarChart3,
  Sparkles,
  Zap,
} from "lucide-react";
import { useStudentSession } from "@/lib/student-session";

export const Route = createFileRoute("/cartilla/")({
  component: CartillaHome,
  head: () => ({
    meta: [
      { title: "Cartilla digital — La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "Cartilla digital interactiva: 24 lecciones, ejercicios, evaluaciones, prueba FAST y panel de maestro.",
      },
      { property: "og:title", content: "La Cartilla de Gretel — Edición digital interactiva" },
      {
        property: "og:description",
        content:
          "Método fonético K-2 con 24 lecciones, ejercicios interactivos y panel de maestro.",
      },
    ],
  }),
});

function CartillaHome() {
  const session = useStudentSession();
  const cards = [
    {
      to: "/cartilla/lecciones" as const,
      icon: ListOrdered,
      title: "Las 24 lecciones",
      desc: "Aprende paso a paso, vocal por vocal y consonante por consonante.",
      color: "bg-primary",
    },
    {
      to: "/cartilla/practica" as const,
      icon: Zap,
      title: "Práctica rápida",
      desc: "Drill de 60 segundos: identifica sílabas a toda velocidad.",
      color: "bg-vowel-o",
    },
    ...(session
      ? [
          {
            to: "/cartilla/mi-progreso" as const,
            icon: BarChart3,
            title: "Mi progreso",
            desc: `Hola ${session.studentName} — revisa tus lecciones, aciertos e insignias.`,
            color: "bg-vowel-a",
          },
          {
            to: "/cartilla/repaso" as const,
            icon: Sparkles,
            title: "Modo repaso",
            desc: "Practica las lecciones donde fallaste y refuerza lo pendiente.",
            color: "bg-vowel-e",
          },
        ]
      : [
          {
            to: "/cartilla/unirse" as const,
            icon: User,
            title: "Soy estudiante",
            desc: "Únete a tu clase con el código que te dio tu maestra o maestro.",
            color: "bg-vowel-i",
          },
        ]),
    {
      to: "/cartilla/teacher" as const,
      icon: GraduationCap,
      title: "Panel de Maestro",
      desc: "Crea clases, agrega alumnos y revisa el progreso real.",
      color: "bg-vowel-o",
    },
    {
      to: "/cartilla/autora" as const,
      icon: User,
      title: "La autora",
      desc: "Conoce a Leonor Lopetegui, autora del método.",
      color: "bg-vowel-u",
    },
  ];
  return (
    <main className="min-h-screen bg-background px-4 py-8 max-w-4xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Inicio
      </Link>
      <header className="mt-6 text-center">
        <h1 className="float-soft text-4xl sm:text-5xl font-bold bg-gradient-to-br from-primary via-vowel-i to-vowel-o bg-clip-text text-transparent">
          La Cartilla de Gretel
        </h1>
        <p className="mt-3 text-foreground/70">
          Edición digital interactiva — método fonético K-2.
        </p>
      </header>
      <section className="mt-10 grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="kid-card group p-6 flex items-start gap-4 hover:-translate-y-1 transition duration-300"
          >
            <div
              className={`shrink-0 w-12 h-12 rounded-2xl ${c.color} text-white flex items-center justify-center transition duration-300 group-hover:scale-110 group-hover:rotate-3`}
            >
              <c.icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{c.title}</h2>
              <p className="text-sm text-foreground/70 mt-1">{c.desc}</p>
            </div>
          </Link>
        ))}
      </section>
      <p className="mt-12 text-center text-xs text-foreground/50">
        ¿Prefieres leer el libro?{" "}
        <Link to="/book" className="underline font-bold inline-flex items-center gap-1">
          <BookOpen className="w-3 h-3" /> Abrir lector
        </Link>
      </p>
    </main>
  );
}
