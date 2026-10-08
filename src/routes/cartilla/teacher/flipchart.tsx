import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LessonCatalog } from "@/features/teacher-crm/components/LessonCatalog";
import { ArrowLeft } from "lucide-react";
import "@/styles/teacher-crm.css";

export const Route = createFileRoute("/cartilla/teacher/flipchart")({
  component: TeacherFlipchartPage,
  head: () => ({
    meta: [{ title: "Seleccionar Flipchart — La Cartilla de Gretel" }],
  }),
});

function TeacherFlipchartPage() {
  return <div className="space-y-4">
    <LessonCatalog />
  </div>;
}
