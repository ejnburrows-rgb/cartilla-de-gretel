// GameShell.tsx — shared shell for the themed Cartilla games (instructions header,
// warm-cream book palette, Gretel mascot). Wraps existing infra; the game body is
// passed in as children so each themed game only implements its own mechanic.
import { type ReactNode } from "react";
import { Volume2 } from "lucide-react";
import { playInstruction } from "@/lib/games/wordAudio";
import type { GameContent } from "@/lib/games/gameContent";
import { GardenBackdrop } from "@/components/cartilla/GardenBackdrop";
import { KidButton } from "@/components/ui/KidButton";

interface GameShellProps {
  content: GameContent;
  children: ReactNode;
}

export function GameShell({
  content,
  children,
}: GameShellProps) {
  return (
    <main className="min-h-screen px-4 py-4 sm:py-8 relative overflow-hidden flex flex-col">
      <GardenBackdrop variant="soft" />
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col landscape:flex-row gap-4 sm:gap-6 items-stretch landscape:items-start flex-1">

        {/* Left Column in Landscape: Instructions */}
        <div className="w-full landscape:w-[320px] shrink-0 flex flex-col gap-4 landscape:sticky landscape:top-6">
          {(content.instructions && content.instructions.length > 0) && (
            <header className="kid-card p-4 sm:p-5" aria-label="Instrucciones del juego">
              <ol className="space-y-1.5 text-sm sm:text-base font-semibold text-stone-700">
                {content.instructions.map((line, i) => {
                  const hasAudio = content.instructionAudioUrls?.[i];
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-stone-400 font-black shrink-0">{i + 1}.</span>
                      <span className="flex-1">{line}</span>
                      {hasAudio && (
                        <KidButton
                          variant="outline"
                          accent="var(--book-teal)"
                          onClick={() => playInstruction(hasAudio)}
                          aria-label={`Escuchar instrucción ${i + 1}`}
                          className="!p-1.5 !rounded-lg"
                        >
                          <Volume2 className="w-4 h-4" aria-hidden />
                        </KidButton>
                      )}
                    </li>
                  );
                })}
              </ol>
            </header>
          )}
        </div>

        {/* Right Column in Landscape: The Game */}
        <div className="w-full flex-1 flex flex-col gap-4 min-w-0">
          <div className="w-full max-w-3xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
