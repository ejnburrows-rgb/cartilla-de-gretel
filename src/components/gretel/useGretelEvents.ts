// useGretelEvents.ts
// Wraps useGretelAnimation and subscribes to the gretel-bus.
// Any component using this hook will respond to gretelEvent() calls.
// Manages speech text display and a 10s inactivity nudge timer.
import { useEffect, useRef, useState } from "react";
import { useGretelAnimation } from "./useGretelAnimation";
import { onGretelEvent, type GretelBusEvent } from "@/lib/gretel-bus";
import { speak } from "@/lib/speak";

const NUDGE_DELAY_MS = 10_000;

export function useGretelEvents() {
  const { currentPose, machineState, send, isRecovering } = useGretelAnimation();
  const [speechText, setSpeechText] = useState<string | undefined>(undefined);

  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearSpeech = () => {
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
        speechTimerRef.current = null;
      }
    };

    const clearHint = () => {
      if (hintIntervalRef.current) {
        clearInterval(hintIntervalRef.current);
        hintIntervalRef.current = null;
      }
    };

    const scheduleSpeechClear = (ms: number) => {
      clearSpeech();
      speechTimerRef.current = setTimeout(() => setSpeechText(undefined), ms);
    };

    const resetNudge = () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = setTimeout(() => {
        send({ type: "POINT" });
        setSpeechText("¡Inténtalo!");
        scheduleSpeechClear(2200);
      }, NUDGE_DELAY_MS);
    };

    resetNudge();

    const off = onGretelEvent((type: GretelBusEvent) => {
      resetNudge();
      clearHint();

      switch (type) {
        case "lesson:start":
          send({ type: "WAVE" });
          setSpeechText("¡Empecemos!");
          scheduleSpeechClear(2200);
          break;

        case "answer:correct":
          send({ type: "CHEER" });
          setSpeechText("¡Muy bien!");
          scheduleSpeechClear(2200);
          void speak("¡Muy bien!", { silentPose: true });
          break;

        case "answer:wrong":
          send({ type: "POINT" });
          setSpeechText("¡Inténtalo de nuevo!");
          scheduleSpeechClear(2200);
          break;

        case "hint:show":
          send({ type: "POINT" });
          setSpeechText("¡Mira aquí!");
          // Re-point every 1.8s to hold the pose past the 2s FSM auto-return
          hintIntervalRef.current = setInterval(() => send({ type: "POINT" }), 1800);
          break;

        case "hint:hide":
          clearHint();
          send({ type: "IDLE" });
          setSpeechText(undefined);
          clearSpeech();
          break;

        case "lesson:complete":
          send({ type: "CHEER" });
          setSpeechText("¡Lo lograste!");
          scheduleSpeechClear(3200);
          void speak("¡Lo lograste! Buen trabajo.", { silentPose: true });
          break;

        case "talk:start":
          send({ type: "SPEAK_START" });
          break;

        case "talk:stop":
          send({ type: "SPEAK_STOP" });
          setSpeechText(undefined);
          clearSpeech();
          break;

        case "nudge":
          send({ type: "POINT" });
          setSpeechText("¡Inténtalo!");
          scheduleSpeechClear(2200);
          break;
      }
    });

    return () => {
      off();
      clearSpeech();
      clearHint();
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, [send]);

  return { currentPose, machineState, isRecovering, speechText, send };
}
