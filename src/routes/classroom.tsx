import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ClassroomBookFlip,
  type ClassroomPageEntry,
} from "../components/teacher/ClassroomBookFlip";

export const Route = createFileRoute("/classroom")({
  component: ClassroomPage,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel — Láminas de clase" },
      {
        name: "description",
        content: "Libro de clase del maestro con vuelta vertical, lámina por lámina.",
      },
    ],
  }),
});

function ClassroomPage() {
  const pages: ClassroomPageEntry[] = [
    {
      id: "portada",
      content: (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[hsl(31,56%,48%)]">
            Libro de clase
          </p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-[hsl(197,41%,22%)] sm:text-6xl">
            La Cartilla de Gretel
          </h1>
          <p className="mt-6 text-base font-bold text-[hsl(28,30%,18%)]/70">Para el maestro</p>
        </div>
      ),
    },
    {
      id: "vocal-o",
      content: (
        <article className="flex h-full flex-col justify-center">
          <span className="inline-block w-fit rounded-full bg-[hsl(var(--vowel-o))]/15 px-5 py-1.5 text-sm font-black uppercase tracking-widest text-[hsl(var(--vowel-o))]">
            Vocal O
          </span>
          <h2 className="mt-4 text-7xl font-black text-[hsl(var(--vowel-o))]">O o</h2>
          <p className="mt-6 text-2xl font-bold leading-relaxed text-[hsl(28,30%,18%)]/85">
            Arre, arre, caballito,
            <br />
            vamos para Belén.
          </p>
        </article>
      ),
    },
    {
      id: "vocal-a",
      content: (
        <article className="flex h-full flex-col justify-center">
          <span className="inline-block w-fit rounded-full bg-[hsl(var(--vowel-a))]/15 px-5 py-1.5 text-sm font-black uppercase tracking-widest text-[hsl(var(--vowel-a))]">
            Vocal A
          </span>
          <h2 className="mt-4 text-7xl font-black text-[hsl(var(--vowel-a))]">A a</h2>
          <p className="mt-6 text-2xl font-bold leading-relaxed text-[hsl(28,30%,18%)]/85">
            La niña enfermita.
          </p>
        </article>
      ),
    },
    {
      id: "vocal-e",
      content: (
        <article className="flex h-full flex-col justify-center">
          <span className="inline-block w-fit rounded-full bg-[hsl(var(--vowel-e))]/15 px-5 py-1.5 text-sm font-black uppercase tracking-widest text-[hsl(var(--vowel-e))]">
            Vocal E
          </span>
          <h2 className="mt-4 text-7xl font-black text-[hsl(var(--vowel-e))]">E e</h2>
          <p className="mt-6 text-2xl font-bold leading-relaxed text-[hsl(28,30%,18%)]/85">
            La niña sordita.
          </p>
        </article>
      ),
    },
    {
      id: "vocal-i",
      content: (
        <article className="flex h-full flex-col justify-center">
          <span className="inline-block w-fit rounded-full bg-[hsl(var(--vowel-i))]/15 px-5 py-1.5 text-sm font-black uppercase tracking-widest text-[hsl(var(--vowel-i))]">
            Vocal I
          </span>
          <h2 className="mt-4 text-7xl font-black text-[hsl(var(--vowel-i))]">I i</h2>
          <p className="mt-6 text-2xl font-bold leading-relaxed text-[hsl(28,30%,18%)]/85">
            La niña llorona.
          </p>
        </article>
      ),
    },
    {
      id: "vocal-u",
      content: (
        <article className="flex h-full flex-col justify-center">
          <span className="inline-block w-fit rounded-full bg-[hsl(var(--vowel-u))]/15 px-5 py-1.5 text-sm font-black uppercase tracking-widest text-[hsl(var(--vowel-u))]">
            Vocal U
          </span>
          <h2 className="mt-4 text-7xl font-black text-[hsl(var(--vowel-u))]">U u</h2>
          <p className="mt-6 text-2xl font-bold leading-relaxed text-[hsl(28,30%,18%)]/85">
            La brujita.
          </p>
        </article>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,214,165,0.58),transparent_32%),linear-gradient(135deg,#fff8ed_0%,#f9efe0_48%,#e8f4ef_100%)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="rounded-full border border-[hsl(28,30%,18%)]/15 bg-white/70 px-4 py-2 text-sm font-black text-[hsl(28,30%,18%)] shadow-sm backdrop-blur transition hover:bg-white"
          >
            ← Inicio
          </Link>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[hsl(31,56%,48%)]">
            Láminas de clase · Maestro
          </p>
        </header>
        <ClassroomBookFlip pages={pages} />
      </div>
    </main>
  );
}
