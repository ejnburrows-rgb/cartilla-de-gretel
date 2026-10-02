/**
 * Flip Chart proof plates (teacher presentation) — Lección 9, Ss.
 *   Plate 17 (printed folio 15): "Sapo Samapo" — Ss halo, approved scene, verse card.
 *   Plate 16 (printed folio 14): syllable rows, word columns, sight words, sentences.
 *
 * Text is transcribed verbatim from the printed plates; the only artwork used is
 * the approved plate-17 scene file, placed unchanged. Everything else behind the
 * plate is background scenery (repo.md background-only exception).
 *
 * Teacher interactions: tap any syllable, word or line to hear it; tapping a
 * verse line or sentence spotlights it for the class; tapping a sight word on
 * plate 16 lights up every place it appears in the sentences.
 */
import { useState, type CSSProperties, type ReactNode } from "react";
import { speak } from "@/lib/speak";
import { StorybookSceneArt } from "@/components/storybook/StorybookWorld";
import { STORYBOOK_FLIPCHART_PLATES } from "@/content/storybook-proof";
import "@/styles/storybook.css";

const P17_SCENE = "/cartilla/art/optimized/flipchart-native/p017-scene.png";

export const PLATE_17 = {
  letter: "Ss",
  title: "Sapo Samapo",
  verse: ["Sapo Samapo", "en la mesa está", "sapo Samapo", "sa-po-mi-pa."],
} as const;

export const PLATE_16 = {
  letter: "Ss",
  rows: [
    ["sa", "se", "si", "so", "su"],
    ["su", "so", "sa", "se", "si"],
  ],
  words: [
    ["masa", "sapo", "así", "puso", "Sisi"],
    ["mesa", "seso", "sopa", "supo", "ese"],
    ["suma", "Susi", "paso", "supe", "esa"],
  ],
  sightWords: ["es", "de", "un", "está", "en", "la", "el"],
  sentences: [
    "La mesa es de Susi.",
    "La sopa está en la mesa.",
    "Papá pasa la sopa a Susi.",
    "Sisi pasa la sopa a mamá.",
    "Ese sapo es de Sisi. Es el sapo Samapo.",
    "Sisi pasa el sapo a Pepe.",
    "Pepe puso un sapo en la mesa.",
  ],
} as const;

const SIGHT = new Set<string>(PLATE_16.sightWords);
const bare = (token: string) => token.replace(/[.,;:!?¡¿]/g, "").toLowerCase();

const say = (text: string) => {
  void speak(text.replace(/-/g, " "));
};

/** The taught letter in the book's red, the vowel in ink. */
function Syllable({ text }: { text: string }) {
  return (
    <>
      <span className="sbfc__red">{text.charAt(0)}</span>
      {text.slice(1)}
    </>
  );
}

function Plate17() {
  const [spot, setSpot] = useState<number | null>(null);
  const lines: Array<{ text: string; title?: boolean }> = [
    { text: PLATE_17.title, title: true },
    ...PLATE_17.verse.map((text) => ({ text })),
  ];
  return (
    <div className="sbfc__plate sbfc__plate--17">
      <button
        type="button"
        className="sbfc__halo sbfc__enter"
        style={{ "--i": 0 } as CSSProperties}
        onClick={() => say("ese")}
        aria-label="Ss"
      >
        <span>{PLATE_17.letter}</span>
      </button>
      <figure className="sbfc__scene-art sbfc__enter" style={{ "--i": 1 } as CSSProperties}>
        <img src={P17_SCENE} alt="Sapo Samapo" draggable={false} />
      </figure>
      <section
        className="sbfc__verse sbfc__enter"
        style={{ "--i": 2 } as CSSProperties}
        data-spotlight={spot === null ? undefined : "true"}
        aria-label="Sapo Samapo"
      >
        {lines.map((line, index) => (
          <button
            key={index}
            type="button"
            className={line.title ? "sbfc__verse-title" : "sbfc__verse-line"}
            data-active={spot === index || undefined}
            onClick={() => {
              const next = spot === index ? null : index;
              setSpot(next);
              if (next !== null) say(line.text);
            }}
          >
            {line.text}
          </button>
        ))}
      </section>
    </div>
  );
}

function Sentence({ text, lit }: { text: string; lit: string | null }) {
  const parts: ReactNode[] = [];
  text.split(" ").forEach((token, i) => {
    const key = bare(token);
    if (i > 0) parts.push(" ");
    parts.push(
      SIGHT.has(key) ? (
        <b key={i} className="sbfc__sight-in" data-lit={lit === key || undefined}>
          {token}
        </b>
      ) : (
        <span key={i}>{token}</span>
      ),
    );
  });
  return <>{parts}</>;
}

function Plate16() {
  const [lit, setLit] = useState<string | null>(null);
  const [spot, setSpot] = useState<number | null>(null);
  return (
    <div className="sbfc__plate sbfc__plate--16">
      <section
        className="sbfc__sheet sbfc__sheet--drill sbfc__enter"
        style={{ "--i": 0 } as CSSProperties}
      >
        <div className="sbfc__drill-head">
          <button type="button" className="sbfc__letter" onClick={() => say("ese")} aria-label="Ss">
            {PLATE_16.letter}
          </button>
          <div className="sbfc__rows">
            {PLATE_16.rows.map((row, r) => (
              <div
                key={r}
                className={`sbfc__row sbfc__row--${r + 1}`}
                role="group"
                aria-label={row.join(" ")}
              >
                {row.map((syl) => (
                  <button key={syl} type="button" className="sbfc__syl" onClick={() => say(syl)}>
                    <Syllable text={syl} />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="sbfc__words">
          {PLATE_16.words.map((col, c) => (
            <ul key={c} className="sbfc__word-col">
              {col.map((word) => (
                <li key={word}>
                  <button type="button" className="sbfc__word" onClick={() => say(word)}>
                    {word}
                  </button>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>
      <section
        className="sbfc__sheet sbfc__sheet--read sbfc__enter"
        style={{ "--i": 1 } as CSSProperties}
        data-lit={lit ?? undefined}
      >
        <div className="sbfc__sight-bar" role="group" aria-label="Palabras de uso frecuente">
          {PLATE_16.sightWords.map((word) => (
            <button
              key={word}
              type="button"
              className="sbfc__sight"
              aria-pressed={lit === word}
              onClick={() => {
                const next = lit === word ? null : word;
                setLit(next);
                if (next) say(word);
              }}
            >
              {word}
            </button>
          ))}
        </div>
        <ol className="sbfc__sentences" data-spotlight={spot === null ? undefined : "true"}>
          {PLATE_16.sentences.map((sentence, index) => (
            <li key={index}>
              <button
                type="button"
                className="sbfc__sentence"
                data-active={spot === index || undefined}
                onClick={() => {
                  const next = spot === index ? null : index;
                  setSpot(next);
                  if (next !== null) say(sentence);
                }}
              >
                <Sentence text={sentence} lit={lit} />
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export function StorybookFlipchartPlate({ plate }: { plate: number }) {
  const scene = STORYBOOK_FLIPCHART_PLATES[plate]?.scene ?? "meadow";
  return (
    <div className="sbfc" data-plate={plate} data-testid="storybook-flipchart-plate">
      <div className="sbfc__world" aria-hidden="true">
        <StorybookSceneArt scene={scene} />
      </div>
      {plate === 17 ? <Plate17 /> : <Plate16 />}
    </div>
  );
}
