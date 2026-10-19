import { type CSSProperties, useCallback, useMemo } from "react";
import { Check, Lock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { CATALOG, type ActivityId, type CatalogEntry } from "@/lib/lesson-catalog";
import { useLessonProgress } from "@/lib/lesson-progress";
import { requestLessonFullscreen } from "@/lib/lesson-fullscreen";
import { playUiTick } from "@/lib/piano-audio";

/** One letter of the Cartilla letter path, as the picker renders it. */
export type LetterPickerLetter = {
  /** Canonical letter id from the lesson catalog, e.g. "m" or "rr". */
  letter: string;
  /** Display pair shown on the tile, e.g. "Mm" (rr stays lowercase, like the book). */
  label: string;
  /** Lesson that teaches this letter. */
  lessonNumber: number;
  color: string;
  syllables: string[];
};

export interface LetterPickerHubProps {
  /**
   * Letters offered by the entrance screen. Defaults to the Cartilla
   * consonant letter path in book order, starting at Mm.
   */
  letters?: LetterPickerLetter[];
  /**
   * Exact unlocked letter ids. Overrides the default sequential rule —
   * hosts that already track unlocks can pass their own set.
   */
  unlockedLetters?: string[];
  /**
   * When set, picking a letter opens this activity for that letter
   * (family practice). Otherwise picking a letter opens its lesson.
   */
  activity?: ActivityId;
  /** Custom pick behavior for hosts embedding the hub in their own flow. */
  onPickLetter?: (letter: LetterPickerLetter) => void;
  title?: string;
  subtitle?: string;
}

/** The Cartilla consonant letters in book order; Mm comes first. */
export function cartillaLetters(): LetterPickerLetter[] {
  return CATALOG.filter((entry): entry is Extract<CatalogEntry, { kind: "consonant" }> => {
    return entry.kind === "consonant";
  }).map((entry) => ({
    letter: entry.letter,
    label: entry.letter === "rr" ? entry.letter : entry.letter.toUpperCase() + entry.letter,
    lessonNumber: entry.n,
    color: entry.color,
    syllables: entry.data.syllables,
  }));
}

/**
 * Default unlock rule: the first letter is always unlocked (Mm); each next
 * letter unlocks when the previous letter's lesson is completed.
 *
 * The picker deliberately does NOT inherit the workspace-wide open-access
 * flag from lesson-progress: the owner locked this entrance screen to
 * "Mm first, other letters visible but locked". Hosts that need open access
 * can pass every letter id in `unlockedLetters`.
 */
export function isLetterUnlockedAt(index: number, isPreviousCompleted: boolean): boolean {
  return index === 0 || isPreviousCompleted;
}

export function LetterPickerHub({
  letters = cartillaLetters(),
  unlockedLetters,
  activity,
  onPickLetter,
  title = "Elige una letra",
  subtitle = "Completa una letra para desbloquear la siguiente.",
}: LetterPickerHubProps) {
  const { isCompleted } = useLessonProgress();
  const navigate = useNavigate();

  const unlockedSet = useMemo(() => {
    if (unlockedLetters) return new Set(unlockedLetters);
    const unlocked = new Set<string>();
    letters.forEach((letter, index) => {
      const previous = letters[index - 1];
      const previousCompleted = previous ? isCompleted(previous.lessonNumber) : true;
      if (isLetterUnlockedAt(index, previousCompleted)) unlocked.add(letter.letter);
    });
    return unlocked;
  }, [letters, unlockedLetters, isCompleted]);

  const pick = useCallback(
    (letter: LetterPickerLetter) => {
      playUiTick();
      if (onPickLetter) {
        onPickLetter(letter);
        return;
      }
      if (activity) {
        // Raw href, like the teacher tools use: the router's default search
        // serializer would quote the values, but /cartilla/practica parses
        // plain query-string values (family=1&lesson=7).
        navigate({
          to: `/cartilla/practica?family=1&lesson=${letter.lessonNumber}&activity=${activity}`,
        });
        return;
      }
      requestLessonFullscreen();
      navigate({
        to: "/cartilla/leccion/$n",
        params: { n: String(letter.lessonNumber) },
      });
    },
    [navigate, activity, onPickLetter],
  );

  return (
    <main className="lc-letras">
      <header className="lc-letras__header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      <section className="lc-letras__grid" aria-label="Letras de La Cartilla de Gretel">
        {letters.map((letter) => {
          const unlocked = unlockedSet.has(letter.letter);
          const done = isCompleted(letter.lessonNumber);
          const tileStyle = { "--lesson-color": letter.color } as CSSProperties;
          const label = unlocked ? `Letra ${letter.label}` : `Letra ${letter.label} bloqueada`;
          return (
            <button
              key={letter.letter}
              type="button"
              disabled={!unlocked}
              onClick={() => pick(letter)}
              className={`lc-letras__tile${unlocked ? "" : " is-locked"}${done ? " is-done" : ""}`}
              style={tileStyle}
              aria-label={label}
              data-letter={letter.letter}
              data-unlocked={unlocked}
            >
              <strong className="lc-letras__tile-letter">{letter.label}</strong>
              <span className="lc-letras__tile-syllables">{letter.syllables.join(" · ")}</span>
              {done ? (
                <span className="lc-letras__tile-done" aria-hidden>
                  <Check size={18} />
                </span>
              ) : null}
              {!unlocked ? (
                <span className="lc-letras__tile-lock" aria-hidden>
                  <Lock size={18} />
                </span>
              ) : null}
            </button>
          );
        })}
      </section>
    </main>
  );
}
