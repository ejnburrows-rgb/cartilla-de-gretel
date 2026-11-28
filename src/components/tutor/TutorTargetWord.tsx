import type { CSSProperties } from "react";

/** Whole-word cue follows real playback. Letter-level timing needs approved alignment. */
export interface TutorTargetWordProps {
  word: string;
  playing: boolean;
}
export function TutorTargetWord({ word, playing }: TutorTargetWordProps) {
  const tokens = word.split(/(\s+)/).filter((part) => part.length > 0);
  const wordLengths = tokens
    .filter((part) => !/^\s+$/.test(part))
    .map((part) => Array.from(part).length);
  const maxWordChars = Math.max(1, ...wordLengths);
  const isMultiWord = wordLengths.length > 1;
  let letterCursor = 0;

  return (
    <div className="tutor-word-measure w-full min-w-0">
      <p
        data-tutor-target-word=""
        data-playing={playing ? "true" : "false"}
        data-multi-word={isMultiWord ? "true" : "false"}
        aria-label={word}
        style={{ "--tutor-word-chars": String(maxWordChars) } as CSSProperties}
        className="tutor-word flex flex-wrap justify-center font-black leading-none tracking-wide text-stone-800"
      >
        {tokens.map((token, tokenIndex) => {
          const chars = Array.from(token);
          if (/^\s+$/.test(token)) {
            return chars.map((space) => {
              const index = letterCursor++;
              return (
                <span
                  key={`space-${tokenIndex}-${index}`}
                  data-letter-index={index}
                  data-highlighted={playing ? "true" : "false"}
                  className="tutor-word-space whitespace-pre text-stone-900"
                >
                  {space}
                </span>
              );
            });
          }
          return (
            <span
              key={`word-${tokenIndex}-${token}`}
              className="tutor-word-token inline-flex whitespace-nowrap"
            >
              {chars.map((letter) => {
                const index = letterCursor++;
                return (
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
                );
              })}
            </span>
          );
        })}
      </p>
    </div>
  );
}
export default TutorTargetWord;
