import { useRef, useCallback } from "react";

export interface SwipeData {
  direction: "left" | "right" | "up" | "down";
  distance: number;
  velocity: number;
}

export interface UseSwipeOptions {
  onSwipe: (data: SwipeData) => void;
  minDistance?: number;
}

export function useSwipe({ onSwipe, minDistance = 30 }: UseSwipeOptions) {
  const startRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    startRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now(),
    };
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    // Tracing moved coordinates if necessary
  }, []);

  const onPointerUp = useCallback((event: React.PointerEvent) => {
    if (!startRef.current) return;

    const dx = event.clientX - startRef.current.x;
    const dy = event.clientY - startRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = Date.now() - startRef.current.time;

    startRef.current = null;

    if (distance < minDistance || duration === 0) return;

    const velocity = distance / duration;
    let direction: "left" | "right" | "up" | "down";

    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx < 0 ? "left" : "right";
    } else {
      direction = dy < 0 ? "up" : "down";
    }

    onSwipe({ direction, distance, velocity });
  }, [onSwipe, minDistance]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}

export type UseSwipe = typeof useSwipe;
