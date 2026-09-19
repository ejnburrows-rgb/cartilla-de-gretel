import React from "react";

interface DragGhostProps {
  x: number;
  y: number;
  visible: boolean;
  children: React.ReactNode;
}

export function DragGhost({ x, y, visible, children }: DragGhostProps) {
  if (!visible) return null;

  const style = {
    position: "fixed" as const,
    left: `${x}px`,
    top: `${y}px`,
    pointerEvents: "none" as const,
    zIndex: 999999,
  };

  return (
    <div className="drag-ghost-active" style={style}>
      {children}
    </div>
  );
}

export default DragGhost;
