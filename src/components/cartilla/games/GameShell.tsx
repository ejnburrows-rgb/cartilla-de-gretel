// GameShell.tsx — shared shell for the themed Cartilla games (compact instructions header,
// warm-cream book palette, wood/paper stage).
import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Volume2 } from "lucide-react";
import { playInstruction } from "@/lib/games/wordAudio";
import type { GameContent } from "@/lib/games/gameContent";
import { GardenBackdrop } from "@/components/cartilla/GardenBackdrop";
import { KidButton } from "@/components/ui/KidButton";
import "@/styles/games-premium.css";

interface GameShellProps {
  content: GameContent;
  children: ReactNode;
}

export function GameShell({ content, children }: GameShellProps) {
  const hasMany = content.instructions.length > 2;
  const [expanded, setExpanded] = useState(!hasMany);
  const visibleLines = expanded ? content.instructions : content.instructions.slice(0, 1);

  return (
    <main className="game-stage game-shell-wrap min-h-screen px-3 py-4 sm:px-6 sm:py-6 relative">
      <GardenBackdrop variant="soft" />
      <div className="relative z-10 max-w-5xl mx-auto space-y-4">
        <header
          className="game-paper-board p-3.5 sm:p-4"
          aria-label="Instrucciones del juego"
        >
          <div className="flex flex-col gap-2">
            <ol className="space-y-2 text-sm sm:text-base font-semibold text-[#25313A]">
              {visibleLines.map((line, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#F2B632]/25 text-xs font-black text-[#25313A]">
                    {i + 1}
                  </span>
                  <span className="flex-1 leading-snug">{line}</span>
                  <KidButton
                    variant="outline"
                    accent="#167A72"
                    onClick={() => playInstruction()}
                    aria-label={`Escuchar instrucción ${i + 1}`}
                    className="!min-h-14 !min-w-14 !p-0 !rounded-2xl shrink-0"
                  >
                    <Volume2 className="w-5 h-5" aria-hidden />
                  </KidButton>
                </li>
              ))}
            </ol>

            {hasMany && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  className="inline-flex min-h-14 items-center gap-2 rounded-2xl border-2 border-[#D4C4A8] bg-[#F5F1E8] px-4 py-2 text-sm font-black text-[#25313A] hover:border-[#167A72] transition-colors"
                >
                  {expanded ? (
                    <>
                      Ocultar pasos <ChevronUp className="h-4 w-4" aria-hidden />
                    </>
                  ) : (
                    <>
                      Ver los {content.instructions.length} pasos{" "}
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
