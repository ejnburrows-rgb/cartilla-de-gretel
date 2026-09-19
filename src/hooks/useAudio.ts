import { useState, useCallback } from "react";
import { speak, speakVowel } from "@/lib/speak";

export function useAudio() {
  const [playingText, setPlayingText] = useState<string | null>(null);

  const play = useCallback(async (text: string, isVowel = false) => {
    setPlayingText(text);
    try {
      if (isVowel) {
        await speakVowel(text);
      } else {
        await speak(text);
      }
    } finally {
      setPlayingText(null);
    }
  }, []);

  return { play, playingText };
}
