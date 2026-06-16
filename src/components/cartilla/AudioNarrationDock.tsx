import { speak } from "@/lib/speak";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { Volume2, HelpCircle } from "lucide-react";

const dockWrapperStyle: React.CSSProperties = {
  padding: "1rem",
  backgroundColor: "#fcf8f2",
  borderRadius: "1.5rem",
  border: "2px solid #ecdac3",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

interface AudioNarrationDockProps {
  entry: CatalogEntry;
  activeStepIdx: number;
}

function getSpokenText(entry: CatalogEntry, stepIdx: number): string {
  if (entry.kind === "intro") {
    return "Las cinco vocales son a, e, i, o, u. Repite conmigo: a, e, i, o, u.";
  }

  if (entry.kind === "vowel") {
    if (stepIdx === 0) {
      return `${entry.lesson.characterName}. ${entry.lesson.characterDesc}`;
    }
    const words = entry.lesson.vocab.map((v) => v.word).join(", ");
    return `Vocabulario de la vocal ${entry.vowel}: ${words}`;
  }

  // Consonants
  const syllables = entry.data.syllables.join(", ");
  const sentences = entry.data.sentences.join(". ");
  const examples = Object.values(entry.data.examples).flat().slice(0, 6).join(", ");

  if (stepIdx === 0) {
    return `Letra ${entry.letter.toUpperCase()} ${entry.letter}. Las sílabas son: ${syllables}`;
  }
  if (stepIdx === 1) {
    return `Toque de sílabas: ${syllables}`;
  }
  if (stepIdx === 2 || stepIdx === 3) {
    return `Palabras de ejemplo: ${examples}`;
  }
  return `Lectura de oraciones: ${sentences}`;
}

// Custom Spanish syllable-by-syllable spacing algorithm
function spaceSyllables(text: string): string {
  return text
    // Replace consonant-vowel combinations with space-separated syllables
    .replace(/([aeiouáéíóúü])([bcdfghjklmnñpqrstvwxyz][aeiouáéíóúü])/gi, "$1 · $2")
    // Keep it clean
    .toLowerCase();
}

export function AudioNarrationDock({ entry, activeStepIdx }: AudioNarrationDockProps) {
  const textToRead = getSpokenText(entry, activeStepIdx);

  const handleReadNormal = () => {
    speak(textToRead);
  };

  const handleReadSlow = () => {
    speak(textToRead);
  };

  const handleReadSyllables = () => {
    const syllabifiedText = spaceSyllables(textToRead);
    speak(syllabifiedText);
  };

  return (
    <div style={dockWrapperStyle}>
      <div className="flex items-center gap-2 mb-1">
        <Volume2 className="w-5 h-5 text-amber-800" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Audio Guía Docente
        </h3>
      </div>

      <div className="text-[11px] text-stone-600 leading-normal bg-white p-3 border border-stone-200 rounded-xl max-h-24 overflow-y-auto">
        <strong>Se leerá: </strong>
        {textToRead}
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleReadNormal}
          className="w-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-bold py-2.5 px-3 rounded-xl transition text-xs flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5" /> Leer velocidad normal
        </button>

        <button
          onClick={handleReadSlow}
          className="w-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-bold py-2.5 px-3 rounded-xl transition text-xs flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5" /> Leer velocidad lenta (0.7x)
        </button>

        <button
          onClick={handleReadSyllables}
          className="w-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-bold py-2.5 px-3 rounded-xl transition text-xs flex items-center justify-center gap-1.5 active:scale-95"
        >
          <HelpCircle className="w-3.5 h-3.5 text-stone-500" /> Leer sílaba por sílaba
        </button>
      </div>
    </div>
  );
}
