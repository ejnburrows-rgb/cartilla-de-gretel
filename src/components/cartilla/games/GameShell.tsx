// Shared viewport shell: keep the activity visible in phone landscape, with
// instructions available on demand and a separately scrollable activity.
import { type ReactNode } from "react";
import type { GameContent } from "@/lib/games/gameContent";
import { GardenBackdrop } from "@/components/cartilla/GardenBackdrop";
import { Volume2 } from "lucide-react";
import { playInstruction } from "@/lib/games/wordAudio";
import { KidButton } from "@/components/ui/KidButton";
import { GameInstructions } from "./GameInstructions";

interface GameShellProps {
  content: GameContent;
  children: ReactNode;
}

export function GameShell({ content, children }: GameShellProps) {
  if (content.type === "payaso-chano")
    return <ExcludedGameShell content={content}>{children}</ExcludedGameShell>;
  return (
    <main className="relative h-dvh overflow-hidden p-2">
      <GardenBackdrop variant="soft" />
      <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col gap-2">
        <GameInstructions content={content} />
        <div
          data-game-activity
          className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-1"
        >
          {children}
        </div>
      </div>
    </main>
  );
}

/** Preserve excluded Chano presentation/control behavior from PR1006 base. */
function ExcludedGameShell({ content, children }: GameShellProps) {
  return (
    <main className="min-h-screen px-4 py-6 sm:py-10 relative">
      <GardenBackdrop variant="soft" />
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <header className="kid-card p-5" aria-label="Instrucciones del juego">
          <ol className="space-y-1.5 text-sm sm:text-base font-semibold text-stone-700">
            {content.instructions.map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-stone-400 font-black shrink-0">{i + 1}.</span>
                <span className="flex-1">{line}</span>
                <KidButton
                  variant="outline"
                  accent="var(--book-teal)"
                  onClick={() => playInstruction()}
                  aria-label={`Escuchar instrucción ${i + 1}`}
                  className="!p-2 !rounded-lg"
                >
                  <Volume2 className="w-4 h-4" aria-hidden />
                </KidButton>
              </li>
            ))}
          </ol>
        </header>

        {children}
      </div>
    </main>
  );
}
