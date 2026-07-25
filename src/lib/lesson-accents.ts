/**
 * Per-lesson accent colours — one distinct, saturated, child-friendly colour
 * for each of the 24 lessons. This is the single source of truth for a
 * lesson's identity colour; the catalog feeds it into `entry.color`, which the
 * student pages already thread into lesson nodes, progress dots, focus rings,
 * page badges and the Anterior/Siguiente buttons.
 *
 * Every colour was generated to pass WCAG AA contrast (>= 4.6:1) against BOTH
 * white and the warm cream paper, so it is safe as a white-on-colour node fill
 * AND as coloured text/UI sitting on the page. (See scripts note in the PR.)
 * Ordering runs warm -> cool -> warm so no two consecutive lessons collide.
 */
export const LESSON_ACCENTS: readonly string[] = [
  "#BC3C15", // 1  — warm terracotta
  "#CA214E", // 2  — rose red
  "#BC248A", // 3  — raspberry
  "#9F28C3", // 4  — grape
  "#692AC0", // 5  — violet
  "#2828C3", // 6  — royal indigo
  "#2268C3", // 7  — strong blue
  "#166F92", // 8  — ocean
  "#137376", // 9  — deep teal
  "#187764", // 10 — pine
  "#1E763B", // 11 — forest green
  "#41751F", // 12 — leaf green
  "#796915", // 13 — olive gold
  "#975B17", // 14 — amber brown
  "#C32F18", // 15 — deep coral
  "#C32273", // 16 — magenta
  "#B027B0", // 17 — orchid
  "#842AC0", // 18 — purple
  "#284FC3", // 19 — cobalt
  "#1B6DA7", // 20 — azure
  "#13766E", // 21 — jade
  "#1C784A", // 22 — sea green
  "#527321", // 23 — moss
  "#9B5927", // 24 — sienna
];

/** Accent colour for lesson `n` (1-based). Falls back to the warm primary. */
export function getLessonAccent(n: number): string {
  return LESSON_ACCENTS[n - 1] ?? "#d4541a";
}
