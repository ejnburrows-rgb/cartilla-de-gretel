import { useEffect } from "react";
import { GretelLiveAvatar } from "./GretelLiveAvatar";
import { gretelEvent } from "@/lib/gretel-bus";

export type GretelPose = "welcome" | "point" | "read" | "celebrate" | "think" | "wave";

interface GretelMascotProps {
  pose?: GretelPose;
  text?: string;
  className?: string;
  bubblePosition?: "left" | "right" | "top";
  showCloseButton?: boolean;
}

export function GretelMascot({
  pose = "welcome",
  text,
  className = "",
  bubblePosition = "left",
  showCloseButton = false,
}: GretelMascotProps) {
  useEffect(() => {
    switch (pose) {
      case "celebrate":
        gretelEvent("activity:complete");
        break;
      case "point":
        gretelEvent("hint:show");
        break;
      case "welcome":
      case "wave":
        gretelEvent("lesson:start");
        break;
      case "read":
      case "think":
      default:
        gretelEvent("page:revealed");
        break;
    }
  }, [pose]);

  void showCloseButton;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {text && (
        <span className="sr-only" role="status" aria-live="polite">
          {text}
        </span>
      )}
      <GretelLiveAvatar size="md" bubblePosition={bubblePosition} />
    </div>
  );
}

export default GretelMascot;
