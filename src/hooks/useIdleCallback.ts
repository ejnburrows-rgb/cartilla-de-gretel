import { useEffect, useRef } from "react";

export function useIdleCallback(callback: () => void, timeoutMs = 2000) {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let handle: number;
    const runCallback = () => {
      callbackRef.current();
    };

    if ("requestIdleCallback" in window) {
      handle = (window as any).requestIdleCallback(runCallback, { timeout: timeoutMs });
    } else {
      handle = setTimeout(runCallback, 1) as unknown as number;
    }

    return () => {
      if ("cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(handle);
      } else {
        clearTimeout(handle);
      }
    };
  }, [timeoutMs]);
}
export type UseIdleCallback = typeof useIdleCallback;
