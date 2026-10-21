/**
 * TutorStage — the session screen's calm layout (spec §9).
 *
 * Landscape first (1280×800): Gretel on the left (~40%), the cream word
 * card on the right, the mic button under the card. Portrait (390×844):
 * Gretel on top (~35% height), the word card, then the mic in the thumb
 * zone. Calm background only — no scenic wallpaper, no third-party fonts.
 */
import type { ReactNode } from "react";

export interface TutorStageProps {
  gretel: ReactNode;
  /** The right-column content: word card (+ marks, indicators). */
  card: ReactNode;
  /** Mic + listening indicator (goes under the card / in the thumb zone). */
  mic: ReactNode;
  /** Optional gentle status row (unavailable states) under the mic. */
  status?: ReactNode;
}

export function TutorStage({ gretel, card, mic, status }: TutorStageProps) {
  return (
    <div
      data-tutor-stage=""
      className="flex min-h-screen flex-col bg-[hsl(40_45%_93%)] lg:flex-row"
    >
      {/* Gretel: portrait top ~35% height, landscape left ~40% width. */}
      <div
        data-tutor-stage-gretel=""
        className="relative h-[35vh] w-full shrink-0 lg:h-auto lg:min-h-screen lg:w-[40%]"
      >
        {gretel}
      </div>

      {/* Word card + mic: centered on the right (landscape) / below Gretel (portrait). */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-6 lg:h-screen">
        {card}
        <div className="mt-auto flex flex-col items-center gap-4 lg:mt-0">
          {mic}
          {status}
        </div>
      </div>
    </div>
  );
}

export default TutorStage;
