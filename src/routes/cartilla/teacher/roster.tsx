import { createFileRoute } from "@tanstack/react-router";
import { ClassRoster } from "@/components/teacher/ClassRoster";

export const Route = createFileRoute("/cartilla/teacher/roster")({
  component: TeacherRosterPage,
  head: () => ({
    meta: [
      { title: "Roster de Clase — La Cartilla de Gretel CRM" },
      { name: "description", content: "Gestión de alumnos de la clase." },
    ],
  }),
});

function TeacherRosterPage() {
  return (
    <div className="w-full space-y-6">
      <header className="no-print">
        <h1 className="text-3xl font-black text-stone-800">Directorio de Alumnos</h1>
        <p className="text-sm font-bold text-stone-500 mt-1">
          Gestiona los perfiles de los estudiantes, visualiza su estado general de conectividad y progreso básico.
        </p>
      </header>

      <ClassRoster />
    </div>
  );
}
