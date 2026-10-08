import { createLazyFileRoute } from "@tanstack/react-router";
import { TeacherDailyHome } from "../../../features/teacher-crm/TeacherDailyHome";

export const Route = createLazyFileRoute("/cartilla/teacher/crm/")({
  component: TeacherDailyHome,
});
