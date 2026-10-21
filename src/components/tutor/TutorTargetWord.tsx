/**
 * TutorTargetWord — the cream word card's target word (spec §9).
 *
 * During the MODEL line the word highlights letter by letter (karaoke);
 * outside the model the whole word stays highlighted so the child can
 * read it while speaking. Reduced motion: the whole word highlights
 * instantly — same sequence, same audio, no tweening.
 */
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface TutorTargetWordProps {
  /** Printed text exactly as the book prints it (accents and ñ preserved). */
  word: string;
  /** True while the model line is being spoken. */
  playing: boolean;
}

/** Calm per-letter pace for the karaoke highlight. */
export const KARAOKE_LETTER_MS = 350;

export function TutorTargetWord({ word, playing }: TutorTargetWordProps) {
  const reducedMotion = useReducedMotion();
  const [highlighted, setHighlighted] = useState(0);
  const letters = Array.from(word);

  useEffect(() => {
    if (!playing) {
      setHighlighted(0);
      return;
    }
    // Reduced motion: the full highlight appears instantly (same sequence).
    if (reducedMotion) {
      setHighlighted(letters.length);
      return;
    }
    setHighlighted(0);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setHighlighted(index);
      if (index >= letters.length) window.clearInterval(timer);
    }, KARAOKE_LETTER_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- letters.length derives from word
  }, [playing, reducedMotion, word]);

  // Outside the model the whole word is highlighted (the child reads it).
  const activeCount = playing ? highlighted : letters.length;

  return (
    <p
      data-tutor-target-word=""
      aria-label={word}
      className="flex flex-wrap justify-center font-black leading-none tracking-wide text-stone-800"
      style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
    >
      {letters.map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          data-letter-index={index}
          data-highlighted={index < activeCount ? "true" : "false"}
          className={
            index < activeCount
              ? "text-stone-900 underline decoration-amber-500 decoration-[0.12em] underline-offset-[0.18em]"
              : "text-stone-400"
          }
        >
          {letter}
        </span>
      ))}
    </p>
  );
}

export default TutorTargetWord;
