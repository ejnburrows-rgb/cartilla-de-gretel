// GameShell.tsx — shared shell for the themed Cartilla games (instructions header,
// warm-cream book palette, Gretel mascot). Wraps existing infra; the game body is
// passed in as children so each themed game only implements its own mechanic.
import { type ReactNode } from "react";
import { Volume2 } from "lucide-react";
import { GretelMascot, type GretelPose } from "@/components/gretel/GretelMascot";
import { playInstruction } from "@/lib/games/wordAudio";
import type { GameContent } from "@/lib/games/gameContent";
import { GardenBackdrop } from "@/components/cartilla/GardenBackdrop";
import { KidButton } from "@/components/ui/KidButton";

interface GameShellProps {
  content: GameContent;
  gretelPose?: GretelPose;
  gretelText?: string;
  children: ReactNode;
}

export function GameShell({
  content,
  gretelPose = "welcome",
  gretelText,
  children,
}: GameShellProps) {
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

        <div className="flex justify-center">
          <GretelMascot pose={gretelPose} text={gretelText} bubblePosition="top" />
        </div>

        {children}
      </div>
    </main>
  );
}
