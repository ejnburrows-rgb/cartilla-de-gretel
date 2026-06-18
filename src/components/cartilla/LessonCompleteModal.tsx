import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Sparkles } from "lucide-react";
import { feelBus } from "@/lib/feel-bus";
import { STICKERS, type Sticker } from "@/lib/rewards";
import { saveEarnedSticker, getEarnedStickers } from "@/lib/rewards";
import { GretelMascot } from "@/components/gretel/GretelMascot";
import { KenBurnsSlideshow } from "@/components/cartilla/KenBurnsSlideshow";

interface LessonCompleteModalProps {
  lessonId: string;
  onNext: () => void;
  /** Page images from this lesson, shown as a pan/zoom recap before the celebration. */
  recapImages?: string[];
}

export function LessonCompleteModal({ lessonId, onNext, recapImages }: LessonCompleteModalProps) {
  const [awardedSticker, setAwardedSticker] = useState<Sticker | null>(null);

  useEffect(() => {
    // Unlock a random unowned sticker
    const ownedIds = getEarnedStickers(); // number[]
    const available = STICKERS.filter((s) => !ownedIds.includes(s.lessonId));
    let stickerToAward = available[Math.floor(Math.random() * available.length)];

    // If they have all stickers, just show a random one anyway
    if (!stickerToAward) {
      stickerToAward = STICKERS[Math.floor(Math.random() * STICKERS.length)];
    }

    if (stickerToAward && available.length > 0) {
      saveEarnedSticker(stickerToAward.lessonId);
    }

    setAwardedSticker(stickerToAward ?? null);

    // Trigger celebration effects
    feelBus.emit("success");
    setTimeout(() => feelBus.emit("sparkle"), 400);
    setTimeout(() => feelBus.emit("sparkle"), 800);
  }, [lessonId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-fade-in">
      <div className="bg-card border border-border shadow-2xl rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden">
        {/* Background rays/sparkles */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent animate-pulse" />

        <div className="relative z-10">
          {recapImages && recapImages.length > 0 && (
            <KenBurnsSlideshow
              images={recapImages}
              slideDuration={3}
              className="mb-6 h-36 -mt-2"
              alt={(i) => `Página ${i + 1} de la lección`}
            />
          )}

          <div className="flex justify-center mb-6">
            <GretelMascot
              pose="celebrate"
              text={`¡Great job!\n¡Completaste todos los retos de hoy!`}
              bubblePosition="top"
            />
          </div>

          <h2 className="text-3xl font-bold font-fredoka mb-2 text-foreground mt-4">
            ¡Lección Completada!
          </h2>
          <p className="text-foreground/70 mb-8">
            Has terminado todos los ejercicios de esta lección. ¡Excelente trabajo!
          </p>

          {awardedSticker && (
            <motion.div
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.6, duration: 0.8, delay: 0.2 }}
              className="mb-8 p-6 bg-secondary/30 rounded-3xl border border-secondary/50 relative group"
            >
              <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-amber-400 animate-bounce" />
              <div className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-4">
                Has ganado un sticker
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-6xl font-black mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ color: awardedSticker.color }}
              >
                {awardedSticker.name.charAt(0).toUpperCase()}
              </motion.div>
              <div className="font-bold text-lg font-fredoka text-primary">
                {awardedSticker.name}
              </div>
            </motion.div>
          )}

          <button
            onClick={onNext}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Siguiente Lección <Star className="w-5 h-5" fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
