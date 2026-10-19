import { useState } from "react";
import {
  AUTHOR_LETTERS,
  AUTHOR_MECHANICS,
  createAuthorGame,
  type AuthorMechanic,
} from "@/content/games/author-games";
import { PayasoChano } from "./PayasoChano";
import { SyllableBuilder } from "./SyllableBuilder";
import { CoreGame } from "./CoreGames";
import { playInstruction, stopGameAudio } from "@/lib/games/wordAudio";
import { RecordedGameFrame } from "./RecordedGameFrame";

/** Letter is a curriculum lesson number: Rr and rr must remain distinct. */
export function AuthorGameTemplate({
  mechanic = "mariposas",
  lesson = 7,
}: {
  mechanic?: AuthorMechanic;
  lesson?: number;
}) {
  const [selected, setSelected] = useState(lesson);
  const [type, setType] = useState<AuthorMechanic>(mechanic);
  const { content } = createAuthorGame(type, selected);
  const change = (action: () => void) => {
    stopGameAudio();
    action();
  };
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4" aria-label="Juegos por letra">
      <nav className="flex flex-wrap gap-2" aria-label="Letras">
        {AUTHOR_LETTERS.map((item) => (
          <button
            type="button"
            key={item.n}
            aria-pressed={item.n === selected}
            onClick={() => change(() => setSelected(item.n))}
            className="min-h-11 min-w-11 rounded-xl border-2 border-stone-300 bg-white px-3 font-bold aria-pressed:border-emerald-600"
          >
            {item.letter}
          </button>
        ))}
      </nav>
      <select
        aria-label="Juego"
        value={type}
        onChange={(event) => change(() => setType(event.target.value as AuthorMechanic))}
        className="min-h-11 max-w-full rounded-xl border-2 bg-white p-2"
      >
        {AUTHOR_MECHANICS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      {content ? (
        <RecordedGameFrame key={content.id} content={content}>
          <ol className="space-y-2 rounded-2xl bg-white p-4 font-semibold">
            {content.instructions.map((line, index) => (
              <li key={index}>
                {line}{" "}
                <button
                  type="button"
                  aria-label={`Escuchar instrucción ${index + 1}`}
                  onClick={() =>
                    playInstruction(
                      content.instructionAudioUrls?.[index],
                      content.instructions[index],
                    )
                  }
                  className="min-h-11 min-w-11 rounded-lg border"
                >
                  ▷
                </button>
              </li>
            ))}
          </ol>
          {type === "payaso-chano" ? (
            <PayasoChano content={content} />
          ) : type === "lectura-silabas" ? (
            <SyllableBuilder content={content} />
          ) : (
            <CoreGame content={content} />
          )}
        </RecordedGameFrame>
      ) : (
        <p role="status">pendiente</p>
      )}
    </main>
  );
}
