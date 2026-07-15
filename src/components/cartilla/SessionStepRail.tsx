import { useEffect } from "react";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { BookOpen, HelpCircle, Layers, Type, ArrowRight } from "lucide-react";

export type SessionStep = {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
};

const INTRO_STEPS: SessionStep[] = [
  { id: "intro", label: "Introducción", desc: "Presentación de las Vocales", icon: BookOpen },
  { id: "reading", label: "Lectura", desc: "Práctica de Lectura", icon: Type },
];

const VOWEL_STEPS: SessionStep[] = [
  { id: "intro", label: "Presentación", desc: "Historia del Personaje", icon: BookOpen },
  { id: "word-match", label: "Aparear Palabras", desc: "Asociación Vocabulario", icon: Layers },
  { id: "drag-build", label: "Construir Palabras", desc: "Arrastrar Sílabas", icon: HelpCircle },
  { id: "reading", label: "Lectura", desc: "Lectura Guiada", icon: Type },
];

const CONSONANT_STEPS: SessionStep[] = [
  { id: "intro", label: "Presentación", desc: "Trazado e Intro", icon: BookOpen },
  { id: "syllable-tap", label: "Toque de Sílabas", desc: "Lectura de Sílabas", icon: Layers },
  { id: "word-match", label: "Aparear Palabras", desc: "Vocabulario Ilustrado", icon: HelpCircle },
  {
    id: "drag-build",
    label: "Construir Palabras",
    desc: "Construcción Ortográfica",
    icon: HelpCircle,
  },
  { id: "reading", label: "Lectura", desc: "Lectura de Oraciones", icon: Type },
];

export function getStepsForLesson(entry: CatalogEntry): SessionStep[] {
  if (entry.kind === "intro") return INTRO_STEPS;
  if (entry.kind === "vowel") return VOWEL_STEPS;
  return CONSONANT_STEPS;
}

interface SessionStepRailProps {
  entry: CatalogEntry;
  activeStepIdx: number;
  onStepChange: (idx: number) => void;
}

const railContainerStyle: React.CSSProperties = {
  backgroundColor: "#f9f6f0",
  borderRight: "2px solid #ecdac3",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  height: "100%",
};

export function SessionStepRail({ entry, activeStepIdx, onStepChange }: SessionStepRailProps) {
  const steps = getStepsForLesson(entry);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus standard tags or input fields should ignore shortcut triggers
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // 1 — Navigation 1-5
      const num = Number(e.key);
      if (num >= 1 && num <= steps.length) {
        e.preventDefault();
        onStepChange(num - 1);
      }

      // 2 — Arrow Up/Down
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onStepChange(Math.max(0, activeStepIdx - 1));
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        onStepChange(Math.min(steps.length - 1, activeStepIdx + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [steps, activeStepIdx, onStepChange]);

  return (
    <div style={railContainerStyle}>
      <div className="mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Pasos de la Clase
        </span>
        <p className="text-xs text-stone-500 mt-1">
          Usa <kbd className="bg-stone-200 px-1 rounded">↑/↓</kbd> o números{" "}
          <kbd className="bg-stone-200 px-1 rounded">1-{steps.length}</kbd>
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-2.5">
        {steps.map((step, idx) => {
          const isActive = idx === activeStepIdx;
          const StepIcon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => onStepChange(idx)}
              className={`w-full text-left p-3 rounded-xl border-2 flex items-start gap-3 transition ${
                isActive
                  ? "bg-amber-100 border-amber-800 shadow-sm"
                  : "bg-white hover:bg-stone-50 border-stone-200"
              }`}
              aria-current={isActive ? "step" : undefined}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  isActive ? "bg-amber-800 text-white" : "bg-stone-100 text-stone-500"
                }`}
              >
                <StepIcon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div
                  className={`text-xs font-bold leading-tight ${
                    isActive ? "text-amber-950" : "text-stone-800"
                  }`}
                >
                  {idx + 1}. {step.label}
                </div>
                <div className="text-[10px] text-stone-500 truncate mt-0.5">{step.desc}</div>
              </div>
              {isActive && (
                <ArrowRight className="w-3.5 h-3.5 text-amber-800 shrink-0 ml-auto mt-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
