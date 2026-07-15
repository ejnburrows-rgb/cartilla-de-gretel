import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="crm-topbar">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7065]" />
          <input
            type="text"
            placeholder="Buscar alumno, lección o tarea..."
            className="w-full pl-9 pr-4 py-2 bg-[#fdfbf7] border border-[#e8e2d9] rounded-lg text-sm focus:outline-none focus:border-[#8da47e] focus:ring-1 focus:ring-[#8da47e]"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-[#7a7065] hover:bg-[#f6ecd7] rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d4a373] rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-[#d4a373] text-white flex items-center justify-center font-bold text-sm">
          M
        </div>
      </div>
    </header>
  );
}
