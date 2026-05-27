import React, { useState, useCallback, useRef } from "react";

interface RippleInstance {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function useRipple() {
  const [ripples, setRipples] = useState<RippleInstance[]>([]);
  const nextId = useRef(0);
  const elementRef = useRef<HTMLElement | null>(null);

  const addRipple = useCallback((event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    const el = elementRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in event) {
      if (event.touches.length === 0) return;
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Circle bounding size
    const size = Math.max(rect.width, rect.height) * 2;

    const newRipple: RippleInstance = {
      id: nextId.current++,
      x,
      y,
      size,
    };

    setRipples((prev) => [...prev, newRipple]);

    // Duration of standard ripple effect
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  }, []);

  return {
    ref: elementRef,
    ripples,
    onMouseDown: addRipple,
    onTouchStart: addRipple,
  };
}

export type UseRipple = typeof useRipple;
