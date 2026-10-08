import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/crm/")({
  head: () => ({
    meta: [{ title: "Hoy en tu clase — La Cartilla de Gretel" }],
  }),
});
