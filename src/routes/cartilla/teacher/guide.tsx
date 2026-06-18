import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenCheck, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/cartilla/teacher/guide")({
  component: TeacherGuide,
  head: () => ({
    meta: [{ title: "Guía del Maestro — La Cartilla de Gretel" }],
  }),
});

function TeacherGuide() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 text-center">
      <Link
        to="/cartilla/teacher"
        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-10 text-[#6a7a60] hover:text-[#3a4a30] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Volver
      </Link>
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: "#6a7a6020", border: "3px solid #6a7a60" }}
      >
        <BookOpenCheck className="w-10 h-10" style={{ color: "#6a7a60" }} />
      </div>
      <h1 className="text-4xl font-black mb-4" style={{ color: "#28301e" }}>Guía del Maestro</h1>
      <p className="text-lg font-semibold" style={{ color: "#6a7a60" }}>
        PLACEHOLDER_CONTENT — Los planes de clase y notas pedagógicas estarán disponibles próximamente.
      </p>
    </div>
  );
}
