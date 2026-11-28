import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/crm/$classId/$studentId/sesiones")({
  head: () => ({
    meta: [{ title: "Revisión de Sesiones del Tutor — La Cartilla de Gretel" }],
  }),
});
