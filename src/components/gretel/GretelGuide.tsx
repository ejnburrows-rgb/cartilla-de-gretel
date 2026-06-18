import { useEffect, useState } from "react";
import { useGretelEvents } from "./useGretelEvents";

interface GretelGuideProps {
  className?: string;
  bubblePosition?: "left" | "right" | "top";
}

export function GretelGuide({
  className = "",
  bubblePosition = "left",
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
  if (!reducedMotion) {
    if (machineState === "idle" || machineState === "talking" || machineState === "boot" || machineState === "blinking") {
      motionClass = "animate-gretel-bob";
    } else if (machineState === "waving") {
      motionClass = "animate-gretel-wave";
    } else if (machineState === "pointing") {
      motionClass = "animate-gretel-point";
    } else if (machineState === "cheering") {
      motionClass = "animate-gretel-bounce";
    }
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
      {speechText && (
        <div
          className={`absolute z-30 max-w-[200px] sm:max-w-[240px] w-56 rounded-2xl bg-white p-3 sm:p-4 text-xs sm:text-sm font-bold text-stone-800 shadow-xl border border-stone-200/65 select-none animate-fade-in ${bubbleClasses[bubblePosition]}`}
          aria-live="polite"
        >
          <div className={`absolute w-0 h-0 border-solid ${bubbleArrowClasses[bubblePosition]}`} />
          <p className="leading-relaxed whitespace-pre-line pr-2">{speechText}</p>
        </div>
      )}

      <div className={`relative h-24 w-24 sm:h-36 sm:w-36 origin-bottom drop-shadow-xl select-none ${motionClass}`}>
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
  );
}
