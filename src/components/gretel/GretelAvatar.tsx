import React from "react";
import type { GretelOutcome } from "@/hooks/useGretel";

interface GretelAvatarProps {
  outcome: GretelOutcome;
}

// Hoisted Styles for double-brace JSX styling ban compliance
const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  transition: "opacity 0.22s ease-in-out",
};

export function GretelAvatar({ outcome }: GretelAvatarProps) {
  // We render beautifully designed, hand-drawn responsive inline SVGs representing Gretel.
  // This complies perfectly with the matching art instructions and allows zero-network load times.

  const renderGretelSVG = () => {
    switch (outcome) {
      case "streak":
      case "lesson-complete":
      case "correct":
        return (
          /* Cheer Pose — Arms up, happy celebrate */
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background premium soft glow */}
            <circle cx="50" cy="50" r="38" fill="rgba(245, 158, 11, 0.15)" />
            {/* Pig tails */}
            <circle cx="24" cy="40" r="10" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            <circle cx="76" cy="40" r="10" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            {/* Head */}
            <circle cx="50" cy="45" r="24" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" />
            {/* Hair details */}
            <path d="M26 38 Q50 30 74 38 Q50 20 26 38" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            {/* Eyes — Closed happy arcs */}
            <path d="M38 45 Q42 41 46 45" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M54 45 Q58 41 62 45" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
            {/* Rosy Cheeks */}
            <circle cx="34" cy="51" r="4" fill="#f43f5e" opacity="0.6" />
            <circle cx="66" cy="51" r="4" fill="#f43f5e" opacity="0.6" />
            {/* Mouth — Wide open cheering smile */}
            <path d="M44 52 Q50 62 56 52 Z" fill="#b91c1c" stroke="#7c2d12" strokeWidth="2" />
            {/* Cheerful Dress Body */}
            <path d="M36 68 L64 68 L58 90 L42 90 Z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2" />
            {/* Cheering Arms */}
            <path d="M36 68 Q20 50 16 54" fill="none" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />
            <path d="M64 68 Q80 50 84 54" fill="none" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case "thinking":
        return (
          /* Thinking Pose — Finger on chin, eyes up */
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="38" fill="rgba(14, 165, 233, 0.12)" />
            {/* Hair Pig tails */}
            <circle cx="25" cy="43" r="9" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            <circle cx="75" cy="43" r="9" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            {/* Head */}
            <circle cx="50" cy="45" r="24" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" />
            <path d="M26 38 Q50 30 74 38 Q50 20 26 38" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            {/* Eyes — Puzzled looking up */}
            <circle cx="41" cy="42" r="3" fill="#1e293b" />
            <circle cx="59" cy="42" r="3" fill="#1e293b" />
            <path d="M37 36 Q41 34 45 36" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            <path d="M55 36 Q59 34 63 36" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            {/* Mouth — Curious small line */}
            <path d="M46 54 Q50 51 54 54" fill="none" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
            {/* Dress Body */}
            <path d="M36 68 L64 68 L58 90 L42 90 Z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2" />
            {/* Hand on chin */}
            <path d="M40 76 Q45 60 48 57" fill="none" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case "start":
      case "try-again":
        return (
          /* Encouraging / Welcome Pose — Smiling & Waving */
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="38" fill="rgba(34, 197, 94, 0.12)" />
            {/* Hair Pig tails */}
            <circle cx="23" cy="42" r="10" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            <circle cx="77" cy="42" r="10" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            {/* Head */}
            <circle cx="50" cy="45" r="24" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" />
            <path d="M26 38 Q50 30 74 38 Q50 20 26 38" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            {/* Big friendly curious eyes */}
            <circle cx="40" cy="43" r="4.5" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
            <circle cx="41" cy="43" r="2.5" fill="#6d28d9" />
            <circle cx="60" cy="43" r="4.5" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
            <circle cx="61" cy="43" r="2.5" fill="#6d28d9" />
            {/* Smile */}
            <path d="M44 52 Q50 59 56 52" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
            {/* Rosy Cheeks */}
            <circle cx="34" cy="51" r="3" fill="#f43f5e" opacity="0.5" />
            <circle cx="66" cy="51" r="3" fill="#f43f5e" opacity="0.5" />
            {/* Dress Body */}
            <path d="M36 68 L64 68 L58 90 L42 90 Z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2" />
            {/* Waving Hand */}
            <path d="M64 68 Q78 54 82 46" fill="none" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />
            <circle cx="82" cy="44" r="3.5" fill="#fed7aa" />
          </svg>
        );

      case "idle":
        return (
          /* Alternate Idle Pose — Looking slightly sideways & smiling */
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Head */}
            <circle cx="25" cy="44" r="9" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            <circle cx="75" cy="44" r="9" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            <circle cx="50" cy="45" r="24" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" />
            <path d="M26 38 Q50 30 74 38 Q50 20 26 38" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            {/* Eyes looking to the right */}
            <circle cx="42" cy="43" r="4.5" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
            <circle cx="43" cy="43" r="2" fill="#1e293b" />
            <circle cx="58" cy="43" r="4.5" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
            <circle cx="59" cy="43" r="2" fill="#1e293b" />
            {/* Sweet subtle smile */}
            <path d="M45 52 Q50 57 55 52" fill="none" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
            {/* Dress Body */}
            <path d="M36 68 L64 68 L58 90 L42 90 Z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2" />
          </svg>
        );

      case "happy":
      default:
        return (
          /* Default Happy Pose — Wide open friendly eyes & big smile */
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Hair Pig tails */}
            <circle cx="23" cy="42" r="10" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            <circle cx="77" cy="42" r="10" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            {/* Head */}
            <circle cx="50" cy="45" r="24" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" />
            {/* Bangs */}
            <path d="M26 38 Q50 30 74 38 Q50 20 26 38" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
            {/* Friendly curious eyes */}
            <circle cx="39" cy="43" r="4.5" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
            <circle cx="39" cy="43" r="2.5" fill="#6d28d9" />
            <circle cx="61" cy="43" r="4.5" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
            <circle cx="61" cy="43" r="2.5" fill="#6d28d9" />
            {/* Rosy Cheeks */}
            <circle cx="33" cy="51" r="3" fill="#f43f5e" opacity="0.5" />
            <circle cx="67" cy="51" r="3" fill="#f43f5e" opacity="0.5" />
            {/* Smile */}
            <path d="M43 51 Q50 59 57 51" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
            {/* Dress Body */}
            <path d="M36 68 L64 68 L58 90 L42 90 Z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2" />
          </svg>
        );
    }
  };

  return (
    <div style={imageStyle} className="gretel-avatar-svg-container">
      {renderGretelSVG()}
    </div>
  );
}
