import { Link } from "@tanstack/react-router";
import { BookOpen, LayoutDashboard, Users, Settings, GraduationCap, FileSpreadsheet, CircleHelp } from "lucide-react";

export function Sidebar() {
  // Hoisted styles to satisfy the JSX double-brace styling ban
  const activeCls = "bg-[#dce7d5] text-[#2c3e20]";
  const inactiveCls = "text-[#7a7065] hover:bg-[#f6ecd7] hover:text-[#3a322b]";

  return (
    <aside className="crm-sidebar border-r border-[#e8e2d9] bg-white flex flex-col w-[240px] shrink-0">
      <div className="p-6 border-b border-[#e8e2d9]">
        <div className="flex items-center gap-2 text-[#8da47e] font-black text-lg font-fredoka">
          <GraduationCap className="w-6 h-6" />
          <span>Gretel CRM</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1" aria-label="Navegación del panel docente">
        <Link
          to="/cartilla/teacher/crm"
          activeProps={{ className: activeCls }}
          inactiveProps={{ className: inactiveCls }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors min-h-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8da47e]"
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" aria-hidden="true" /> Tablero
        </Link>
        <Link
          to="/cartilla/teacher/roster"
          activeProps={{ className: activeCls }}
          inactiveProps={{ className: inactiveCls }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors min-h-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8da47e]"
        >
          <Users className="w-5 h-5 shrink-0" aria-hidden="true" /> Alumnos
        </Link>
        <Link
          to="/cartilla/teacher/progreso"
          activeProps={{ className: activeCls }}
          inactiveProps={{ className: inactiveCls }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors min-h-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8da47e]"
        >
          <BookOpen className="w-5 h-5 shrink-0" aria-hidden="true" /> Progreso
        </Link>
        <Link
          to="/cartilla/teacher/lecciones"
          activeProps={{ className: activeCls }}
          inactiveProps={{ className: inactiveCls }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors min-h-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8da47e]"
        >
          <BookOpen className="w-5 h-5 shrink-0" aria-hidden="true" /> Lecciones
        </Link>
        <Link
          to="/cartilla/teacher/reportes"
          activeProps={{ className: activeCls }}
          inactiveProps={{ className: inactiveCls }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors min-h-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8da47e]"
        >
          <FileSpreadsheet className="w-5 h-5 shrink-0" aria-hidden="true" /> Reportes
        </Link>
        <Link
          to="/cartilla/ayuda"
          activeProps={{ className: activeCls }}
          inactiveProps={{ className: inactiveCls }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors min-h-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8da47e]"
        >
          <CircleHelp className="w-5 h-5 shrink-0" aria-hidden="true" /> Ayuda
        </Link>
      </nav>
      <div className="p-4 border-t border-[#e8e2d9]">
        <Link 
          to="/cartilla"
          className="flex items-center gap-3 px-3 py-2 text-[#7a7065] hover:bg-[#f2d8d8] hover:text-[hsl(354,78%,35%)] rounded-xl font-bold text-sm transition-colors min-h-11"
        >
          <Settings className="w-5 h-5" aria-hidden="true" /> Salir a Cartilla
        </Link>
      </div>
    </aside>
  );
}
