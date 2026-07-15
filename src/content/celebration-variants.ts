// celebration-variants.ts — varied celebration copy so Gretel does not
// repeat herself across a session. The gretel-feedback module picks one
// at random per outcome; this module supplies the pool.

export type CelebrationContext =
  | "page-perfect"
  | "page-completed"
  | "lesson-completed"
  | "streak-extended"
  | "streak-recovered"
  | "first-try"
  | "persistence";

export const CELEBRATION_POOL: Record<CelebrationContext, string[]> = {
  "page-perfect": [
    "\u00a1Perfecto! No te equivocaste ni una vez.",
    "\u00a1Sin errores! Sigue as\u00ed.",
    "\u00a1Excelente! P\u00e1gina perfecta.",
    "\u00a1Bravo! Lo hiciste todo bien.",
  ],
  "page-completed": [
    "\u00a1Terminaste esta p\u00e1gina!",
    "\u00a1Otra p\u00e1gina completada!",
    "\u00a1Gran trabajo! Vamos a la siguiente.",
    "\u00a1Vas muy bien!",
  ],
  "lesson-completed": [
    "\u00a1Lecci\u00f3n completa! Eres incre\u00edble.",
    "\u00a1Terminaste la lecci\u00f3n entera!",
    "\u00a1Otra lecci\u00f3n m\u00e1s! Sigue brillando.",
    "\u00a1Lo lograste! Lecci\u00f3n dominada.",
  ],
  "streak-extended": [
    "\u00a1Sigues practicando! Tu racha crece.",
    "\u00a1Un d\u00eda m\u00e1s en tu racha!",
    "\u00a1Constancia! Tu racha sigue.",
  ],
  "streak-recovered": [
    "\u00a1Volviste! Vamos a empezar otra racha.",
    "\u00a1Aqu\u00ed estamos otra vez! A practicar.",
    "\u00a1Qu\u00e9 bueno verte de regreso!",
  ],
  "first-try": [
    "\u00a1Lo hiciste a la primera!",
    "\u00a1Primera vez y perfecto!",
    "\u00a1Sin titubear! Muy bien.",
  ],
  persistence: [
    "\u00a1Lo intentaste hasta lograrlo!",
    "No te rendiste. \u00a1Bravo!",
    "\u00a1La paciencia da frutos!",
  ],
};

export function pickCelebration(ctx: CelebrationContext, seed?: number): string {
  const pool = CELEBRATION_POOL[ctx];
  if (!pool || pool.length === 0) return "";
  const idx =
    typeof seed === "number"
      ? Math.abs(seed) % pool.length
      : Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export function allCelebrations(ctx: CelebrationContext): string[] {
  return CELEBRATION_POOL[ctx] ?? [];
}
