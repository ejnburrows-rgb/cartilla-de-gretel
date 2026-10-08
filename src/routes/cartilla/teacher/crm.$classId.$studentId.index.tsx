import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/crm/$classId/$studentId/")({
  head: () => ({ meta: [{ title: "Alumno — La Cartilla de Gretel CRM" }] }),
});
