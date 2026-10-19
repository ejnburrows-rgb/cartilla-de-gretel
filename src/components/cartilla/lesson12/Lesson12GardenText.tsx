/**
 * Lesson 12 (Ll) wide-screen design — garden-palette instruction letters.
 * Owner-approved Lesson 3 design language: instruction text is rendered in
 * rotating garden colors (leaf, rose, sun, sky, lavender) instead of plain
 * dark ink. Text content is never changed — only letter colors.
 */

const GARDEN_CLASSES = [
  "l12-leaf",
  "l12-rose",
  "l12-sun",
  "l12-sky",
  "l12-lavender",
] as const;

/** Render text with each letter in a rotating garden-palette color. */
export function Lesson12GardenText({ text }: { text: string }) {
  let colorIndex = 0;
  return (
    <>
      {[...text].map((char, i) => {
        if (char === " ") return <span key={i}> </span>;
        const cls = GARDEN_CLASSES[colorIndex % GARDEN_CLASSES.length];
        colorIndex += 1;
        return (
          <span key={i} className={`l12-garden-letter ${cls}`}>
            {char}
          </span>
        );
      })}
    </>
  );
}
