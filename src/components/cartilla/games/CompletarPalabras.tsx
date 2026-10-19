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
import { AudioLines, Lock } from "lucide-react";
import consonants from "@/content/consonants.json";
import type {
  CompletarBlankCard,
  CompletarPalabrasContent,
} from "@/content/games/completar-palabras";

const LETTER_ID: Record<string, string> = { m: "completar-palabras" };

function BlankCard({ card }: { card: CompletarBlankCard }) {
  return (
    <div className="rounded-2xl border-2 border-sky-200 bg-white px-4 py-3 text-center">
      <p className="text-2xl font-black tracking-wide text-stone-800">
        {card.before}
        {card.shownTile ? (
          <span className="rounded-lg bg-rose-100 px-2 py-0.5 text-rose-700">{card.shownTile}</span>
        ) : (
          <span className="mx-1 inline-block min-w-16 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 px-2 py-0.5 align-middle text-base font-bold text-amber-700">
            ¿? pendiente
          </span>
        )}
        {card.after}
      </p>
      <p className="mt-1 text-xs font-bold text-amber-700">
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
      <section className="kid-card p-5 sm:p-7 space-y-5" aria-label="Completar palabras">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black text-stone-800">Completar palabras</h1>
          <p className="text-sm font-bold text-stone-600">Elige una letra</p>
        </div>
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6" role="list">
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
                  className={`w-full rounded-xl border-2 px-2 py-3 text-center text-xl font-black ${
                    open
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 active:scale-95"
                      : "border-stone-200 bg-stone-100 text-stone-400"
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
        <p className="text-center text-xs font-bold text-stone-500">
          Mm está lista. Las demás letras están pendientes hasta que exista su archivo del profesor.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-5" aria-label={content.title}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="rounded-xl bg-primary/10 px-4 py-2 text-xl font-black text-stone-800">
          {content.title}
        </h1>
        <p className="inline-flex items-center gap-1.5 rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
          <AudioLines className="h-4 w-4" aria-hidden /> Audio: pendiente
        </p>
      </div>

      {content.sections.map((section) => (
        <section key={section.id} className="kid-card p-4 sm:p-6 space-y-4" aria-label={section.id}>
          {section.completeCards.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {section.completeCards.map((word) => (
                <p
                  key={word}
                  className="rounded-xl border-2 border-stone-200 bg-white px-4 py-2 text-2xl font-black text-stone-800"
                >
                  {word}
                </p>
              ))}
            </div>
          )}
          {section.syllableBoxes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {section.syllableBoxes.map((box) => (
                <p
                  key={box}
                  className="rounded-xl bg-rose-100 px-4 py-2 text-xl font-black text-rose-700"
                >
                  {box}
                </p>
              ))}
            </div>
          )}
          {section.blankCards.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-3">
              {section.blankCards.map((card) => (
                <BlankCard key={card.id} card={card} />
              ))}
            </div>
          )}
        </section>
      ))}

      <section className="kid-card p-4 sm:p-6 space-y-3" aria-label="Sílabas">
        <p className="text-sm font-bold text-stone-600">Sílabas</p>
        <div className="flex flex-wrap justify-center gap-2">
          {(content.tiles ?? []).map((tile) => (
            <button
              key={tile}
              type="button"
              disabled
              aria-label={`Sílaba ${tile}: pendiente`}
              className="rounded-xl border-2 border-amber-200 bg-amber-50 px-5 py-3 text-xl font-black text-stone-500"
            >
              {tile}
            </button>
          ))}
        </div>
        <p className="text-center text-xs font-bold text-amber-700">
          Las sílabas se pueden arrastrar cuando el archivo del profesor indique qué sílaba completa
          cada palabra. Ahora mismo eso falta: pendiente.
        </p>
      </section>

      <section
        className="kid-card space-y-2 border-2 border-amber-300 bg-amber-50/60 p-4 sm:p-6"
        aria-label="Pendiente, falta en el archivo del profesor"
      >
        <h2 className="text-base font-black text-amber-800">
          Pendiente — falta en el archivo del profesor
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm font-semibold text-amber-900">
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
  );
}
