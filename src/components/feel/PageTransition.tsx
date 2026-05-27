import React from "react";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={`feel-page-transition-container ${className}`}>
      {children}
    </div>
  );
}

export default PageTransition;
