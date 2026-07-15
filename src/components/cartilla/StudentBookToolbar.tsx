import { useState, useEffect } from "react";
import {
  Printer,
  Sun,
  Moon,
  Sparkles,
  Type,
  ChevronLeft,
  ChevronRight,
  Volume2,
} from "lucide-react";

interface StudentBookToolbarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrint?: () => void;
  onAudio?: () => void;
}

const toolbarClass =
  "student-toolbar no-print sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b-2 border-stone-150 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm";
const btnGroupClass = "flex items-center gap-1.5";
const iconBtnClass =
  "p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition hover:scale-105 active:scale-95";
const activeIconBtnClass =
  "p-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 transition font-bold";
const navBtnClass =
  "px-3 py-1.5 rounded-xl bg-amber-900 text-white font-bold text-xs hover:bg-amber-850 disabled:opacity-40 transition flex items-center gap-1";

export function StudentBookToolbar({
  currentPage,
  totalPages,
  onPageChange,
  onPrint,
  onAudio,
}: StudentBookToolbarProps) {
  const [theme, setTheme] = useState<string>("default");

  // Handle local theme switches
  const handleThemeSwitch = (newTheme: string) => {
    setTheme(newTheme);
    const body = document.body;
    body.className = body.className.replace(/theme-\S+/g, ""); // clear previous themes
    if (newTheme !== "default") {
      body.classList.add(`theme-${newTheme}`);
    }
  };

  return (
    <div className={toolbarClass}>
      {/* 1. Theme controls */}
      <div className={btnGroupClass}>
        <button
          onClick={() => handleThemeSwitch("default")}
          className={theme === "default" ? activeIconBtnClass : iconBtnClass}
          title="Modo Claro Estándar"
          aria-label="Modo Claro"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleThemeSwitch("dark")}
          className={theme === "dark" ? activeIconBtnClass : iconBtnClass}
          title="Modo Oscuro Ink & Paper"
          aria-label="Modo Oscuro"
        >
          <Moon className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleThemeSwitch("high-contrast")}
          className={theme === "high-contrast" ? activeIconBtnClass : iconBtnClass}
          title="Contraste Alto WCAG AAA"
          aria-label="Contraste Alto"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleThemeSwitch("dyslexia")}
          className={theme === "dyslexia" ? activeIconBtnClass : iconBtnClass}
          title="Tipografía OpenDyslexic"
          aria-label="Tipografía Dislexia"
        >
          <Type className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={navBtnClass}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        <span className="text-sm font-bold text-stone-600 font-mono">
          Pág. {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={navBtnClass}
          aria-label="Página siguiente"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Audio & Export PDF / print */}
      <div className="flex items-center gap-2">
        {onAudio && (
          <button
            onClick={onAudio}
            className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs inline-flex items-center gap-2 shadow hover:scale-[1.02] active:scale-95 transition"
            aria-label="Escuchar página"
          >
            <Volume2 className="w-4 h-4" />
            Escuchar
          </button>
        )}
        {onPrint && (
          <button
            onClick={onPrint}
            className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs inline-flex items-center gap-2 shadow hover:scale-[1.02] active:scale-95 transition"
            aria-label="Imprimir libro de trabajo"
          >
            <Printer className="w-4 h-4" />
            Imprimir / PDF
          </button>
        )}
      </div>
    </div>
  );
}
