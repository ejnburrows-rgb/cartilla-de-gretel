import { useEffect, useState, type CSSProperties } from "react";
import type { GretelOutcome } from "@/hooks/useGretel";

interface GretelAvatarProps {
  outcome: GretelOutcome;
}

const avatarFrameStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  transition: "opacity 0.22s ease-in-out",
};

const gretelImageByOutcome: Record<GretelOutcome, string> = {
  correct: "/gretel/cheer.webp",
  streak: "/gretel/cheer.webp",
  "lesson-complete": "/gretel/cheer.webp",
  start: "/gretel/happy.webp",
  "try-again": "/gretel/encouraging.webp",
  thinking: "/gretel/thinking.webp",
  happy: "/gretel/happy.webp",
  idle: "/gretel/idle-1.webp",
};

export function GretelAvatar({ outcome }: GretelAvatarProps) {
  const [fallback, setFallback] = useState(false);
  const src = fallback ? "/gretel/happy.webp" : gretelImageByOutcome[outcome];

  useEffect(() => {
    setFallback(false);
  }, [outcome]);

  return (
    <div style={avatarFrameStyle} className="gretel-avatar-svg-container">
      <img
        src={src}
        alt="Gretel"
        className="h-full w-full object-contain"
        draggable={false}
        onError={() => setFallback(true)}
      />
    </div>
  );
}
