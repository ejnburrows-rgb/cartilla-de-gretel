import { useState } from "react";
import { speak } from "@/lib/speak";
import { Volume2 } from "lucide-react";
import { PAGE_HOTSPOTS } from "@/content/page-hotspots";

interface InteractiveFlipchartOverlayProps {
  pageNumber: number;
  words: { word: string; emoji?: string }[];
}

export function InteractiveFlipchartOverlay({ pageNumber, words }: InteractiveFlipchartOverlayProps) {
  const [animatingIdx, setAnimatingIdx] = useState<number | null>(null);

  const exactHotspots = PAGE_HOTSPOTS[pageNumber];

  const handleTap = async (word: string, index: number) => {
    setAnimatingIdx(index);
    // Attempt to play mp3 first if exists, fallback to native TTS
    const audioUrl = `/cartilla/audio/words/${word.toLowerCase()}.mp3`;
    const audio = new Audio(audioUrl);
    
    let played = false;
    try {
      played = await new Promise((resolve, reject) => {
        audio.oncanplaythrough = () => {
          audio.play().then(() => resolve(true)).catch(reject);
        };
        audio.onerror = reject;
        setTimeout(() => reject(new Error("timeout")), 1000);
        audio.load();
      });
    } catch {
      played = false;
    }

    if (!played) {
      await speak(word);
    }
    
    setAnimatingIdx(null);
  };

  // We are falling back to the corner buttons because mapping all cutouts requires a full remap
  // and the corner buttons are easier to see.
  
  if (!words || words.length === 0) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex flex-wrap gap-5 p-8 items-start justify-end">
      {words.map((w, i) => (
        <button
          key={i}
          onClick={() => handleTap(w.word, i)}
          className={`pointer-events-auto flex items-center justify-center w-24 h-24 rounded-3xl border-4 transition-all duration-300 cursor-pointer shadow-2xl ${
            animatingIdx === i 
              ? "animate-bounce scale-125 border-yellow-300 bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_40px_rgba(249,115,22,0.8)]" 
              : "bg-gradient-to-br from-orange-300 to-red-400 border-white/80 hover:scale-110 hover:border-yellow-300 hover:shadow-[0_0_30px_rgba(251,146,60,0.6)]"
          }`}
          title={`Escuchar ${w.word}`}
        >
          <span className="text-5xl drop-shadow-md">
            {w.emoji || <Volume2 className="w-10 h-10 text-white" />}
          </span>
        </button>
      ))}
    </div>
  );
}
