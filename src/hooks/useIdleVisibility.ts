import { useEffect, useState } from "react";

export function useIdleVisibility(delayMs = 2500) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timeoutId: number;

    const resetTimer = () => {
      setIsVisible(true);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsVisible(false);
      }, delayMs);
    };

    resetTimer();

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "pointermove"];
    for (const event of events) {
      window.addEventListener(event, resetTimer, { passive: true });
    }

    return () => {
      window.clearTimeout(timeoutId);
      for (const event of events) {
        window.removeEventListener(event, resetTimer);
      }
    };
  }, [delayMs]);

  return isVisible;
}
