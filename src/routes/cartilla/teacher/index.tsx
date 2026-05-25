import { createFileRoute } from "@tanstack/react-router";
import { TeacherCrmShell } from "../../../features/teacher-crm/TeacherCrmShell";

export const Route = createFileRoute("/cartilla/teacher/")({
  component: TeacherCrmRoute,
});

function TeacherCrmRoute() {
  return <TeacherCrmShell />;
}
