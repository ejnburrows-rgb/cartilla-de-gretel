/** Shared CSV export helpers — used by the Reportes page and the Clase
 * overview page so both "Exportar CSV" buttons produce the exact same file
 * shape instead of two independently-maintained implementations. */

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface ClassProgressStudent {
  id: string;
  name: string;
  lessonsCount: number;
  accuracy: number | null;
  timeSeconds: number;
}

export function exportClassProgressCsv(
  className: string,
  _students: unknown,
  progressData: { perStudent: ClassProgressStudent[] },
) {
  let csv = "Nombre Alumno,Lecciones Completas,Precision Promedio,Tiempo Total (m)\n";
  progressData.perStudent.forEach((s) => {
    const accuracy = s.accuracy !== null ? `${Math.round(s.accuracy * 100)}%` : "N/A";
    const timeMins = Math.round(s.timeSeconds / 60);
    csv += `"${s.name}",${s.lessonsCount},${accuracy},${timeMins}\n`;
  });
  const safeName = className
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  downloadCsv(csv, `reporte_clase_${safeName || "sin_nombre"}.csv`);
}

interface StudentEvent {
  created_at: string;
  event_kind: string;
  lesson_id: string;
  score: number | null;
  total: number | null;
  time_seconds: number | null;
}

export function exportStudentProgressCsv(studentName: string, events: StudentEvent[]) {
  let csv = "Fecha,Evento,Leccion,Puntuacion,Total,Tiempo (s)\n";
  events.forEach((e) => {
    csv += `${new Date(e.created_at).toLocaleDateString()},${e.event_kind},${e.lesson_id},${e.score || 0},${e.total || 0},${e.time_seconds || 0}\n`;
  });
  const safeName = studentName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  downloadCsv(csv, `reporte_${safeName || "alumno"}.csv`);
}
