import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "Entrada sencilla para estudiantes y maestros de La Cartilla de Gretel.",
      },
    ],
  }),
});

function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,214,165,0.58),transparent_32%),linear-gradient(135deg,#fff8ed_0%,#f9efe0_48%,#e8f4ef_100%)] px-4 py-8 text-[hsl(28,30%,18%)]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-between">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[hsl(24,98%,50%)]">
              La Cartilla de Gretel
            </p>
            <h1 className="mt-2 text-3xl font-black leading-none sm:text-5xl">
              Bienvenidos
            </h1>
          </div>
          <Link
            to="/credits"
            className="rounded-full border border-[hsl(28,30%,18%)]/15 bg-white/60 px-4 py-2 text-sm font-black shadow-sm backdrop-blur transition hover:bg-white"
          >
            Créditos
          </Link>
        </header>

        <div className="grid items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm rounded-[2rem] border border-white/80 bg-white/70 p-4 shadow-2xl shadow-[hsl(24,98%,50%)]/20 backdrop-blur">
            <div className="h-full rounded-[1.5rem] border border-[hsl(28,30%,18%)]/10 bg-[linear-gradient(160deg,#f8dfb7,#f7efe1_48%,#d5ebe2)] p-6 shadow-inner">
              <div className="flex h-full flex-col items-center justify-end text-center">

                <h2 className="mt-2 text-5xl font-black leading-none text-[hsl(200,98%,39%)]">
                  Gretel
                </h2>
                <p className="mt-4 max-w-xs text-base font-semibold leading-relaxed text-[hsl(28,30%,18%)]/72">
                  Te acompaño en cada lección, paso a paso, como en tu libro.
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[hsl(24,98%,50%)]">
              Comience aquí
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black leading-[0.98] text-[hsl(200,98%,39%)] sm:text-6xl">
              Elija el camino de la clase.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                to="/cartilla/unirse"
                className="group min-h-56 rounded-[1.5rem] border border-white/80 bg-white/82 p-6 shadow-xl shadow-[hsl(200,98%,39%)]/10 transition hover:-translate-y-1 hover:bg-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[hsl(24,98%,50%)]"
                aria-label="Entrar como estudiante"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(200,98%,39%)] text-white shadow-lg shadow-[hsl(200,98%,39%)]/20">
                  <BookOpen className="h-7 w-7" aria-hidden />
                </span>
                <span className="mt-6 block text-3xl font-black text-[hsl(200,98%,39%)]">
                  Estudiante
                </span>
                <span className="mt-3 block text-base font-semibold leading-relaxed text-[hsl(28,30%,18%)]/70">
                  Entrar con el código de clase y continuar las lecciones.
                </span>
                <span className="mt-6 inline-flex text-sm font-black text-[hsl(24,98%,50%)] group-hover:underline">
                  Entrar como estudiante
                </span>
              </Link>

              <Link
                to="/cartilla/teacher"
                className="group min-h-56 rounded-[1.5rem] border border-white/80 bg-white/82 p-6 shadow-xl shadow-[hsl(200,98%,39%)]/10 transition hover:-translate-y-1 hover:bg-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[hsl(24,98%,50%)]"
                aria-label="Entrar como maestro"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(24,98%,50%)] text-white shadow-lg shadow-[hsl(24,98%,50%)]/20">
                  <GraduationCap className="h-7 w-7" aria-hidden />
                </span>
                <span className="mt-6 block text-3xl font-black text-[hsl(200,98%,39%)]">
                  Maestro
                </span>
                <span className="mt-3 block text-base font-semibold leading-relaxed text-[hsl(28,30%,18%)]/70">
                  Abrir el panel del maestro y la presentación de clase.
                </span>
                <span className="mt-6 inline-flex text-sm font-black text-[hsl(24,98%,50%)] group-hover:underline">
                  Entrar como maestro
                </span>
              </Link>
            </div>
          </div>
        </div>

        <footer className="flex flex-col gap-3 border-t border-[hsl(28,30%,18%)]/10 py-5 text-xs font-bold text-[hsl(28,30%,18%)]/60 sm:flex-row sm:items-center sm:justify-between">
          <p>La Cartilla de Gretel · Leonor Lopetegui · Digital adaptation by Emilio Jose Novo · Imprint: LANY Books LLC</p>
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
