// useGameReactions.ts — single hook the themed games call for Gretel + audio feedback.
// Standardizes on the typed gretel-bus (gretelEvent) rather than the legacy raw
// "gretel:celebrate" CustomEvent some older exercise components still dispatch.
import { useCallback, useState } from "react";
import { gretelEvent } from "@/lib/gretel-bus";
import { gretelSay } from "@/content/gretel-feedback";
import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";

export type GameFeedback = "ok" | "x" | null;

export function useGameReactions() {
  const [feedback, setFeedback] = useState<GameFeedback>(null);
  const [line, setLine] = useState("");

  const start = useCallback(() => {
    gretelEvent("lesson:start");
    setLine(gretelSay("start"));
  }, []);

  const correct = useCallback(() => {
    playCorrectChord();
    gretelEvent("answer:correct");
    setFeedback("ok");
    setLine(gretelSay("correct"));
  }, []);

  const wrong = useCallback(() => {
    playWrongBuzz();
    gretelEvent("answer:wrong");
    setFeedback("x");
    setLine(gretelSay("try-again"));
  }, []);

  const complete = useCallback(() => {
    gretelEvent("lesson:complete");
    setFeedback("ok");
    setLine(gretelSay("lesson-complete"));
  }, []);

  const clear = useCallback(() => setFeedback(null), []);

  return { feedback, line, start, correct, wrong, complete, clear };
}
