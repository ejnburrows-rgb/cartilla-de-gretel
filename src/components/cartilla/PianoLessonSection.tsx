/**
 * PianoLessonSection — owner-approved bridge that places the Piano Hablador
 * (already-built `PianoPronunciation`) into a lesson right after its
 * "Completa" exercise page, for the six lessons the owner signed off on.
 *
 * Owner rules enforced here:
 *   • Only lessons 7, 8, 9, 10, 20 and 24 ever render the Piano. For every
 *     other lesson this component returns null, so wiring it into the lesson
 *     flow is safe and inert.
 *   • Piano never counts toward lesson completion. The `onComplete` callback
 *     is intentionally a no-op — it never touches any progress store, never
 *     emits a Gretel activity:complete event, and never gates page-turning.
 *   • Piano is hidden on devices without a confirmed on-device microphone.
 *     We reuse the existing `usePianoListening` probe (the same one the
 *     Piano designs themselves use) instead of duplicating the detection, so
 *     there is one source of truth for "can this device listen?". We never
 *     start the microphone from here — the Piano's own session does that
 *     when the child taps its mic button.
 *   • No new spoken feedback is added by the wiring. `PianoPronunciation`
 *     renders visual-only; its own existing Escuchar example audio is the
 *     only sound that comes out of the section.
 */
import { PianoPronunciation } from "./PianoPronunciation";
import { PIANO_WORDS } from "@/lib/piano-words";
import { usePianoListening } from "@/hooks/usePianoListening";

/** Lessons whose Completa page is followed by a Piano Hablador section. */
export const PIANO_LESSONS: ReadonlySet<number> = new Set([7, 8, 9, 10, 20, 24]);

export interface PianoLessonSectionProps {
  lessonNumber: number;
}

export function PianoLessonSection({ lessonNumber }: PianoLessonSectionProps) {
  /**
   * Reuse the existing on-device microphone probe. We pass a no-op onFinal
   * because this hook instance never starts the microphone — it only
   * observes whether the device confirms on-device recognition is available.
   * The Piano's own `usePianoSession` (inside `PianoPronunciation`) opens
   * the mic when the child taps its button; we do not duplicate that.
   */
  const { processing } = usePianoListening({
    lang: "es-MX",
    onFinal: () => {
      /* never started from here — no final results to handle. */
    },
  });

  if (!PIANO_LESSONS.has(lessonNumber)) return null;
  const words = PIANO_WORDS[lessonNumber];
  if (!words || words.length === 0) return null;
  // "checking" → mic probe still running; render nothing until the browser
  // gives its definitive answer so we never flash the Piano on a device that
  // will hide it. "unavailable" → no confirmed on-device mic, hide entirely.
  if (processing !== "on-device") return null;

  return (
    <PianoPronunciation
      syllables={[]}
      words={words.map((entry) => ({
        word: entry.word,
        syllables: [...entry.syllables],
      }))}
      lessonId={String(lessonNumber)}
      onComplete={() => {
        /* Owner rule: Piano NEVER counts toward lesson completion.
         * No progress store write, no Gretel event, no auto-advance. */
      }}
    />
  );
}

export default PianoLessonSection;
