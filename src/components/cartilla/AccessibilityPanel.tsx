import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

type TextSize = "base" | "lg" | "xl";

type A11ySettings = {
  reduceMotion: boolean;
  highContrast: boolean;
  textSize: TextSize;
};

const A11Y_KEY = "cartilla:a11y:settings";
const DEFAULT_A11Y_SETTINGS: A11ySettings = {
  reduceMotion: false,
  highContrast: false,
  textSize: "base",
};

function readA11ySettings(): A11ySettings {
  if (typeof window === "undefined") return DEFAULT_A11Y_SETTINGS;
  try {
    const raw = localStorage.getItem(A11Y_KEY);
    return raw ? (JSON.parse(raw) as A11ySettings) : DEFAULT_A11Y_SETTINGS;
  } catch {
    return DEFAULT_A11Y_SETTINGS;
  }
}

function applyA11ySettings(settings: A11ySettings) {
  const root = document.documentElement;
  root.classList.toggle("cartilla-reduce-motion", settings.reduceMotion);
  root.classList.toggle("cartilla-high-contrast", settings.highContrast);
  root.classList.toggle("cartilla-text-lg", settings.textSize === "lg");
  root.classList.toggle("cartilla-text-xl", settings.textSize === "xl");
}

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(readA11ySettings);

  useEffect(() => {
    applyA11ySettings(settings);
    localStorage.setItem(A11Y_KEY, JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="fixed bottom-28 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
      {open && (
        <section className="cartilla-floating-control w-72 rounded-2xl border-2 border-amber-900/20 bg-white/95 p-3 text-[#3A281E] shadow-2xl backdrop-blur">
          <h2 className="mb-3 text-sm font-black">Accesibilidad</h2>
          <div className="space-y-2">
            <button
              type="button"
              aria-label="Activar o desactivar movimiento reducido"
              aria-pressed={settings.reduceMotion}
              onClick={() => setSettings((current) => ({ ...current, reduceMotion: !current.reduceMotion }))}
              className="cartilla-focus-ring flex w-full items-center justify-between rounded-xl border border-amber-900/15 px-3 py-2 text-left text-sm font-bold"
            >
              Movimiento reducido
              <span>{settings.reduceMotion ? "Si" : "No"}</span>
            </button>
            <button
              type="button"
              aria-label="Activar o desactivar alto contraste"
              aria-pressed={settings.highContrast}
              onClick={() => setSettings((current) => ({ ...current, highContrast: !current.highContrast }))}
              className="cartilla-focus-ring flex w-full items-center justify-between rounded-xl border border-amber-900/15 px-3 py-2 text-left text-sm font-bold"
            >
              Alto contraste
              <span>{settings.highContrast ? "Si" : "No"}</span>
            </button>
            <div className="rounded-xl border border-amber-900/15 p-2">
              <div className="mb-2 text-xs font-black uppercase tracking-wide text-amber-900/70">Tamano de texto</div>
              <div className="grid grid-cols-3 gap-1">
                {(["base", "lg", "xl"] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    aria-label={`Usar texto ${size}`}
                    aria-pressed={settings.textSize === size}
                    onClick={() => setSettings((current) => ({ ...current, textSize: size }))}
                    className="cartilla-focus-ring rounded-lg border border-amber-900/15 px-2 py-2 text-xs font-black aria-pressed:bg-amber-800 aria-pressed:text-white"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      <button
        type="button"
        aria-label="Abrir panel de accesibilidad"
        onClick={() => setOpen((current) => !current)}
        className="cartilla-focus-ring inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-amber-900/20 bg-white px-4 py-2 text-sm font-black text-[#3A281E] shadow-xl"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Accesibilidad
      </button>
    </div>
  );
}
