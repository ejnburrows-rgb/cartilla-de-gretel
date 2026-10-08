import { useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { StudentPicker } from "@/components/teacher/StudentPicker";
import { ReportCard } from "@/components/teacher/ReportCard";
import { Printer, FileSpreadsheet } from "lucide-react";
import { getStudentProgress, getClassProgress } from "@/lib/teacher.functions";
import { isSeedSessionActive, getSeedStudentProgress, getSeedClassProgress } from "@/lib/seed-data";
import { exportClassProgressCsv, exportStudentProgressCsv } from "@/lib/csv-export";
import "@/styles/teacher-print.css";

export const Route = createLazyFileRoute("/cartilla/teacher/reportes")({
  component: TeacherReportsPage,
});

function TeacherReportsPage() {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [classId, setClassId] = useState<string>("");
  const [studentId, setStudentId] = useState<string | null>(null);

  const handleSelectionChange = (cId: string, sId: string | null) => {
    setClassId(cId);
    setStudentId(sId);
  };

  const handleExportCSV = async () => {
    if (!classId || exporting) return;
    setExporting(true); setExportError("");
    try {

    if (studentId) {
      const data = isSeedSessionActive() ? getSeedStudentProgress(studentId) : await getStudentProgress({ data: { id: studentId } });
      exportStudentProgressCsv(data.student.display_name, data.events);
    } else {
      const data = isSeedSessionActive() ? getSeedClassProgress(classId) : await getClassProgress({ data: { id: classId } });
      exportClassProgressCsv(`clase_${classId.slice(0, 8)}`, [], data);
    }
    } catch { setExportError("No se pudo exportar el reporte. Comprueba la conexión e inténtalo de nuevo."); }
    finally { setExporting(false); }
  };

  return (
    <div className="w-full space-y-6">
      <header className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-800">Panel de Reportes</h1>
          <p className="text-sm font-bold text-stone-500 mt-1">
            Visualiza métricas, exporta datos y prepara informes IEP para tu clase.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            disabled={!classId || exporting}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm inline-flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {exporting ? "Exportando…" : "Exportar CSV"}
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

      {exportError && <p role="alert" className="no-print rounded-xl bg-amber-100 p-3 text-amber-950">{exportError}</p>}
      <StudentPicker onSelectionChange={handleSelectionChange} />

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
