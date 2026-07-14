import type { WorkbookObject } from "@/content/workbook/types";
import { gretelEvent } from "@/lib/gretel-bus";
import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";
import { speak } from "@/lib/speak";

/** Common props every interaction component receives from LivingWorkbookPage.
 * Each interaction owns its own reading of `object.interaction?.data` — see
 * the per-file doc comment for the exact shape it expects. */
export interface InteractionProps {
  objects: WorkbookObject[];
  onResult?: (r: { objectId: string; result: "correct" | "wrong" }) => void;
  onComplete?: () => void;
  /** Fired whenever something audible was attempted (recorded cue or TTS
   * fallback) — used by TapToHear for the audio_played progress event. */
  onAudioPlayed?: (objectId: string) => void;
  reducedMotion: boolean;
}

/** Shared correct/wrong feedback: real audio (WebAudio, no asset) + Gretel
 * reaction. Never a silent grade — every attempt gets both a sound and a
 * Gretel cue, same convention as the existing faithful-page exercises. */
export function fireCorrectFeedback() {
  playCorrectChord();
  gretelEvent("answer:correct");
}

export function fireWrongFeedback() {
  playWrongBuzz();
  gretelEvent("answer:wrong");
}

/** Plays an object's real recorded audio cue when one exists (`audio.src`
 * non-empty); otherwise — or if the recorded file fails to load/decode —
 * falls back to the same Web Speech TTS voice used everywhere else in the
 * app (src/lib/speak.ts: real Spanish voice, little-girl pitch, no AI
 * voice clone). Tapping to listen must always be audible, never a silent
 * no-op — recorded audio is preferred when it exists, TTS is the honest
 * fallback until real recordings land for every word.
 * Returns whether something audible was attempted, so callers can decide
 * whether this counts as a real audio_played progress event. */
export function playObjectAudio(object: WorkbookObject): boolean {
  const src = object.audio?.src;
  const fallbackText = object.audio?.label || object.text || object.alt;
  let spoken = false;
  const speakFallback = () => {
    if (spoken || !fallbackText) return;
    spoken = true;
    void speak(fallbackText);
  };
  if (src) {
    const audio = new Audio(src);
    audio.addEventListener("error", speakFallback);
    audio.play().catch(speakFallback);
    return true;
  }
  if (fallbackText) {
    speakFallback();
    return true;
  }
  return false;
}

/** dnd-kit sensors covering mouse, touch, and keyboard, shared by every
 * drag-capable interaction (matches InteractivePageExercises.tsx's pattern). */
export {
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DndContext,
} from "@dnd-kit/core";
export type { DragEndEvent } from "@dnd-kit/core";
