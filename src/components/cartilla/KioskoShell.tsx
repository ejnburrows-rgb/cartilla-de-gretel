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
  background: "linear-gradient(135deg, #1e1b18 0%, #0d0a06 100%)",
  color: "#fff8de",
  overflow: "hidden",
  zIndex: 99999,
  display: "flex",
  flexDirection: "column",
  userSelect: "none",
};

const cornerExitTriggerStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "80px",
  height: "80px",
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

  // Support 3-finger touch to exit (smartboard robust escape)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 3) {
        handleExit();
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, [onExit]);

  // Support Keyboard Escape
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onExit]);

  // Support backup triple tap on top-left corner
  let clickCount = 0;
  let clickTimeout: NodeJS.Timeout | null = null;

  const handleCornerClick = () => {
    clickCount += 1;
    if (clickCount >= 3) {
      handleExit();
    }
    if (clickTimeout) clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      clickCount = 0;
    }, 1500);
  };

  return (
    <div style={shellContainerStyle} className="kiosko-fullscreen-shell">
      {/* Smartboard gesture area */}
      <div
        style={cornerExitTriggerStyle}
        onClick={handleCornerClick}
        title="Triple-click corner to exit"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
