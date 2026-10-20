import { useCallback, useMemo, useState } from "react";
export type GameFeedback = "ok" | "x" | null;
export function useGameReactions() {
  const [feedback, setFeedback] = useState<GameFeedback>(null);
  const clear = useCallback(() => setFeedback(null), []);
  const correct = useCallback(() => setFeedback("ok"), []);
  const wrong = useCallback(() => setFeedback("x"), []);
  return useMemo(
    () => ({ feedback, line: "", start: clear, correct, wrong, complete: correct, clear }),
    [feedback, clear, correct, wrong],
  );
}
