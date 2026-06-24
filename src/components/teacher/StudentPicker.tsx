import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { listClasses, getClass } from "@/lib/teacher.functions";

interface StudentPickerProps {
  onSelectionChange: (classId: string, studentId: string | null) => void;
}

const dropdownClass = "w-full sm:w-64 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-[14px] cursor-pointer";
const labelClass = "block text-[12px] font-medium text-gray-500 mb-1";

export function StudentPicker({ onSelectionChange }: StudentPickerProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // 1. Fetch Classes
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => listClasses(),
  });

  // 2. Fetch Students for Selected Class
  const { data: classData, isLoading: loadingStudents } = useQuery({
    queryKey: ["teacher-class-students", selectedClassId],
    queryFn: () => getClass({ data: { id: selectedClassId } }),
    enabled: !!selectedClassId,
  });

  // Set default class on load
  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // Bubble up selection changes
  useEffect(() => {
    if (selectedClassId) {
      onSelectionChange(selectedClassId, selectedStudentId);
    }
  }, [selectedClassId, selectedStudentId, onSelectionChange]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClassId(e.target.value);
    setSelectedStudentId(null); // Reset student on class change
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedStudentId(val === "all" ? null : val);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-200 rounded-md no-print shadow-sm">
      <div className="flex-1">
        <label className={labelClass}>Clase</label>
        {loadingClasses ? (
          <div className="text-[14px] font-medium text-gray-400 py-2">Cargando clases...</div>
        ) : (
          <select
            value={selectedClassId}
            onChange={handleClassChange}
            className={dropdownClass}
          >
            {classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.student_count} alumnos)
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1">
        <label className={labelClass}>Alumno</label>
        {loadingStudents && selectedClassId ? (
          <div className="text-[14px] font-medium text-gray-400 py-2">Cargando alumnos...</div>
        ) : (
          <select
            value={selectedStudentId || "all"}
            onChange={handleStudentChange}
            disabled={!selectedClassId}
            className={dropdownClass}
          >
            <option value="all">Toda la clase (Reporte general)</option>
            {classData?.students?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.display_name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
