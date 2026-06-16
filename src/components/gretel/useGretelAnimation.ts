import { useEffect, useReducer, useRef, useState, useCallback } from "react";
import {
  gretelReducer,
  GretelState,
  GretelEvent,
} from "./gretelMachine";
import { GRETEL_POSES, GRETEL_FALLBACKS, type GretelPoseState } from "./gretelPoses";

const failedUrls = new Set<string>();
const TRANSPARENT_SPACER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

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
  const lastStateRef = useRef<GretelState>("boot");

  const isRecoveringRef = useRef(isRecovering);
  const currentPoseKeyRef = useRef(currentPoseKey);

  useEffect(() => {
    isRecoveringRef.current = isRecovering;
    currentPoseKeyRef.current = currentPoseKey;
  }, [isRecovering, currentPoseKey]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const send = useCallback((event: GretelEvent) => {
    if (event.type === "RESET") {
      setIsRecovering(false);
      failedUrls.clear();
    } else if (event.type === "ASSET_ERROR") {
      const activeSrc = isRecoveringRef.current
        ? GRETEL_FALLBACKS[currentPoseKeyRef.current]
        : GRETEL_POSES[currentPoseKeyRef.current];
      failedUrls.add(activeSrc);
      if (!isRecoveringRef.current) {
        setIsRecovering(true);
      }
    }
    dispatch(event);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleSpeakStart = () => send({ type: "SPEAK_START" });
    const handleSpeakStop = () => send({ type: "SPEAK_STOP" });

    window.addEventListener("gretel:speak_start", handleSpeakStart);
    window.addEventListener("gretel:speak_stop", handleSpeakStop);

    return () => {
      window.removeEventListener("gretel:speak_start", handleSpeakStart);
      window.removeEventListener("gretel:speak_stop", handleSpeakStop);
    };
  }, [send]);

  // Preloading utility
  const preloadImage = (src: string): Promise<void> => {
    if (src === TRANSPARENT_SPACER) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = src;
    });
  };

  const applyPose = useCallback(
    async (poseKey: GretelPoseState) => {
      const primarySrc = GRETEL_POSES[poseKey];
      const fallbackSrc = GRETEL_FALLBACKS[poseKey];

      const tryPreload = async (src: string) => {
        if (failedUrls.has(src)) throw new Error("Cached failure");
        await preloadImage(src);
      };

      if (isRecovering) {
        try {
          await tryPreload(fallbackSrc);
          setCurrentPoseKey(poseKey);
        } catch (e) {
          failedUrls.add(fallbackSrc);
          dispatch({ type: "ASSET_ERROR" });
        }
      } else {
        try {
          await tryPreload(primarySrc);
          setCurrentPoseKey(poseKey);
        } catch (e) {
          failedUrls.add(primarySrc);
          setIsRecovering(true);
          try {
            await tryPreload(fallbackSrc);
            setCurrentPoseKey(poseKey);
          } catch (err) {
            failedUrls.add(fallbackSrc);
            dispatch({ type: "ASSET_ERROR" });
          }
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

    const stateChanged = lastStateRef.current !== machineState;
    lastStateRef.current = machineState;

    let isCancelled = false;

    const runIdleCycle = () => {
      const interval = 4000 + Math.random() * 2000;
      timerRef.current = setTimeout(() => {
        if (isCancelled) return;
        
        if (Math.random() < 0.3) {
          dispatch({ type: "BLINK" });
        } else {
          const next = currentPoseKey === "idle-1" ? "idle-2" : "idle-1";
          applyPose(next);
        }
      }, interval);
    };

    const runTalkingCycle = () => {
      timerRef.current = setTimeout(() => {
        if (isCancelled) return;
        const next = currentPoseKey === "talk-open" ? "talk-closed" : "talk-open";
        applyPose(next);
      }, 220);
    };

    switch (machineState) {
      case "idle":
        if (stateChanged) {
          applyPose("idle-1");
        }
        runIdleCycle();
        break;
      case "blinking":
        if (stateChanged) {
          applyPose("blink");
        }
        timerRef.current = setTimeout(() => {
          if (!isCancelled) dispatch({ type: "IDLE" });
        }, 120);
        break;
      case "talking":
        if (stateChanged) {
          applyPose("talk-open");
        }
        runTalkingCycle();
        break;
      case "waving":
        if (stateChanged) {
          applyPose("wave");
        }
        timerRef.current = setTimeout(() => {
          if (!isCancelled) dispatch({ type: "IDLE" });
        }, 2000);
        break;
      case "pointing":
        if (stateChanged) {
          applyPose("point");
        }
        timerRef.current = setTimeout(() => {
          if (!isCancelled) dispatch({ type: "IDLE" });
        }, 2000);
        break;
      case "cheering":
        if (stateChanged) {
          applyPose("cheer");
        }
        timerRef.current = setTimeout(() => {
          if (!isCancelled) dispatch({ type: "IDLE" });
        }, 2000);
        break;
      case "error":
        setCurrentPoseKey("idle-1");
        break;
    }

    return () => {
      isCancelled = true;
      clearTimer();
    };
  }, [machineState, applyPose, clearTimer, currentPoseKey]);

  let currentSrc = isRecovering
    ? GRETEL_FALLBACKS[currentPoseKey]
    : GRETEL_POSES[currentPoseKey];

  if (failedUrls.has(currentSrc)) {
    currentSrc = TRANSPARENT_SPACER;
  }

  return {
    currentPose: currentSrc,
    machineState,
    send,
    isRecovering,
  };
}
