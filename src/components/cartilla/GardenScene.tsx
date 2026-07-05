import type { ReactNode } from "react";
import "@/styles/garden-scene.css";

/**
 * Soft garden frame around the student workbook, replacing the old
 * wood-desk background. Palette and motifs (grass, flowers, a yellow
 * butterfly, a dragonfly) are drawn from the real book cover art
 * (public/cartilla/images/original/cover.jpg), not invented.
 */
interface GardenSceneProps {
  children: ReactNode;
  className?: string;
}

const FLOWER_COLORS = ["#e0568c", "#f0923a", "#f4c542", "#e0568c"];
const FLOWER_POSITIONS = [6, 26, 68, 88]; // left %, kept off-center so nothing overlaps the book
const FLOWER_DELAYS = [0, 1.1, 0.5, 1.7];

function Flower({ color, left, delay }: { color: string; left: number; delay: number }) {
  return (
    <div
      className="garden-flower"
      style={{ left: `${left}%`, ["--sway-delay" as string]: `${delay}s` }}
      aria-hidden="true"
    >
      <svg width="34" height="46" viewBox="0 0 34 46">
        <path d="M17 46 L17 20" stroke="#7a9c53" strokeWidth="3" strokeLinecap="round" />
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="17"
            cy="12"
            rx="6"
            ry="9"
            fill={color}
            transform={`rotate(${angle} 17 20)`}
          />
        ))}
        <circle cx="17" cy="20" r="5" fill="#f9dd6b" />
      </svg>
    </div>
  );
}

function Butterfly({ delay }: { delay: number }) {
  return (
    <div className="garden-butterfly" style={{ ["--drift-delay" as string]: `${delay}s` }} aria-hidden="true">
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
    <div className="garden-dragonfly" style={{ ["--drift-delay" as string]: `${delay}s` }} aria-hidden="true">
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

export function GardenScene({ children, className }: GardenSceneProps) {
  return (
    <div className={`garden-scene p-5 sm:p-9 mb-12 ${className ?? ""}`}>
      <div className="garden-scene__critters">
        {FLOWER_POSITIONS.map((left, i) => (
          <Flower key={left} color={FLOWER_COLORS[i]} left={left} delay={FLOWER_DELAYS[i]} />
        ))}
        <Butterfly delay={0} />
        <Dragonfly delay={2.4} />
      </div>
      <div className="garden-scene__content">{children}</div>
    </div>
  );
}
