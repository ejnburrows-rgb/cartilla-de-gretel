import React, { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

interface KioskoShellProps {
  children: React.ReactNode;
  onExit?: () => void;
}

// Hoisted Styles for double-brace JSX styling ban compliance
const shellContainerStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  background: "linear-gradient(135deg, #181512 0%, #080705 100%)",
  color: "#fff8de",
  overflow: "hidden",
  zIndex: 99999,
  display: "flex",
  flexDirection: "column",
  userSelect: "none",
};

// Hidden gesture triggers for smartboard exit robustness
const cornerExitTriggerStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "60px",
  height: "60px",
  backgroundColor: "transparent",
  cursor: "default",
  zIndex: 100000,
};

export function KioskoShell({ children, onExit }: KioskoShellProps) {
  const navigate = useNavigate();

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      navigate({ to: "/cartilla/lecciones" });
    }
  };

  // Support 3-finger tap gesture to exit
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 3) {
        // 3-finger tap detected, trigger exit
        handleExit();
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, [onExit]);

  // Support long-press or triple-tap on top-left corner as backup
  let cornerClickCount = 0;
  let clickTimeout: NodeJS.Timeout | null = null;

  const handleCornerClick = () => {
    cornerClickCount += 1;
    if (cornerClickCount >= 3) {
      handleExit();
    }

    if (clickTimeout) clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      cornerClickCount = 0;
    }, 1500);
  };

  return (
    <div style={shellContainerStyle} className="kiosko-fullscreen-shell">
      {/* Corner Gesture Trigger Zone */}
      <div
        style={cornerExitTriggerStyle}
        onClick={handleCornerClick}
        title="Triple-click corner to exit presenter"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
