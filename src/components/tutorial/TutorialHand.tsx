import React from "react";

interface TutorialHandProps {
  x: number;
  y: number;
}

export function TutorialHand({ x, y }: TutorialHandProps) {
  // Bounces on targeted coordinate points dynamically
  const handStyle: React.CSSProperties = {
    top: `${y}px`,
    left: `${x}px`,
  };

  return (
    <div
      style={handStyle}
      className="tutorial-hand no-print"
      aria-hidden="true"
    >
      {/* Premium vector pointing finger hand drawing */}
      <svg viewBox="0 0 100 100" className="w-12 h-12 select-none filter drop-shadow-md">
        <path
          d="M32 75 L32 40 Q32 32 38 32 Q44 32 44 40 L44 50 L48 50 Q52 50 52 46 L52 14 Q52 6 60 6 Q68 6 68 14 L68 50 L72 50 Q76 50 76 46 L76 34 Q76 28 82 28 Q88 28 88 34 L88 50 L92 50 Q96 50 96 46 L96 38 Q96 32 100 32 L100 70 L92 90 L46 90 Z"
          fill="#ffd43b"
          stroke="#e67e22"
          strokeWidth="3.5"
          strokeLinejoin="round"
          transform="rotate(-50 50 50)"
        />
      </svg>
    </div>
  );
}
export type TutorialHand = typeof TutorialHand;
