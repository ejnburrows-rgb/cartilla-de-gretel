// juego.$gameId.tsx — Lane A (student)
// Looks up a themed game's GameContent by id and mounts GameShell + the matching
// game component. Pilot: payaso-chano-ss. The other 7 games register here later.
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { GameShell } from "@/components/cartilla/games/GameShell";
import { PayasoChano } from "@/components/cartilla/games/PayasoChano";
import { PAYASO_CHANO_SS } from "@/content/games/payaso-chano-ss";
import type { GameContent } from "@/lib/games/gameContent";

export const Route = createFileRoute("/cartilla/juego/$gameId")({
  component: Juego,
});

const GAMES: Record<string, GameContent> = {
  [PAYASO_CHANO_SS.id]: PAYASO_CHANO_SS,
};

function renderGame(content: GameContent) {
  switch (content.type) {
    case "payaso-chano":
      return <PayasoChano content={content} />;
    default:
      return null;
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
          <Link to="/cartilla" className="text-sm font-bold text-primary underline">
            Volver a la Cartilla
          </Link>
        </div>
      </main>
    );
  }

  return (
    <GameShell content={content}>
      <div className="flex justify-start">
        <Link
          to="/cartilla"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
          aria-label="Volver a la Cartilla"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden /> Cartilla
        </Link>
      </div>
      {renderGame(content)}
    </GameShell>
  );
}
