// intro-content.ts — Lesson 1 (pages 1-3) introductory copy.
// Spanish primary, English fallback for teacher view.
// Used by ExerciseHost intro renderer and the binder cover.

export type IntroPage = {
	page: number;
	titleEs: string;
	titleEn: string;
	bodyEs: string[];
	bodyEn: string[];
};

export const INTRO_PAGES: IntroPage[] = [
	{
		page: 1,
		titleEs: "Bienvenida",
		titleEn: "Welcome",
		bodyEs: [
			"\u00a1Hola! Soy Gretel.",
			"Te voy a acompa\u00f1ar a leer y a escribir.",
			"Vamos a aprender las vocales y las consonantes paso a paso.",
		],
		bodyEn: [
			"Hello! I'm Gretel.",
			"I'll help you read and write.",
			"We will learn vowels and consonants step by step.",
		],
	},
	{
		page: 2,
		titleEs: "As\u00ed funciona",
		titleEn: "How it works",
		bodyEs: [
			"Cada lecci\u00f3n tiene varias p\u00e1ginas.",
			"Primero tocas la s\u00edlaba que escuches.",
			"Luego presionas el dibujo correcto.",
			"Despu\u00e9s arrastras las s\u00edlabas y formas la palabra.",
			"Al final, lees en voz alta.",
		],
		bodyEn: [
			"Each lesson has several pages.",
			"First, tap the syllable you hear.",
			"Then press the matching picture.",
			"Next, drag the syllables and build the word.",
			"Finally, read aloud.",
		],
	},
	{
		page: 3,
		titleEs: "\u00a1Empecemos!",
		titleEn: "Let's begin!",
		bodyEs: [
			"Cuando est\u00e9s list@, toca Siguiente.",
			"Si te equivocas, no pasa nada. Volvemos a intentar.",
			"Yo estoy contigo en cada p\u00e1gina.",
		],
		bodyEn: [
			"When you're ready, tap Next.",
			"If you make a mistake, no problem. We try again.",
			"I'm with you on every page.",
		],
	},
];

export function introForPage(page: number): IntroPage | null {
	return INTRO_PAGES.find((p) => p.page === page) ?? null;
}
