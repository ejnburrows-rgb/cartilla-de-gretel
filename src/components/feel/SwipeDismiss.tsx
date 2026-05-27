import React, { useRef, useState } from "react";

interface SwipeDismissProps {
  children: React.ReactNode;
  onDismiss: (direction: "left" | "right") => void;
  className?: string;
}

export function SwipeDismiss({ children, onDismiss, className = "" }: SwipeDismissProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - startX.current;
    
    // Apply elastic resistance
    const resistance = Math.sign(dx) * Math.pow(Math.abs(dx), 0.85);
    setOffsetX(resistance);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const threshold = 120;
    if (offsetX > threshold) {
      setOffsetX(window.innerWidth);
      setTimeout(() => onDismiss("right"), 200);
    } else if (offsetX < -threshold) {
      setOffsetX(-window.innerWidth);
      setTimeout(() => onDismiss("left"), 200);
    } else {
      setOffsetX(0);
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setOffsetX(0);
  };

  const style = {
    transform: `translateX(${offsetX}px)`,
    opacity: isDragging ? Math.max(0.4, 1 - Math.abs(offsetX) / 300) : 1,
    transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease",
  };

  return (
    <div
      ref={containerRef}
      className={`feel-swipe-dismiss-container ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={style}
    >
      {children}
    </div>
  );
}

export default SwipeDismiss;
