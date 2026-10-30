import { useState } from "react";
import { Volume2 } from "lucide-react";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import { playPictureName } from "@/lib/picture-audio";
import { approvedPictureRecording, resolvePictureName } from "@/lib/picture-vocabulary";

interface InteractiveFlipchartOverlayProps {
  pageNumber: number;
  words: { word: string; emoji?: string; illustrationSrc?: string }[];
}

export function InteractiveFlipchartOverlay({
  pageNumber,
  words,
}: InteractiveFlipchartOverlayProps) {
  const [animatingIdx, setAnimatingIdx] = useState<number | null>(null);

  const handleTap = (entry: NonNullable<ReturnType<typeof resolvePictureName>>, index: number) => {
    setAnimatingIdx(index);
    playPictureName(entry);
    window.setTimeout(() => setAnimatingIdx((current) => current === index ? null : current), 700);
  };

  const playableWords = words.flatMap((word, originalIndex) => {
    if (!word.illustrationSrc) return [];
    const entry = resolvePictureName(word.illustrationSrc, word.word);
    if (!entry || !approvedPictureRecording(entry.key)) return [];
    return [{ word, entry, originalIndex }];
  });
  if (playableWords.length === 0) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex flex-wrap gap-5 p-8 items-start justify-end">
      {playableWords.map(({ word: w, entry, originalIndex }, i) => (
        <button
          key={`${pageNumber}-${entry.key}-${originalIndex}`}
          type="button"
          onClick={() => handleTap(entry, i)}
          className={`pointer-events-auto flex flex-col items-center justify-center w-24 h-24 rounded-3xl border-4 transition-all duration-300 cursor-pointer shadow-2xl ${
            animatingIdx === i
              ? "animate-bounce scale-125 border-yellow-300 bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_40px_rgba(249,115,22,0.8)]"
              : "bg-gradient-to-br from-orange-300 to-red-400 border-white/80 hover:scale-110 hover:border-yellow-300 hover:shadow-[0_0_30px_rgba(251,146,60,0.6)]"
          }`}
          title={`Escuchar ${w.word}`}
          aria-label={`Escuchar ${w.word}`}
        >
          <LivingIllustration
            src={w.illustrationSrc!}
            alt=""
            className="max-h-12 w-auto drop-shadow-md"
            loading="lazy"
          />
          <span className="mt-1 text-[10px] font-black text-white drop-shadow-md max-w-[5.5rem] truncate">
            {w.word}
          </span>
        </button>
      ))}
    </div>
  );
}
