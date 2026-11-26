import { useCallback } from "react";
import { playPictureName } from "@/lib/picture-audio";
import { resolveRecordedPictureName } from "@/lib/picture-vocabulary";

/** Recorded vocabulary playback only. Missing clips stay silent; TTS is never a fallback. */
export function useAudio() {
  const isAvailable = useCallback((text: string) => !!resolveRecordedPictureName(text), []);
  const play = useCallback((text: string) => {
    const entry = resolveRecordedPictureName(text);
    if (!entry) return;
    playPictureName(entry);
  }, []);

  return { play, playingText: null, isAvailable };
}
