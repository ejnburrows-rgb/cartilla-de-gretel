import { useState, useEffect } from "react";
import { GRETEL_POSES, GRETEL_FALLBACKS, type GretelPoseState } from "./gretelPoses";

export type GretelGuideState = "idle" | "talk" | "wave" | "point" | "cheer";

interface GretelGuideProps {
  state?: GretelGuideState;
  text?: string;
  className?: string;
  bubblePosition?: "left" | "right" | "top";
}

export function GretelGuide({
  state = "idle",
  text,
  className = "",
  bubblePosition = "left",
}: GretelGuideProps) {
  const [internalState, setInternalState] = useState<GretelGuideState>(state);
  const [currentFrame, setCurrentFrame] = useState<GretelPoseState>("idle-1");
  const [useFallback, setUseFallback] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Sync prop state to internal state, auto-revert transient states
  useEffect(() => {
    setInternalState(state);
    if (state !== "idle" && state !== "talk") {
      const t = setTimeout(() => {
        setInternalState("idle");
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [state]);

  // Handle prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Frame swapping logic
  useEffect(() => {
    if (reducedMotion) {
      switch (internalState) {
        case "talk": setCurrentFrame("talk-open"); break;
        case "wave": setCurrentFrame("wave"); break;
        case "point": setCurrentFrame("point"); break;
        case "cheer": setCurrentFrame("cheer"); break;
        default: setCurrentFrame("idle-1"); break;
      }
      return;
    }

    let intervalId: ReturnType<typeof setInterval>;
    let timeoutId: ReturnType<typeof setTimeout>;

    if (internalState === "idle") {
      setCurrentFrame("idle-1");
      const scheduleBlink = () => {
        const delay = 3000 + Math.random() * 4000;
        timeoutId = setTimeout(() => {
          setCurrentFrame("blink");
          setTimeout(() => {
            setCurrentFrame("idle-1");
            scheduleBlink();
          }, 120);
        }, delay);
      };
      scheduleBlink();
    } else if (internalState === "talk") {
      let open = true;
      setCurrentFrame("talk-open");
      intervalId = setInterval(() => {
        open = !open;
        setCurrentFrame(open ? "talk-open" : "talk-closed");
      }, 220);
    } else if (internalState === "wave") {
      setCurrentFrame("wave");
    } else if (internalState === "point") {
      setCurrentFrame("point");
    } else if (internalState === "cheer") {
      setCurrentFrame("cheer");
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [internalState, reducedMotion]);

  // Handle fallback seamlessly
  const handleError = () => setUseFallback(true);
  const imgSrc = useFallback ? GRETEL_FALLBACKS[currentFrame] : GRETEL_POSES[currentFrame];

  // CSS Animation Classes
  let motionClass = "";
  if (!reducedMotion) {
    if (internalState === "idle" || internalState === "talk") motionClass = "animate-gretel-bob";
    else if (internalState === "wave") motionClass = "animate-gretel-wave";
    else if (internalState === "point") motionClass = "animate-gretel-point";
    else if (internalState === "cheer") motionClass = "animate-gretel-bounce";
  }

  const bubbleClasses = {
    left: "right-full mr-4 bottom-6",
    right: "left-full ml-4 bottom-6",
    top: "bottom-full mb-4 left-1/2 -translate-x-1/2",
  };

  const bubbleArrowClasses = {
    left: "right-[-8px] bottom-6 border-l-white border-t-transparent border-b-transparent border-r-transparent border-y-[8px] border-l-[8px]",
    right: "left-[-8px] bottom-6 border-r-white border-t-transparent border-b-transparent border-l-transparent border-y-[8px] border-r-[8px]",
    top: "bottom-[-8px] left-1/2 -translate-x-1/2 border-t-white border-x-transparent border-b-transparent border-y-[8px] border-t-[8px] border-x-[8px]",
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Speech Bubble */}
      {text && (
        <div
          className={`absolute z-30 max-w-[200px] sm:max-w-[240px] w-56 rounded-2xl bg-white p-3 sm:p-4 text-xs sm:text-sm font-bold text-stone-800 shadow-xl border border-stone-200/65 select-none animate-fade-in ${bubbleClasses[bubblePosition]}`}
          aria-live="polite"
        >
          <div className={`absolute w-0 h-0 border-solid ${bubbleArrowClasses[bubblePosition]}`} />
          <p className="leading-relaxed whitespace-pre-line pr-2">{text}</p>
        </div>
      )}

      {/* Mascot Image */}
      <div className={`relative h-24 w-24 sm:h-36 sm:w-36 origin-bottom drop-shadow-xl select-none ${motionClass}`}>
        <img
          key={imgSrc} // Re-mount img visually when src changes isn't strictly necessary, but good
          src={imgSrc}
          alt="Gretel"
          className="h-full w-full object-contain"
          draggable={false}
          onError={handleError}
        />
      </div>
    </div>
  );
}
