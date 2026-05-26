// kiosko-config.ts — smartboard / classroom-projector kiosko layout config.
// Data only. The kiosko route + components live in the Antigravity lane.
// We own the layout knobs; they read them.

export type KioskoLayout = {
	// Min font size in rem for the kiosko page text. Smartboards in classrooms
	// must be readable from the back row.
	minBodyRem: number;
	minHeadingRem: number;
	// How long Gretel's speech bubble stays on a kiosko page (longer than
	// student device, because the whole class reads it together).
	speechBubbleMs: number;
	// Whether to show the page number on the kiosko (yes — teachers need it).
	showPageNumber: boolean;
	// Whether to show timers (no — class pace, not student pace).
	showTimer: boolean;
	// Idle screen activates after this many ms with no interaction.
	idleMs: number;
	// Page turn sound key (from audio-manifest UI_CUE_AUDIO).
	pageTurnCueKey: "pageTurn" | "pageTurnSoft";
	// Whether to dim siblings when zooming into a single exercise.
	dimSiblings: boolean;
	// Default zoom for a single exercise focus.
	zoomFactor: number;
};

export const KIOSKO_DEFAULT: KioskoLayout = {
	minBodyRem: 2.2,
	minHeadingRem: 4.5,
	speechBubbleMs: 7500,
	showPageNumber: true,
	showTimer: false,
	idleMs: 90_000,
	pageTurnCueKey: "pageTurn",
	dimSiblings: true,
	zoomFactor: 1.4,
};

export type KioskoMode = "presentation" | "workshop" | "review";

export const KIOSKO_MODES: Record<KioskoMode, Partial<KioskoLayout>> = {
	presentation: { dimSiblings: true,  zoomFactor: 1.6, speechBubbleMs: 9000 },
	workshop:     { dimSiblings: false, zoomFactor: 1.2, speechBubbleMs: 5500 },
	review:       { dimSiblings: true,  zoomFactor: 1.4, speechBubbleMs: 7500 },
};

export function kioskoLayoutFor(mode: KioskoMode = "presentation"): KioskoLayout {
	return { ...KIOSKO_DEFAULT, ...KIOSKO_MODES[mode] };
}
