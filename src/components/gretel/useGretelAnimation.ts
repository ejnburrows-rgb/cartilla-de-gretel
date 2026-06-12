import { useEffect, useReducer, useRef, useState, useCallback } from "react";
import {
  gretelReducer,
  GretelState,
  GretelEvent,
} from "./gretelMachine";
import { GRETEL_POSES, GRETEL_FALLBACKS, type GretelPoseState } from "./gretelPoses";

export interface GretelAnimationHook {
  currentPose: string;
  machineState: GretelState;
  send: (event: GretelEvent) => void;
  isRecovering: boolean;
}

export function useGretelAnimation(): GretelAnimationHook {
  const [machineState, dispatch] = useReducer(gretelReducer, "boot");
  const [currentPoseKey, setCurrentPoseKey] = useState<GretelPoseState>("idle-1");
  const [isRecovering, setIsRecovering] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Wraps dispatch so that consumers can send events
  const send = useCallback((event: GretelEvent) => {
    dispatch(event);
  }, []);

  // Preloading utility
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = src;
    });
  };

  const applyPose = useCallback(
    async (poseKey: GretelPoseState) => {
      const src = isRecovering ? GRETEL_FALLBACKS[poseKey] : GRETEL_POSES[poseKey];
      try {
        await preloadImage(src);
        setCurrentPoseKey(poseKey);
      } catch (e) {
        if (!isRecovering) {
          // HD asset failed, fall back
          setIsRecovering(true);
          dispatch({ type: "ASSET_ERROR" });
        } else {
          // Fallback also failed, transition to hard error state
          dispatch({ type: "ASSET_ERROR" });
        }
      }
    },
    [isRecovering]
  );

  useEffect(() => {
    // When we boot, just init immediately
    if (machineState === "boot") {
      dispatch({ type: "INIT" });
      return;
    }

    clearTimer();

    // Effect logic for each state
    let isCancelled = false;

    const runIdleCycle = () => {
      const interval = 4000 + Math.random() * 2000;
      timerRef.current = setTimeout(() => {
        if (isCancelled) return;
        
        // Randomly decide to blink or alternate idle
        if (Math.random() < 0.3) {
          dispatch({ type: "BLINK" });
        } else {
          setCurrentPoseKey((prev) => {
            const next = prev === "idle-1" ? "idle-2" : "idle-1";
            applyPose(next);
            return next; // Optimistic update, actual update happens in applyPose
          });
          runIdleCycle();
        }
      }, interval);
    };

    const runTalkingCycle = () => {
      timerRef.current = setTimeout(() => {
        if (isCancelled) return;
        setCurrentPoseKey((prev) => {
          const next = prev === "talk-open" ? "talk-closed" : "talk-open";
          applyPose(next);
          return next;
        });
        runTalkingCycle();
      }, 220);
    };

    switch (machineState) {
      case "idle":
        applyPose("idle-1");
        runIdleCycle();
        break;
      case "blinking":
        applyPose("blink");
        timerRef.current = setTimeout(() => {
          if (!isCancelled) dispatch({ type: "IDLE" });
        }, 120);
        break;
      case "talking":
        applyPose("talk-open");
        runTalkingCycle();
        break;
      case "waving":
        applyPose("wave");
        timerRef.current = setTimeout(() => {
          if (!isCancelled) dispatch({ type: "IDLE" });
        }, 2000);
        break;
      case "pointing":
        applyPose("point");
        timerRef.current = setTimeout(() => {
          if (!isCancelled) dispatch({ type: "IDLE" });
        }, 2000);
        break;
      case "cheering":
        applyPose("cheer");
        timerRef.current = setTimeout(() => {
          if (!isCancelled) dispatch({ type: "IDLE" });
        }, 2000);
        break;
      case "error":
        // Fallback for extreme failure - use the most basic available image or nothing
        setCurrentPoseKey("idle-1");
        break;
    }

    return () => {
      isCancelled = true;
      clearTimer();
    };
  }, [machineState, applyPose, clearTimer]);

  const currentSrc = isRecovering
    ? GRETEL_FALLBACKS[currentPoseKey]
    : GRETEL_POSES[currentPoseKey];

  return {
    currentPose: currentSrc,
    machineState,
    send,
    isRecovering,
  };
}
