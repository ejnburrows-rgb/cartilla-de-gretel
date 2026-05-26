// reading-mode-hard.ts — hard-mode reading lists for advanced consonant lessons.
// Sentences are longer + compound. Used as an optional challenge mode on the
// L17..L24 reading page (+3). Triggered only when the student has reached
// "Bien" or "Excelente" mastery on the standard sentence-bank entry.

export type HardSentence = {
	text: string;
	wordCount: number;
	targetSyllables: string[];
};

export const HARD_READING: Record<number, HardSentence[]> = {
	17: [
		{ text: "Mar\u00eda corre por la arena y mira el mar.",            wordCount: 9, targetSyllables: ["ra", "re", "ri", "ro", "ru"] },
		{ text: "El perro y el gato comen pera madura.",                     wordCount: 8, targetSyllables: ["ra", "re", "ri", "ro", "ru"] },
		{ text: "La rana salta y el r\u00edo suena fuerte.",                  wordCount: 8, targetSyllables: ["ra", "re", "ri", "ro", "ru"] },
	],
	18: [
		{ text: "El carro corre r\u00e1pido por la carretera.",               wordCount: 7, targetSyllables: ["rra", "rre", "rri", "rro", "rru"] },
		{ text: "El perro de Ramiro come arroz con tierra.",                 wordCount: 8, targetSyllables: ["rra", "rre", "rri", "rro", "rru"] },
		{ text: "La torre de la iglesia es muy alta.",                       wordCount: 8, targetSyllables: ["rra", "rre", "rri", "rro", "rru"] },
	],
	19: [
		{ text: "Gabi y Gus juegan con la gata gris.",                       wordCount: 8, targetSyllables: ["ga", "go", "gu"] },
		{ text: "El gato sube al \u00e1rbol y mira el gusano.",                wordCount: 9, targetSyllables: ["ga", "go", "gu"] },
	],
	20: [
		{ text: "Felipe come fresa con flan de fresa fresca.",               wordCount: 8, targetSyllables: ["fa", "fe", "fi", "fo", "fu"] },
		{ text: "La foto de la familia est\u00e1 en el frasco.",                wordCount: 8, targetSyllables: ["fa", "fe", "fi", "fo", "fu"] },
	],
	21: [
		{ text: "Juan juega con el jugo de naranja en la jaula.",            wordCount: 10, targetSyllables: ["ja", "je", "ji", "jo", "ju"] },
		{ text: "Jorge y Julia juntan jabalines en julio.",                  wordCount: 7, targetSyllables: ["ja", "je", "ji", "jo", "ju"] },
	],
	22: [
		{ text: "Camila come carne con coco en la cocina.",                  wordCount: 8, targetSyllables: ["ca", "co", "cu"] },
		{ text: "El conejo corre con la cuchara y la copa.",                 wordCount: 9, targetSyllables: ["ca", "co", "cu"] },
	],
	23: [
		{ text: "El rey ya lleg\u00f3 con la llave y la yegua.",                wordCount: 9, targetSyllables: ["ya", "ye", "yi", "yo", "yu"] },
		{ text: "Yo voy a la playa con Yola y Yoel.",                          wordCount: 9, targetSyllables: ["ya", "ye", "yi", "yo", "yu"] },
	],
	24: [
		{ text: "El zapato de Zoila tiene un zorrito de paz.",                wordCount: 9, targetSyllables: ["za", "ze", "zi", "zo", "zu"] },
		{ text: "La zanahoria y el zumo est\u00e1n en el zapato.",              wordCount: 8, targetSyllables: ["za", "ze", "zi", "zo", "zu"] },
	],
};

export function hardReadingForLesson(n: number): HardSentence[] {
	return HARD_READING[n] ?? [];
}

export function hasHardReading(n: number): boolean {
	return (HARD_READING[n]?.length ?? 0) > 0;
}
