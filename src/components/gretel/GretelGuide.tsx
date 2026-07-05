import { useEffect, useState } from "react";
import { useGretelEvents } from "./useGretelEvents";

interface GretelGuideProps {
  className?: string;
  /** @deprecated feedback is now spoken, not shown as a text bubble; kept so existing call sites don't need to change. */
  bubblePosition?: "left" | "right" | "top";
}

export function GretelGuide({
  className = "",
}: GretelGuideProps) {
  const { currentPose, machineState, speechText, send } = useGretelEvents();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const handleError = () => {
    send({ type: "ASSET_ERROR" });
  };

  let motionClass = "";
  let shadowMotionClass = "";
  if (!reducedMotion) {
    if (machineState === "idle" || machineState === "talking" || machineState === "boot" || machineState === "blinking") {
      motionClass = "animate-gretel-bob";
      shadowMotionClass = "animate-gretel-shadow-bob";
    } else if (machineState === "waving") {
      motionClass = "animate-gretel-wave";
    } else if (machineState === "pointing") {
      motionClass = "animate-gretel-point";
      shadowMotionClass = "animate-gretel-shadow-point";
    } else if (machineState === "cheering") {
      motionClass = "animate-gretel-bounce";
      shadowMotionClass = "animate-gretel-shadow-bounce";
    }
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Feedback is spoken aloud (gretel-tts.ts), not shown as a text
          bubble. Still exposed to screen readers via a visually-hidden
          live region so the feedback isn't audio-only for accessibility. */}
      {speechText && (
        <span className="sr-only" aria-live="polite">
          {speechText}
        </span>
      )}

      <div className="relative h-24 w-24 sm:h-36 sm:w-36">
        <div className={`gretel-contact-shadow ${shadowMotionClass}`} />
        <div
          className={`relative h-full w-full origin-bottom select-none ${motionClass}`}
          style={{ filter: "drop-shadow(0 10px 10px rgba(20, 20, 30, 0.28)) drop-shadow(0 2px 3px rgba(20, 20, 30, 0.18))" }}
        >
          <img
            key={currentPose}
            src={currentPose}
            alt="Gretel"
            className="h-full w-full object-contain"
            draggable={false}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
}
