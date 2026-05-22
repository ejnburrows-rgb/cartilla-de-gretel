import { createFileRoute } from "@tanstack/react-router";
import { BookReader } from "@/components/cartilla/BookReader";

export const Route = createFileRoute("/cartilla/libro")({
  component: LibroPage,
  head: () => ({ meta: [{ title: "Libro — La Cartilla de Gretel" }] }),
});

function LibroPage() {
  return <BookReader />;
}
