import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { GameShell } from "@/components/cartilla/games/GameShell";
import { PayasoChano } from "@/components/cartilla/games/PayasoChano";
import { SyllableBuilder } from "@/components/cartilla/games/SyllableBuilder";
import { CoreGame } from "@/components/cartilla/games/CoreGames";
import { PAYASO_CHANO_SS } from "@/content/games/payaso-chano-ss";
import { SYLLABLE_BUILDER_PILOT } from "@/content/games/syllable-builder-pilot";
import { CORE_THEMED_GAMES } from "@/content/games/core-games";
import type { GameContent } from "@/lib/games/gameContent";

export const Route = createFileRoute("/cartilla/juego/$gameId")({
  component: Juego,
});

export const LIVE_GAMES: GameContent[] = [
  PAYASO_CHANO_SS,
  ...SYLLABLE_BUILDER_PILOT,
  ...CORE_THEMED_GAMES,
];

const GAMES: Record<string, GameContent> = Object.fromEntries(
  LIVE_GAMES.map((game) => [game.id, game]),
);

function renderGame(content: GameContent) {
  switch (content.type) {
    case "payaso-chano":
      return <PayasoChano content={content} />;
    case "lectura-silabas":
      return <SyllableBuilder content={content} />;
    case "mariposas":
    case "juego-vocal":
    case "fonetica-completar":
    case "lectura-rima":
    case "palabras-por-minuto":
    case "dibujos":
      return <CoreGame content={content} />;
  }
}

function Juego() {
  const { gameId } = Route.useParams();
  const content = GAMES[gameId];

  if (!content) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-foreground/70 font-bold">Juego no encontrado.</p>
          <Link to="/cartilla/practica" className="text-sm font-bold text-primary underline">
            Volver a práctica
          </Link>
        </div>
      </main>
    );
  }

  return (
    <GameShell content={content}>
      <div className="flex justify-start">
        <Link
          to="/cartilla/practica"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
          aria-label="Volver a práctica"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden /> Práctica
        </Link>
      </div>
      {renderGame(content)}
    </GameShell>
  );
}
