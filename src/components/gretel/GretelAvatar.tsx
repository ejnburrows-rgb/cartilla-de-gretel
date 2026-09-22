import { useEffect } from "react";
import type { GretelOutcome } from "@/hooks/useGretel";
import { GretelLiveAvatar } from "./GretelLiveAvatar";
import { gretelEvent } from "@/lib/gretel-bus";

interface GretelAvatarProps {
  outcome: GretelOutcome;
  isSpeaking?: boolean;
}

export function GretelAvatar({ outcome, isSpeaking }: GretelAvatarProps) {
  useEffect(() => {
    if (isSpeaking) {
      gretelEvent("listen:start");
      return () => gretelEvent("listen:stop");
    }

    switch (outcome) {
      case "correct":
      case "streak":
      case "lesson-complete":
        gretelEvent("answer:correct");
        break;
      case "start":
      case "happy":
        gretelEvent("lesson:start");
        break;
      case "try-again":
      case "thinking":
        gretelEvent("hint:show");
        break;
      case "idle":
      default:
        gretelEvent("page:revealed");
        break;
    }
  }, [outcome, isSpeaking]);

  return (
    <div className="gretel-avatar-svg-container">
      <GretelLiveAvatar size="sm" bubblePosition="right" />
    </div>
  );
}
