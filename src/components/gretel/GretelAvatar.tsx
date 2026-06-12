import { useEffect, type CSSProperties } from "react";
import type { GretelOutcome } from "@/hooks/useGretel";
import { useGretelAnimation } from "./useGretelAnimation";

interface GretelAvatarProps {
  outcome: GretelOutcome;
  isSpeaking?: boolean;
}

const avatarFrameStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  transition: "opacity 0.22s ease-in-out",
};

export function GretelAvatar({ outcome, isSpeaking }: GretelAvatarProps) {
  const { currentPose, send } = useGretelAnimation();

  useEffect(() => {
    if (isSpeaking) {
      send({ type: "SPEAK_START" });
      return;
    } else {
      send({ type: "SPEAK_STOP" });
    }

    switch (outcome) {
      case "correct":
      case "streak":
      case "lesson-complete":
        send({ type: "CHEER" });
        break;
      case "start":
      case "happy":
        send({ type: "WAVE" });
        break;
      case "try-again":
      case "thinking":
        send({ type: "POINT" });
        break;
      case "idle":
      default:
        send({ type: "IDLE" });
        break;
    }
  }, [outcome, isSpeaking, send]);

  return (
    <div style={avatarFrameStyle} className="gretel-avatar-svg-container">
      <img
        src={currentPose}
        alt="Gretel"
        className="h-full w-full object-contain"
        draggable={false}
        onError={() => send({ type: "ASSET_ERROR" })}
      />
    </div>
  );
}
