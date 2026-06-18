import { useState } from "react";
import { speak } from "@/lib/speak";
import { Volume2 } from "lucide-react";

interface InteractiveFlipchartOverlayProps {
  pageNumber: number;
  words: { word: string; emoji?: string }[];
}

export function InteractiveFlipchartOverlay({ pageNumber, words }: InteractiveFlipchartOverlayProps) {
  const [animatingIdx, setAnimatingIdx] = useState<number | null>(null);

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
          {/* Defaulting to emoji or icon until exact figure coordinate mapping is applied */}
          <span className="text-4xl">{w.emoji || <Volume2 className="w-8 h-8 text-stone-400" />}</span>
        </button>
      ))}
    </div>
  );
}
