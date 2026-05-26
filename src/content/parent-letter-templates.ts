// parent-letter-templates.ts — bilingual parent letter templates.
// Used by parent message thread + weekly auto report + intervention flag.
// Tokens use name lesson level date teacher.

export type LetterKind =
	| "welcome"
	| "weekly-progress"
	| "celebration"
	| "intervention"
	| "absence-followup"
	| "conference-request";

export type LetterTemplate = {
	kind: LetterKind;
	subjectEs: string;
	subjectEn: string;
	bodyEs: string;
	bodyEn: string;
};

export const PARENT_LETTERS: LetterTemplate[] = [
	{
		kind: "welcome",
		subjectEs: "Bienvenidos a La Cartilla de Gretel",
		subjectEn: "Welcome to La Cartilla de Gretel",
		bodyEs:
			"Estimada familia de name,\n\nSoy teacher. Comenzamos juntos esta aventura de lectura con La Cartilla de Gretel. Cada semana practicaremos vocales y consonantes paso a paso. Recibir\u00e1 un reporte semanal con el progreso de name.\n\nGracias por su apoyo.",
		bodyEn:
			"Dear name's family,\n\nI'm teacher. We're starting this reading journey together with La Cartilla de Gretel. Each week we practice vowels and consonants step by step. You will receive a weekly progress report for name.\n\nThank you for your support.",
	},
	{
		kind: "weekly-progress",
		subjectEs: "Reporte semanal de name",
		subjectEn: "Weekly report for name",
		bodyEs:
			"Estimada familia,\n\nEsta semana name trabaj\u00f3 en la lecci\u00f3n lesson. Nivel actual: level.\n\nPueden practicar en casa 10 minutos al d\u00eda. La aplicaci\u00f3n funciona sin internet despu\u00e9s de la primera vez.\n\nUn saludo,\nteacher",
		bodyEn:
			"Dear family,\n\nThis week name worked on lesson lesson. Current level: level.\n\nYou can practice at home 10 minutes a day. The app works offline after the first use.\n\nBest,\nteacher",
	},
	{
		kind: "celebration",
		subjectEs: "\u00a1name logr\u00f3 un gran avance!",
		subjectEn: "name reached a big milestone!",
		bodyEs:
			"\u00a1Felicitaciones! name complet\u00f3 la lecci\u00f3n lesson con nivel level. Gracias por el apoyo en casa.\n\n\u2014 teacher",
		bodyEn:
			"Congratulations! name completed lesson lesson at the level level. Thank you for your support at home.\n\n\u2014 teacher",
	},
	{
		kind: "intervention",
		subjectEs: "Apoyo adicional para name",
		subjectEn: "Additional support for name",
		bodyEs:
			"Estimada familia,\n\nQuiero compartir que name necesita un poco m\u00e1s de pr\u00e1ctica en la lecci\u00f3n lesson. Sugerencias para casa:\n\n\u2022 Practicar 10 minutos al d\u00eda con la aplicaci\u00f3n.\n\u2022 Repetir las s\u00edlabas en voz alta.\n\u2022 Leer juntos un libro corto cada noche.\n\nEstoy a sus \u00f3rdenes si desean conversar.\n\nteacher",
		bodyEn:
			"Dear family,\n\nI want to share that name could use a little more practice on lesson lesson. Suggestions for home:\n\n\u2022 Practice 10 minutes a day in the app.\n\u2022 Repeat the syllables aloud.\n\u2022 Read a short book together every night.\n\nI'm available if you'd like to talk.\n\nteacher",
	},
	{
		kind: "absence-followup",
		subjectEs: "Notamos que name no ha practicado",
		subjectEn: "We noticed name hasn't been practicing",
		bodyEs:
			"Estimada familia,\n\nname no ha completado p\u00e1ginas en los \u00faltimos d\u00edas. Si todo est\u00e1 bien, una breve sesi\u00f3n diaria ayuda mucho. Av\u00edsenme si hay algo en lo que pueda apoyar.\n\nteacher",
		bodyEn:
			"Dear family,\n\nname hasn't completed pages in the last few days. If everything is okay, a short daily session helps a lot. Please let me know if there is anything I can do to support.\n\nteacher",
	},
	{
		kind: "conference-request",
		subjectEs: "Solicitud de reuni\u00f3n breve",
		subjectEn: "Short meeting request",
		bodyEs:
			"Estimada familia,\n\nMe gustar\u00eda agendar una reuni\u00f3n breve (15 minutos) para conversar sobre el progreso de name. \u00bfQu\u00e9 d\u00edas y horarios les funcionan?\n\nGracias,\nteacher",
		bodyEn:
			"Dear family,\n\nI would like to schedule a short (15-minute) meeting to talk about name's progress. What days and times work for you?\n\nThank you,\nteacher",
	},
];

export function letterTemplate(kind: LetterKind): LetterTemplate | null {
	return PARENT_LETTERS.find((l) => l.kind === kind) ?? null;
}

export function fillTemplate(text: string, vars: Record<string, string>): string {
	return text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}
