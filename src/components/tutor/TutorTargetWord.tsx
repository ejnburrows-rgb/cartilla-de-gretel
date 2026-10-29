/** Whole-word cue follows real playback. Letter-level timing needs approved alignment. */
export interface TutorTargetWordProps {
  word: string;
  playing: boolean;
}
export function TutorTargetWord({ word, playing }: TutorTargetWordProps) {
  return (
    <p
      data-tutor-target-word=""
      data-playing={playing ? "true" : "false"}
      aria-label={word}
      className="tutor-word flex flex-wrap justify-center font-black leading-none tracking-wide text-stone-800"
    >
      {Array.from(word).map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          data-letter-index={index}
          data-highlighted={playing ? "true" : "false"}
          className={
            playing
              ? "text-stone-900 underline decoration-amber-500 decoration-[0.12em] underline-offset-[0.18em]"
              : "text-stone-900"
          }
        >
          {letter}
        </span>
      ))}
    </p>
  );
}
export default TutorTargetWord;
