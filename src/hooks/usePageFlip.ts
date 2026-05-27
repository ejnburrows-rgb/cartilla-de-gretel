import { useState, useCallback, useRef } from "react";

export function usePageFlip(durationMs = 520) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const onCompleteRef = useRef<(() => void) | null>(null);

  const flip = useCallback((dir: "next" | "prev", onComplete: () => void) => {
    if (isFlipping) return;
    setDirection(dir);
    setIsFlipping(true);
    onCompleteRef.current = onComplete;

    // Safety fallback timer to prevent locks in case transitionend does not fire
    const timer = setTimeout(() => {
      setIsFlipping((curr) => {
        if (curr) {
          if (onCompleteRef.current) {
            onCompleteRef.current();
            onCompleteRef.current = null;
          }
          return false;
        }
        return curr;
      });
    }, durationMs + 80);

    return () => clearTimeout(timer);
  }, [isFlipping, durationMs]);

  // Hook handles transitionend directly, making commits highly responsive and fluid
  const handleTransitionEnd = useCallback((e: React.TransitionEvent<HTMLDivElement>) => {
    // Only handle the Y-rotation transformation to prevent double triggers
    if (e.propertyName === "transform") {
      setIsFlipping(false);
      if (onCompleteRef.current) {
        onCompleteRef.current();
        onCompleteRef.current = null;
      }
    }
  }, []);

  return { flip, isFlipping, direction, handleTransitionEnd };
}
export type UsePageFlipReturn = ReturnType<typeof usePageFlip>;
