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

    const idleWindow = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (idleWindow.requestIdleCallback) {
      handle = idleWindow.requestIdleCallback(runCallback, { timeout: timeoutMs });
    } else {
      handle = setTimeout(runCallback, 1) as unknown as number;
    }

    return () => {
      if (idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(handle);
      } else {
        clearTimeout(handle);
      }
    };
  }, [timeoutMs]);
}
export type UseIdleCallback = typeof useIdleCallback;
