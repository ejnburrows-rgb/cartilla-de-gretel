import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel — Lector y Cartilla digital" },
      {
        name: "description",
        content:
          "Lee el libro original o usa la cartilla digital interactiva con lecciones, ejercicios y evaluaciones.",
      },
    ],
  }),
});

function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-12 flex flex-col items-center">
      <header className="max-w-3xl text-center mb-12">
        <p className="text-xs uppercase tracking-[0.35em] text-foreground/50 mb-3">
          Double R Publishing
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight">La Cartilla de Gretel</h1>
        <p className="mt-4 text-lg text-foreground/70">
          Elige cómo quieres usarla: lee el libro original o practica con la cartilla digital
          interactiva.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 gap-6 max-w-4xl w-full">
        <Link
          to="/book"
          className="kid-card p-8 hover:-translate-y-1 transition group flex flex-col items-start gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold">Lector del libro</h2>
          <p className="text-foreground/70">
            PDF oficial de <em>La Cartilla de Gretel</em> con progreso por página.
          </p>
          <span className="text-sm font-bold text-primary mt-auto">Abrir lector →</span>
        </Link>

        <Link
          to="/cartilla"
          className="kid-card p-8 hover:-translate-y-1 transition group flex flex-col items-start gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-vowel-i text-white flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold">Cartilla digital</h2>
          <p className="text-foreground/70">
            24 lecciones interactivas, ejercicios adaptativos, prueba FAST y panel de maestro.
          </p>
          <span className="text-sm font-bold text-primary mt-auto">Abrir cartilla →</span>
        </Link>
      </section>

      <footer className="mt-16 text-xs text-foreground/50 text-center space-y-1">
        <p>© {new Date().getFullYear()} Double R Publishing · Leonor Lopetegui</p>
        <p>ISBN 978-1-7368420-7-2</p>
      </footer>
    </main>
  );
}
