import { createFileRoute } from "@tanstack/react-router";
import { TeacherCrmShell } from "../../../features/teacher-crm/TeacherCrmShell";

export const Route = createFileRoute("/cartilla/teacher/crm/")({
  component: TeacherCrmRoute,
  head: () => ({
    meta: [{ title: "Panel del Maestro — La Cartilla de Gretel" }],
  }),
});

function TeacherCrmRoute() {
  return <TeacherCrmShell />;
}
