import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DashboardStudent {
  id: string;
  name: string;
  progress: number;
  lastActive: string;
  alert?: boolean;
  grade?: string;
  teacher_notes?: string;
}

interface PipelineBoardProps {
  students: DashboardStudent[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string) => void;
}

export function PipelineBoard({
  students,
  selectedStudentId,
  onSelectStudent,
}: PipelineBoardProps) {
  if (students.length === 0) {
    return (
      <div className="crm-card text-center py-12 px-4 space-y-4">
        <div className="w-16 h-16 mx-auto bg-[#fdfbf7] border border-[#e8e2d9] rounded-2xl flex items-center justify-center text-[#7a7065]/60 shadow-inner">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-lg text-[#3a322b]">Todavía no hay alumnos.</h4>
          <p className="text-sm font-medium text-[#7a7065] max-w-[280px] mx-auto leading-relaxed">
            Crea una clase para ver sus alumnos.
          </p>
        </div>
      </div>
    );
  }

  const atencion = students.filter((s) => s.alert);
  const progreso = students.filter((s) => !s.alert && s.progress < 80);
  const excelente = students.filter((s) => !s.alert && s.progress >= 80);

  return (
    <div className="crm-card">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">Estado de la clase</h3>
      <div className="crm-pipeline">
        {/* Requieren atención */}
        <div className="crm-pipeline-column">
          <div className="font-bold text-sm text-[#902b2b] mb-2 flex justify-between items-center">
            <span>Requieren atención</span>
            <span className="bg-[#f2d8d8] px-2 py-0.5 rounded-full text-xs font-black">
              {atencion.length}
            </span>
          </div>
          <div className="space-y-3 min-h-[120px]">
            {atencion.map((s) => {
              const isSelected = selectedStudentId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectStudent(s.id)}
                  className={cn(
                    "crm-pipeline-card border-l-4 border-l-[#902b2b] transition-all",
                    isSelected
                      ? "ring-2 ring-[#902b2b]/40 scale-[1.02] bg-[hsl(354,78%,99%)]"
                      : "hover:border-[#902b2b]/40",
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-[#3a322b]">{s.name}</span>
                    {s.alert && <AlertCircle className="w-4 h-4 text-[#902b2b]" />}
                  </div>
                  <div className="mt-2 text-[10px] text-[#7a7065] flex justify-between font-bold">
                    <span>Progreso: {s.progress}%</span>
                    <span>{s.lastActive}</span>
                  </div>
                </div>
              );
            })}
            {atencion.length === 0 && (
              <div className="text-center py-6 text-xs text-[#7a7065]/60 italic font-bold">
                Ninguno en esta columna
              </div>
            )}
          </div>
        </div>

        {/* En progreso normal */}
        <div className="crm-pipeline-column">
          <div className="font-bold text-sm text-[#8c6b36] mb-2 flex justify-between items-center">
            <span>En progreso normal</span>
            <span className="bg-[#f6ecd7] px-2 py-0.5 rounded-full text-xs font-black">
              {progreso.length}
            </span>
          </div>
          <div className="space-y-3 min-h-[120px]">
            {progreso.map((s) => {
              const isSelected = selectedStudentId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectStudent(s.id)}
                  className={cn(
                    "crm-pipeline-card border-l-4 border-l-[#d4a373] transition-all",
                    isSelected
                      ? "ring-2 ring-[#d4a373]/40 scale-[1.02] bg-[hsl(48,100%,99%)]"
                      : "hover:border-[#d4a373]/40",
                  )}
                >
                  <span className="font-bold text-sm text-[#3a322b]">{s.name}</span>
                  <div className="mt-2 text-[10px] text-[#7a7065] flex justify-between font-bold">
                    <span>Progreso: {s.progress}%</span>
                    <span>{s.lastActive}</span>
                  </div>
                </div>
              );
            })}
            {progreso.length === 0 && (
              <div className="text-center py-6 text-xs text-[#7a7065]/60 italic font-bold">
                Ninguno en esta columna
              </div>
            )}
          </div>
        </div>

        {/* Excelente progreso */}
        <div className="crm-pipeline-column">
          <div className="font-bold text-sm text-[#2c3e20] mb-2 flex justify-between items-center">
            <span>Excelente progreso</span>
            <span className="bg-[#dce7d5] px-2 py-0.5 rounded-full text-xs font-black">
              {excelente.length}
            </span>
          </div>
          <div className="space-y-3 min-h-[120px]">
            {excelente.map((s) => {
              const isSelected = selectedStudentId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectStudent(s.id)}
                  className={cn(
                    "crm-pipeline-card border-l-4 border-l-[#8da47e] transition-all",
                    isSelected
                      ? "ring-2 ring-[#8da47e]/40 scale-[1.02] bg-[hsl(145,60%,99%)]"
                      : "hover:border-[#8da47e]/40",
                  )}
                >
                  <span className="font-bold text-sm text-[#3a322b]">{s.name}</span>
                  <div className="mt-2 text-[10px] text-[#7a7065] flex justify-between font-bold">
                    <span>Progreso: {s.progress}%</span>
                    <span>{s.lastActive}</span>
                  </div>
                </div>
              );
            })}
            {excelente.length === 0 && (
              <div className="text-center py-6 text-xs text-[#7a7065]/60 italic font-bold">
                Ninguno en esta columna
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

