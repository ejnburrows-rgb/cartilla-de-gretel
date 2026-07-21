import React from "react";

export interface GardenBackdropProps {
  variant?: "default" | "soft";
  className?: string;
}

export function GardenBackdrop({ variant = "default", className = "" }: GardenBackdropProps) {
  const isSoft = variant === "soft";

  return (
    <div
      className={`absolute inset-0 z-0 pointer-events-none overflow-hidden ${className}`}
      style={
        isSoft
          ? {
              background: "linear-gradient(180deg, var(--book-paper, #fbf3e0) 0%, #fdf6ec 100%)",
            }
          : {
              background: "radial-gradient(circle, #e5c531 0%, #0d6b38 100%)",
            }
      }
    >
      <div className={`absolute inset-0 ${isSoft ? "opacity-30 mix-blend-overlay" : ""}`}>
        {/* Sun */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-xl opacity-80 animate-pulse" />
        <div className="absolute top-12 right-12 w-28 h-28 bg-yellow-400 rounded-full" />

        {/* Rolling Hills (CSS curves) */}
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-emerald-400 [clip-path:ellipse(120%_100%_at_50%_100%)] shadow-inner" />
        <div className="absolute bottom-0 left-[-20%] right-[-20%] h-[30vh] bg-green-500 [clip-path:ellipse(100%_100%_at_20%_100%)] opacity-80" />
        <div className="absolute bottom-0 left-[-20%] right-[-20%] h-[25vh] bg-emerald-600 [clip-path:ellipse(100%_100%_at_80%_100%)] opacity-60" />
      </div>
    </div>
  );
}
