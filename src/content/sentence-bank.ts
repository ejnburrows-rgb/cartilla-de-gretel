// sentence-bank.ts — short Spanish reading sentences per consonant lesson.
// Used by the reading exercise on the 4th page of each consonant lesson.
// Copy is student-level neutral Spanish, locked. Do not paraphrase without EJN.

import { LESSONS } from "./lesson-meta";

export type Sentence = {
	text: string;
	wordCount: number;
};

function sentence(text: string): Sentence {
	return { text, wordCount: text.split(/\s+/).filter(Boolean).length };
}

export const SENTENCES_BY_LESSON: Record<number, Sentence[]> = {
	7:  [sentence("Mam\u00e1 ama a Memo."), sentence("Mimi mima a mam\u00e1."), sentence("Memo y mam\u00e1 r\u00e1en.")],
	8:  [sentence("Pap\u00e1 puli\u00f3 el piso."), sentence("Pepe pinta un pino."), sentence("Pap\u00e1 ama a Pepe.")],
	9:  [sentence("Susi sube al sof\u00e1."), sentence("El sapo salta al sol."), sentence("Susi y Memo son amigos.")],
	10: [sentence("Tito toma su taza."), sentence("Tata teje en la sala."), sentence("Tito ama a Tata.")],
	11: [sentence("Dami da un dado."), sentence("El d\u00eda es de Dora."), sentence("Dami y Dora dibujan.")],
	12: [sentence("Lila ama la luna."), sentence("Lalo lee en la sala."), sentence("Lila y Lalo leen.")],
	13: [sentence("Nena anima a Nico."), sentence("El nido tiene una nuez."), sentence("Nico nada en el lago.")],
	14: [sentence("La ni\u00f1a sue\u00f1a."), sentence("El ni\u00f1o trae \u00f1ame."), sentence("Mu\u00f1eca, mu\u00f1eca, m\u00edrame.")],
	15: [sentence("Beto besa al beb\u00e9."), sentence("La bola es de Bibi."), sentence("Beto y Bibi van al bar.")],
	16: [sentence("La vaca ve a Vito."), sentence("Vivi viene con velas."), sentence("Vito ama la vida.")],
	17: [sentence("Rita rema en la r\u00eda."), sentence("El oro es de Romo."), sentence("Rita y Romo r\u00eden.")],
	18: [sentence("El perro corre al carro."), sentence("La torre tiene un burro."), sentence("El carro pas\u00f3 al perro.")],
	19: [sentence("El gato come goma."), sentence("Gabo gana el gusano."), sentence("El gusano sale del agua.")],
	20: [sentence("Felo toma una foto."), sentence("La familia come fideos."), sentence("La funda es de Felo.")],
	21: [sentence("Jesús toma jugo."), sentence("La jarra tiene ajo."), sentence("La jicotea es de Jesús.")],
	22: [sentence("La casa es de Coco."), sentence("Cami toma un caf\u00e9."), sentence("Coco y Cami cantan.")],
	23: [sentence("Yayita juega con el yoyo."), sentence("La yema es de Yayita."), sentence("El yate de Yayita.")],
	24: [sentence("El zorro come zumo."), sentence("Zoe usa zapatos azules."), sentence("El zorro y Zoe corren.")],
};

export function sentencesForLesson(n: number): Sentence[] {
	return SENTENCES_BY_LESSON[n] ?? [];
}

export function sentencesForPage(page: number): Sentence[] {
	const lesson = LESSONS.find((l) => page >= l.pages[0] && page <= l.pages[1]);
	if (!lesson) return [];
	// Reading is the 4th page of consonant lessons
	if (lesson.kind !== "consonant") return [];
	if (page !== lesson.pages[0] + 3) return [];
	return sentencesForLesson(lesson.n);
}
