// lesson-rubric.ts — mastery rubric per exercise type.
// Maps a student's performance on an exercise to one of the 5 mastery levels.
// Used by analytics-aggregator + report-builder + IEP notes.
//
// Levels (Spanish, locked):
//   Inicial          — just starting, needs heavy support
//   Practica         — attempting with frequent errors
//   Lo voy logrando  — inconsistent but improving
//   Bien             — mostly correct, minor errors
//   Excelente        — consistent, accurate, fast

export type MasteryLevel = "Inicial" | "Practica" | "Lo voy logrando" | "Bien" | "Excelente";

export const MASTERY_LEVELS: MasteryLevel[] = [
	"Inicial",
	"Practica",
	"Lo voy logrando",
	"Bien",
	"Excelente",
];

export type RubricInput = {
	correct: number;
	attempts: number;
	averageMs?: number; // time per item; lower is better
};

export type RubricRow = {
	level: MasteryLevel;
	minAccuracy: number;     // 0..1
	maxAvgMs?: number;       // optional fluency ceiling for this level
	descriptionEs: string;
	descriptionEn: string;
};

export const TAP_SYLLABLE_RUBRIC: RubricRow[] = [
	{ level: "Excelente",       minAccuracy: 0.95, maxAvgMs: 2500, descriptionEs: "Toca la s\u00edlaba correcta r\u00e1pido y sin dudar.",      descriptionEn: "Taps the correct syllable quickly and without hesitation." },
	{ level: "Bien",            minAccuracy: 0.85,                  descriptionEs: "Toca la s\u00edlaba correcta la mayor\u00eda de las veces.", descriptionEn: "Taps the correct syllable most of the time." },
	{ level: "Lo voy logrando", minAccuracy: 0.65,                  descriptionEs: "Toca la s\u00edlaba correcta con apoyo ocasional.",    descriptionEn: "Taps the correct syllable with occasional support." },
	{ level: "Practica",        minAccuracy: 0.35,                  descriptionEs: "Identifica algunas s\u00edlabas correctas.",                 descriptionEn: "Identifies some correct syllables." },
	{ level: "Inicial",         minAccuracy: 0.0,                   descriptionEs: "Comienza a reconocer s\u00edlabas con apoyo.",                descriptionEn: "Beginning to recognize syllables with support." },
];

export const WORD_MATCH_RUBRIC: RubricRow[] = [
	{ level: "Excelente",       minAccuracy: 0.95, maxAvgMs: 3000, descriptionEs: "Asocia palabra y dibujo con precisi\u00f3n y fluidez.",        descriptionEn: "Matches word and picture accurately and fluently." },
	{ level: "Bien",            minAccuracy: 0.85,                  descriptionEs: "Asocia correctamente la mayor\u00eda de palabras y dibujos.",   descriptionEn: "Matches words and pictures correctly most of the time." },
	{ level: "Lo voy logrando", minAccuracy: 0.65,                  descriptionEs: "Asocia palabra y dibujo con apoyo.",                          descriptionEn: "Matches word and picture with support." },
	{ level: "Practica",        minAccuracy: 0.35,                  descriptionEs: "Asocia algunos pares correctamente.",                          descriptionEn: "Matches some pairs correctly." },
	{ level: "Inicial",         minAccuracy: 0.0,                   descriptionEs: "Comienza a asociar dibujo y palabra.",                         descriptionEn: "Beginning to associate picture and word." },
];

export const DRAG_BUILD_RUBRIC: RubricRow[] = [
	{ level: "Excelente",       minAccuracy: 0.95, maxAvgMs: 5000, descriptionEs: "Forma palabras correctamente y de manera fluida.",            descriptionEn: "Builds words correctly and fluently." },
	{ level: "Bien",            minAccuracy: 0.85,                  descriptionEs: "Forma la mayor\u00eda de las palabras correctamente.",          descriptionEn: "Builds most words correctly." },
	{ level: "Lo voy logrando", minAccuracy: 0.65,                  descriptionEs: "Forma palabras con apoyo ocasional.",                          descriptionEn: "Builds words with occasional support." },
	{ level: "Practica",        minAccuracy: 0.35,                  descriptionEs: "Forma algunas palabras correctamente.",                        descriptionEn: "Builds some words correctly." },
	{ level: "Inicial",         minAccuracy: 0.0,                   descriptionEs: "Comienza a ordenar s\u00edlabas con apoyo.",                    descriptionEn: "Beginning to order syllables with support." },
];

export const READING_RUBRIC: RubricRow[] = [
	{ level: "Excelente",       minAccuracy: 0.95, maxAvgMs: 3500, descriptionEs: "Lee con precisi\u00f3n, fluidez y expresi\u00f3n.",             descriptionEn: "Reads with accuracy, fluency, and expression." },
	{ level: "Bien",            minAccuracy: 0.85,                  descriptionEs: "Lee con buena precisi\u00f3n y fluidez.",                      descriptionEn: "Reads with good accuracy and fluency." },
	{ level: "Lo voy logrando", minAccuracy: 0.65,                  descriptionEs: "Lee con apoyo ocasional.",                                     descriptionEn: "Reads with occasional support." },
	{ level: "Practica",        minAccuracy: 0.35,                  descriptionEs: "Lee algunas palabras correctamente.",                          descriptionEn: "Reads some words correctly." },
	{ level: "Inicial",         minAccuracy: 0.0,                   descriptionEs: "Comienza a decodificar palabras con apoyo.",                    descriptionEn: "Beginning to decode words with support." },
];

export const RUBRIC_BY_KIND = {
	"syllable-tap": TAP_SYLLABLE_RUBRIC,
	"word-match":   WORD_MATCH_RUBRIC,
	"drag-build":   DRAG_BUILD_RUBRIC,
	"reading":      READING_RUBRIC,
} as const;

export function levelFor(kind: keyof typeof RUBRIC_BY_KIND, input: RubricInput): MasteryLevel {
	const rubric = RUBRIC_BY_KIND[kind];
	if (!rubric) return "Inicial";
	const accuracy = input.attempts > 0 ? input.correct / input.attempts : 0;
	for (const row of rubric) {
		if (accuracy >= row.minAccuracy) {
			if (row.maxAvgMs && input.averageMs && input.averageMs > row.maxAvgMs) continue;
			return row.level;
		}
	}
	return "Inicial";
}

export function colorForLevel(level: MasteryLevel): string {
	switch (level) {
		case "Excelente":       return "#2A9D8F";
		case "Bien":            return "#5BAE6F";
		case "Lo voy logrando": return "#F4A261";
		case "Practica":        return "#E76F51";
		case "Inicial":         return "#C0392B";
	}
}
