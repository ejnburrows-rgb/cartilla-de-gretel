import { createFileRoute } from "@tanstack/react-router";
import { BookReader } from "@/components/cartilla/BookReader";
import "@/styles/student-print.css";

export const Route = createFileRoute("/cartilla/libro")({
  component: LibroPage,
  head: () => ({
    meta: [
      { title: "Libro del estudiante - La Cartilla de Gretel" },
      {
        name: "description",
        content: "Flipbook vertical del cuaderno completo de La Cartilla de Gretel con paginas pulidas por leccion.",
      },
    ],
  }),
});

function LibroPage() {
  return <BookReader initialLesson={1} showExercises />;
}
