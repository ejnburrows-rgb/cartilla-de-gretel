import { createFileRoute, Link } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";
import { MonitorPlay } from "lucide-react";

export const Route = createFileRoute("/cartilla/teacher/flipchart/")({
  component: FlipchartPickerPage,
});

function titleStyle(color: string): React.CSSProperties {
  return { color };
}

function accentBorderStyle(color: string): React.CSSProperties {
  return { borderColor: color };
}

function FlipchartPickerPage() {
  return (
    <div className="w-full space-y-6">
      <header className="no-print mb-8">
        <h1 className="text-3xl font-black text-stone-800 flex items-center gap-2">
          <MonitorPlay className="w-8 h-8 text-[#8da47e]" /> Flipchart Proyector
        </h1>
        <p className="text-sm font-bold text-stone-500 mt-1 max-w-xl">
          Selecciona una lección para proyectarla en pantalla completa. Usa las flechas del teclado para navegar por las páginas reales del libro.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {CATALOG.map((entry) => (
          <Link
            key={entry.n}
            to="/cartilla/teacher/flipchart/$n"
            params={{ n: String(entry.n) }}
            className="group block rounded-[2rem] border-2 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md active:scale-95 text-center flex flex-col justify-center items-center min-h-[140px]"
            style={accentBorderStyle(entry.color)}
          >
            <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
              Lección {entry.n}
            </div>
            <div
              className="text-3xl font-black font-fredoka transition-transform group-hover:scale-110"
              style={titleStyle(entry.color)}
            >
              {entry.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
