// Short, approved neutral-Spanish feedback phrases for real student outcomes.
export type FeedbackOutcome =
  | "correct"
  | "close"
  | "try-again"
  | "streak"
  | "lesson-complete"
  | "start";

const PHRASES: Record<FeedbackOutcome, string[]> = {
  correct: ["¡Muy bien!", "¡Así es!", "¡Perfecto!", "¡Excelente!", "¡Lo lograste!"],
  close: ["Casi, intenta de nuevo.", "Ya casi. Una vez más.", "Estás cerca. Vuelve a probar."],
  "try-again": ["Intentémoslo otra vez.", "Sin prisa. Vuelve a intentarlo.", "Con calma. Vuelve a intentarlo."],
  streak: ["¡Vas en racha!", "¡Sigue así!", "¡Imparable!"],
  "lesson-complete": ["¡Terminaste la lección!", "¡Gran trabajo en toda la lección!", "¡Lo lograste! A la siguiente."],
  start: ["¡Hola! Soy Gretel.", "Empecemos juntos.", "Vamos a leer."],
};

export function gretelSay(outcome: FeedbackOutcome, seed?: number): string {
  const pool = PHRASES[outcome];
  if (!pool?.length) return "";
  const index = typeof seed === "number" ? Math.abs(seed) % pool.length : Math.floor(Math.random() * pool.length);
  return pool[index];
}

export function allPhrases(outcome: FeedbackOutcome): readonly string[] {
  return PHRASES[outcome];
}
