import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  GraduationCap,
  ListOrdered,
  MousePointerClick,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { useStudentSession } from "@/lib/student-session";

export const Route = createFileRoute("/cartilla/")({
  component: CartillaHome,
  head: () => ({
    meta: [
      { title: "Cartilla digital - La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "Cartilla digital interactiva: 24 lecciones, ejercicios, evaluaciones, prueba FAST y panel de maestro.",
      },
      { property: "og:title", content: "La Cartilla de Gretel - Edición digital interactiva" },
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
            desc: `Hola ${session.studentName} - revisa tus lecciones, aciertos e insignias.`,
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
    <main className="mx-auto min-h-screen max-w-5xl bg-background px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-2xl bg-card px-4 py-3 text-sm font-bold text-foreground/70 shadow-sm hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Inicio
      </Link>
      <header className="mt-6 grid items-center gap-6 rounded-3xl bg-card/85 p-5 shadow-xl shadow-primary/10 md:grid-cols-[180px_1fr]">
        <img
          src="/cartilla/images/cover.png"
          alt="Portada de La Cartilla de Gretel"
          className="mx-auto w-36 rounded-2xl border-4 border-white shadow-lg md:w-44"
        />
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-primary sm:text-5xl">La Cartilla de Gretel</h1>
          <p className="mt-3 text-xl text-foreground/75">
            Edición digital interactiva - método fonético K-2.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm font-bold">
            <MousePointerClick className="h-5 w-5" />
            Botones grandes para escoger la actividad
          </div>
        </div>
      </header>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="kid-card group flex items-start gap-4 p-6 transition duration-300 hover:-translate-y-1"
          >
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${c.color} text-white transition duration-300 group-hover:scale-105`}
            >
              <c.icon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{c.title}</h2>
              <p className="mt-1 text-base text-foreground/75">{c.desc}</p>
            </div>
          </Link>
        ))}
      </section>
      <p className="mt-12 text-center text-sm text-foreground/60">
        ¿Prefieres leer el libro?{" "}
        <Link to="/book" className="inline-flex items-center gap-1 font-bold underline">
          <BookOpen className="h-4 w-4" /> Abrir lector
        </Link>
      </p>
    </main>
  );
}
