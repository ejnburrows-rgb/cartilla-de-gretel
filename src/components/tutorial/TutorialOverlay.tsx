import React, { useState } from "react";
import { useTutorial } from "@/hooks/useTutorial";
import { TutorialSpotlight } from "./TutorialSpotlight";
import { TutorialHand } from "./TutorialHand";
import { TutorialStep } from "./TutorialStep";
import "@/styles/tutorial.css";

export function TutorialOverlay() {
  const {
    isActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    finishTutorial,
  } = useTutorial();

  // Pointer coordinates tracked dynamically
  const [handCoords, setHandCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleCoordsChange = (newX: number, newY: number) => {
    setHandCoords({ x: newX, y: newY });
  };

  if (!isActive) return null;

  return (
    <div
      className="tutorial-overlay-container no-print"
      role="presentation"
    >
      {/* 1. Backdrop Spotlight Mask */}
      <TutorialSpotlight
        targetSelector={currentStep.targetSelector}
        onChangeCoords={handleCoordsChange}
      />

      {/* 2. Floating point hand indicator */}
      {currentStep.targetSelector && handCoords.x > 0 && handCoords.y > 0 && (
        <TutorialHand x={handCoords.x} y={handCoords.y} />
      )}

      {/* 3. Instruction Card Dialog */}
      <TutorialStep
        step={currentStep}
        stepIndex={currentStepIndex}
        totalSteps={totalSteps}
        x={handCoords.x}
        y={handCoords.y}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={finishTutorial}
      />
    </div>
  );
}
export type TutorialOverlay = typeof TutorialOverlay;
