import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gretelEvent } from "@/lib/gretel-bus";
import { X } from "lucide-react";

export interface MarkPictureItem {
  id: string;
  label: string;
  correct: boolean;
  imageUrl?: string;
}

export interface MarkPicturesBySoundProps {
  targetVowel: string;
  items: MarkPictureItem[];
  onComplete: () => void;
}

export function MarkPicturesBySound({ targetVowel, items, onComplete }: MarkPicturesBySoundProps) {
  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);

  const totalCorrect = items.filter((item) => item.correct).length;
  const isComplete = markedIds.size === totalCorrect;

  useEffect(() => {
    if (isComplete && totalCorrect > 0) {
      // Small delay to allow seeing the last X
      const timer = setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("gretel:celebrate", {
            detail: { text: "¡Muy bien! Encontraste todas las correctas." },
          })
        );
        gretelEvent("activity:complete");
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, totalCorrect, onComplete]);

  const handleTap = (item: MarkPictureItem) => {
    if (markedIds.has(item.id) || isComplete) return;

    if (item.correct) {
      setMarkedIds((prev) => new Set(prev).add(item.id));
    } else {
      setWrongId(item.id);
      window.dispatchEvent(
        new CustomEvent("gretel:celebrate", {
          detail: { text: "Inténtalo de nuevo." },
        })
      );
      setTimeout(() => setWrongId(null), 600);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white/40 backdrop-blur-sm border border-stone-200/50 rounded-3xl shadow-sm">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black text-stone-800">
          Marca los dibujos que empiezan con el sonido "{targetVowel}"
        </h3>
        <p className="text-sm font-bold text-stone-500 mt-2">
          Toca las imágenes correctas para marcarlas.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
        {items.map((item) => {
          const isMarked = markedIds.has(item.id);
          const isWrong = wrongId === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleTap(item)}
              animate={isWrong ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: isMarked ? 1 : 1.02 }}
              whileTap={{ scale: isMarked ? 1 : 0.95 }}
              className="relative w-full aspect-square rounded-2xl border-2 border-stone-200 bg-[#FFF8ED] shadow-sm flex flex-col items-center justify-center p-3 overflow-hidden cursor-pointer touch-manipulation"
              disabled={isMarked || isComplete}
            >
              {/* Picture / Image area */}
              <div className="flex-1 flex items-center justify-center w-full mb-2">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.label}
                    className="max-h-full max-w-full object-contain select-none"
                    draggable={false}
                  />
                ) : (
                  <div className="text-5xl opacity-80 select-none">🖼️</div>
                )}
              </div>

              {/* Label */}
              <div className="text-lg font-black text-stone-800 tracking-tight leading-none mb-1">
                {item.label}
              </div>

              {/* Correct Mark Overlay */}
              <AnimatePresence>
                {isMarked && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px]"
                  >
                    <X className="w-24 h-24 text-[#C0392B] drop-shadow-md" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
