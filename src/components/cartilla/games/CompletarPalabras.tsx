// CompletarPalabras.tsx — "Completar palabras" themed activity.
//
// Two screens:
// 1. Entrance: the child picks a letter. Mm is unlocked first; every other
//    letter of the Cartilla consonant sequence is visible but "Pendiente"
//    (no teacher file for it yet).
// 2. Activity (Mm): renders the teacher file
//    `public/teacher/2-Fon_tica_Completar_palabras_con_Mm_5_t925.docx`
//    verbatim — complete word cards, blank word cards, syllable tiles — with
//    visible "pendiente" placeholders in every blank because the file does not
//    say which syllable completes which word. Answers are never validated
//    until the owner fills the mapping. Audio stays pendiente (no device TTS,
//    no generated voice; instruction buttons no-op until real audio exists).
import { useState } from "react";
import { ArrowLeft, AudioLines, Lock } from "lucide-react";
import consonants from "@/content/consonants.json";
import type {
  CompletarBlankCard,
  CompletarPalabrasContent,
} from "@/content/games/completar-palabras";

const LETTER_ID: Record<string, string> = { m: "completar-palabras" };

function BlankCard({ card }: { card: CompletarBlankCard }) {
  return (
    <div className="game-tactile-card rounded-2xl px-4 py-4 text-center">
      <p className="text-2xl font-black tracking-wide text-[#25313A]">
        {card.before}
        {card.shownTile ? (
          <span className="rounded-xl border border-[#D99B1E] bg-[#FFF6D6] px-2.5 py-0.5 text-[#25313A]">
            {card.shownTile}
          </span>
        ) : (
          <span className="mx-1 inline-block min-w-16 rounded-xl border-2 border-dashed border-[#D99B1E] bg-[#FFF6D6] px-2.5 py-0.5 align-middle text-base font-bold text-[#8B5A00]">
            ¿? pendiente
          </span>
        )}
        {card.after}
      </p>
      <p className="mt-1.5 text-xs font-bold text-[#8B5A00]">
        Palabra completa y sílaba correcta: pendiente
      </p>
    </div>
  );
}

