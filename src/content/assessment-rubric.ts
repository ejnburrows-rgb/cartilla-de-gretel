// assessment-rubric.ts — grade-aligned scoring chart.
// Used by principal / district reports and IEP progress narratives to
// translate the 5-level mastery scale into a numeric grade equivalent and a
// percentile band aligned to early literacy norms.

import type { MasteryLevel } from "./lesson-rubric";

export type AssessmentBand = {
	level: MasteryLevel;
	numericGrade: number;        // 0-4 scale (district friendly)
	letterEs: string;            // E / S / N / I style report-card letter (Spanish)
	letterEn: string;
	percentileBand: { min: number; max: number };  // percentile range
	descriptorEs: string;
	descriptorEn: string;
};

export const ASSESSMENT_BANDS: AssessmentBand[] = [
	{ level: "Excelente",       numericGrade: 4, letterEs: "E", letterEn: "A", percentileBand: { min: 85, max: 99 }, descriptorEs: "Por encima del nivel.",      descriptorEn: "Above grade level." },
	{ level: "Bien",            numericGrade: 3, letterEs: "S", letterEn: "B", percentileBand: { min: 65, max: 84 }, descriptorEs: "En nivel.",                  descriptorEn: "At grade level." },
	{ level: "Lo voy logrando", numericGrade: 2, letterEs: "S", letterEn: "C", percentileBand: { min: 40, max: 64 }, descriptorEs: "Cerca del nivel.",          descriptorEn: "Approaching grade level." },
	{ level: "Practica",        numericGrade: 1, letterEs: "N", letterEn: "D", percentileBand: { min: 20, max: 39 }, descriptorEs: "Por debajo del nivel.",     descriptorEn: "Below grade level." },
	{ level: "Inicial",         numericGrade: 0, letterEs: "I", letterEn: "F", percentileBand: { min: 0,  max: 19 }, descriptorEs: "Muy por debajo del nivel.", descriptorEn: "Significantly below grade level." },
];

export function bandForLevel(level: MasteryLevel): AssessmentBand | null {
	return ASSESSMENT_BANDS.find((b) => b.level === level) ?? null;
}

export function bandForNumericGrade(grade: number): AssessmentBand | null {
	return ASSESSMENT_BANDS.find((b) => b.numericGrade === grade) ?? null;
}

export function bandForPercentile(percentile: number): AssessmentBand | null {
	for (const band of ASSESSMENT_BANDS) {
		if (percentile >= band.percentileBand.min && percentile <= band.percentileBand.max) return band;
	}
	return null;
}
