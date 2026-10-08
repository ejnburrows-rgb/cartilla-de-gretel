import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/flipchart")({
  head: () => ({
    meta: [{ title: "Seleccionar Flipchart — La Cartilla de Gretel" }],
  }),
});
