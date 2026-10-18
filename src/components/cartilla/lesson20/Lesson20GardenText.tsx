/**
 * Lesson 20 (Ff) owner-approved wide-screen design: instruction and key
 * teaching letters render in a colorful garden palette instead of dark ink.
 * Purely presentational — the exact source wording is never changed.
 * Colors cycle per letter across a muted garden palette (leaf green, teal,
 * marigold, violet, sky blue, bougainvillea pink); spaces stay uncolored.
 * Screen readers get the plain sentence once via a visually-hidden span.
 */

import type { CSSProperties } from "react";

const GARDEN_COLORS = ["#2f7d4a", "#167a72", "#c46a1b", "#7756a8", "#356fbd", "#c24d75"] as const;

const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

export function Lesson20GardenText({ text }: { text: string }) {
  let colorIndex = 0;
  const letters = Array.from(text);
  return (
    <span className="lc20-garden-text">
      <span style={srOnly}>{text}</span>
      {letters.map((ch, i) => {
        if (ch === " ") {
          return (
            <span key={i} aria-hidden="true">
              {" "}
            </span>
          );
        }
        const color = GARDEN_COLORS[colorIndex % GARDEN_COLORS.length];
        colorIndex += 1;
        return (
          <span key={i} aria-hidden="true" style={{ color }}>
            {ch}
          </span>
        );
      })}
    </span>
  );
}
