import { useLayoutEffect, useRef, type RefObject } from "react";
import { canvasStorageKey, saveCanvasSnapshot } from "./activity-canvas-store";

/** Save an interrupted stroke before navigation/unmount; capture the learner key. */
export function useCanvasContinuity(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  activeRef: RefObject<boolean>,
  pageKey: string,
  flush?: () => void,
) {
  const flushRef = useRef(flush);
  flushRef.current = flush;
  useLayoutEffect(() => {
    const capturedKey = canvasStorageKey(pageKey);
    const save = () => {
      const canvas = canvasRef.current;
      if (!canvas || !activeRef.current) return;
      flushRef.current?.();
      try { saveCanvasSnapshot(pageKey, canvas.toDataURL("image/png"), capturedKey); }
      catch { window.dispatchEvent(new Event("cartilla:work-save-failed")); }
    };
    const hide = () => { if (document.hidden) save(); };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", hide);
    return () => {
      save();
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [canvasRef, activeRef, pageKey]);
}
