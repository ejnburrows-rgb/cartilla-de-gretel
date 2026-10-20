import { Volume2 } from "lucide-react";
import { GAME_INSTRUCTION_RECORDINGS, playInstruction } from "@/lib/games/wordAudio";
import type { GameContent } from "@/lib/games/gameContent";

/** Recording slots are not playable controls until an exact recording exists. */
export function GameInstructions({ content }: { content: GameContent }) {
  const recordings = content.instructions.map(
    (line, index) => content.instructionAudioUrls?.[index] || GAME_INSTRUCTION_RECORDINGS[line],
  );
  return (
    <details className="max-h-[45dvh] shrink-0 overflow-y-auto rounded-2xl bg-white px-3 py-1 font-semibold">
      <summary className="min-h-11 cursor-pointer py-2">Instrucciones</summary>
      <ol aria-label="Instrucciones del juego" className="space-y-1 pb-2 text-sm sm:text-base">
        {content.instructions.map((line, index) => (
          <li key={index} className="flex items-start gap-2">
            <span aria-hidden="true" className="py-2 text-stone-500">
              {index + 1}.
            </span>
            <span className="flex-1 py-2">{line}</span>
            <button
              type="button"
              disabled={!recordings[index]}
              aria-label={
                recordings[index]
                  ? `Escuchar instrucción ${index + 1}`
                  : `Audio pendiente: instrucción ${index + 1}`
              }
              onClick={() => playInstruction(recordings[index], line)}
              className="min-h-11 min-w-11 shrink-0 rounded-lg border p-2 disabled:opacity-40"
            >
              <Volume2 aria-hidden="true" className="mx-auto h-4 w-4" />
            </button>
          </li>
        ))}
      </ol>
      {recordings.some((url) => !url) && (
        <p className="pb-2 text-sm text-stone-600">
          Audio de instrucciones pendiente. Puedes leer las instrucciones.
        </p>
      )}
    </details>
  );
}
