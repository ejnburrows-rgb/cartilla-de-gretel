import { createLazyFileRoute } from "@tanstack/react-router";
import { ClassRoster } from "@/components/teacher/ClassRoster";

export const Route = createLazyFileRoute("/cartilla/teacher/roster")({
  component: TeacherRosterPage,
});

function TeacherRosterPage() {
  return (
    <div className="w-full space-y-6">
      <header className="no-print">
        <h1 className="text-3xl font-black text-stone-800">Directorio de Alumnos</h1>
        <p className="text-sm font-bold text-stone-500 mt-1">
          Gestiona los perfiles de los estudiantes, visualiza su estado general de conectividad y
          progreso básico.
        </p>
      </header>

      <ClassRoster />
    </div>
  );
}
