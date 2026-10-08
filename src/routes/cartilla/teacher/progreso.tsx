import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/progreso")({
  head: () => ({
    meta: [{ title: "Progreso — La Cartilla de Gretel CRM" }],
  }),
});
