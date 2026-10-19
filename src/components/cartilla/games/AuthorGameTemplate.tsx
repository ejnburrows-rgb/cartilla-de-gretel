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
    <main
      className="mx-auto flex h-dvh max-w-3xl flex-col gap-2 overflow-hidden p-2"
      aria-label="Juegos por letra"
    >
      <div className="flex shrink-0 items-center gap-2">
        <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto" aria-label="Letras">
          {AUTHOR_LETTERS.map((item) => (
            <button
              type="button"
              key={item.n}
              aria-pressed={item.n === selected}
              onClick={() => change(() => setSelected(item.n))}
              className="min-h-11 min-w-11 shrink-0 rounded-xl border-2 border-stone-300 bg-white px-2 font-bold aria-pressed:border-emerald-600"
            >
              {item.letter}
            </button>
          ))}
        </nav>
        <select
          aria-label="Juego"
          value={type}
          onChange={(event) => change(() => setType(event.target.value as AuthorMechanic))}
          className="min-h-11 max-w-[45%] shrink-0 rounded-xl border-2 bg-white p-2"
        >
          {AUTHOR_MECHANICS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      {content ? (
        <RecordedGameFrame key={content.id} content={content}>
          <details className="shrink-0 rounded-2xl bg-white px-3 py-1 font-semibold">
            <summary className="min-h-11 cursor-pointer py-2">Instrucciones</summary>
            <ol className="space-y-1 pb-2">
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
          </details>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {type === "payaso-chano" ? (
              <PayasoChano content={content} />
            ) : type === "lectura-silabas" ? (
              <SyllableBuilder content={content} />
            ) : (
              <CoreGame content={content} />
            )}
          </div>
        </RecordedGameFrame>
      ) : (
        <p role="status">pendiente</p>
      )}
    </main>
  );
}
