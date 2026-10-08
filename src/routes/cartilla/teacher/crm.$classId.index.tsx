import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/crm/$classId/")({
  head: () => ({ meta: [{ title: "Clase — La Cartilla de Gretel CRM" }] }),
});
