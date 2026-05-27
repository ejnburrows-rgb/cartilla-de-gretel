import React from "react";

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Shimmer({ className = "", ...props }: ShimmerProps) {
  return (
    <div
      className={`feel-shimmer-block feel-anim-shimmer ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

export default Shimmer;
