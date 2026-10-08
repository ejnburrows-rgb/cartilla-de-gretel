import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/crm/$classId/$studentId/$lessonId")({
  head: () => ({ meta: [{ title: "Lección — La Cartilla de Gretel CRM" }] }),
});
