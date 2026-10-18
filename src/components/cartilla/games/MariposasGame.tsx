import { useEffect, useRef, useState } from "react";
import type { GameContent } from "@/lib/games/gameContent";
import { playWord } from "@/lib/games/wordAudio";
import "./MariposasGame.css";

type Mark = "idle" | "ash" | "green" | "red" | "erasing";

const ART = "/games/mariposas";
const POSITIONS = [
  { left: "8%", top: "8%", rotate: "-10deg" },
  { left: "29%", top: "15%", rotate: "7deg" },
  { left: "49%", top: "5%", rotate: "-4deg" },
  { left: "70%", top: "22%", rotate: "9deg" },
  { left: "13%", top: "53%", rotate: "-8deg" },
  { left: "52%", top: "48%", rotate: "5deg" },
];

export function MariposasGame({ content }: { content: GameContent }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string[]>([]);
  const [mark, setMark] = useState<Mark>("idle");
  const [message, setMessage] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const item = content.words[index % content.words.length];
  const complete = mark === "green";
  const busy = mark === "ash" || mark === "red" || mark === "erasing";
  const syllables = item?.syllables ?? [];
  const props = content.assets?.props;

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const later = (fn: () => void, delay: number) => {
    timers.current.push(setTimeout(fn, delay));
  };

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const clearGarden = () => {
    clearTimers();
    setSelected(null);
    setPlaced([]);
    setMark("idle");
    setMessage("");
  };

  const playRecording = () => {
    if (item?.audioUrl) {
      playWord(item.audioUrl);
      setMessage("");
    } else {
      setMessage("Audio pendiente: no hay grabación de esta palabra.");
    }
  };

  const choose = (syllable: string) => {
    if (busy || complete || placed.length >= syllables.length) return;
    setSelected(syllable);
    setMessage("");
  };

  const place = () => {
    if (!selected || busy || complete || placed.length >= syllables.length) return;
    setPlaced((old) => [...old, selected]);
    setSelected(null);
    setMark("idle");
    setMessage("");
  };

  const check = () => {
    if (busy || complete || placed.length !== syllables.length || !syllables.length) return;
    // Draw the mark in ash first. It cannot start green or red.
    setMark("ash");
    setMessage("");
    const valid = placed.every((s, i) => s === syllables[i]);
    later(() => {
      setMark(valid ? "green" : "red");
      if (valid) {
        setMessage("¡Correcto!");
      } else {
        later(() => setMark("erasing"), 600);
        later(() => {
          setPlaced([]);
          setSelected(null);
          setMark("idle");
          setMessage("Inténtalo otra vez.");
        }, 1080);
      }
    }, 380);
  };

  const next = () => {
    clearGarden();
    setIndex((old) => (old + 1) % content.words.length);
    // No voice and no TTS fallback. The next cue remains visibly pending.
  };

  if (!item) {
    return <p role="status">Palabras pendientes de la fuente original.</p>;
  }

  return (
    <section className="mariposas-game" aria-label="Juego Mariposas Mm">
      <div className="mariposas-heading">
        <h1>Mariposas · Mm</h1>
        <span data-testid="mariposas-cue">
          Sílaba de práctica: <strong>{item.word}</strong>
        </span>
        <span className="mariposas-audio-label">Audio pendiente</span>
      </div>

      <div className="mariposas-scene">
        <img className="mariposas-garden-art" src={content.assets?.board ?? `${ART}/garden.jpeg`} alt="Jardín de flores original del documento de la maestra" />
        {POSITIONS.map((pos, n) => (
          <img
            key={n}
            src={props?.butterfly ?? `${ART}/butterfly.png`}
            className="mariposas-decoration"
            style={{ left: pos.left, top: pos.top, rotate: pos.rotate }}
            alt=""
            aria-hidden="true"
          />
        ))}
        <button type="button" className="mariposas-prop mariposas-sun" onClick={playRecording} aria-label="Sol: escuchar de nuevo la palabra" title="Escuchar de nuevo">
          <img src={props?.sun ?? `${ART}/sun.png`} alt="" />
        </button>
        <button type="button" className="mariposas-prop mariposas-butterfly" onClick={check} disabled={busy || complete || placed.length !== syllables.length} aria-label="Mariposa: comprobar la palabra" title="Comprobar">
          <img src={props?.butterfly ?? `${ART}/butterfly.png`} alt="" />
          <span>Comprobar</span>
        </button>
        <div className="mariposas-answer-area" data-testid="mariposas-answer" data-mark={mark} aria-label="Palabra formada">
          {syllables.map((_, n) => (
            <span className="mariposas-answer-slot" key={n}>{placed[n] ?? ""}</span>
          ))}
        </div>
        <button type="button" className="mariposas-prop mariposas-flower" onClick={place} disabled={!selected || busy || complete} aria-label="Colocar sílaba en la florecita" title="Colocar sílaba">
          <img src={props?.flower ?? `${ART}/flower.png`} alt="" />
          <span>Colocar</span>
        </button>
        <button type="button" className="mariposas-prop mariposas-net" onClick={clearGarden} aria-label="Red: regresar las mariposas al jardín" title="Regresar al jardín">
          <img src={props?.net ?? `${ART}/net.png`} alt="" />
          <span>Regresar</span>
        </button>
        <button type="button" className="mariposas-prop mariposas-can" onClick={next} aria-label="Regadera: próxima palabra" title="Próxima palabra">
          <img src={props?.wateringCan ?? `${ART}/watering-can.png`} alt="" />
          <span>Siguiente</span>
        </button>
      </div>

      <div className="mariposas-tray" role="group" aria-label="Sílabas del documento original">
        {(content.tiles ?? []).map((syllable, i) => (
          <button
            type="button"
            key={`${syllable}-${i}`}
            onClick={() => choose(syllable)}
            disabled={busy || complete || placed.length >= syllables.length}
            className={selected === syllable ? "is-selected" : ""}
            aria-label={`Elegir sílaba ${syllable}`}
            aria-pressed={selected === syllable}
          >{syllable}</button>
        ))}
      </div>
      <div className="mariposas-feedback" role="status" aria-live="polite">
        {message || (selected ? `Coloca «${selected}» en la florecita.` : " ")}
      </div>
      <div className="mariposas-instructions" aria-label="Instrucciones originales">
        <div className="mariposas-instruction-panel">
          <strong>Instrucciones:</strong>
          <ol start={1}>{content.instructions.slice(0, 3).map((text) => <li key={text}>{text}</li>)}</ol>
        </div>
        <div className="mariposas-instruction-panel">
          <ol start={4}>{content.instructions.slice(3).map((text) => <li key={text}>{text}</li>)}</ol>
        </div>
      </div>
    </section>
  );
}
