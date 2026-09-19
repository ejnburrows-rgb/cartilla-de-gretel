import { useEffect } from "react";
import { audioEngine } from "@/lib/audio-engine";

export function PageTurnSound() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePageFlip = (e: Event) => {
      // Check if it's a soft page turn custom detail or normal
      const isSoft = (e as CustomEvent)?.detail?.soft === true;
      audioEngine.playPageTurn(isSoft);
    };

    window.addEventListener("cartilla:page-flip", handlePageFlip);

    // Initial ambient audio trigger on first interaction
    const initAmbient = () => {
      if (audioEngine.isAmbientPlaying()) {
        audioEngine.toggleAmbient(true);
      }
      window.removeEventListener("click", initAmbient);
    };
    window.addEventListener("click", initAmbient);

    return () => {
      window.removeEventListener("cartilla:page-flip", handlePageFlip);
      window.removeEventListener("click", initAmbient);
    };
  }, []);

  return null;
}
