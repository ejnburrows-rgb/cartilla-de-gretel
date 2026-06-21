import { createFileRoute, Link } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";
import { MonitorPlay, Info, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { TeacherResourcePanel } from "@/components/teacher/TeacherResourcePanel";

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
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  return (
    <div className="w-full space-y-6">
      {selectedResource && (
        <TeacherResourcePanel resourceId={selectedResource} onClose={() => setSelectedResource(null)} />
      )}
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
            <button 
              onClick={(e) => {
                e.preventDefault();
                setSelectedResource(`lesson-${entry.n}`);
              }}
              className="mt-4 inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-500 hover:bg-stone-200 hover:text-stone-800"
            >
              <Info className="h-3 w-3" /> Más info
            </button>
          </Link>
        ))}
      </div>

      <div className="mt-12 mb-5 border-t-2 border-stone-100 pt-8">
        <h2 className="text-2xl font-black text-stone-800 flex items-center gap-2">
          <Gamepad2 className="w-7 h-7 text-[#f97316]" /> Juegos Interactivos
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <a
          href="/cartilla/juego/payaso-chano-ss"
          className="group block rounded-[2rem] border-2 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md active:scale-95 text-center flex flex-col justify-center items-center min-h-[140px]"
          style={accentBorderStyle("#f97316")}
        >
          <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
            Juego
          </div>
          <div
            className="text-2xl font-black font-fredoka transition-transform group-hover:scale-110"
            style={titleStyle("#f97316")}
          >
            Payaso Chano
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              setSelectedResource("game-payaso-chano");
            }}
            className="mt-4 inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors"
          >
            <Info className="h-3 w-3" /> Más info
          </button>
        </a>
      </div>
    </div>
  );
}
