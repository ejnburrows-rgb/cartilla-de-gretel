import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/lecciones")({
  head: () => ({
    meta: [{ title: "Catálogo de Lecciones — La Cartilla de Gretel CRM" }],
  }),
});
