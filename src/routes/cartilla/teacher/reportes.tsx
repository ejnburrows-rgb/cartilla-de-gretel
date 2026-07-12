import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { StudentPicker } from "@/components/teacher/StudentPicker";
import { ReportCard } from "@/components/teacher/ReportCard";
import { ArrowLeft, Printer, FileSpreadsheet } from "lucide-react";
import { getStudentProgress, getClassProgress } from "@/lib/teacher.functions";
import { exportClassProgressCsv, exportStudentProgressCsv } from "@/lib/csv-export";
import "@/styles/teacher-print.css";

export const Route = createFileRoute("/cartilla/teacher/reportes")({
  component: TeacherReportsPage,
  head: () => ({
    meta: [
      { title: "Reportes Académicos del Docente — La Cartilla de Gretel" },
      { name: "description", content: "Métricas de precisión, ritmo de avance e informes para IEP." },
    ],
  }),
});

function TeacherReportsPage() {
  const [classId, setClassId] = useState<string>("");
  const [studentId, setStudentId] = useState<string | null>(null);

  const handleSelectionChange = (cId: string, sId: string | null) => {
    setClassId(cId);
    setStudentId(sId);
  };

  // ── CSV Export Handler ──
  const handleExportCSV = async () => {
    if (!classId) return;

    if (studentId) {
      const data = await getStudentProgress({ data: { id: studentId } });
      exportStudentProgressCsv(data.student.display_name, data.events);
    } else {
      const data = await getClassProgress({ data: { id: classId } });
      exportClassProgressCsv(`clase_${classId.slice(0, 8)}`, [], data);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header (No print) */}
      <header className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-800">Panel de Reportes</h1>
          <p className="text-sm font-bold text-stone-500 mt-1">
            Visualiza métricas, exporta datos y prepara informes IEP para tu clase.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={!classId}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm inline-flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={() => window.print()}
            disabled={!classId}
            className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200 disabled:opacity-50 text-stone-800 font-bold text-sm rounded-xl shadow-sm inline-flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            Imprimir
          </button>
        </div>
      </header>

      {/* Picker (No print) */}
      <StudentPicker onSelectionChange={handleSelectionChange} />

      {/* Report Card Viewer (Both screen & print) */}
      {classId ? (
        <ReportCard classId={classId} studentId={studentId} />
      ) : (
        <div className="no-print p-12 text-center font-bold text-stone-400 bg-white border border-stone-200 rounded-3xl">
          Por favor selecciona una clase o alumno para ver las analíticas.
        </div>
      )}
    </div>
  );
}
