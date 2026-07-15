import React, { useEffect, useRef, useState } from "react";

interface RippleInstance {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function Ripple() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<RippleInstance[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parent = container.parentElement;
    if (!parent) return;

    const parentStyle = window.getComputedStyle(parent);
    if (parentStyle.position === "static") {
      parent.style.position = "relative";
    }

    const triggerRipple = (clientX: number, clientY: number) => {
      const rect = parent.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2;

      const newRipple: RippleInstance = {
        id: nextId.current++,
        x,
        y,
        size,
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    };

    const handleMouseDown = (e: MouseEvent) => {
      triggerRipple(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        triggerRipple(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    parent.addEventListener("mousedown", handleMouseDown);
    parent.addEventListener("touchstart", handleTouchStart, { passive: true });

    return () => {
      parent.removeEventListener("mousedown", handleMouseDown);
      parent.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  return (
    <div ref={containerRef} className="feel-ripple-container">
      {ripples.map((ripple) => {
        const style = {
          left: `${ripple.x - ripple.size / 2}px`,
          top: `${ripple.y - ripple.size / 2}px`,
          width: `${ripple.size}px`,
          height: `${ripple.size}px`,
        };
        return <span key={ripple.id} className="feel-ripple-effect" style={style} />;
      })}
    </div>
  );
}

export default Ripple;
