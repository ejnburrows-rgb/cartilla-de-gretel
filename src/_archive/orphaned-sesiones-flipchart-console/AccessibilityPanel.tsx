import { useSessionStore, sessionStore } from "@/lib/session-store";
import { Eye, Type, AlignLeft, ShieldAlert } from "lucide-react";

const a11yPanelStyle: React.CSSProperties = {
  padding: "1rem",
  backgroundColor: "#fcf8f2",
  borderRadius: "1.5rem",
  border: "2px solid #ecdac3",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

export function AccessibilityPanel() {
  const { fontScale, dyslexic, highContrast, lineSpacing } = useSessionStore();

  const setScale = (scale: 100 | 125 | 150) => {
    sessionStore.update({ fontScale: scale });
  };

  const toggleDyslexic = () => {
    sessionStore.update({ dyslexic: !dyslexic });
  };

  const toggleContrast = () => {
    sessionStore.update({ highContrast: !highContrast });
  };

  const setSpacing = (spacing: "normal" | "tight" | "loose") => {
    sessionStore.update({ lineSpacing: spacing });
  };

  return (
    <div style={a11yPanelStyle}>
      <div className="flex items-center gap-2 mb-1">
        <Eye className="w-5 h-5 text-amber-800" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Panel de Accesibilidad
        </h3>
      </div>

      {/* 1. Font Size */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1">
          <Type className="w-3.5 h-3.5" /> Tamaño de Texto
        </label>
        <div className="grid grid-cols-3 gap-1">
          {[100, 125, 150].map((scale) => {
            const isActive = fontScale === scale;
            return (
              <button
                key={scale}
                onClick={() => setScale(scale as 100 | 125 | 150)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                  isActive
                    ? "bg-amber-800 text-white border-amber-800"
                    : "bg-white hover:bg-stone-50 border-stone-200 text-stone-600"
                }`}
              >
                {scale}%
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Line Spacing */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1">
          <AlignLeft className="w-3.5 h-3.5" /> Espaciado de Líneas
        </label>
        <div className="grid grid-cols-3 gap-1">
          {(["tight", "normal", "loose"] as const).map((space) => {
            const isActive = lineSpacing === space;
            const labels = { tight: "Apretado", normal: "Normal", loose: "Espacioso" };
            return (
              <button
                key={space}
                onClick={() => setSpacing(space)}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition truncate ${
                  isActive
                    ? "bg-amber-800 text-white border-amber-800"
                    : "bg-white hover:bg-stone-50 border-stone-200 text-stone-600"
                }`}
              >
                {labels[space]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Toggles */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        {/* Dyslexia Mode Toggle */}
        <button
          onClick={toggleDyslexic}
          className={`p-2.5 rounded-xl border-2 font-bold text-xs transition flex flex-col items-center gap-1 text-center justify-center ${
            dyslexic
              ? "bg-amber-100 border-amber-850 text-amber-950"
              : "bg-white hover:bg-stone-50 border-stone-200 text-stone-600"
          }`}
        >
          <span className="text-base">Aa</span>
          <span>Tipografía Dislexia</span>
        </button>

        {/* High Contrast Toggle */}
        <button
          onClick={toggleContrast}
          className={`p-2.5 rounded-xl border-2 font-bold text-xs transition flex flex-col items-center gap-1 text-center justify-center ${
            highContrast
              ? "bg-amber-100 border-amber-850 text-amber-950"
              : "bg-white hover:bg-stone-50 border-stone-200 text-stone-600"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-stone-800" />
          <span>Alto Contraste</span>
        </button>
      </div>
    </div>
  );
}
