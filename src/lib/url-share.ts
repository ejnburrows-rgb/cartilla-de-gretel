// url-share.ts — short share-URL builder for read-only family reports.
// Produces compact opaque tokens stable per (kind, id, salt) tuple so the
// link a family receives keeps working as long as the underlying entity
// exists in localStorage. No backend; tokens are recoverable client-side.

export type ShareKind = "report" | "page" | "lesson" | "badge";

const BASE32 = "abcdefghijklmnopqrstuvwxyz234567";

function toBase32(input: string): string {
	let bits = 0;
	let value = 0;
	let out = "";
	for (let i = 0; i < input.length; i++) {
		value = (value << 8) | input.charCodeAt(i);
		bits += 8;
		while (bits >= 5) {
			bits -= 5;
			out += BASE32[(value >> bits) & 31];
		}
	}
	if (bits > 0) {
		out += BASE32[(value << (5 - bits)) & 31];
	}
	return out;
}

function fromBase32(input: string): string {
	let bits = 0;
	let value = 0;
	let out = "";
	for (let i = 0; i < input.length; i++) {
		const idx = BASE32.indexOf(input[i].toLowerCase());
		if (idx < 0) continue;
		value = (value << 5) | idx;
		bits += 5;
		if (bits >= 8) {
			bits -= 8;
			out += String.fromCharCode((value >> bits) & 255);
		}
	}
	return out;
}

export function encodeShareToken(kind: ShareKind, id: string): string {
	const payload = `${kind}|${id}`;
	return toBase32(payload);
}

export function decodeShareToken(token: string): { kind: ShareKind; id: string } | null {
	try {
		const raw = fromBase32(token);
		const parts = raw.split("|");
		if (parts.length !== 2) return null;
		const kind = parts[0] as ShareKind;
		if (!["report", "page", "lesson", "badge"].includes(kind)) return null;
		return { kind, id: parts[1] };
	} catch {
		return null;
	}
}

export function shareUrl(kind: ShareKind, id: string, origin?: string): string {
	const token = encodeShareToken(kind, id);
	const base = origin
		?? (typeof window !== "undefined" ? window.location.origin : "");
	return `${base}/r/${token}`;
}

export function isShareToken(value: string): boolean {
	return /^[a-z2-7]+$/.test(value) && value.length >= 4;
}
