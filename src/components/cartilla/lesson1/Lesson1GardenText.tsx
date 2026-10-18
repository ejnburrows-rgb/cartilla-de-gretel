/**
 * Lesson 1 (vocales A/E/I/O/U) wide-screen design — garden-palette
 * instruction letters. Owner-approved Lesson 3 design language (template:
 * PR #927 Lesson 21): instruction text is rendered in rotating garden
 * colors (leaf, rose, sun, sky, lavender) instead of plain dark ink.
 * Text content is never changed — only letter colors.
 */

const GARDEN_CLASSES = [
  "l1-leaf",
  "l1-rose",
  "l1-sun",
  "l1-sky",
  "l1-lavender",
] as const;

/** Render text with each letter in a rotating garden-palette color. */
export function Lesson1GardenText({ text }: { text: string }) {
  let colorIndex = 0;
  return (
    <>
      {[...text].map((char, i) => {
        if (char === " ") return <span key={i}> </span>;
        const cls = GARDEN_CLASSES[colorIndex % GARDEN_CLASSES.length];
        colorIndex += 1;
        return (
          <span key={i} className={`l1-garden-letter ${cls}`}>
            {char}
          </span>
        );
      })}
    </>
  );
}
