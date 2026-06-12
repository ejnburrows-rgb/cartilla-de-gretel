import { useEffect, useState } from "react";
import { useGretelAnimation } from "../gretel/useGretelAnimation";

export type GretelState = "idle" | "pointing" | "cheering";

interface GretelMascotProps {
  state?: GretelState;
  className?: string;
}

export function GretelMascot({ state = "idle", className = "" }: GretelMascotProps) {
  const { currentPose, machineState, send } = useGretelAnimation();
  const [reducedMotion, setReducedMotion] = useState(false);

  // Sync state prop with FSM events
  useEffect(() => {
    switch (state) {
      case "idle":
        send({ type: "IDLE" });
        break;
      case "pointing":
        send({ type: "POINT" });
        break;
      case "cheering":
        send({ type: "CHEER" });
        break;
    }
  }, [state, send]);

  // Handle prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // CSS Animation Classes matching the state
  let motionClass = "";
  if (!reducedMotion) {
    if (machineState === "idle" || machineState === "boot" || machineState === "blinking") {
      motionClass = "animate-gretel-bob";
    } else if (machineState === "pointing") {
      motionClass = "animate-gretel-point";
    } else if (machineState === "cheering") {
      motionClass = "animate-gretel-bounce";
    }
  }

  return (
    <div
      className={`relative h-32 w-32 origin-bottom drop-shadow-2xl md:h-48 md:w-48 ${motionClass} ${className}`}
    >
      <img
        key={currentPose}
        src={currentPose}
        alt="Gretel"
        className="h-full w-full object-contain"
        draggable={false}
        onError={() => send({ type: "ASSET_ERROR" })}
      />
    </div>
  );
}
