import { useCallback, useRef } from "react";

export function useDoubleTap<E>(onDoubleTap: (event: E) => void, delayMs = 300) {
  const lastTapRef = useRef<number>(0);

  const handleTap = useCallback(
    (event: E) => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < delayMs) {
        onDoubleTap(event);
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    },
    [onDoubleTap, delayMs],
  );

  return handleTap;
}

export type UseDoubleTap = typeof useDoubleTap;
