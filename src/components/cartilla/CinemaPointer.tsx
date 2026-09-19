import { useEffect, useState } from "react";

interface CinemaPointerProps {
  isActive: boolean;
}

export function CinemaPointer({ isActive }: CinemaPointerProps) {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isActive]);

  if (!isActive) return null;

  const styleObj = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    pointerEvents: "none" as const,
    zIndex: 9999,
    background: `radial-gradient(240px circle at ${position.x}px ${position.y}px, rgba(234, 179, 8, 0.18) 0%, transparent 100%)`,
  };

  return <div style={styleObj} aria-hidden />;
}
