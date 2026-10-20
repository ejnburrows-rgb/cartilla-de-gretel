import { useCallback, useEffect, useRef, useState } from "react";
import "./pick-mark.css";

export const PICK_SETTLE_MS = 2200;
export const PICK_ERASE_MS = 3600;

/** One cancellable clock per game; resets and letter switches cancel pending picks. */
export function useGameClock() {
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const cancel = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);
  useEffect(() => cancel, [cancel]);
  const later = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
  }, []);
  return { later, cancel };
}

export function usePickMark() {
  const [pick, setPick] = useState<{ key: string; correct: boolean } | null>(null);
  const clock = useGameClock();
  const clear = useCallback(() => {
    clock.cancel();
    setPick(null);
  }, [clock.cancel]);
  const mark = (key: string, correct: boolean, after?: () => void) => {
    clock.cancel();
    setPick({ key, correct });
    clock.later(
      () => {
        setPick(null);
        after?.();
      },
      correct ? PICK_SETTLE_MS : PICK_ERASE_MS,
    );
  };
  return {
    pick,
    mark,
    clear,
    attribute: (key: string) =>
      pick?.key === key ? (pick.correct ? "right" : "wrong") : undefined,
  };
}

/** Existing feedback wording stays accessible; visible feedback uses only marks. */
export function PickMark({ correct, text = "" }: { correct: boolean; text?: string }) {
  return (
    <span
      role="status"
      aria-label={text || (correct ? "✓" : "↻")}
      className="game-pick-status"
      data-pick-mark={correct ? "right" : "wrong"}
    >
      <span aria-hidden="true">{correct ? "✓" : "↻"}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
