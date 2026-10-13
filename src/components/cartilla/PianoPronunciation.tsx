/**
 * Piano Hablador — the child says each syllable and the piano plays it.
 *
 * Two owner-approved designs share the same behavior (usePianoSession):
 *   • "Piano" (design A): the original wooden piano, refined — a full octave
 *     of white and black keys under a little staff of syllables.
 *   • "Cancionero" (design B): Gretel's songbook — the syllables as song
 *     lyrics, five big keys docked within thumb reach on phones.
 *
 * The app picks one by screen size (Cancionero on phones, Piano on tablets and
 * laptops) and a small switch lets the child or teacher change it; the choice
 * is remembered on this device. Content that needs more than five keys always
 * uses the Piano.
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Music, Piano } from "lucide-react";
import type { PianoWord } from "@/lib/piano-words";
import { PianoDesignA } from "./piano/PianoDesignA";
import { PianoDesignB, DESIGN_B_MAX_SYLLABLES } from "./piano/PianoDesignB";
import "./piano/piano-choice.css";

interface PianoPronunciationProps {
  /** Lesson syllables (used when there are no verified words). */
  syllables: string[];
  /** Verified book words, practiced one at a time. */
  words?: PianoWord[];
  lessonId?: string;
  /** Kept for the activity API; the designs use their own palette. */
  color?: string;
  onComplete?: () => void;
  locale?: string;
}

export type PianoDesign = "piano" | "cancionero";
export const PIANO_DESIGN_STORAGE_KEY = "cartilla.piano.design";
export const PHONE_QUERY = "(max-width: 640px)";

function subscribePhone(onChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener?.("change", onChange);
  return () => query.removeEventListener?.("change", onChange);
}
function isPhone() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(PHONE_QUERY).matches
  );
}

function readSavedDesign(): PianoDesign | null {
  try {
    const value = window.localStorage.getItem(PIANO_DESIGN_STORAGE_KEY);
    return value === "piano" || value === "cancionero" ? value : null;
  } catch {
    return null;
  }
}

export function PianoPronunciation({
  syllables,
  words,
  lessonId,
  onComplete,
  locale = "es-MX",
}: PianoPronunciationProps) {
  const phone = useSyncExternalStore(subscribePhone, isPhone, () => false);
  const [saved, setSaved] = useState<PianoDesign | null>(null);
  useEffect(() => setSaved(readSavedDesign()), []);

  const verified = (words ?? []).filter((entry) => entry.syllables.length > 0);
  const longest = verified.length
    ? Math.max(...verified.map((entry) => entry.syllables.length))
    : syllables.length;
  const cancioneroFits = longest <= DESIGN_B_MAX_SYLLABLES;
  const preferred: PianoDesign = saved ?? (phone ? "cancionero" : "piano");
  const design: PianoDesign = cancioneroFits ? preferred : "piano";

  const choose = useCallback((next: PianoDesign) => {
    setSaved(next);
    try {
      window.localStorage.setItem(PIANO_DESIGN_STORAGE_KEY, next);
    } catch {
      /* private mode: the choice lasts for this visit */
    }
  }, []);

  const props = { syllables, words, lessonId, onComplete, locale };
  return (
    <div className="piano-choice-wrap" data-piano-design={design}>
      {cancioneroFits && (
        <div className="piano-choice" role="group" aria-label="Elegir el piano">
          <button
            type="button"
            className="piano-choice__option"
            aria-pressed={design === "piano"}
            onClick={() => choose("piano")}
            data-testid="piano-design-piano"
          >
            <Piano aria-hidden="true" /> Piano
          </button>
          <button
            type="button"
            className="piano-choice__option"
            aria-pressed={design === "cancionero"}
            onClick={() => choose("cancionero")}
            data-testid="piano-design-cancionero"
          >
            <Music aria-hidden="true" /> Cancionero
          </button>
        </div>
      )}
      {design === "cancionero" ? (
        <PianoDesignB key="cancionero" {...props} />
      ) : (
        <PianoDesignA key="piano" {...props} />
      )}
    </div>
  );
}

export default PianoPronunciation;
