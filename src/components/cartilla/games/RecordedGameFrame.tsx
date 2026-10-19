import { useEffect, type ReactNode } from "react";
import type { GameContent } from "@/lib/games/gameContent";
import { playInstruction, stopGameAudio } from "@/lib/games/wordAudio";

export function RecordedGameFrame({
  content,
  children,
}: {
  content: GameContent;
  children: ReactNode;
}) {
  useEffect(() => stopGameAudio, [content.id]);
  return (
    <div
      data-recorded-game={content.id}
      onClickCapture={(event) => {
        const target = event.target instanceof Element ? event.target : null;
        const button = target?.closest("button");
        const match = button?.getAttribute("aria-label")?.match(/^Escuchar instrucción (\d+)$/);
        if (match) {
          event.stopPropagation();
          playInstruction(
            content.instructionAudioUrls?.[Number(match[1]) - 1],
            content.instructions[Number(match[1]) - 1],
          );
        }
      }}
    >
      {children}
    </div>
  );
}
