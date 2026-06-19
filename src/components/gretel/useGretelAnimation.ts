import { useEffect, useReducer, useRef, useState, useCallback } from "react";
import {
  gretelReducer,
  GretelState,
  GretelEvent,
} from "./gretelMachine";
import { GRETEL_ORIGINAL_ARTWORK } from "./gretelPoses";

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
  const [isRecovering, setIsRecovering] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      failedUrls.add(GRETEL_ORIGINAL_ARTWORK);
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
      preloadImage(GRETEL_ORIGINAL_ARTWORK)
        .catch(() => {
          failedUrls.add(GRETEL_ORIGINAL_ARTWORK);
        })
        .finally(() => {
          dispatch({ type: "INIT" });
        });
      return;
    }

    clearTimer();
    let isCancelled = false;

    // Reset back to idle automatically for transient states like pointing/waving/cheering
    if (["pointing", "waving", "cheering", "blinking"].includes(machineState)) {
      timerRef.current = setTimeout(() => {
        if (!isCancelled) dispatch({ type: "IDLE" });
      }, 2000);
    }

    return () => {
      isCancelled = true;
      clearTimer();
    };
  }, [machineState, clearTimer]);

  let currentSrc = GRETEL_ORIGINAL_ARTWORK;
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

