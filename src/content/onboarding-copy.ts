// onboarding-copy.ts — first-run tutorial copy.
// The TutorialOverlay (Antigravity lane) iterates over TUTORIAL_STEPS and
// spotlights each target. Spanish primary, English subtitle.

export type TutorialStep = {
	id: string;
	// CSS selector for the element to spotlight (kept generic; Antigravity
	// lane adds the corresponding data-tutorial-target attributes).
	targetSelector: string;
	// Where the speech bubble appears relative to the target.
	placement: "top" | "bottom" | "left" | "right";
	titleEs: string;
	titleEn: string;
	bodyEs: string;
	bodyEn: string;
	actionLabelEs: string;
	actionLabelEn: string;
};

export const TUTORIAL_STEPS: TutorialStep[] = [
	{
		id: "welcome",
		targetSelector: "[data-tutorial-target='gretel-stage']",
		placement: "top",
		titleEs: "\u00a1Hola! Soy Gretel.",
		titleEn: "Hi! I'm Gretel.",
		bodyEs: "Voy a acompa\u00f1arte en cada p\u00e1gina.",
		bodyEn: "I'll be with you on every page.",
		actionLabelEs: "Continuar",
		actionLabelEn: "Continue",
	},
	{
		id: "page-area",
		targetSelector: "[data-tutorial-target='page-area']",
		placement: "top",
		titleEs: "Esta es tu p\u00e1gina.",
		titleEn: "This is your page.",
		bodyEs: "Aqu\u00ed ver\u00e1s el ejercicio del d\u00eda.",
		bodyEn: "Here you'll see today's exercise.",
		actionLabelEs: "Continuar",
		actionLabelEn: "Continue",
	},
	{
		id: "next-button",
		targetSelector: "[data-tutorial-target='next-button']",
		placement: "left",
		titleEs: "Siguiente",
		titleEn: "Next",
		bodyEs: "Toca aqu\u00ed cuando termines.",
		bodyEn: "Tap here when you finish.",
		actionLabelEs: "Continuar",
		actionLabelEn: "Continue",
	},
	{
		id: "menu",
		targetSelector: "[data-tutorial-target='menu']",
		placement: "bottom",
		titleEs: "Tu men\u00fa",
		titleEn: "Your menu",
		bodyEs: "Aqu\u00ed ves tus logros, tu progreso y los ajustes.",
		bodyEn: "Here you can see your badges, progress, and settings.",
		actionLabelEs: "Continuar",
		actionLabelEn: "Continue",
	},
	{
		id: "ready",
		targetSelector: "[data-tutorial-target='start-button']",
		placement: "top",
		titleEs: "\u00a1Listos!",
		titleEn: "Ready!",
		bodyEs: "Empecemos a leer.",
		bodyEn: "Let's start reading.",
		actionLabelEs: "Empezar",
		actionLabelEn: "Start",
	},
];

export const TUTORIAL_STORAGE_KEY = "cartilla.tutorial.done.v1";

export function isTutorialDone(): boolean {
	if (typeof window === "undefined") return true;
	try {
		return window.localStorage.getItem(TUTORIAL_STORAGE_KEY) === "1";
	} catch {
		return false;
	}
}

export function markTutorialDone(): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
	} catch {
		/* swallow */
	}
}

export function resetTutorial(): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.removeItem(TUTORIAL_STORAGE_KEY);
	} catch {
		/* swallow */
	}
}
