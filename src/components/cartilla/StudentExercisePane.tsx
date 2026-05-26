import type { CatalogEntry } from "@/types/cartilla";
import { SyllableTap, WordMatch } from "./Ejercicios";
import { DragBuildWord } from "./DragBuildWord";

interface Props {
  entry: CatalogEntry;
}

/**
 * The three student-side practice activities that follow each workbook page:
 * 1) tap the syllable you hear (SyllableTap)
 * 2) mix-and-match the word with its syllables (WordMatch)
 * 3) drag the letters to build the word (DragBuildWord)
 *
 * Each lesson kind (intro, vowel, consonant) draws its content from the same
 * lesson catalog that drives the teacher side, so the practice matches the
 * page the student is reading.
 */
export function StudentExercisePane({ entry }: Props) {
  const color = entry.color;
  const lessonId = String(entry.n);

  if (entry.kind === "intro") {
    const vowels = ["a", "e", "i", "o", "u"];
    const vowelWords = [
      { word: "ala" },
      { word: "elefante" },
      { word: "iglú" },
      { word: "oso" },
      { word: "uva" },
    ];
    return (
      <section className="mt-8 w-full space-y-5">
        <SectionHeader color={color} />
        <SyllableTap syllables={vowels} color={color} lessonId={lessonId} />
        <WordMatch words={vowelWords} color={color} lessonId={lessonId} />
      </section>
    );
  }

  if (entry.kind === "vowel") {
    const vocab = entry.lesson.vocab ?? [];
    return (
      <section className="mt-8 w-full space-y-5">
        <SectionHeader color={color} />
        {vocab.length >= 2 ? (
          <WordMatch words={vocab} color={color} lessonId={lessonId} />
        ) : null}
        <DragBuildWord entry={entry} accent={color} />
      </section>
    );
  }

  // consonant
  const c = entry.data;
  const syllables = c?.syllables ?? [];
  const exampleWords: Array<{ word: string }> = [];
  if (c?.examples) {
    for (const list of Object.values(c.examples)) {
      if (Array.isArray(list)) {
        for (const w of list) {
          if (typeof w === "string" && exampleWords.length < 4) {
            exampleWords.push({ word: w });
          }
        }
      }
    }
  }
  return (
    <section className="mt-8 w-full space-y-5">
      <SectionHeader color={color} />
      {syllables.length > 0 ? (
        <SyllableTap syllables={syllables} color={color} lessonId={lessonId} />
      ) : null}
      {exampleWords.length >= 2 ? (
        <WordMatch words={exampleWords} color={color} lessonId={lessonId} />
      ) : null}
      <DragBuildWord entry={entry} accent={color} />
    </section>
  );
}

function SectionHeader({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-block h-3 w-3 rounded-full"
        style= backgroundColor: color 
        aria-hidden
      />
      <h2
        className="text-sm font-black uppercase tracking-[0.18em]"
        style= color 
      >
        Practica
      </h2>
    </div>
  );
}
