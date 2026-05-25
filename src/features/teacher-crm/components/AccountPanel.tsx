import { mockStudents } from "../mock/seed";
import { ChevronRight, Mail, MessageSquare } from "lucide-react";

export function AccountPanel() {
  const student = mockStudents[0];

  return (
    <div className="crm-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Vista de alumno</h3>
        <button className="text-[#7a7065] hover:text-[#3a322b]">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      <div className="text-center py-4 border-b border-[#e8e2d9]">
        <div className="w-20 h-20 mx-auto bg-[#dce7d5] rounded-full flex items-center justify-center text-3xl font-bold text-[#2c3e20] mb-3">
          {student.name.charAt(0)}
        </div>
        <h4 className="font-bold text-xl">{student.name}</h4>
        <p className="text-sm text-[#7a7065] mt-1">Kinder A • Último acceso: {student.lastActive}</p>
      </div>

      <div className="py-4 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Progreso general</span>
            <span className="font-bold text-[#8da47e]">{student.progress}%</span>
          </div>
          <div className="h-2 w-full bg-[#fdfbf7] rounded-full overflow-hidden border border-[#e8e2d9]">
            <div className="h-full bg-[#8da47e] rounded-full" style={{ width: `${student.progress}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#f6ecd7] text-[#8c6b36] hover:bg-[#d4a373] hover:text-white transition-colors text-sm font-medium">
            <MessageSquare className="w-4 h-4" /> Nota
          </button>
          <button className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#d4e4ea] text-[#2c4c5b] hover:bg-[#a9c9d6] transition-colors text-sm font-medium">
            <Mail className="w-4 h-4" /> Padres
          </button>
        </div>
      </div>
    </div>
  );
}
