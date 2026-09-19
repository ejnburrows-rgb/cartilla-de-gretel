import { useState } from "react";
import { speak } from "@/lib/speak";
import { Volume2 } from "lucide-react";
import { PAGE_HOTSPOTS } from "@/content/page-hotspots";

interface InteractiveFlipchartOverlayProps {
  pageNumber: number;
  words: { word: string; emoji?: string; illustrationSrc?: string }[];
}

export function InteractiveFlipchartOverlay({
  pageNumber,
  words,
}: InteractiveFlipchartOverlayProps) {
  const [animatingIdx, setAnimatingIdx] = useState<number | null>(null);

  void pageNumber;
  void PAGE_HOTSPOTS; // hotspots reserved for future plate map; not emoji

  const handleTap = async (word: string, index: number) => {
    setAnimatingIdx(index);
    // Word mp3 library is not shipped (public/cartilla/audio/words/ absent).
    // Use TTS only — never hit a missing URL (avoids demo console 404 spam).
    // When real kid-voice recordings land, wire them via audio-manifest.
    await speak(word);
    setAnimatingIdx(null);
  };

  if (!words || words.length === 0) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex flex-wrap gap-5 p-8 items-start justify-end">
      {words.map((w, i) => (
        <button
          key={i}
          type="button"
          onClick={() => handleTap(w.word, i)}
          className={`pointer-events-auto flex flex-col items-center justify-center w-24 h-24 rounded-3xl border-4 transition-all duration-300 cursor-pointer shadow-2xl ${
            animatingIdx === i
              ? "animate-bounce scale-125 border-yellow-300 bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_40px_rgba(249,115,22,0.8)]"
              : "bg-gradient-to-br from-orange-300 to-red-400 border-white/80 hover:scale-110 hover:border-yellow-300 hover:shadow-[0_0_30px_rgba(251,146,60,0.6)]"
          }`}
          title={`Escuchar ${w.word}`}
          aria-label={`Escuchar ${w.word}`}
        >
          {w.illustrationSrc ? (
            <img
              src={w.illustrationSrc}
              alt=""
              className="max-h-12 w-auto object-contain drop-shadow-md"
              draggable={false}
            />
          ) : (
            <Volume2 className="w-8 h-8 text-white drop-shadow-md" aria-hidden />
          )}
          <span className="mt-1 text-[10px] font-black text-white drop-shadow-md max-w-[5.5rem] truncate">
            {w.word}
          </span>
        </button>
      ))}
    </div>
  );
}
