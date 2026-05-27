import { STICKERS, type Sticker } from "@/lib/rewards";
import { Sparkles, HelpCircle } from "lucide-react";
import { feelBus } from "@/lib/feel-bus";

interface StickerReelProps {
  earnedIds: number[];
}

export function StickerReel({ earnedIds }: StickerReelProps) {
  const handleStickerClick = (sticker: Sticker, isEarned: boolean) => {
    if (isEarned) {
      feelBus.emit("sparkle");
      // Trigger a speaking voice reading the sticker description
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(`¡Pegatina ${sticker.name}! ${sticker.description}`);
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
    <div className="w-full py-6 px-4 rounded-3xl bg-gradient-to-b from-[#fdf6e2] to-[#f5e6be] border-4 border-[#d5be88] shadow-inner relative overflow-hidden">
      {/* Wooden texture details */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#804000_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-700">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <h3 className="font-bold text-lg text-amber-950 font-fredoka">Álbum de Pegatinas ({earnedIds.length} / 24)</h3>
      </div>

      {/* Horizontal shelf layout */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-amber-700/30 scrollbar-track-transparent scroll-smooth snap-x">
        {STICKERS.map((sticker) => {
          const isEarned = earnedIds.includes(sticker.lessonId);
          return (
            <div
              key={sticker.id}
              onClick={() => handleStickerClick(sticker, isEarned)}
              className="flex-shrink-0 w-24 flex flex-col items-center snap-center cursor-pointer group"
            >
              <div 
                className={`relative w-20 h-20 rounded-2xl flex items-center justify-center border-4 transition-all duration-300 ${
                  isEarned
                    ? "bg-white/95 scale-100 hover:scale-110 hover:-rotate-3 active:scale-95 shadow-md hover:shadow-xl"
                    : "bg-black/5 border-dashed border-gray-300 opacity-60 hover:opacity-80"
                }`}
                style={{
                  borderColor: isEarned ? sticker.color : "rgb(209, 213, 219)",
                  boxShadow: isEarned 
                    ? `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px ${sticker.color}40`
                    : undefined
                }}
              >
                {isEarned ? (
                  <>
                    <span className="text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] group-hover:animate-bounce select-none">
                      {sticker.emoji}
                    </span>
                    {/* Sparkle micro-indicator */}
                    <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  </>
                ) : (
                  <HelpCircle className="w-8 h-8 text-gray-400" />
                )}
              </div>

              {/* Caption */}
              <div className="mt-2 text-center w-full">
                <p className="text-xs font-bold text-amber-950 truncate max-w-full">
                  {isEarned ? sticker.name : `Lección ${sticker.lessonId}`}
                </p>
                {isEarned && (
                  <p className="text-[10px] text-amber-800/80 line-clamp-1 group-hover:line-clamp-none transition-all duration-300 px-1 mt-0.5">
                    {sticker.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative shelf base plate */}
      <div className="h-2 w-full bg-amber-800/40 rounded-full mt-1"></div>
    </div>
  );
}
