import { ChevronRight, Mail, MessageSquare, User } from "lucide-react";
import type { DashboardStudent } from "./PipelineBoard";

interface AccountPanelProps {
  student: DashboardStudent | null;
}

export function AccountPanel({ student }: AccountPanelProps) {
  if (!student) {
    return (
      <div className="crm-card text-center py-10 space-y-4">
        <div className="w-12 h-12 mx-auto bg-[#f6ecd7] rounded-full flex items-center justify-center text-[#8c6b36]">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-[#3a322b]">Sin selección</h4>
          <p className="text-xs text-[#7a7065] mt-1 max-w-[200px] mx-auto">
            Selecciona un alumno de la pizarra para ver sus detalles.
          </p>
        </div>
      </div>
    );
  }

  const progressWidthStyle: React.CSSProperties = {
    width: `${student.progress}%`,
  };

  return (
    <div className="crm-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Vista de alumno</h3>
        <button className="text-[#7a7065] hover:text-[#3a322b]">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center py-4 border-b border-[#e8e2d9]">
        <div className="w-16 h-16 mx-auto bg-[#dce7d5] rounded-full flex items-center justify-center text-2xl font-black text-[#2c3e20] mb-3 shadow-inner">
          {student.name.charAt(0)}
        </div>
        <h4 className="font-extrabold text-lg text-[#3a322b]">{student.name}</h4>
        <p className="text-xs font-semibold text-[#7a7065] mt-1">
          Última actividad: {student.lastActive}
        </p>
      </div>

      <div className="py-4 space-y-4">
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-[#7a7065]">Progreso general</span>
            <span className="text-[#8da47e]">{student.progress}%</span>
          </div>
          <div className="h-2 w-full bg-[#fdfbf7] rounded-full overflow-hidden border border-[#e8e2d9]">
            <div className="h-full bg-[#8da47e] rounded-full" style={progressWidthStyle}></div>
          </div>
          {student.progress === 0 && (
            <p className="text-[10px] text-[#7a7065]/70 italic font-semibold mt-1">
              Progress appears after students complete activities.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#f6ecd7] text-[#8c6b36] hover:bg-[#d4a373] hover:text-white transition shadow-xs text-xs font-bold cursor-pointer">
            <MessageSquare className="w-4 h-4" /> Nota
          </button>
          <button className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#d4e4ea] text-[#2c4c5b] hover:bg-[#a9c9d6] transition shadow-xs text-xs font-bold cursor-pointer">
            <Mail className="w-4 h-4" /> Padres
          </button>
        </div>
      </div>
    </div>
  );
}
