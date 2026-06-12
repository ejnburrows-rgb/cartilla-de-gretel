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
  const pages: WorkbookPageEntry[] = Array.from({ length: 92 }).map((_, i) => {
    const pageNum = i + 1;
    const src = `/art/hd/page-${pageNum}.png`;

    return {
      id: `page-${pageNum}`,
      cover: pageNum === 1,
      content: (
        <div className="flex h-full w-full items-center justify-center bg-white">
          <img
            src={src}
            alt={`Página ${pageNum}`}
            className="h-full w-full object-contain"
            draggable={false}
          />
        </div>
      ),
    };
  });

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
