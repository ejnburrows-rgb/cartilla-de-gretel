import { BADGES, type Badge } from "@/lib/rewards";
import { Lock, Award } from "lucide-react";
import { feelBus } from "@/lib/feel-bus";

interface BadgeGridProps {
  earnedIds: string[];
}

export function BadgeGrid({ earnedIds }: BadgeGridProps) {
  const handleBadgeClick = (badge: Badge, isEarned: boolean) => {
    if (isEarned) {
      feelBus.emit("chime");
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(`¡Insignia ${badge.name}! ${badge.description}`);
        utterance.lang = "es-ES";
        utterance.rate = 1.0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } else {
      feelBus.emit("tap");
    }
  };

  return (
    <div className="w-full py-6 px-4 rounded-3xl bg-card border-2 border-foreground/10 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Award className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-lg text-foreground font-fredoka">Insignias y Logros ({earnedIds.length} / 7)</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {BADGES.map((badge) => {
          const isEarned = earnedIds.includes(badge.id);
          return (
            <div
              key={badge.id}
              onClick={() => handleBadgeClick(badge, isEarned)}
              className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                isEarned
                  ? "bg-gradient-to-br from-white/90 to-white/50 dark:from-white/10 dark:to-white/5 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95"
                  : "bg-secondary/30 border-dashed border-foreground/10 opacity-60"
              }`}
              style={{
                borderColor: isEarned ? badge.color : "transparent"
              }}
            >
              {/* Badge Circular Emblem */}
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center border-4 relative mb-3 overflow-hidden shadow-inner ${
                  isEarned
                    ? "bg-white scale-100 rotate-0 hover:rotate-6 duration-200"
                    : "bg-black/10 border-gray-300"
                }`}
                style={{
                  borderColor: isEarned ? badge.color : "rgb(209, 213, 219)"
                }}
              >
                {/* Glossy overlay effect for premium look */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/40 pointer-events-none"></div>

                {isEarned ? (
                  <span
                    className="text-2xl font-black select-none"
                    style={{ color: badge.color }}
                  >
                    {badge.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <Lock className="w-6 h-6 text-foreground/40" />
                )}
              </div>

              {/* Title & Description */}
              <h4 className="font-bold text-sm text-foreground text-center font-fredoka line-clamp-1">
                {badge.name}
              </h4>
              <p className="text-[11px] text-foreground/60 text-center mt-1 leading-snug line-clamp-2 px-1">
                {isEarned ? badge.description : badge.condition}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default BadgeGrid;
