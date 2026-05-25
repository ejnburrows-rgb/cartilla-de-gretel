import { BookOpen, LayoutDashboard, Users, Settings, Bell, Search, GraduationCap } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="crm-sidebar">
      <div className="p-6 border-b border-[#e8e2d9]">
        <div className="flex items-center gap-2 text-[#8da47e] font-bold text-lg">
          <GraduationCap className="w-6 h-6" />
          <span>Gretel CRM</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <a href="#" className="flex items-center gap-3 px-3 py-2 bg-[#dce7d5] text-[#2c3e20] rounded-lg font-medium">
          <LayoutDashboard className="w-5 h-5" /> Tablero
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#7a7065] hover:bg-[#f6ecd7] hover:text-[#3a322b] rounded-lg font-medium transition-colors">
          <Users className="w-5 h-5" /> Alumnos
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#7a7065] hover:bg-[#f6ecd7] hover:text-[#3a322b] rounded-lg font-medium transition-colors">
          <BookOpen className="w-5 h-5" /> Lecciones
        </a>
      </nav>
      <div className="p-4 border-t border-[#e8e2d9]">
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#7a7065] hover:bg-[#f6ecd7] hover:text-[#3a322b] rounded-lg font-medium transition-colors">
          <Settings className="w-5 h-5" /> Configuración
        </a>
      </div>
    </aside>
  );
}
