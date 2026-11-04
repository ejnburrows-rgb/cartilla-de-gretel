import { createLazyFileRoute } from "@tanstack/react-router";
import { LessonCatalog } from "@/features/teacher-crm/components/LessonCatalog";
import "@/styles/teacher-crm.css";

export const Route = createLazyFileRoute("/cartilla/teacher/flipchart")({
  component: TeacherFlipchartPage,
});

function TeacherFlipchartPage() {
  return <div className="space-y-4">
    <LessonCatalog />
  </div>;
}
