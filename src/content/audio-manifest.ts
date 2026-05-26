// audio-manifest.ts — manifest of expected kid-voice audio assets.
// The audio engine (other lane) consults this manifest to know which files
// exist on disk and to fall back gracefully when a file is missing.
//
// Files live under public/audio/voz/<letter>/<slug>.mp3 once recorded.
// Until real recordings arrive, the engine returns silence (NOT TTS).
//
// Per locked spec: NO synthesized voices. Real kid recordings only.

export type AudioAsset = {
	key: string;          // canonical key, e.g. "m-mama"
	letter: string;       // "m", "p", "a", "o", etc.
	word: string;         // "mama"
	src: string;          // public path
	durationHintMs?: number;
};

// Build asset records from the picture catalog at runtime.
// We do NOT hardcode the full asset list here; the catalog is the source of
// truth for vocabulary. This file owns the PATH CONVENTION and a small set
// of UI cue audio paths.

export function audioPathFor(letter: string, slug: string): string {
	return `/audio/voz/${letter}/${slug}.mp3`;
}

export function syllableAudioPath(syllable: string): string {
	const slug = syllable.toLowerCase().replace(/[^a-z\u00f1]/g, "");
	return `/audio/silaba/${slug}.mp3`;
}

// UI cue audio (page turn, success, gentle nudge). Real recordings only.
export const UI_CUE_AUDIO = {
	pageTurn:       "/audio/ui/page-turn.mp3",
	pageTurnSoft:   "/audio/ui/page-turn-soft.mp3",
	success:        "/audio/ui/success.mp3",
	nudgeGentle:    "/audio/ui/nudge-gentle.mp3",
	streakChime:    "/audio/ui/streak-chime.mp3",
	streakCheer:    "/audio/ui/streak-cheer.mp3",
	streakFanfare:  "/audio/ui/streak-fanfare.mp3",
	ambientClass:   "/audio/ui/ambient-classroom.mp3",
} as const;

export type UiCueId = keyof typeof UI_CUE_AUDIO;

export function uiCueSrc(id: UiCueId): string {
	return UI_CUE_AUDIO[id];
}

// Engine-facing: list of all UI cue paths so the engine can warm a cache.
export function allUiCuePaths(): string[] {
	return Object.values(UI_CUE_AUDIO);
}

// Engine-facing: given a letter + word slug, return the canonical voice path.
// Engine should HEAD-check the file before attempting playback.
export function voiceSrc(letter: string, wordSlug: string): string {
	return audioPathFor(letter, wordSlug);
}

// Locked policy reminder embedded in source so future agents do not forget.
export const AUDIO_POLICY = {
	allowTts: false,
	allowSynthesizedVoice: false,
	allowAiVoiceClone: false,
	note: "Per locked spec: real kid-voice recordings only. Engine returns silence when an asset is missing.",
} as const;
