// useGretelEvents.ts
// Wraps useGretelAnimation and subscribes to the gretel-bus.
// Any component using this hook will respond to gretelEvent() calls.
//
// Owner rule (CLAUDE.md "Characters must be ALIVE"): no unprompted speech.
// The 10s inactivity nudge timer that fired speech with zero student action
// has been REMOVED. Gretel only speaks on: lesson:start, answer:correct,
// answer:wrong, lesson:complete, hint:show, hint:hide, talk:start, talk:stop.
import { useEffect, useRef, useState } from "react";
import { useGretelAnimation } from "./useGretelAnimation";
import { onGretelEvent, type GretelBusEvent } from "@/lib/gretel-bus";
import { speakGretelPhrase } from "@/lib/gretel-tts";

export function useGretelEvents() {
  const { currentPose, machineState, send, isRecovering } = useGretelAnimation();
  const [speechText, setSpeechText] = useState<string | undefined>(undefined);

  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    // Speaks the phrase aloud (real audio, no on-screen text) and keeps
    // speechText in state for any non-visual consumer (e.g. a11y/testing).
    const say = (phrase: string) => {
      setSpeechText(phrase);
      speakGretelPhrase(phrase);
    };

    const off = onGretelEvent((type: GretelBusEvent) => {
      clearHint();

      switch (type) {
        case "lesson:start":
          send({ type: "WAVE" });
          say("¡Empecemos!");
          scheduleSpeechClear(2200);
          break;

        case "answer:correct":
          send({ type: "CHEER" });
          say("¡Muy bien!");
          scheduleSpeechClear(2200);
          break;

        case "answer:wrong":
          send({ type: "POINT" });
          say("¡Inténtalo de nuevo!");
          scheduleSpeechClear(2200);
          break;

        case "hint:show":
          send({ type: "POINT" });
          say("¡Mira aquí!");
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
          say("¡Lo lograste!");
          scheduleSpeechClear(3200);
          break;

        case "talk:start":
          send({ type: "SPEAK_START" });
          break;

        case "talk:stop":
          send({ type: "SPEAK_STOP" });
          setSpeechText(undefined);
          clearSpeech();
          break;

        // "nudge" case removed — was fired by a 10s inactivity timer with
        // zero student action. The timer is gone. If any external caller
        // still dispatches "nudge" it hits this no-op default.
        case "nudge":
        case "mount":
        case "page-flip":
          break;
      }
    });

    return () => {
      off();
      clearSpeech();
      clearHint();
    };
  }, [send]);

  return { currentPose, machineState, isRecovering, speechText, send };
}
