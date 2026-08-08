import { forwardRef, type CSSProperties, type ReactNode } from "react";
import "@/styles/garden-scene.css";
import "@/styles/storybook-stage.css";

/**
 * Soft garden frame around the student workbook, replacing the old
 * wood-desk background. Palette and motifs (grass, a yellow butterfly, a
 * dragonfly) are drawn from the real book cover art
 * (public/cartilla/images/original/cover.jpg), not invented.
 */
interface GardenSceneProps {
  children: ReactNode;
  className?: string;
}

function Butterfly({ delay }: { delay: number }) {
  return (
    <div
      className="garden-butterfly"
      style={{ ["--drift-delay" as string]: `${delay}s` }}
      aria-hidden="true"
    >
      <svg width="40" height="34" viewBox="0 0 40 34">
        <g className="garden-butterfly__wing">
          <ellipse cx="12" cy="14" rx="11" ry="9" fill="#f5d547" />
          <circle cx="9" cy="12" r="3" fill="#e0553a" />
        </g>
        <g className="garden-butterfly__wing garden-butterfly__wing--right">
          <ellipse cx="28" cy="14" rx="11" ry="9" fill="#f5d547" />
          <circle cx="31" cy="12" r="3" fill="#e0553a" />
        </g>
        <rect x="18.5" y="7" width="3" height="22" rx="1.5" fill="#6b4a2b" />
      </svg>
    </div>
  );
}

function Dragonfly({ delay }: { delay: number }) {
  return (
    <div
      className="garden-dragonfly"
      style={{ ["--drift-delay" as string]: `${delay}s` }}
      aria-hidden="true"
    >
      <svg width="34" height="18" viewBox="0 0 34 18">
        <g className="garden-dragonfly__wing">
          <ellipse cx="14" cy="6" rx="10" ry="3.5" fill="#3fa9a6" opacity="0.75" />
          <ellipse cx="16" cy="12" rx="9" ry="3" fill="#3fa9a6" opacity="0.6" />
        </g>
        <rect x="17" y="7" width="16" height="2.6" rx="1.3" fill="#2f8b88" />
        <circle cx="16" cy="8" r="3" fill="#2f8b88" />
      </svg>
    </div>
  );
}

function FolkFlower({ flower, center }: { flower: string; center: string }) {
  const style = { "--flower": flower, "--center": center } as CSSProperties;
  return (
    <span className="storybook-flower" style={style} aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <i key={index} style={{ "--petal-turn": `${index * 60}deg` } as CSSProperties} />
      ))}
    </span>
  );
}

function FolkFlowerGarland({ side }: { side: "top" | "bottom" }) {
  return (
    <div className={`storybook-stage__garland storybook-stage__garland--${side}`} aria-hidden="true">
      <span className="storybook-leaf" />
      <FolkFlower flower="#e52d3c" center="#f8cf2d" />
      <FolkFlower flower="#f14d8a" center="#fff3a6" />
      <span className="storybook-leaf" />
      <FolkFlower flower="#1553b7" center="#f8cf2d" />
    </div>
  );
}

export const GardenScene = forwardRef<HTMLDivElement, GardenSceneProps>(function GardenScene(
  { children, className },
  ref,
) {
  return (
    <div ref={ref} className={`garden-scene storybook-stage p-5 sm:p-9 mb-12 ${className ?? ""}`}>
      <FolkFlowerGarland side="top" />
      <FolkFlowerGarland side="bottom" />
      <div className="garden-scene__critters">
        <Butterfly delay={0} />
        <Dragonfly delay={2.4} />
      </div>
      <div className="garden-scene__content">{children}</div>
    </div>
  );
});
