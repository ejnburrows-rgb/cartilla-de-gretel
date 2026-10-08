import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes Académicos del Docente — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Métricas de precisión, ritmo de avance e informes para IEP.",
      },
    ],
  }),
});
