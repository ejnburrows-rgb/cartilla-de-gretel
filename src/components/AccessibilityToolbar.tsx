import { useState } from "react";
import { Eye, LetterText, ZoomIn } from "lucide-react";
import { storage } from "@/lib/storage";

type TextSize = "normal" | "large" | "xlarge";

const SIZE_KEY = "cartilla.accessibility.textSize";
const CONTRAST_KEY = "cartilla.accessibility.highContrast";

function applyA11y(size: TextSize, highContrast: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("a11y-large", size === "large");
  root.classList.toggle("a11y-xlarge", size === "xlarge");
  root.classList.toggle("a11y-contrast", highContrast);
}

function readInitialSettings() {
  const size = storage.get<TextSize>(SIZE_KEY, "normal");
  const highContrast = storage.get(CONTRAST_KEY, false);
  applyA11y(size, highContrast);
  return { size, highContrast };
}

export function AccessibilityToolbar() {
  const [settings, setSettings] = useState(readInitialSettings);
  const { size, highContrast } = settings;

  const updateSettings = (next: { size: TextSize; highContrast: boolean }) => {
    applyA11y(next.size, next.highContrast);
    storage.set(SIZE_KEY, next.size);
    storage.set(CONTRAST_KEY, next.highContrast);
    setSettings(next);
  };

  const cycleSize = () => {
    const nextSize = size === "normal" ? "large" : size === "large" ? "xlarge" : "normal";
    updateSettings({ size: nextSize, highContrast });
  };

  return (
    <div className="fixed bottom-24 right-3 z-50 flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-2xl border-2 border-foreground/15 bg-card/95 p-2 shadow-xl backdrop-blur">
      <button
        type="button"
        onClick={cycleSize}
        className="tap-target inline-flex items-center gap-2 rounded-xl border-2 border-foreground/10 bg-background px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary"
      >
        <ZoomIn className="h-4 w-4" />
        Letra {size === "normal" ? "normal" : size === "large" ? "grande" : "muy grande"}
      </button>
      <button
        type="button"
        onClick={() => updateSettings({ size, highContrast: !highContrast })}
        className="tap-target inline-flex items-center gap-2 rounded-xl border-2 border-foreground/10 bg-background px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary"
        aria-pressed={highContrast}
      >
        {highContrast ? <Eye className="h-4 w-4" /> : <LetterText className="h-4 w-4" />}
        {highContrast ? "Contraste alto" : "Más contraste"}
      </button>
    </div>
  );
}
