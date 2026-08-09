import { forwardRef, type ReactNode } from "react";
import "@/styles/garden-scene.css";

/**
 * Quiet reader frame for the student workbook.
 *
 * This frame deliberately contains no decorative characters, flowers, or
 * substitute artwork: the scanned workbook pages are the only illustration.
 */
interface GardenSceneProps {
  children: ReactNode;
  className?: string;
}

export const GardenScene = forwardRef<HTMLDivElement, GardenSceneProps>(function GardenScene(
  { children, className },
  ref,
) {
  return (
    <div ref={ref} className={`garden-scene p-3 sm:p-5 mb-8 ${className ?? ""}`}>
      <div className="garden-scene__content">{children}</div>
    </div>
  );
});
