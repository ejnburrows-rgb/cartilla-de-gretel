import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { prefersReducedMotion } from "@/lib/living-motion";
import { playUiTick } from "@/lib/piano-audio";

export interface KidButtonProps extends HTMLMotionProps<"button"> {
  variant?: "solid" | "outline";
  accent?: string;
}

export const KidButton = React.forwardRef<HTMLButtonElement, KidButtonProps>(
  (
    {
      className = "",
      variant = "solid",
      accent = "var(--student-accent, var(--book-teal))",
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playUiTick();
      if (onClick) onClick(e);
    };

    const isReduced = prefersReducedMotion();

    const baseStyles =
      "relative flex items-center justify-center gap-2 rounded-[var(--student-radius,999px)] px-4 py-3.5 text-sm font-black transition-colors select-none font-book-title focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

    // Fallback if playUiTick is not yet implemented fully or imported correctly

    return (
      <motion.button
        ref={ref}
        onClick={handleClick}
        whileTap={isReduced ? undefined : { scale: 0.94 }}
        className={`${baseStyles} ${className}`}
        style={{
          ...(variant === "solid"
            ? {
                background: accent,
                color: "#fff",
                boxShadow: `0 6px 16px -4px color-mix(in srgb, ${accent} 40%, transparent)`,
              }
            : {
                background: "var(--book-paper, #fbf3e0)",
                color: accent,
                border: `2px solid ${accent}`,
              }),
          ...props.style,
        }}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

KidButton.displayName = "KidButton";
