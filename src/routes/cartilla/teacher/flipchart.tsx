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
  const navigate = useNavigate();

  return (
    <div
      className="crm-app flex h-screen"
      style={{
        background: "radial-gradient(circle at top left, #fdf3e0 0%, #f5e8c8 50%, #ecdaaa 100%)",
      }}
    >
      <main className="crm-main flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Back button to Teacher Hub */}
        <button
          onClick={() => navigate({ to: "/cartilla/teacher" })}
          className="absolute top-6 left-8 z-[60] flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:shadow-md hover:bg-white text-stone-600 font-bold border border-white/40 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </button>

        <div className="pt-8 h-full">
          <LessonCatalog />
        </div>
      </main>
    </div>
  );
}
