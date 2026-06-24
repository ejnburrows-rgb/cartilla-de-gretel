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
    <div className="w-full flex flex-col pt-4">
      <div className="mb-6 no-print">
        <h1 className="text-[22px] font-normal text-gray-800">Directorio de Alumnos</h1>
        <p className="text-[14px] text-gray-600 mt-1">
          Gestiona los perfiles de los estudiantes, visualiza su estado general de conectividad y progreso básico.
        </p>
      </div>

      <ClassRoster />
    </div>
  );
}
