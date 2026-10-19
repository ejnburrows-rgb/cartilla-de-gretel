/**
 * Lesson 17 (Rr) wide-screen design — garden-palette instruction letters.
 * Owner-approved Lesson 3 design language: instruction text is rendered in
 * rotating garden colors (leaf, rose, sun, sky, lavender) instead of plain
 * dark ink. Text content is never changed — only letter colors.
 */

const GARDEN_CLASSES = [
  "l17-leaf",
  "l17-rose",
  "l17-sun",
  "l17-sky",
  "l17-lavender",
] as const;

/** Render text with each letter in a rotating garden-palette color. */
export function Lesson17GardenText({ text }: { text: string }) {
  let colorIndex = 0;
  return (
    <>
      {[...text].map((char, i) => {
        if (char === " ") return <span key={i}> </span>;
        const cls = GARDEN_CLASSES[colorIndex % GARDEN_CLASSES.length];
        colorIndex += 1;
        return (
          <span key={i} className={`l17-garden-letter ${cls}`}>
            {char}
          </span>
        );
      })}
    </>
  );
}
