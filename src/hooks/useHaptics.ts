import { useCallback } from "react";
import { triggerHaptic, HapticKind } from "../lib/haptic-patterns";

export function useHaptics() {
  const trigger = useCallback((kind: HapticKind) => {
    triggerHaptic(kind);
  }, []);

  return { trigger };
}

export type UseHaptics = typeof useHaptics;
