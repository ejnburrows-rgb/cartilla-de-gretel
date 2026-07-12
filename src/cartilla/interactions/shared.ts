import type { WorkbookObject } from "@/content/workbook/types";
import { gretelEvent } from "@/lib/gretel-bus";
import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";

/** Common props every interaction component receives from LivingWorkbookPage.
 * Each interaction owns its own reading of `object.interaction?.data` — see
 * the per-file doc comment for the exact shape it expects. */
export interface InteractionProps {
  objects: WorkbookObject[];
  onResult?: (r: { objectId: string; result: "correct" | "wrong" }) => void;
  onComplete?: () => void;
  /** Fired only when a real audio cue actually played (non-empty src) —
   * used by TapToHear for the audio_played progress event. */
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

/** Plays an object's real audio cue if one exists; silently no-ops
 * otherwise (the established "safe until real audio lands" convention).
 * Returns whether a real cue was actually played, so callers can decide
 * whether this counts as a real audio_played progress event. */
export function playObjectAudio(object: WorkbookObject): boolean {
  const src = object.audio?.src;
  if (!src) return false;
  const audio = new Audio(src);
  audio.play().catch(() => {
    /* autoplay/user-gesture rejections are expected on some browsers — ignore */
  });
  return true;
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
