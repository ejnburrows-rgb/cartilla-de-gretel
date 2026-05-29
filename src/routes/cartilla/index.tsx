import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import "@/styles/cartilla-student.css";

export const Route = createFileRoute("/cartilla/")({
  component: CartillaHome,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel — Estudiante o maestro" },
      {
        name: "description",
        content: "Entrada directa para estudiantes y maestros de La Cartilla de Gretel.",
      },
    ],
  }),
});

function CartillaHome() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(255,216,171,0.68),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(168,213,198,0.42),transparent_30%),linear-gradient(135deg,#fff8ed_0%,#f7ead6_52%,#e8f4ef_100%)] px-4 py-6 text-[hsl(28,30%,18%)]">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <nav className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[hsl(28,30%,18%)]/10 bg-white/60 px-4 py-2 text-sm font-black shadow-sm backdrop-blur transition hover:bg-white"
            aria-label="Volver al inicio"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Inicio
          </Link>
          <Link
            to="/credits"
            className="rounded-full border border-[hsl(28,30%,18%)]/10 bg-white/60 px-4 py-2 text-sm font-black shadow-sm backdrop-blur transition hover:bg-white"
          >
            Créditos
          </Link>
        </nav>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <header>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[hsl(24,98%,50%)]">
              La Cartilla de Gretel
            </p>
            <h1 className="mt-4 max-w-2xl text-5xl font-black leading-[0.95] text-[hsl(200,98%,39%)] sm:text-7xl">
              ¿Quién va a entrar?
            </h1>
            <p className="mt-6 max-w-xl text-xl font-semibold leading-relaxed text-[hsl(28,30%,18%)]/72">
              Use el acceso de estudiante para practicar. Use el acceso de maestro para dirigir la clase.
            </p>
          </header>

          <section className="grid gap-5" aria-label="Caminos de entrada">
            <Link
              to="/cartilla/unirse"
              className="group grid min-h-48 grid-cols-[72px_1fr] items-center gap-5 rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-2xl shadow-[hsl(200,98%,39%)]/10 transition hover:-translate-y-1 hover:bg-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[hsl(24,98%,50%)] sm:grid-cols-[96px_1fr]"
              aria-label="Entrar como estudiante"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[hsl(200,98%,39%)] text-white shadow-lg shadow-[hsl(200,98%,39%)]/20 sm:h-24 sm:w-24">
                <BookOpen className="h-8 w-8 sm:h-11 sm:w-11" aria-hidden />
              </span>
              <span>
                <span className="block text-3xl font-black text-[hsl(200,98%,39%)] sm:text-4xl">
                  Estudiante
                </span>
                <span className="mt-2 block text-base font-semibold leading-relaxed text-[hsl(28,30%,18%)]/70">
                  Código de clase, lecciones, práctica y progreso.
                </span>
                <span className="mt-4 inline-flex text-sm font-black text-[hsl(24,98%,50%)] group-hover:underline">
                  Entrar como estudiante
                </span>
              </span>
            </Link>

            <Link
              to="/cartilla/teacher"
              className="group grid min-h-48 grid-cols-[72px_1fr] items-center gap-5 rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-2xl shadow-[hsl(200,98%,39%)]/10 transition hover:-translate-y-1 hover:bg-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[hsl(24,98%,50%)] sm:grid-cols-[96px_1fr]"
              aria-label="Entrar como maestro"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[hsl(24,98%,50%)] text-white shadow-lg shadow-[hsl(24,98%,50%)]/20 sm:h-24 sm:w-24">
                <GraduationCap className="h-8 w-8 sm:h-11 sm:w-11" aria-hidden />
              </span>
              <span>
                <span className="block text-3xl font-black text-[hsl(200,98%,39%)] sm:text-4xl">
                  Maestro
                </span>
                <span className="mt-2 block text-base font-semibold leading-relaxed text-[hsl(28,30%,18%)]/70">
                  Panel, grupo, progreso y presentación del maestro.
                </span>
                <span className="mt-4 inline-flex text-sm font-black text-[hsl(24,98%,50%)] group-hover:underline">
                  Entrar como maestro
                </span>
              </span>
            </Link>
          </section>
        </div>

        <footer className="flex flex-col gap-3 border-t border-[hsl(28,30%,18%)]/10 py-5 text-sm font-bold text-[hsl(28,30%,18%)]/60 sm:flex-row sm:items-center sm:justify-between">
          <p>Libro, práctica y clase en una entrada sencilla.</p>
          <div className="flex gap-4">
            <Link to="/book" className="hover:text-[hsl(24,98%,50%)] hover:underline">
              Libro
            </Link>
            <Link to="/credits" className="hover:text-[hsl(24,98%,50%)] hover:underline">
              Créditos
            </Link>
          </div>
        </footer>
      </section>
    </main>
  );
}
