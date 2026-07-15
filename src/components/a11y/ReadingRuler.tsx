import React, { useState, useEffect } from "react";

export function ReadingRuler() {
  const [active, setActive] = useState<boolean>(false);
  const [topPos, setTopPos] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Follow mouse movements
    const handleMouseMove = (e: MouseEvent) => {
      setTopPos(e.clientY);
    };

    // 2. Follow touch movement as fallback
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        setTopPos(e.touches[0].clientY);
      }
    };

    // 3. Listen to keyboard toggles: press 'Alt + R' or 'Ctrl + R' to toggle the ruler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        setActive((prev) => !prev);
      }
    };

    // 4. Custom event toggle
    const handleCustomToggle = (e: Event) => {
      const state = (e as CustomEvent)?.detail?.active;
      setActive(state !== undefined ? state : (prev) => !prev);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("cartilla:reading-ruler-toggle", handleCustomToggle);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("cartilla:reading-ruler-toggle", handleCustomToggle);
    };
  }, []);

  if (!active) return null;

  const rulerStyle: React.CSSProperties = {
    top: `${topPos}px`,
  };

  return <div style={rulerStyle} className="reading-ruler" aria-hidden="true" />;
}

// Global toggler helper
export function toggleReadingRuler(active?: boolean) {
  if (typeof window === "undefined") return;
  const event = new CustomEvent("cartilla:reading-ruler-toggle", {
    detail: { active },
  });
  window.dispatchEvent(event);
}
