import { useCallback, useRef } from "react";

export interface UseLongPressOptions {
  threshold?: number;
  onLongPress: (event: any) => void;
  onClick?: (event: any) => void;
}

export function useLongPress({ onLongPress, onClick, threshold = 600 }: UseLongPressOptions) {
  const timeoutRef = useRef<number | null>(null);
  const startCoords = useRef<{ x: number; y: number } | null>(null);
  const isLongPressActive = useRef(false);

  const start = useCallback(
    (event: any) => {
      isLongPressActive.current = false;
      let clientX = 0;
      let clientY = 0;

      if (event.touches) {
        if (event.touches.length === 0) return;
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      startCoords.current = { x: clientX, y: clientY };

      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

      const cachedEvent = { ...event, target: event.target };

      timeoutRef.current = window.setTimeout(() => {
        isLongPressActive.current = true;
        onLongPress(cachedEvent);
      }, threshold);
    },
    [onLongPress, threshold],
  );

  const move = useCallback((event: any) => {
    if (!startCoords.current || isLongPressActive.current) return;

    let clientX = 0;
    let clientY = 0;

    if (event.touches) {
      if (event.touches.length === 0) return;
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const dx = clientX - startCoords.current.x;
    const dy = clientY - startCoords.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 10) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, []);

  const end = useCallback(
    (event: any) => {
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
