import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { StudentPicker } from "@/components/teacher/StudentPicker";
import { ReportCard } from "@/components/teacher/ReportCard";
import { ArrowLeft, Printer, FileSpreadsheet } from "lucide-react";
import { getStudentProgress, getClassProgress } from "@/lib/teacher.functions";
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

    let csvContent = "";
    let filename = "";

    if (studentId) {
      // 1. Export Student Events
      const data = await getStudentProgress({ data: { id: studentId } });
      filename = `reporte_${data.student.display_name.toLowerCase().replace(/\s+/g, "_")}.csv`;
      
      csvContent = "Fecha,Evento,Leccion,Puntuacion,Total,Tiempo (s)\n";
      data.events.forEach((e: any) => {
        csvContent += `${new Date(e.created_at).toLocaleDateString()},${e.event_kind},${e.lesson_id},${e.score || 0},${e.total || 0},${e.time_seconds || 0}\n`;
      });
    } else {
      // 2. Export Class Matrix
      const data = await getClassProgress({ data: { id: classId } });
      filename = `reporte_clase_${classId.slice(0, 8)}.csv`;

      csvContent = "Nombre Alumno,Lecciones Completas,Precision Promedio,Tiempo Total (m)\n";
      data.perStudent.forEach((s: any) => {
        const accuracy = s.accuracy !== null ? `${Math.round(s.accuracy * 100)}%` : "N/A";
        const timeMins = Math.round(s.timeSeconds / 60);
        csvContent += `"${s.name}",${s.lessonsCount},${accuracy},${timeMins}\n`;
      });
    }

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
