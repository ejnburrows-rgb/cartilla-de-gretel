import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/features/teacher-crm/components/Sidebar";
import { Topbar } from "@/features/teacher-crm/components/Topbar";
import { LessonCatalog } from "@/features/teacher-crm/components/LessonCatalog";
import "@/styles/teacher-crm.css";

export const Route = createFileRoute("/cartilla/teacher/lecciones")({
  component: TeacherLeccionesPage,
  head: () => ({
    meta: [{ title: "Catálogo de Lecciones — La Cartilla de Gretel CRM" }],
  }),
});

function TeacherLeccionesPage() {
  return (
    <div 
      className="crm-app flex h-screen"
      style={{
        background: "radial-gradient(circle at top left, #fdf3e0 0%, #f5e8c8 50%, #ecdaaa 100%)",
      }}
    >
      <Sidebar />
      <main className="crm-main flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <LessonCatalog />
      </main>
    </div>
  );
}
