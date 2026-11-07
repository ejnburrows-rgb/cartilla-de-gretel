// words.ts — Chano scene word set. Every word comes from the book's M lesson
// (src/content/consonants.json) and is built only from the four balls: ma, mi, mu, me.
import { approvedPictureRecording } from "@/lib/picture-vocabulary";

export interface ChanoWord {
  word: string;
  syllables: [string, string];
  /** Owner-approved recording, or undefined (then Escuchar stays silent). */
  audio?: string;
}

const make = (word: string, a: string, b: string): ChanoWord => ({
  word,
  syllables: [a, b],
  audio: approvedPictureRecording(word.toLocaleLowerCase("es")),
});

export const CHANO_WORDS: ChanoWord[] = [
  make("mima", "mi", "ma"),
  make("mamá", "ma", "má"),
  make("Meme", "me", "me"),
  make("Mumi", "mu", "mi"),
  make("mami", "ma", "mi"),
];

/** Compare syllables without case or written accent (the ball "ma" builds "má"). */
export function sameSyllable(a: string | null, b: string): boolean {
  if (!a) return false;
  const n = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es");
  return n(a) === n(b);
}
