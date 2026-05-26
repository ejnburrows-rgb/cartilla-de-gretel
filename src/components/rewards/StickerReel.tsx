import { Sparkles } from "lucide-react";
import { LESSON_STICKERS, useRewards } from "@/lib/rewards";
import { cn } from "@/lib/utils";

export function StickerReel() {
  const { earnedStickerIds } = useRewards();
  const earnedCount = earnedStickerIds.size;

  return (
    <section
      className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa,#fff7ed)] p-4 sm:p-5 shadow-[0_18px_42px_rgba(50,30,10,0.07)]"
      aria-label="Stickers ganados"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-amber-950 sm:text-lg">Stickers</h2>
          <p className="text-xs font-bold text-amber-900/55">
            {earnedCount} de {LESSON_STICKERS.length} ganados
          </p>
        </div>
        <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-amber-900 shadow-sm ring-1 ring-amber-900/10">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Recompensas
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x" role="list">
        {LESSON_STICKERS.map((sticker) => {
          const earned = earnedStickerIds.has(sticker.id);
          return (
            <div
              key={sticker.id}
              role="listitem"
              className={cn(
                "snap-start grid min-h-24 min-w-24 place-items-center rounded-3xl border-2 p-3 text-center transition duration-300",
                earned
                  ? "border-white bg-white shadow-md ring-4 ring-amber-100 hover:-translate-y-1 hover:rotate-1"
                  : "border-dashed border-amber-900/15 bg-white/45 opacity-65",
              )}
              aria-label={`${sticker.label}${earned ? ". Ganado." : ". Bloqueado."}`}
            >
              <div
                className={cn(
                  "grid h-14 w-14 place-items-center rounded-2xl text-3xl font-black shadow-inner transition duration-300",
                  earned ? "scale-100" : "scale-95 grayscale",
                )}
                style={{ backgroundColor: earned ? sticker.color : "#f5f5f4", color: earned ? "#3a281e" : "#a8a29e" }}
                aria-hidden
              >
                {earned ? sticker.symbol : "?"}
              </div>
              <span className="mt-2 text-[11px] font-black text-amber-950/70">{sticker.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
