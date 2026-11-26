import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/gretel")({
  head: () => ({
    meta: [
      { title: "Asistente Pedagógica Gretel — La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "Asistente metodológica y pedagógica para docentes: progresión de lecciones, estructura de clase, uso del rotafolio, evaluación y atención a la diversidad.",
      },
    ],
  }),
});
