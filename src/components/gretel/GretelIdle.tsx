import React, { useEffect } from "react";
import type { GretelOutcome } from "@/hooks/useGretel";

interface GretelIdleProps {
  currentOutcome: GretelOutcome;
  setOutcome: (o: GretelOutcome) => void;
}

export function GretelIdle({ currentOutcome, setOutcome }: GretelIdleProps) {
  useEffect(() => {
    // Only cycle idle poses if the current outcome is 'happy' or 'idle'
    if (currentOutcome !== "happy" && currentOutcome !== "idle") return;

    const runIdleCycle = () => {
      // Random cycle interval between 4 and 6 seconds
      const interval = 4000 + Math.random() * 2000;
      
      const timer = setTimeout(() => {
        setOutcome(currentOutcome === "happy" ? "idle" : "happy");
        runIdleCycle();
      }, interval);

      return timer;
    };

    const activeTimer = runIdleCycle();
    return () => clearTimeout(activeTimer);
  }, [currentOutcome, setOutcome]);

  return null;
}
