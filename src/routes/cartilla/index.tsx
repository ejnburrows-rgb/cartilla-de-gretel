import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  User,
  ListOrdered,
  ArrowLeft,
  BarChart3,
  Sparkles,
import {
  Zap,
} from "lucide-react";
import { useStudentSession } from "@/lib/student-session";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { sCopy } from "@/content/student-copy";

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
  const { lang } = useLanguage();
  const t = sCopy;
  const session = useStudentSession();
  const cards = [
    {
      to: "/cartilla/lecciones" as const,
      icon: ListOrdered,
      title: t.las24Lecciones[lang],
      desc: t.aprendePasoVocales[lang],
      color: "bg-primary",
    },
    {
      to: "/cartilla/practica" as const,
      icon: Zap,
      title: t.practicaRapida[lang],
      desc: t.drill[lang],
      color: "bg-vowel-o",
    },
    ...(session
      ? [
          {
            to: "/cartilla/mi-progreso" as const,
            icon: BarChart3,
            title: t.miProgreso[lang],
            desc: t.holaNameRevisa[lang].replace("{name}", session.studentName),
            color: "bg-vowel-a",
          },
          {
            to: "/cartilla/repaso" as const,
            icon: Sparkles,
            title: t.modoRepaso[lang],
            desc: t.practicaLeccionesFallaste[lang],
            color: "bg-vowel-e",
          },
        ]
      : [
          {
            to: "/cartilla/unirse" as const,
            icon: User,
            title: t.soyEstudiante[lang],
            desc: t.uneteClase[lang],
            color: "bg-vowel-i",
          },
        ]),
    {
      to: "/cartilla/teacher" as const,
      icon: GraduationCap,
      title: t.panelMaestro[lang],
      desc: t.creaClases[lang],
      color: "bg-vowel-o",
    },
    {
      to: "/cartilla/autora" as const,
      icon: User,
      title: t.laAutora[lang],
      desc: t.conoceAutora[lang],
      color: "bg-vowel-u",
    },
  ];
  return (
    <main className="min-h-screen bg-background px-4 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> {t.inicio[lang]}
        </Link>
        <LanguageToggle />
      </div>
      <header className="mt-6 text-center">
        <h1 className="float-soft text-4xl sm:text-5xl font-bold bg-gradient-to-br from-primary via-vowel-i to-vowel-o bg-clip-text text-transparent">
          La Cartilla de Gretel
        </h1>
        <p className="mt-3 text-foreground/70">
          {t.edicionDigital[lang]}
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
        {t.prefieresLeer[lang]}{" "}
        <Link to="/book" className="underline font-bold inline-flex items-center gap-1">
          <BookOpen className="w-3 h-3" /> {t.abrirLector[lang]}
        </Link>
      </p>
    </main>
  );
}
