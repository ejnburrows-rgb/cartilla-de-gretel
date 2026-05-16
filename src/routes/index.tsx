import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, MousePointerClick } from "lucide-react";
import { assetPath } from "@/lib/assets";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel - Lector y Cartilla digital" },
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
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <header className="mx-auto grid max-w-5xl items-center gap-8 py-4 md:grid-cols-[0.75fr_1fr]">
        <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-3xl border-4 border-white bg-card shadow-2xl shadow-primary/15 md:max-w-[320px]">
          <img
            src={assetPath("cartilla/images/cover.png")}
            alt="Portada de La Cartilla de Gretel"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="text-center md:text-left">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Double R Publishing
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-6xl">
            La Cartilla de Gretel
          </h1>
          <p className="mt-4 text-xl text-foreground/75">
            Un acceso claro para maestras, estudiantes y lectura del libro oficial.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground">
            <MousePointerClick className="h-5 w-5" />
            Elige una opción para comenzar
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-2">
        <Link
          to="/book"
          className="kid-card group flex flex-col items-start gap-5 p-8 transition hover:-translate-y-1"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Lector del libro</h2>
          <p className="text-lg text-foreground/75">
            PDF oficial de <em>La Cartilla de Gretel</em> con progreso por página.
          </p>
          <span className="tap-target mt-auto inline-flex items-center rounded-2xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground">
            Abrir lector
          </span>
        </Link>

        <Link
          to="/cartilla"
          className="kid-card group flex flex-col items-start gap-5 p-8 transition hover:-translate-y-1"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-vowel-i text-white">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Cartilla digital</h2>
          <p className="text-lg text-foreground/75">
            24 lecciones interactivas, ejercicios adaptativos, prueba FAST y panel de maestro.
          </p>
          <span className="tap-target mt-auto inline-flex items-center rounded-2xl bg-vowel-i px-5 py-3 text-base font-bold text-white">
            Abrir cartilla
          </span>
        </Link>
      </section>

      <footer className="mt-14 space-y-1 text-center text-sm text-foreground/55">
        <p>© {new Date().getFullYear()} Double R Publishing · Leonor Lopetegui</p>
        <p>ISBN 978-1-7368420-7-2</p>
      </footer>
    </main>
  );
}