export function CompletarPalabras({ content }: { content: CompletarPalabrasContent }) {
  const [letter, setLetter] = useState<string | null>(null);
  const unlocked = (l: string) => LETTER_ID[l] === content.id;

  if (letter !== content.letter) {
    return (
      <div className="game-wood-frame">
        <section className="game-paper-board p-5 sm:p-8 space-y-6" aria-label="Completar palabras">
          <div className="text-center space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-[#25313A]">Completar palabras</h1>
            <p className="text-base font-bold text-[#25313A]/75">Elige una letra</p>
          </div>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6" role="list">
            {consonants.map((c) => {
              const open = unlocked(c.letter);
              const label = open
                ? `Jugar Completar palabras con ${c.letter.toUpperCase()}${c.letter}`
                : `Letra ${c.letter.toUpperCase()}${c.letter}: pendiente`;
              return (
                <li key={c.letter}>
                  <button
                    type="button"
                    disabled={!open}
                    onClick={() => setLetter(c.letter)}
                    aria-label={label}
                    className={`w-full min-h-16 rounded-2xl border-2 px-2 py-3 text-center text-xl font-black transition-all ${
                      open
                        ? "border-[#2F7D4A] bg-[#ECF9F0] text-[#1D5631] shadow-[0_4px_0_#2F7D4A] hover:bg-[#D8F3E0] active:translate-y-[2px] active:shadow-none"
                        : "border-[#DFD3BC] bg-[#F5F1E8] text-[#25313A]/45"
                    }`}
                  >
                    {c.letter.toUpperCase()}
                    {c.letter}
                    {!open && <Lock className="mx-auto mt-1 h-4 w-4" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="text-center text-sm font-bold text-[#25313A]/70">
            Mm está lista. Las demás letras están pendientes hasta que exista su archivo del profesor.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="game-wood-frame">
      <div className="game-paper-board p-5 sm:p-8 space-y-5" aria-label={content.title}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6DCC8] pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setLetter(null)}
              className="inline-flex min-h-14 items-center gap-2 rounded-2xl border-2 border-[#D4C4A8] bg-[#F5F1E8] px-4 py-2 text-sm font-black text-[#25313A] hover:border-[#167A72]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Letras
            </button>
            <h1 className="rounded-2xl bg-[#167A72]/10 border border-[#167A72]/25 px-4 py-2.5 text-xl font-black text-[#25313A]">
              {content.title}
            </h1>
          </div>
          <p className="inline-flex min-h-14 items-center gap-2 rounded-2xl border-2 border-[#D99B1E] bg-[#FFF6D6] px-4 py-2 text-sm font-bold text-[#25313A]">
            <AudioLines className="h-4 w-4 text-[#8B5A00]" aria-hidden /> Audio: pendiente
          </p>
        </div>

        {content.sections.map((section) => (
          <section
            key={section.id}
            className="rounded-2xl border border-[#E6DCC8] bg-[#F5F1E8]/65 p-4 sm:p-5 space-y-4"
            aria-label={section.id}
          >
            {section.completeCards.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2.5">
                {section.completeCards.map((word) => (
                  <p
                    key={word}
                    className="game-tactile-card rounded-2xl px-5 py-2.5 text-2xl font-black text-[#25313A]"
                  >
                    {word}
                  </p>
                ))}
              </div>
            )}
            {section.syllableBoxes.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2.5">
                {section.syllableBoxes.map((box) => (
                  <p
                    key={box}
                    className="rounded-2xl border-2 border-[#D99B1E] bg-[#FFF6D6] px-5 py-2.5 text-xl font-black text-[#25313A]"
                  >
                    {box}
                  </p>
                ))}
              </div>
            )}
            {section.blankCards.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {section.blankCards.map((card) => (
                  <BlankCard key={card.id} card={card} />
                ))}
              </div>
            )}
          </section>
        ))}

        <section
          className="rounded-2xl border border-[#E6DCC8] bg-[#F5F1E8]/65 p-4 sm:p-5 space-y-3"
          aria-label="Sílabas"
        >
          <p className="text-sm font-bold text-[#25313A]/75">Sílabas</p>
          <div className="flex flex-wrap justify-center gap-3">
            {(content.tiles ?? []).map((tile) => (
              <button
                key={tile}
                type="button"
                disabled
                aria-label={`Sílaba ${tile}: pendiente`}
                className="min-h-14 min-w-16 rounded-2xl border-2 border-[#D99B1E]/60 bg-[#FFF6D6]/70 px-5 py-3 text-xl font-black text-[#25313A]/60"
              >
                {tile}
              </button>
            ))}
          </div>
          <p className="text-center text-xs font-bold text-[#8B5A00]">
            Las sílabas se pueden arrastrar cuando el archivo del profesor indique qué sílaba completa
            cada palabra. Ahora mismo eso falta: pendiente.
          </p>
        </section>

        <section
          className="rounded-2xl space-y-2 border-2 border-[#D99B1E] bg-[#FFF6D6]/70 p-4 sm:p-5"
          aria-label="Pendiente, falta en el archivo del profesor"
        >
          <h2 className="text-base font-black text-[#25313A]">
            Pendiente — falta en el archivo del profesor
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm font-semibold text-[#25313A]/85">
            {content.sections
              .flatMap((s) => s.blankCards.map((card) => ({ s, card })))
              .map(({ s, card }) => (
                <li key={card.id}>
                  {s.id.replace("seccion", "Sección")} · caja “{card.before}___{card.after}”: falta la
                  palabra completa y la sílaba correcta
                </li>
              ))}
            <li>Voz y audio de instrucciones y palabras: pendiente</li>
            <li>Las demás letras (después de Mm): pendientes</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
