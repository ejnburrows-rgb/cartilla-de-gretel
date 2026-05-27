import { createFileRoute } from "@tanstack/react-router";
import { BookReader } from "@/components/cartilla/BookReader";

export const Route = createFileRoute("/cartilla/libro")({
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
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#120f0d] text-stone-850 flex flex-col">
      <BookReader initialPage={1} />
    </div>
  );
}
export default LibroReaderPage;
