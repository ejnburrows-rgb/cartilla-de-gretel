import { Trophy } from "lucide-react";
import { BADGES, useRewards } from "@/lib/rewards";
import { cn } from "@/lib/utils";

export function BadgeGrid() {
  const { earnedBadgeIds } = useRewards();

  return (
    <section
      className="rounded-[2rem] border border-stone-200 bg-white p-4 sm:p-5 shadow-[0_18px_42px_rgba(50,30,10,0.06)]"
      aria-label="Insignias ganadas"
    >
      <div className="mb-4 flex items-center gap-2 text-amber-950">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h2 className="text-base font-black sm:text-lg">Insignias</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="list">
        {BADGES.map((badge) => {
          const earned = earnedBadgeIds.has(badge.id);
          return (
            <div
              key={badge.id}
              role="listitem"
              className={cn(
                "min-h-36 rounded-3xl border-2 p-3 text-center transition duration-300",
                earned
                  ? "border-amber-200 bg-amber-50/70 shadow-md hover:-translate-y-1"
                  : "border-dashed border-stone-200 bg-stone-50/70 opacity-70",
              )}
              aria-label={`${badge.label}${earned ? ". Ganada." : ". Bloqueada."}`}
            >
              <div
                className="mx-auto grid h-16 w-16 place-items-center rounded-3xl text-xl font-black shadow-inner"
                style={{ backgroundColor: earned ? badge.color : "#e7e5e4", color: earned ? "#3a281e" : "#78716c" }}
                aria-hidden
              >
                {earned ? badge.symbol : "--"}
              </div>
              <h3 className="mt-3 text-sm font-black text-amber-950">{badge.label}</h3>
              <p className="mt-1 text-xs font-semibold leading-snug text-stone-500">{badge.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
