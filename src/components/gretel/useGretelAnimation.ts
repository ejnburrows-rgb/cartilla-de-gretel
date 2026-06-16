import { useEffect, useReducer, useRef, useState, useCallback } from "react";
import {
  gretelReducer,
  GretelState,
  GretelEvent,
} from "./gretelMachine";
import { GRETEL_POSES, GRETEL_FALLBACKS, type GretelPoseState } from "./gretelPoses";
import { gretelEmitter, gretelEvent, type GretelEventName } from "./gretelEvents";

const failedUrls = new Set<string>();
const TRANSPARENT_SPACER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export interface GretelAnimationHook {
  currentPose: string;
  machineState: GretelState;
  send: (event: GretelEvent) => void;
  isRecovering: boolean;
  showBlinkOverlay: boolean;
}

export function useGretelAnimation(): GretelAnimationHook {
  const [machineState, dispatch] = useReducer(gretelReducer, "boot");
  const [currentPoseKey, setCurrentPoseKey] = useState<GretelPoseState>("idle-1");
  const [isRecovering, setIsRecovering] = useState(false);
  const [showBlinkOverlay, setShowBlinkOverlay] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStateRef = useRef<GretelState>("boot");
  const lastActivityRef = useRef(Date.now());

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
    if (inactivityTimerRef.current !== null) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
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

    // Global event listeners for all 9 event types
    const handleMount = () => {
      lastActivityRef.current = Date.now();
      send({ type: "WAVE" });
    };
    const handleCorrect = () => {
      lastActivityRef.current = Date.now();
      send({ type: "CHEER" });
    };
    const handleWrong = () => {
      lastActivityRef.current = Date.now();
      send({ type: "POINT" });
    };
    const handleHintShow = () => {
      lastActivityRef.current = Date.now();
      send({ type: "POINT" });
    };
    const handleHintHide = () => {
      lastActivityRef.current = Date.now();
      send({ type: "IDLE" });
    };
    const handleComplete = () => {
      lastActivityRef.current = Date.now();
      send({ type: "CHEER" });
    };
    const handleTalkStart = () => {
      lastActivityRef.current = Date.now();
      send({ type: "SPEAK_START" });
    };
    const handleTalkStop = () => {
      lastActivityRef.current = Date.now();
      send({ type: "SPEAK_STOP" });
    };
    const handlePageFlip = () => {
      lastActivityRef.current = Date.now();
      send({ type: "WAVE" });
    };

    // Subscribe to global emitter
    const unsubscribeMount = gretelEmitter.on("mount", handleMount);
    const unsubscribeCorrect = gretelEmitter.on("correct", handleCorrect);
    const unsubscribeWrong = gretelEmitter.on("wrong", handleWrong);
    const unsubscribeHintShow = gretelEmitter.on("hint-show", handleHintShow);
    const unsubscribeHintHide = gretelEmitter.on("hint-hide", handleHintHide);
    const unsubscribeComplete = gretelEmitter.on("complete", handleComplete);
    const unsubscribeTalkStart = gretelEmitter.on("talk-start", handleTalkStart);
    const unsubscribeTalkStop = gretelEmitter.on("talk-stop", handleTalkStop);
    const unsubscribePageFlip = gretelEmitter.on("page-flip", handlePageFlip);

    // Legacy window event listeners for backward compatibility
    const handleLegacySpeakStart = () => send({ type: "SPEAK_START" });
    const handleLegacySpeakStop = () => send({ type: "SPEAK_STOP" });

    window.addEventListener("gretel:speak_start", handleLegacySpeakStart);
    window.addEventListener("gretel:speak_stop", handleLegacySpeakStop);

    return () => {
      unsubscribeMount();
      unsubscribeCorrect();
      unsubscribeWrong();
      unsubscribeHintShow();
      unsubscribeHintHide();
      unsubscribeComplete();
      unsubscribeTalkStart();
      unsubscribeTalkStop();
      unsubscribePageFlip();
      window.removeEventListener("gretel:speak_start", handleLegacySpeakStart);
      window.removeEventListener("gretel:speak_stop", handleLegacySpeakStop);
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

    // Inactivity nudge at 10s
    const checkInactivity = () => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      if (inactiveTime > 10000 && machineState === "idle") {
        // Nudge user with a wave
        dispatch({ type: "WAVE" });
        lastActivityRef.current = Date.now();
      }
    };

    const runIdleCycle = () => {
      const interval = 4000 + Math.random() * 2000;
      timerRef.current = setTimeout(() => {
        if (isCancelled) return;
        
        checkInactivity();
        
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
          setShowBlinkOverlay(true);
          // Blink overlay timer - show for 120ms then hide
          setTimeout(() => {
            if (!isCancelled) setShowBlinkOverlay(false);
          }, 120);
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
    showBlinkOverlay,
  };
}
