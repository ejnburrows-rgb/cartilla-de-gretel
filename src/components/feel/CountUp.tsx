import React, { useEffect, useState } from "react";

interface CountUpProps {
  end: number;
  start?: number;
  durationMs?: number;
}

export function CountUp({ end, start = 0, durationMs = 800 }: CountUpProps) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValue(end);
      return;
    }

    const startTime = performance.now();

    const easeOutBack = (x: number): number => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    };

    let frameId: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      const easeProgress = easeOutBack(progress);
      const currentVal = Math.round(start + (end - start) * easeProgress);

      setValue(currentVal);

      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      } else {
        setValue(end);
      }
    };

    frameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frameId);
  }, [end, start, durationMs]);

  return <span>{value}</span>;
}

export default CountUp;
