// gretel-feedback.ts — short Spanish phrases Gretel speaks on each outcome.
// Student-level neutral Spanish. Used by ExerciseHost + future audio layer.
// Phrases are randomized per outcome to keep it lively without going off-script.

export type FeedbackOutcome =
	| "correct"
	| "close"
	| "try-again"
	| "streak"
	| "lesson-complete"
	| "start";

const PHRASES: Record<FeedbackOutcome, string[]> = {
	correct: [
		"\u00a1Muy bien!",
		"\u00a1As\u00ed es!",
		"\u00a1Perfecto!",
		"\u00a1Excelente!",
		"\u00a1Lo lograste!",
	],
	close: [
		"Casi, intenta de nuevo.",
		"Ya casi. Una vez m\u00e1s.",
		"Est\u00e1s cerca. Vuelve a probar.",
	],
	"try-again": [
		"Inten\u00e9moslo otra vez.",
		"Sin prisa. Vuelve a intentarlo.",
		"Tranquil@. Lo har\u00e1s.",
	],
	streak: [
		"\u00a1Vas en racha!",
		"\u00a1Sigue as\u00ed!",
		"\u00a1Imparable!",
	],
	"lesson-complete": [
		"\u00a1Terminaste la lecci\u00f3n!",
		"\u00a1Gran trabajo en toda la lecci\u00f3n!",
		"\u00a1Lo lograste! A la siguiente.",
	],
	start: [
		"\u00a1Hola! Soy Gretel.",
		"Empecemos juntos.",
		"Vamos a leer.",
	],
};

export function gretelSay(outcome: FeedbackOutcome, seed?: number): string {
	const pool = PHRASES[outcome];
	if (!pool || pool.length === 0) return "";
	const i =
		typeof seed === "number"
			? Math.abs(seed) % pool.length
			: Math.floor(Math.random() * pool.length);
	return pool[i];
}

export function allPhrases(outcome: FeedbackOutcome): readonly string[] {
	return PHRASES[outcome];
}
