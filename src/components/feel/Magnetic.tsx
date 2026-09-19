import React, { useRef, useState, useEffect } from "react";

interface MagneticProps {
  children: React.ReactElement;
  strength?: number;
}

export function Magnetic({ children, strength = 0.3 }: MagneticProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>("");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isTouch = false;

    const handleTouchStart = () => {
      isTouch = true;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isTouch) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      const x = dx * strength;
      const y = dy * strength;

      setTransform(`translate(${x}px, ${y}px)`);
    };

    const handleMouseLeave = () => {
      setTransform("translate(0, 0)");
      isTouch = false;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  const style = transform ? { transform } : undefined;

  return (
    <div ref={containerRef} className="feel-magnetic-wrapper" style={style}>
      {children}
    </div>
  );
}

export default Magnetic;
