// random-with-seed.ts — deterministic randomization.
// Same seed → same sequence. Enables reproducible exercise variety per
// student per day without storing per-attempt randomness on disk.

export function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return function () {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function shuffle<T>(arr: readonly T[], seed: number): T[] {
	const rng = mulberry32(seed);
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

export function pickN<T>(arr: readonly T[], n: number, seed: number): T[] {
	return shuffle(arr, seed).slice(0, Math.min(n, arr.length));
}

export function pickOne<T>(arr: readonly T[], seed: number): T | null {
	if (arr.length === 0) return null;
	const rng = mulberry32(seed);
	return arr[Math.floor(rng() * arr.length)];
}

export function seedFromStrings(...parts: string[]): number {
	let h = 2166136261 >>> 0;
	for (const part of parts) {
		for (let i = 0; i < part.length; i++) {
			h ^= part.charCodeAt(i);
			h = Math.imul(h, 16777619) >>> 0;
		}
	}
	return h >>> 0;
}

/** Compose a daily seed for a student so the same student gets the same variant on a given day. */
export function dailySeed(studentId: string, lessonN: number, pageN: number, date: Date = new Date()): number {
	const yyyymmdd = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
	return seedFromStrings(studentId, String(lessonN), String(pageN), yyyymmdd);
}
