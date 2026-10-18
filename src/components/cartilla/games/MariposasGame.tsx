import { useEffect, useRef, useState } from "react";
import type { GameContent } from "@/lib/games/gameContent";
import { playWord } from "@/lib/games/wordAudio";
import "./MariposasGame.css";

type Mark = "idle" | "ash" | "green" | "red" | "erasing";

const ART = "/games/mariposas";

// Garden float spots: x/y are % of the scene box (center of the butterfly).
const SPOTS: Record<string, { x: number; y: number; s: number }> = {
  ma: { x: 26, y: 9, s: 1 },
  mo: { x: 38, y: 16, s: 1 },
  mi: { x: 52, y: 9, s: 1 },
  Mu: { x: 66, y: 14, s: 1 },
  Pe: { x: 79, y: 9, s: 1 },
  po: { x: 18, y: 27, s: 0.92 },
  me: { x: 33, y: 33, s: 0.92 },
  pi: { x: 47, y: 29, s: 0.92 },
  Pu: { x: 60, y: 32, s: 0.92 },
  pa: { x: 74, y: 30, s: 0.92 },
};

// Bar slot landing spots (x = slot center, y = slot center, % of scene box).
const SLOT_XS = [43, 57];
const SLOT_Y = 87;

export function MariposasGame({ content }: { content: GameContent }) {
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [flying, setFlying] = useState<{ syllable: string; slot: number } | null>(null);
  const [mark, setMark] = useState<Mark>("idle");
  const [message, setMessage] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const item = content.words[index % content.words.length];
  const syllables = item?.syllables ?? [];
  const busy = flying !== null || mark === "ash" || mark === "red" || mark === "erasing";
  const complete = mark === "green";
  const props = content.assets?.props;
  const butterflyArt = (props?.butterfly ?? {}) as Record<string, string>;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn: () => void, delay: number) => {
    timers.current.push(setTimeout(fn, delay));
  };
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // No recordings exist yet and no synthesis is allowed: the hooks stay wired,
  // but the user always sees the labeled pending state.
  const playCue = (wordIndex: number) => {
    const cue = content.words[wordIndex % content.words.length];
    playWord(cue?.audioUrl);
    if (!cue?.audioUrl) setMessage("Audio pendiente: aún no hay grabación de la palabra.");
  };

  const resetWordState = () => {
    clearTimers();
    setPlaced([]);
    setFlying(null);
    setMark("idle");
    setMessage("");
  };

  const pick = (syllable: string) => {
    if (busy || complete || !syllables.length || placed.length >= syllables.length) return;
    const slot = placed.length;
    setFlying({ syllable, slot });
    setMessage("");
    later(() => {
      setPlaced((old) => [...old, syllable]);
      setFlying(null);
    }, 850);
  };

  const check = () => {
    if (busy || complete || placed.length !== syllables.length) return;
    // The answer mark always starts ash gray, never green or red.
    setMark("ash");
    setMessage("");
    const valid = placed.every(
      (s, i) => s.toLocaleLowerCase("es") === syllables[i]?.toLocaleLowerCase("es"),
    );
    later(() => {
      if (valid) {
        setMark("green");
        setMessage("¡Palabra completa!");
      } else {
        setMark("red");
        later(() => setMark("erasing"), 600);
        later(() => {
          setPlaced([]);
          setMark("idle");
          setMessage("Inténtalo otra vez.");
        }, 1200);
      }
    }, 500);
  };

  const nextWord = () => {
    resetWordState();
    const next = index + 1;
    setIndex(next);
    playCue(next);
  };

  if (!item) {
    return <p role="status">Palabras pendientes de la fuente original.</p>;
  }

  return (
    <section className="mariposas-game" aria-label="Juego Mariposas Mm">
      <div className="mariposas-heading">
        <h1>Mariposas · Mm</h1>
        <span data-testid="mariposas-cue">
          Palabra {index + 1} de {content.words.length}: <strong>{item.word}</strong>
        </span>
        <span className="mariposas-audio-label">Audio pendiente</span>
      </div>

      <div className="mariposas-scene">
        <div className="mariposas-sky" aria-hidden="true" />
        <img
          className="mariposas-cloud"
          src={props?.cloud ?? `${ART}/scene-cloud.svg`}
          alt=""
          aria-hidden="true"
        />
        <div
          className="mariposas-sign"
          aria-label={`Cartel de palabras. Palabra actual: ${item.word}`}
        >
          <img src={props?.sign ?? `${ART}/sign.svg`} alt="" />
          {content.words.map((word, i) => (
            <span
              key={word.word}
              className={i === index % content.words.length ? "is-current" : undefined}
              style={{ top: `${31 + i * 12.6}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
        <button
          type="button"
          className="mariposas-prop mariposas-sun"
          onClick={() => playCue(index)}
          aria-label="Sol: escuchar la palabra actual"
          title="Escuchar la palabra actual"
        >
          <img src={props?.sun ?? `${ART}/sun.svg`} alt="" />
        </button>
        {(content.tiles ?? []).map((syllable, i) => {
          const spot = SPOTS[syllable];
          const isFlying = flying?.syllable === syllable;
          const left = isFlying ? SLOT_XS[flying.slot] : spot.x;
          const top = isFlying ? SLOT_Y : spot.y;
          return (
            <button
              type="button"
              key={`${syllable}-${i}`}
              className={`mariposas-bf${isFlying ? " is-flying" : ""}`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${(i % 5) * -1.1}s`,
              }}
              onClick={() => pick(syllable)}
              disabled={busy || complete || placed.length >= syllables.length}
              aria-label={`Mariposa ${syllable}`}
            >
              <span className="mariposas-bf-float">
                <span
                  className="mariposas-bf-wings"
                  style={{ "--bf-scale": spot.s } as React.CSSProperties}
                >
                  <img src={butterflyArt[syllable] ?? `${ART}/bf-${syllable}.svg`} alt="" />
                </span>
              </span>
            </button>
          );
        })}
        <button
          type="button"
          className="mariposas-prop mariposas-can"
          onClick={nextWord}
          aria-label="Regadera: próxima palabra"
          title="Próxima palabra"
        >
          <img src={props?.can ?? `${ART}/can.svg`} alt="" />
        </button>

        <div className="mariposas-bar">
          <img
            className="mariposas-bar-art"
            src={props?.bar ?? `${ART}/bar.svg`}
            alt=""
            aria-hidden="true"
          />
          <span className="mariposas-bar-word" aria-hidden="true">
            {item.word}
          </span>
          <div className="mariposas-slots" data-testid="mariposas-answer" data-mark={mark}>
            {syllables.map((_, n) => (
              <span className="mariposas-slot" key={n}>
                {placed[n] ?? ""}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="mariposas-check"
            onClick={check}
            disabled={busy || complete || placed.length !== syllables.length}
            aria-label="Mariposa: comprobar la palabra"
            title="Comprobar la palabra"
          >
            <img src={props?.check ?? `${ART}/bf-check.svg`} alt="" />
          </button>
        </div>
      </div>

      <div className="mariposas-feedback" role="status" aria-live="polite">
        {message || " "}
      </div>

      <div className="mariposas-instructions" aria-label="Instrucciones originales">
        <img
          src={props?.panelA ?? `${ART}/panel-a.svg`}
          alt="Instrucciones 1 a 3 del documento original"
        />
        <img
          src={props?.panelB ?? `${ART}/panel-b.svg`}
          alt="Instrucciones 4 a 8 del documento original"
        />
      </div>
    </section>
  );
}
