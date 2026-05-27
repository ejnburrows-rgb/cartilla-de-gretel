import React, { useState, useEffect, useCallback } from "react";

interface TutorialSpotlightProps {
  targetSelector: string;
  onChangeCoords: (x: number, y: number) => void;
}

export function TutorialSpotlight({ targetSelector, onChangeCoords }: TutorialSpotlightProps) {
  const [coords, setCoords] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const measureTarget = useCallback(() => {
    if (!targetSelector) {
      setCoords(null);
      // Default coordinate to center of screen for step dialogues
      if (typeof window !== "undefined") {
        onChangeCoords(window.innerWidth / 2, window.innerHeight / 2);
      }
      return;
    }

    const element = document.querySelector(targetSelector);
    if (!element) {
      setCoords(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    setCoords({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
    
    onChangeCoords(x, y);
  }, [targetSelector, onChangeCoords]);

  useEffect(() => {
    // Measure on mount or selector change
    measureTarget();

    // Re-measure on window events to maintain spotlight coordinates
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget);

    return () => {
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget);
    };
  }, [measureTarget]);

  if (!coords) return null;

  const spotlightStyle: React.CSSProperties = {
    top: `${coords.y - 6}px`,
    left: `${coords.x - 6}px`,
    width: `${coords.width + 12}px`,
    height: `${coords.height + 12}px`,
  };

  return (
    <div
      style={spotlightStyle}
      className="tutorial-spotlight-cutout no-print"
      aria-hidden="true"
    />
  );
}
export type TutorialSpotlight = typeof TutorialSpotlight;
