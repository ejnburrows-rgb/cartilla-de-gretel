import { Bell, Search } from "lucide-react";

export function Topbar({ search, onSearch }: { search?: string; onSearch?: (value: string) => void } = {}) {
  return (
    <header className="crm-topbar">
      <div className="min-w-0 flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7065]" />
          {onSearch ? <input
            type="text"
            aria-label="Buscar alumno"
            placeholder="Buscar alumno..."
            value={search ?? ""}
            onChange={event => onSearch(event.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#fdfbf7] border border-[#e8e2d9] rounded-lg text-sm focus:outline-none focus:border-[#8da47e] focus:ring-1 focus:ring-[#8da47e]"
          /> : <p className="pl-9 text-sm font-bold">Panel de la clase</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <a href="/cartilla/teacher/progreso" aria-label="Ver progreso de la clase" className="relative p-2 text-[#7a7065] hover:bg-[#f6ecd7] rounded-full transition-colors">
          <Bell className="w-5 h-5" />
        </a>
        <div className="w-8 h-8 rounded-full bg-[#d4a373] text-white flex items-center justify-center font-bold text-sm">
          M
        </div>
      </div>
    </header>
  );
}
