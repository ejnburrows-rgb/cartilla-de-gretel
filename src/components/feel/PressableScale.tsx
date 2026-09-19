import React, { useState } from "react";
import { feelBus } from "../../lib/feel-bus";

interface PressableScaleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
}

export function PressableScale({
  children,
  onClick,
  className = "",
  ...props
}: PressableScaleProps) {
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsKeyboardActive(true);
      feelBus.emit("tap");
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      setIsKeyboardActive(false);
      onClick?.(e);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    feelBus.emit("tap");
    onClick?.(e);
  };

  const style = isKeyboardActive ? { transform: "scale(0.97)" } : undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`feel-pressable-scale ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export default PressableScale;
