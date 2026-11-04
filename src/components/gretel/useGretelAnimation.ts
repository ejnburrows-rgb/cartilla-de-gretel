import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { gretelReducer, type GretelEvent, type GretelState } from "./gretelMachine";

export interface GretelAnimationHook {
  currentPose: string;
  machineState: GretelState;
  send: (event: GretelEvent) => void;
  isRecovering: boolean;
  isSpeaking: boolean;
}

export function useGretelAnimation(paused = false): GretelAnimationHook {
  const [machineState, dispatch] = useReducer(gretelReducer, "boot");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const send = useCallback((event: GretelEvent) => {
    // SVG Gretel has no external pose asset to fail. Keep ASSET_ERROR in the
    // state-machine contract for compatibility with older callers, but do not
    // synthesize failures from raster preload attempts.
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

  useEffect(() => {
    if (machineState === "boot") {
      dispatch({ type: "INIT" });
      return;
    }

    clearTimer();
    let cancelled = false;
    const transient = [
      "pointing",
      "waving",
      "teaching",
      "help",
      "gentle-error",
      "cheering",
      "exiting",
    ] as const;

    if (transient.includes(machineState as (typeof transient)[number])) {
      timerRef.current = setTimeout(
        () => {
          if (!cancelled) dispatch({ type: "IDLE" });
        },
        machineState === "exiting" ? 800 : machineState === "cheering" ? 1800 : 1450,
      );
    } else if (machineState === "settling") {
      timerRef.current = setTimeout(() => {
        if (!cancelled) dispatch({ type: "IDLE" });
      }, 520);
    } else if (machineState === "blinking") {
      timerRef.current = setTimeout(() => {
        if (!cancelled) dispatch({ type: "IDLE" });
      }, 130);
    } else if (machineState === "idle" && !paused) {
      timerRef.current = setTimeout(() => {
        if (!cancelled) dispatch({ type: "BLINK" });
      }, 2600 + Math.random() * 3200);
    }

    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [machineState, clearTimer, paused]);

  return {
    currentPose: `svg:${machineState}`,
    machineState,
    send,
    isRecovering: false,
    isSpeaking,
  };
}
