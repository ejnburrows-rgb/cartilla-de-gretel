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

  // If we have exact coordinates mapped for this page
  if (exactHotspots && exactHotspots.length > 0) {
    return (
      <div className="absolute inset-0 z-50 pointer-events-none">
        {exactHotspots.map((hotspot, i) => (
          <button
            key={i}
            onClick={() => handleTap(hotspot.word, i)}
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              width: `${hotspot.w}%`,
              height: `${hotspot.h}%`,
            }}
            className={`absolute pointer-events-auto flex items-center justify-center rounded-xl transition-all cursor-pointer border-4 border-transparent hover:border-red-400 hover:bg-white/10 ${
              animatingIdx === i ? "animate-bounce scale-110 border-red-500 bg-red-400/20 shadow-[0_0_20px_rgba(239,68,68,0.5)]" : ""
            }`}
            title={`Escuchar ${hotspot.word}`}
          >
            {/* The hotspot itself is invisible by default so the authentic art shows through.
                We only show a border on hover or when clicked. */}
          </button>
        ))}
      </div>
    );
  }

  // Fallback if no exact coordinates exist for this page yet
  if (!words || words.length === 0) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex flex-wrap gap-4 p-8 items-start justify-end">
      {words.map((w, i) => (
        <button
          key={i}
          onClick={() => handleTap(w.word, i)}
          className={`pointer-events-auto flex items-center justify-center w-20 h-20 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-4 border-red-200 transition-all cursor-pointer hover:scale-110 hover:border-red-400 ${
            animatingIdx === i ? "animate-bounce scale-110 border-red-500" : ""
          }`}
          title={`Escuchar ${w.word}`}
        >
          <span className="text-4xl">{w.emoji || <Volume2 className="w-8 h-8 text-stone-400" />}</span>
        </button>
      ))}
    </div>
  );
}
