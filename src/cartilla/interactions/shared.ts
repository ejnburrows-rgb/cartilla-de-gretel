import type { WorkbookObject } from "@/content/workbook/types";
import { gretelEvent } from "@/lib/gretel-bus";
import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";
import { playPictureName } from "@/lib/picture-audio";
import { resolvePictureName } from "@/lib/picture-vocabulary";

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

/** Shared vocabulary playback obeys approved recording policy and never reports progress. */
export function playObjectAudio(object: WorkbookObject): boolean {
  const entry = object.src ? resolvePictureName(object.src, object.audio?.label ?? object.alt ?? object.text ?? "") : null;
  if (!entry) return false;
  return ["recorded", "tts"].includes(playPictureName(entry));
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
