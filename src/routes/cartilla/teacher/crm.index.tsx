import { createFileRoute } from "@tanstack/react-router";
import { TeacherDailyHome } from "../../../features/teacher-crm/TeacherDailyHome";

export const Route = createFileRoute("/cartilla/teacher/crm/")({
  component: TeacherDailyHome,
  head: () => ({
    meta: [{ title: "Hoy en tu clase — La Cartilla de Gretel" }],
  }),
});
