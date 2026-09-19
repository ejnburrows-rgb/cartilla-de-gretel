import { useCallback, useRef } from "react";
import type * as React from "react";

type PressEvent = React.MouseEvent | React.TouchEvent;

export interface UseLongPressOptions {
  threshold?: number;
  onLongPress: (event: PressEvent) => void;
  onClick?: (event: PressEvent) => void;
}

/** Read the press coordinates from a mouse or touch event; null if no touch. */
function getPressCoords(event: PressEvent): { x: number; y: number } | null {
  if ("touches" in event) {
    if (event.touches.length === 0) return null;
    return { x: event.touches[0]!.clientX, y: event.touches[0]!.clientY };
  }
  return { x: event.clientX, y: event.clientY };
}

export function useLongPress({ onLongPress, onClick, threshold = 600 }: UseLongPressOptions) {
  const timeoutRef = useRef<number | null>(null);
  const startCoords = useRef<{ x: number; y: number } | null>(null);
  const isLongPressActive = useRef(false);

  const start = useCallback(
    (event: PressEvent) => {
      isLongPressActive.current = false;
      const coords = getPressCoords(event);
      if (!coords) return;

      startCoords.current = coords;

      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

      const cachedEvent = { ...event, target: event.target };

      timeoutRef.current = window.setTimeout(() => {
        isLongPressActive.current = true;
        onLongPress(cachedEvent);
      }, threshold);
    },
    [onLongPress, threshold],
  );

  const move = useCallback((event: PressEvent) => {
    if (!startCoords.current || isLongPressActive.current) return;

    const coords = getPressCoords(event);
    if (!coords) return;

    const dx = coords.x - startCoords.current.x;
    const dy = coords.y - startCoords.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 10) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, []);

  const end = useCallback(
    (event: PressEvent) => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (!isLongPressActive.current && onClick) {
        onClick(event);
      }

      startCoords.current = null;
    },
    [onClick],
  );

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseMove: move,
    onTouchMove: move,
    onMouseUp: end,
    onTouchEnd: end,
    onMouseLeave: end,
  };
}

export type UseLongPress = typeof useLongPress;
