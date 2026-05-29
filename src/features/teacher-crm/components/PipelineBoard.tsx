import { mockStudents } from "../mock/seed";
import { AlertCircle } from "lucide-react";

export function PipelineBoard() {
  const atencion = mockStudents.filter(s => s.status === 'atencion');
  const progreso = mockStudents.filter(s => s.status === 'progreso');
  const excelente = mockStudents.filter(s => s.status === 'excelente');

  if (mockStudents.length === 0) {
    return (
      <div className="crm-card">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          Estado de la clase
        </h3>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-[#e8e2d9] rounded-xl bg-[#faf8f5]">
          <div className="text-[#8c6b36] mb-3 opacity-60">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h4 className="text-lg font-bold text-[#3a322b] mb-2">No students yet.</h4>
          <p className="text-sm text-[#7a7065] max-w-sm">
            Create or connect a class to see roster data. Progress appears after students complete activities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="crm-card">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        Estado de la clase
      </h3>
      <div className="crm-pipeline">
        <div className="crm-pipeline-column">
          <div className="font-bold text-sm text-[#902b2b] mb-2 flex justify-between items-center">
            <span>Requieren atención</span>
            <span className="bg-[#f2d8d8] px-2 py-0.5 rounded-full text-xs">{atencion.length}</span>
          </div>
          {atencion.map(s => (
            <div key={s.id} className="crm-pipeline-card border-l-4 border-l-[#902b2b]">
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">{s.name}</span>
                {s.alert && <AlertCircle className="w-4 h-4 text-[#902b2b]" />}
              </div>
              <div className="mt-2 text-xs text-[#7a7065] flex justify-between">
                <span>Progreso: {s.progress}%</span>
                <span>{s.lastActive}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="crm-pipeline-column">
          <div className="font-bold text-sm text-[#8c6b36] mb-2 flex justify-between items-center">
            <span>En progreso normal</span>
            <span className="bg-[#f6ecd7] px-2 py-0.5 rounded-full text-xs">{progreso.length}</span>
          </div>
          {progreso.map(s => (
            <div key={s.id} className="crm-pipeline-card border-l-4 border-l-[#d4a373]">
              <div className="font-medium text-sm">{s.name}</div>
              <div className="mt-2 text-xs text-[#7a7065] flex justify-between">
                <span>Progreso: {s.progress}%</span>
                <span>{s.lastActive}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="crm-pipeline-column">
          <div className="font-bold text-sm text-[#2c3e20] mb-2 flex justify-between items-center">
            <span>Excelente progreso</span>
            <span className="bg-[#dce7d5] px-2 py-0.5 rounded-full text-xs">{excelente.length}</span>
          </div>
          {excelente.map(s => (
            <div key={s.id} className="crm-pipeline-card border-l-4 border-l-[#8da47e]">
              <div className="font-medium text-sm">{s.name}</div>
              <div className="mt-2 text-xs text-[#7a7065] flex justify-between">
                <span>Progreso: {s.progress}%</span>
                <span>{s.lastActive}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
