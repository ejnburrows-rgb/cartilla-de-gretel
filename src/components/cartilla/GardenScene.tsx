import { forwardRef, type ReactNode } from "react";
import "@/styles/garden-scene.css";

/** Neutral reader surround; all authored artwork stays inside the page. */
interface GardenSceneProps {
  children: ReactNode;
  className?: string;
}

export const GardenScene = forwardRef<HTMLDivElement, GardenSceneProps>(function GardenScene(
  { children, className }, ref,
) {
  return <div ref={ref} className={`garden-scene ${className ?? ""}`}>
    <div className="garden-scene__content">{children}</div>
  </div>;
});
