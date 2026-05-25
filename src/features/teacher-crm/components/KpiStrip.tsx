import { Users, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { kpis } from "../mock/seed";

export function KpiStrip() {
  return (
    <div className="crm-kpi-strip">
      <div className="crm-card flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#dce7d5] text-[#2c3e20] flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-medium text-[#7a7065]">Alumnos activos</div>
          <div className="text-2xl font-bold text-[#3a322b]">{kpis.activeStudents}</div>
        </div>
      </div>
      
      <div className="crm-card flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#d4e4ea] text-[#2c3e20] flex items-center justify-center">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-medium text-[#7a7065]">Progreso promedio</div>
          <div className="text-2xl font-bold text-[#3a322b]">{kpis.averageProgress}</div>
        </div>
      </div>

      <div className="crm-card flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#f2d8d8] text-[#902b2b] flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-medium text-[#7a7065]">Requieren atención</div>
          <div className="text-2xl font-bold text-[#3a322b]">{kpis.needsAttention}</div>
        </div>
      </div>

      <div className="crm-card flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#f6ecd7] text-[#8c6b36] flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-medium text-[#7a7065]">Lecciones de la semana</div>
          <div className="text-2xl font-bold text-[#3a322b]">{kpis.lessonsCompletedThisWeek}</div>
        </div>
      </div>
    </div>
  );
}
