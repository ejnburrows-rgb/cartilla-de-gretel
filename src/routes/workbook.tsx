import { createFileRoute, Link } from "@tanstack/react-router";
import {
  StudentWorkbookFlip,
  type WorkbookPageEntry,
} from "../components/StudentBook/StudentWorkbookFlip";

export const Route = createFileRoute("/workbook")({
  component: WorkbookPage,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel — Mi libro" },
      {
        name: "description",
        content:
          "El libro del estudiante con vuelta de hoja real, página por página.",
      },
    ],
  }),
});

function WorkbookPage() {
  const pages: WorkbookPageEntry[] = [
    {
      id: "cover",
      cover: true,
      content: (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[hsl(31,56%,48%)]">
            Lectura y práctica
          </p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-[hsl(197,41%,22%)]">
            La Cartilla de Gretel
          </h1>
          <p className="mt-6 text-base font-bold text-[hsl(28,30%,18%)]/70">
            Leonor Lopetegui · © 2004
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[hsl(28,30%,18%)]/45">
            LANY Books LLC
          </p>
        </div>
      ),
    },
    {
      id: "intro",
      content: (
        <div>
          <h2 className="text-3xl font-black text-[hsl(197,41%,22%)]">¡Hola!</h2>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-[hsl(28,30%,18%)]/80">
            Soy Gretel. Vamos a aprender a leer juntos. Pasa la página tocando
            o arrastrando la esquina.
          </p>
        </div>
      ),
    },
    {
      id: "o",
      content: (
        <article>
          <span className="inline-block rounded-full bg-[hsl(var(--vowel-o))]/15 px-4 py-1 text-xs font-black uppercase tracking-widest text-[hsl(var(--vowel-o))]">
            Vocal O
          </span>
          <h2 className="mt-3 text-4xl font-black text-[hsl(var(--vowel-o))]">
            Arre caballito
          </h2>
          <p className="mt-6 text-lg font-semibold leading-relaxed text-[hsl(28,30%,18%)]/80">
            Arre, arre, caballito, vamos para Belén…
          </p>
        </article>
      ),
    },
    {
      id: "a",
      content: (
        <article>
          <span className="inline-block rounded-full bg-[hsl(var(--vowel-a))]/15 px-4 py-1 text-xs font-black uppercase tracking-widest text-[hsl(var(--vowel-a))]">
            Vocal A
          </span>
          <h2 className="mt-3 text-4xl font-black text-[hsl(var(--vowel-a))]">
            La niña enfermita
          </h2>
        </article>
      ),
    },
    {
      id: "e",
      content: (
        <article>
          <span className="inline-block rounded-full bg-[hsl(var(--vowel-e))]/15 px-4 py-1 text-xs font-black uppercase tracking-widest text-[hsl(var(--vowel-e))]">
            Vocal E
          </span>
          <h2 className="mt-3 text-4xl font-black text-[hsl(var(--vowel-e))]">
            La niña sordita
          </h2>
        </article>
      ),
    },
    {
      id: "i",
      content: (
        <article>
          <span className="inline-block rounded-full bg-[hsl(var(--vowel-i))]/15 px-4 py-1 text-xs font-black uppercase tracking-widest text-[hsl(var(--vowel-i))]">
            Vocal I
          </span>
          <h2 className="mt-3 text-4xl font-black text-[hsl(var(--vowel-i))]">
            La niña llorona
          </h2>
        </article>
      ),
    },
    {
      id: "u",
      content: (
        <article>
          <span className="inline-block rounded-full bg-[hsl(var(--vowel-u))]/15 px-4 py-1 text-xs font-black uppercase tracking-widest text-[hsl(var(--vowel-u))]">
            Vocal U
          </span>
          <h2 className="mt-3 text-4xl font-black text-[hsl(var(--vowel-u))]">
            La brujita
          </h2>
        </article>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,214,165,0.58),transparent_32%),linear-gradient(135deg,#fff8ed_0%,#f9efe0_48%,#e8f4ef_100%)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="rounded-full border border-[hsl(28,30%,18%)]/15 bg-white/70 px-4 py-2 text-sm font-black text-[hsl(28,30%,18%)] shadow-sm backdrop-blur transition hover:bg-white"
          >
            ← Inicio
          </Link>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[hsl(31,56%,48%)]">
            Libro del estudiante
          </p>
        </header>
        <StudentWorkbookFlip pages={pages} />
      </div>
    </main>
  );
}
