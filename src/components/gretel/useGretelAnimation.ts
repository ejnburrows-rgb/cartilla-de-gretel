import { useEffect, useReducer, useRef, useState, useCallback } from "react";
import { gretelReducer, GretelState, GretelEvent } from "./gretelMachine";
import { getGretelPose, getGretelPoseFrames } from "./gretelPoses";

const failedUrls = new Set<string>();
const TRANSPARENT_SPACER =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export interface GretelAnimationHook {
  currentPose: string;
  machineState: GretelState;
  send: (event: GretelEvent) => void;
  isRecovering: boolean;
  isSpeaking: boolean;
}

export function useGretelAnimation(paused = false): GretelAnimationHook {
  const [machineState, dispatch] = useReducer(gretelReducer, "boot");
  const [isRecovering, setIsRecovering] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const machineStateRef = useRef<GretelState>(machineState);
  machineStateRef.current = machineState;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const send = useCallback((event: GretelEvent) => {
    if (event.type === "RESET") {
      failedUrls.clear();
    } else if (event.type === "ASSET_ERROR") {
      const pose = getGretelPoseFrames(machineStateRef.current);
      if (typeof pose === "string") {
        failedUrls.add(pose);
      } else {
        pose.forEach((p) => failedUrls.add(p));
      }
    }
    dispatch(event);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleSpeakStart = () => {
      setIsSpeaking(true);
      send({ type: "SPEAK_START" });
    };
    const handleSpeakStop = () => {
      setIsSpeaking(false);
      send({ type: "SPEAK_STOP" });
    };

    window.addEventListener("gretel:speak_start", handleSpeakStart);
    window.addEventListener("gretel:speak_stop", handleSpeakStop);

    return () => {
      window.removeEventListener("gretel:speak_start", handleSpeakStart);
      window.removeEventListener("gretel:speak_stop", handleSpeakStop);
    };
  }, [send]);

  const preloadImage = (src: string): Promise<void> => {
    if (src === TRANSPARENT_SPACER) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = src;
    });
  };

  useEffect(() => {
    if (machineState === "boot") {
      const idlePose = getGretelPose("idle") as string;
      preloadImage(idlePose)
        .catch(() => {
          failedUrls.add(idlePose);
        })
        .finally(() => {
          dispatch({ type: "INIT" });
        });
      return;
    }

    clearTimer();
    let isCancelled = false;

    // Reset back to idle automatically for transient states like pointing/waving/cheering
    if (["pointing", "waving", "cheering", "exiting"].includes(machineState)) {
      timerRef.current = setTimeout(
        () => {
          if (!isCancelled) dispatch({ type: "IDLE" });
        },
        machineState === "exiting" ? 900 : 2000,
      );
    } else if (machineState === "settling") {
      // Enter settle hold (G-02) then idle
      timerRef.current = setTimeout(() => {
        if (!isCancelled) dispatch({ type: "IDLE" });
      }, 680);
    } else if (machineState === "blinking") {
      // Blink is fast
      timerRef.current = setTimeout(() => {
        if (!isCancelled) dispatch({ type: "IDLE" });
      }, 150);
    } else if (machineState === "idle" && !paused) {
      // Random blink cycle when idle
      const nextBlink = Math.random() * 4000 + 2000; // 2-6 seconds
      timerRef.current = setTimeout(() => {
        if (!isCancelled) dispatch({ type: "BLINK" });
      }, nextBlink);
    }

    return () => {
      isCancelled = true;
      clearTimer();
    };
  }, [machineState, clearTimer, paused]);

  let currentSrc = getGretelPose(machineState);
  if (typeof currentSrc === "string" && failedUrls.has(currentSrc)) {
    currentSrc = TRANSPARENT_SPACER;
  }

  return {
    currentPose: currentSrc,
    machineState,
    send,
    isRecovering,
    isSpeaking,
  };
}
