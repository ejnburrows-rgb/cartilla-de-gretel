// letter-cards.ts — printable flashcard data per letter.
// Used by the print binder + the kiosko letter-of-the-day card.
// Each card: uppercase, lowercase, IPA, keyword (with picture key), mouth cue.

import type { LetterId } from "./lesson-meta";
import { ipaForLetter } from "./ipa-chart";

export type LetterCard = {
	letter: LetterId;
	upper: string;
	lower: string;
	ipa: string;
	keywordEs: string;
	keywordEn: string;
	pictureKey: string;
	mouthCueEs: string;
	mouthCueEn: string;
	color: string;
};

function card(letter: LetterId, upper: string, lower: string, kwEs: string, kwEn: string, pictureKey: string, color: string): LetterCard {
	const ipa = ipaForLetter(letter);
	return {
		letter,
		upper,
		lower,
		ipa: ipa?.ipa ?? "",
		keywordEs: kwEs,
		keywordEn: kwEn,
		pictureKey,
		mouthCueEs: ipa?.cueEs ?? "",
		mouthCueEn: ipa?.cueEn ?? "",
		color,
	};
}

export const LETTER_CARDS: LetterCard[] = [
	card("o",       "O", "o", "oso",         "bear",       "o-oso",       "#2f80ed"),
	card("a",       "A", "a", "ala",         "wing",       "a-ala",       "#e63946"),
	card("e",       "E", "e", "eso",         "that",       "e-eso",       "#f28c28"),
	card("i",       "I", "i", "isla",        "island",     "i-isla",      "#2a9d8f"),
	card("u",       "U", "u", "uva",         "grape",      "u-uva",       "#8338ec"),
	card("m",       "M", "m", "mam\u00e1",   "mom",        "m-mama",      "#E63946"),
	card("p",       "P", "p", "pap\u00e1",   "dad",        "p-papa",      "#F4A261"),
	card("s",       "S", "s", "sopa",        "soup",       "s-sopa",      "#2A9D8F"),
	card("t",       "T", "t", "taza",        "cup",        "t-taza",      "#264653"),
	card("d",       "D", "d", "dedo",        "finger",     "d-dedo",      "#8338EC"),
	card("l",       "L", "l", "luna",        "moon",       "l-luna",      "#E63946"),
	card("n",       "N", "n", "nube",        "cloud",      "n-nube",      "#F4A261"),
	card("n-tilde", "\u00d1", "\u00f1", "ni\u00f1o", "child",  "n-tilde-nino", "#2A9D8F"),
	card("b",       "B", "b", "bote",        "boat",       "b-bote",      "#264653"),
	card("v",       "V", "v", "vaca",        "cow",        "v-vaca",      "#8338EC"),
	card("r",       "R", "r", "pera",        "pear",       "r-pera",      "#E63946"),
	card("rr",      "RR", "rr", "burro",     "donkey",     "rr-burro",    "#F4A261"),
	card("g",       "G", "g", "gusano",      "worm",       "g-gusano",    "#2A9D8F"),
	card("f",       "F", "f", "foto",        "photo",      "f-foto",      "#264653"),
	card("j",       "J", "j", "jugo",        "juice",      "j-jugo",      "#8338EC"),
	card("c",       "C", "c", "casa",        "house",      "c-casa",      "#E63946"),
	card("y",       "Y", "y", "yema",        "egg yolk",   "y-yema",      "#F4A261"),
	card("z",       "Z", "z", "zapato",      "shoe",       "z-zapato",    "#2A9D8F"),
];

export function cardForLetter(letter: LetterId): LetterCard | null {
	return LETTER_CARDS.find((c) => c.letter === letter) ?? null;
}
