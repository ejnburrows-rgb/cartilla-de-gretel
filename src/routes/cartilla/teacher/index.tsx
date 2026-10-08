import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/")({
  head: () => ({ meta: [{ title: "Panel del Docente — La Cartilla de Gretel" }] }),
});
