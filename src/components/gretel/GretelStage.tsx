import React from "react";

interface GretelStageProps {
  size?: "sm" | "md" | "lg";
  warmth?: boolean;
  basePoseSrc?: string;
  blinkOverlaySrc?: string;
  showBlink?: boolean;
  children?: React.ReactNode;
}

const warmFilter = { filter: "sepia(15%) brightness(1.03)" };

export function GretelStage({ 
  size = "md", 
  warmth = true, 
  basePoseSrc,
  blinkOverlaySrc,
  showBlink = false,
  children
}: GretelStageProps) {
  const sizeClasses = {
    sm: "max-h-[100px] max-w-[100px]",
    md: "max-h-[220px] max-w-[220px]",
    lg: "max-h-[320px] max-w-[320px]",
  };

  return (
    <div className={`relative ${sizeClasses[size]}`} data-size={size}>
      {/* Contact shadow - grounded appearance */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/20 rounded-full blur-sm"
        style={{ filter: "blur(4px)" }}
      />
      
      {/* Dual-layer rendering */}
      <div 
        className="relative w-full h-full"
        style={warmth ? warmFilter : undefined}
      >
        {/* Base pose layer */}
        {basePoseSrc && (
          <img
            src={basePoseSrc}
            alt="Gretel base pose"
            className="w-full h-full object-contain"
            style={{ 
              transition: "opacity 200ms ease-in-out",
              opacity: showBlink ? 0.7 : 1
            }}
            draggable={false}
          />
        )}
        
        {/* Blink overlay layer */}
        {blinkOverlaySrc && showBlink && (
          <img
            src={blinkOverlaySrc}
            alt="Gretel blink overlay"
            className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
            style={{ 
              transition: "opacity 200ms ease-in-out",
              opacity: 1
            }}
            draggable={false}
          />
        )}
        
        {children}
      </div>
    </div>
  );
}
