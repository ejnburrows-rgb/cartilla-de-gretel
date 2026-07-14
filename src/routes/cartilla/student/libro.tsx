import { createFileRoute, Link } from "@tanstack/react-router";
import { BookReader } from "@/components/cartilla/BookReader";

export const Route = createFileRoute("/cartilla/student/libro")({
  component: LibroReaderPage,
  head: () => ({
    meta: [
      { title: "Libro de Lectura Completo — La Cartilla de Gretel" },
      { name: "description", content: "Visualizador oficial del libro de lectura de Gretel." },
    ],
  }),
});

function LibroReaderPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#120f0d] text-stone-900 dark:text-stone-100 flex flex-col">
      <div className="px-4 pt-3 max-w-5xl w-full mx-auto">
        <Link
          to="/cartilla/student/libro-vivo"
          className="inline-flex items-center min-h-11 px-4 py-2 rounded-xl border-2 border-stone-300 dark:border-stone-600 bg-white/80 dark:bg-stone-900/70 text-stone-800 dark:text-stone-100 font-bold text-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400"
        >
          Abrir libro vivo (manifiesto)
        </Link>
      </div>
      <BookReader initialPage={1} />
    </div>
  );
}
export default LibroReaderPage;
