import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/roster")({
  head: () => ({
    meta: [
      { title: "Roster de Clase — La Cartilla de Gretel CRM" },
      { name: "description", content: "Gestión de alumnos de la clase." },
    ],
  }),
});
