import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/guide")({
  head: () => ({
    meta: [{ title: "Guía del Maestro — La Cartilla de Gretel" }],
  }),
});
