import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GameContent, WordItem } from "@/lib/games/gameContent";
import { recordEvent } from "@/lib/student-session";
import "./rima-scene.css";

const WORDS = ["Mami", "mímame", "amo", "ámame"];
const ENDINGS = ["me ama", "a mamá", "mami", "más."];
// Verbatim poem in the owner's approved Mm scene. Not generated letter content.
const SOLUTION = ["Mami", "amo", "mímame", "ámame"];

export function rhymePairs(words: WordItem[]) {
  const remaining = [...words];
  const pairs: Array<[WordItem, WordItem]> = [];
  while (remaining.length) {
    const first = remaining.shift()!;
    const ending = first.syllables.at(-1)?.toLocaleLowerCase("es");
    const i = remaining.findIndex((w) => w.syllables.at(-1)?.toLocaleLowerCase("es") === ending);
    if (i >= 0) pairs.push([first, remaining.splice(i, 1)[0]]);
  }
  return pairs;
}

export function RimaScene({ content }: { content: GameContent }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [feedback, setFeedback] = useState<{ row: number; ok: boolean } | null>(null);
  const [message, setMessage] = useState("");
  const [round, setRound] = useState(-1);
  const [score, setScore] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pairs = rhymePairs(content.words);
  const pair = pairs[round];
  const poem = round < 0;
  const complete = poem ? answers.every(Boolean) : round >= pairs.length;
  const candidates = pair ? content.words.filter((w) => w.word !== pair[0].word).slice(0, 4) : [];
  if (pair && !candidates.some((w) => w.word === pair[1].word))
    candidates[candidates.length - 1] = pair[1];
  const cards = poem ? WORDS : candidates.map((w) => w.word);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  const finish = (total: number) =>
    recordEvent({
      lessonId: `game:${content.id}`,
      kind: "exercise",
      score: total,
      total,
      meta: { exercise: content.type, completed: true, gameId: content.id },
    });
  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setSelected(null);
    setAnswers(["", "", "", ""]);
    setFeedback(null);
    setMessage("");
    setRound(-1);
    setScore(0);
  };
  const place = (row: number, word = selected) => {
    if (!word || feedback || answers[row]) return;
    const ok = SOLUTION[row] === word;
    setFeedback({ row, ok });
    setSelected(null);
    setMessage(ok ? "¡Muy bien!" : "Intenta otra vez.");
    if (ok) {
      const next = answers.map((value, i) => (i === row ? word : value));
      setAnswers(next);
      if (next.every(Boolean)) {
        finish(4);
        setMessage("¡La rima está completa!");
      }
    }
    timer.current = setTimeout(() => setFeedback(null), 700);
  };
  const choose = (word: string) => {
    if (poem) {
      setSelected(word);
      setMessage("Toca el espacio para colocar la palabra.");
      return;
    }
    if (!pair || feedback) return;
    const ok = word === pair[1].word;
    setSelected(word);
    setFeedback({ row: 0, ok });
    setMessage(ok ? "¡Riman!" : "Busca la misma sílaba final.");
    timer.current = setTimeout(() => {
      if (ok) {
        const nextScore = score + 1;
        setScore(nextScore);
        if (round + 1 === pairs.length) finish(nextScore);
        setRound((i) => i + 1);
      }
      setFeedback(null);
      setSelected(null);
    }, 700);
  };
  return createPortal(
    <section className="rima-scene" aria-label="Vamos a rimar" data-rima-scene>
      <div className="rima-top">
        <img
          className="rima-top-art"
          src="/cartilla/games/rima/top.webp"
          alt="Vamos a rimar. Mamá abraza a su hija en el jardín."
          draggable={false}
        />
        <button
          className="rima-audio"
          aria-label="Escuchar la rima"
          onClick={() => setMessage("Audio pendiente: grabación aprobada no instalada.")}
        />
        {cards.map((word, i) => (
          <button
            key={word}
            className={`rima-card rima-card-${i} ${selected === word ? "is-selected" : ""} ${!poem ? "dynamic" : ""}`}
            aria-label={`Palabra ${word}`}
            aria-pressed={selected === word}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", word);
              setSelected(word);
            }}
            onClick={() => choose(word)}
          >
            <span className={poem ? "rima-sr" : ""}>{word}</span>
          </button>
        ))}
        {!poem &&
          [0, 1, 2, 3]
            .filter((i) => i >= cards.length)
            .map((i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`rima-card dynamic rima-card-${i} rima-unused`}
              />
            ))}
      </div>
      <div className={`rima-panel ${!poem ? "rima-practice" : ""}`}>
        <img
          className="rima-panel-art"
          src="/cartilla/games/rima/panel.webp"
          alt="Abeja y flores junto a la rima"
          draggable={false}
        />
        {poem ? (
          ENDINGS.map((ending, i) => (
            <div key={ending} data-ending={ending} className={`rima-line rima-line-${i}`}>
              <button
                className={`rima-slot ${answers[i] ? "is-correct" : ""} ${feedback?.row === i ? (feedback.ok ? "just-correct" : "is-wrong") : ""}`}
                aria-label={`Espacio ${i + 1}: ${answers[i] || "vacío"}, ${ending}`}
                onClick={() => place(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  place(i, e.dataTransfer.getData("text/plain"));
                }}
              >
                {answers[i]}
                <span className="rima-sr">{ending}</span>
              </button>
            </div>
          ))
        ) : (
          <div className="rima-pair-board">
            <p>{complete ? "¡Muy bien!" : "¿Qué palabra rima con…?"}</p>
            <strong>
              {complete ? `${score} de ${pairs.length} rimas encontradas` : pair?.[0].word}
            </strong>
            <p>{complete ? "" : "Toca la palabra de arriba."}</p>
          </div>
        )}
      </div>
      <div className="rima-controls">
        <a href="/cartilla/practica" aria-label="Volver a práctica">
          ⌂
        </a>
        <button onClick={reset} aria-label="Repetir la rima">
          ↺
        </button>
        {complete && poem && pairs.length > 0 && (
          <button
            className="rima-next"
            onClick={() => {
              setRound(0);
              setSelected(null);
              setMessage("");
            }}
          >
            Siguiente →
          </button>
        )}
      </div>
      <div
        className={`rima-feedback ${feedback ? (feedback.ok ? "ok" : "wrong") : ""}`}
        role="status"
        aria-live="polite"
      >
        {message}
      </div>
    </section>,
    document.body,
  );
}
