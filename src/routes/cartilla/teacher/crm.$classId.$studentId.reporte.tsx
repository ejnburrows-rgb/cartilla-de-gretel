import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/crm/$classId/$studentId/reporte")({
  head: () => ({ meta: [{ title: "Reporte para Familias — La Cartilla de Gretel" }] }),
});
