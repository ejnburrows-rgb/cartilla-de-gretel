import React from "react";
import type { TutorialStepType } from "@/hooks/useTutorial";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

interface TutorialStepProps {
  step: TutorialStepType;
  stepIndex: number;
  totalSteps: number;
  x: number;
  y: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

// Hoisted Styles for double-brace JSX styling ban compliance
const stepCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1.5px solid var(--border-color)",
  paddingBottom: "0.5rem",
  marginBottom: "0.5rem",
  width: "100%",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.05rem",
  fontWeight: "800",
  color: "var(--primary-color)",
  margin: 0,
};

const descStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  lineHeight: "1.4",
  color: "var(--text-color)",
  margin: 0,
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "1rem",
  borderTop: "1px dashed var(--border-color)",
  paddingTop: "0.75rem",
};

const primaryBtnStyle: React.CSSProperties = {
  backgroundColor: "var(--primary-color)",
  color: "var(--primary-fg)",
  padding: "0.45rem 0.85rem",
  borderRadius: "0.65rem",
  fontWeight: "bold",
  fontSize: "0.72rem",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  transition: "all 0.15s ease",
};

const outlineBtnStyle: React.CSSProperties = {
  border: "1.5px solid var(--border-color)",
  backgroundColor: "transparent",
  color: "var(--text-color)",
  padding: "0.4rem 0.75rem",
  borderRadius: "0.65rem",
  fontWeight: "bold",
  fontSize: "0.72rem",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  transition: "all 0.15s ease",
};

const skipBtnStyle: React.CSSProperties = {
  border: "none",
  backgroundColor: "transparent",
  color: "var(--muted-color)",
  fontSize: "0.7rem",
  fontWeight: "bold",
  cursor: "pointer",
  padding: 0,
};

export function TutorialStep({
  step,
  stepIndex,
  totalSteps,
  x,
  y,
  onNext,
  onPrev,
  onSkip,
}: TutorialStepProps) {
  // Dynamically compute positioning to place step dialogue in optimal region relative to targets
  const getCardPositionStyle = (): React.CSSProperties => {
    if (step.position === "center" || !x || !y) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    if (step.position === "bottom") {
      return {
        top: `${Math.min(window.innerHeight - 220, y + 60)}px`,
        left: `${Math.max(20, Math.min(window.innerWidth - 400, x - 190))}px`,
      };
    }

    // Default to 'top' position to sit nicely above targets
    return {
      top: `${Math.max(20, y - 220)}px`,
      left: `${Math.max(20, Math.min(window.innerWidth - 400, x - 190))}px`,
    };
  };

  const currentCardStyle = {
    ...getCardPositionStyle(),
  };

  return (
    <div
      style={currentCardStyle}
      className="tutorial-step-card no-print"
      role="dialog"
      aria-labelledby="tutorial-step-title"
      aria-describedby="tutorial-step-desc"
    >
      <header style={stepCardHeaderStyle}>
        <h3 id="tutorial-step-title" style={titleStyle}>
          {step.title}
        </h3>
        <button
          onClick={onSkip}
          style={skipBtnStyle}
          className="hover:text-red-500"
          aria-label="Cerrar tutorial"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      <p id="tutorial-step-desc" style={descStyle}>
        {step.description}
      </p>

      <div style={actionRowStyle}>
        <button
          onClick={onSkip}
          style={skipBtnStyle}
          className="hover:underline"
        >
          Omitir tutorial
        </button>

        <div className="flex gap-2">
          {stepIndex > 0 && (
            <button
              onClick={onPrev}
              style={outlineBtnStyle}
              className="hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Atrás</span>
            </button>
          )}

          <button
            onClick={onNext}
            style={primaryBtnStyle}
            className="hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            <span>{stepIndex === totalSteps - 1 ? "Comenzar" : "Siguiente"}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
export type TutorialStep = typeof TutorialStep;
