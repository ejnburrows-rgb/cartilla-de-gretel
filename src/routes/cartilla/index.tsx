/**
 * index.tsx — Lane A
 *
 * /cartilla landing:
 * - Hero with book cover art from manifest (manifest.cover)
 * - Grid of 24 lesson tiles: character art + letter + Spanish caption
 * - No placeholder copy
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { CATALOG } from "@/lib/lesson-catalog";
import { useStudentSession } from "@/lib/student-session";
import { useLessonProgress } from "@/lib/lesson-progress";
import { useBookArt } from "@/hooks/useBookArt";
import { PageBackground } from "@/components/art/PageBackground";
import { SparkleField } from "@/components/art/SparkleField";
import { BookArtFigure } from "@/components/cartilla/BookArtFigure";
import "@/styles/cartilla-student.css";

export const Route = createFileRoute("/cartilla/")({
  component: CartillaHome,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel — Inicio" },
      {
        name: "description",
        content:
          "Cartilla digital interactiva: 24 lecciones fonéticas K-2, ejercicios, evaluaciones y panel de maestro.",
      },
      { property: "og:title", content: "La Cartilla de Gretel — Edición digital interactiva" },
      {
        property: "og:description",
        content: "Método fonético K-2 con 24 lecciones, ejercicios interactivos y panel de maestro.",
      },
    ],
  }),
});

function CartillaHome() {
  const session = useStudentSession();
  const { isCompleted } = useLessonProgress();

  const navCards = [
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
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      <PageBackground letter="a" className="fixed inset-0 -z-10 w-full h-full opacity-60 mix-blend-multiply" />
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <SparkleField animated={true} className="w-full h-full opacity-70" />
      </div>

      {/* ── Top nav ── */}
      <div className="px-4 pt-6 max-w-5xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
          aria-label="Volver a la página de inicio"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden /> Inicio
        </Link>
      </div>

      {/* ── Hero ── */}
      <header className="px-4 pt-6 pb-8 max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-8">
        {/* Cover art */}
        <div
          className="shrink-0 w-40 sm:w-52 rounded-3xl overflow-hidden shadow-2xl border-2 border-foreground/10"
          aria-label="Portada de La Cartilla de Gretel"
        >
          <CoverArt />
        </div>

        <div className="text-center sm:text-left">
          <h1 className="float-soft text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-primary via-vowel-i to-vowel-o bg-clip-text text-transparent leading-tight">
            La Cartilla de Gretel
          </h1>
          <p className="mt-3 text-foreground/70 text-lg leading-relaxed max-w-md">
            Método fonético K-2 · 24 lecciones · Leonor Lopetegui<br />
            <span className="text-sm">Ilustraciones: Estela de Armas Plasencia</span>
          </p>
          <div className="mt-5 flex flex-wrap gap-3 justify-center sm:justify-start">
            <Link
              to="/cartilla/student/lecciones"
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2"
              aria-label="Empezar las lecciones"
            >
              ¡Empezar a aprender! <Sparkles className="w-5 h-5" />
            </Link>
            <Link
              to="/book"
              className="px-6 py-3 rounded-full border-2 border-foreground/15 bg-white/50 backdrop-blur-sm font-bold text-lg hover:bg-white/80 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 active:scale-95"
              aria-label="Abrir el lector del libro"
            >
              <BookOpen className="w-5 h-5" aria-hidden /> Lector
            </Link>
          </div>
        </div>
      </header>

      {/* ── Nav cards ── */}
      <section className="px-4 pb-8 max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-4">
          {navCards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="kid-card group p-6 flex items-start gap-4 hover:-translate-y-1 transition duration-300"
              aria-label={c.title}
            >
              <div
                className={`shrink-0 w-12 h-12 rounded-2xl ${c.color} text-white flex items-center justify-center transition duration-300 group-hover:scale-110 group-hover:rotate-3`}
                aria-hidden
              >
                <c.icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{c.title}</h2>
                <p className="text-sm text-foreground/70 mt-1">{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 24 lesson tiles ── */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-5">Las 24 lecciones</h2>
        <ol
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
          aria-label="Cuadrícula de 24 lecciones"
        >
          {CATALOG.map((entry) => {
            const done = isCompleted(entry.n);
            const letter =
              entry.kind === "consonant"
                ? entry.letter
                : entry.kind === "vowel"
                  ? entry.vowel
                  : "ABC";
            const caption = entry.subtitle;
            return (
              <li key={entry.n} className="list-none">
                <Link
                  to="/cartilla/student/leccion/$n"
                  params={{ n: String(entry.n) }}
                  className="lesson-tile"
                  aria-label={`Lección ${entry.n}: ${entry.title}${done ? " — completada" : ""}`}
                >
                  <div className="lesson-tile__art" style={{ backgroundColor: `${entry.color}18` }}>
                    <BookArtFigure
                      lesson={entry.n}
                      role="character"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="lesson-tile__body">
                    <div
                      className="lesson-tile__letter"
                      style={{ color: entry.color }}
                      aria-hidden
                    >
                      {letter.toUpperCase()}
                    </div>
                    <p className="lesson-tile__caption">{caption}</p>
                    {done && (
                      <div className="mt-1 text-[10px] font-bold text-success">✓ completada</div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}

/** Fetches cover art from manifest; falls back to a coloured placeholder */
function CoverArt() {
  const art = useBookArt(1); // cover is manifest-global; lessonN irrelevant
  const [imgError, setImgError] = useState(false);

  if (art.loading) {
    return (
      <div
        className="book-art-skeleton"
        style={{ height: "13rem" }}
        aria-label="Cargando portada…"
        aria-busy
      />
    );
  }

  if (!art.cover || imgError) {
    // Tasteful fallback — book-spine coloured block with title
    return (
      <div
        className="w-full h-52 flex items-center justify-center text-center p-3"
        style={{ background: "linear-gradient(160deg,hsl(230 75% 58%),hsl(198 78% 50%))" }}
        aria-label="Portada de La Cartilla de Gretel"
      >
        <span className="text-white font-bold text-sm leading-tight">
          La Cartilla<br />de Gretel
        </span>
      </div>
    );
  }

  return (
    <img
      src={art.cover}
      alt="Portada de La Cartilla de Gretel"
      className="w-full h-full object-cover"
      loading="eager"
      onError={() => setImgError(true)}
    />
  );
}
