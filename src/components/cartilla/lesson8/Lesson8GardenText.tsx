/**
 * Lesson 8 (Pp) wide-screen design — garden-palette instruction letters.
 * Owner-approved Lesson 3 design language: instruction text is rendered in
 * rotating garden colors (leaf, rose, sun, sky, lavender) instead of plain
 * dark ink. Text content is never changed — only letter colors.
 */

const GARDEN_CLASSES = [
  "l8-leaf",
  "l8-rose",
  "l8-sun",
  "l8-sky",
  "l8-lavender",
] as const;

/** Render text with each letter in a rotating garden-palette color. */
export function Lesson8GardenText({ text }: { text: string }) {
  let colorIndex = 0;
  return (
    <>
      {[...text].map((char, i) => {
        if (char === " ") return <span key={i}> </span>;
        const cls = GARDEN_CLASSES[colorIndex % GARDEN_CLASSES.length];
        colorIndex += 1;
        return (
          <span key={i} className={`l8-garden-letter ${cls}`}>
            {char}
          </span>
        );
      })}
    </>
  );
}
