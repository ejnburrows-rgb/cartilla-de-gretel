import { useState, useEffect, useCallback } from "react";

export interface TutorialStepType {
  targetSelector: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right" | "center";
}

export const TUTORIAL_STEPS: TutorialStepType[] = [
  {
    targetSelector: ".pdf-page-wrapper",
    title: "¡Te doy la bienvenida a la Cartilla de Gretel!",
    description: "Esta es tu Cartilla interactiva. Aquí leeremos juntos historias increíbles y aprenderemos sílabas divertidas.",
    position: "bottom",
  },
  {
    targetSelector: ".exercise-handout-box, .student-exercise-pane, [role='tabpanel']",
    title: "Área de Práctica",
    description: "En este espacio harás ejercicios táctiles: trazar letras, formar palabras y unir sílabas para subir de nivel.",
    position: "top",
  },
  {
    targetSelector: ".gretel-avatar-container",
    title: "Gretel Asistente",
    description: "Yo estaré aquí para darte ánimos, guiarte en tus trazos y celebrar a lo grande cada uno de tus aciertos.",
    position: "top",
  },
  {
    targetSelector: ".no-print button, .kiosko-huge-arrow, .navigation-overlay-box",
    title: "Cambiar de Página",
    description: "Usa los botones para avanzar o retroceder páginas, o desliza tu dedo de izquierda a derecha en tu iPad o tableta.",
    position: "top",
  },
  {
    targetSelector: "",
    title: "¡Todo Listo!",
    description: "Toca cualquier sílaba o letra de la pantalla para comenzar esta aventura literaria. ¡A leer!",
    position: "center",
  },
];

export function useTutorial() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Check localStorage for tutorial done
  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem("cartilla.tutorial.done") === "true";
    if (!done) {
      // Trigger tutorial first run with small delay
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const finishTutorial = useCallback(() => {
    setIsActive(false);
    localStorage.setItem("cartilla.tutorial.done", "true");
  }, []);

  const resetTutorial = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      finishTutorial();
    }
  }, [currentStepIndex, finishTutorial]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  return {
    isActive,
    currentStepIndex,
    currentStep: TUTORIAL_STEPS[currentStepIndex],
    totalSteps: TUTORIAL_STEPS.length,
    nextStep,
    prevStep,
    finishTutorial,
    resetTutorial,
  };
}
export type UseTutorialReturn = ReturnType<typeof useTutorial>;
