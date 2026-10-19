// PalabrasMinutoScene.tsx - "Palabras por minuto" as one full-screen cork-board scene.
// Look follows the owner-approved mockup. Game logic is the logic already on main
// (60 s wall-clock timer, words marked in order, one completion event).
import { useEffect, useRef, useState } from "react";
import type { GameContent } from "@/lib/games/gameContent";
import { recordEvent } from "@/lib/student-session";
import { Music, VolumeX } from "lucide-react";
import {
  appMuted,
  createMusic,
  musicPreferred,
  playFinish,
  playRight,
  playWrong,
  setMusicPreferred,
} from "./sounds";
import "./PalabrasMinutoScene.css";

const ART = "/cartilla/games/palabras-minuto";
const START_SECONDS = 60;

function finishGame(content: GameContent, score: number, total: number) {
  recordEvent({
    lessonId: `game:${content.id}`,
    kind: "exercise",
    score,
    total,
    meta: { exercise: content.type, completed: true, gameId: content.id },
  });
}

function clock(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function PalabrasMinutoScene({ content }: { content: GameContent }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(START_SECONDS);
  const [count, setCount] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);
  const finished = !running && seconds === 0;
  const total = content.words.length;

  const countRef = useRef(count);
  countRef.current = count;
  const contentRef = useRef(content);
  contentRef.current = content;
  const hasFinishedRef = useRef(false);

  // Timer: deps are [running, seconds] only so marking a word never stretches the minute.
  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      setRunning(false);
      if (!hasFinishedRef.current) {
        hasFinishedRef.current = true;
        finishGame(contentRef.current, countRef.current, contentRef.current.words.length);
      }
      return;
    }
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [running, seconds]);

  useEffect(() => {
    if (wrong === null) return;
    const t = window.setTimeout(() => setWrong(null), 420);
    return () => window.clearTimeout(t);
  }, [wrong]);

  const start = () => {
    if (running) return;
    hasFinishedRef.current = false;
    setCount(0);
    setSeconds(START_SECONDS);
    setRunning(true);
  };

  const reset = () => {
    hasFinishedRef.current = true; // an abandoned run is not a completion
    setRunning(false);
    setCount(0);
    setSeconds(START_SECONDS);
  };

  const tapWord = (i: number) => {
    if (!running) {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 1100);
      return;
    }
    if (i === count) {
      playRight();
      setCount((n) => Math.min(n + 1, total));
    } else if (i > count) {
      playWrong();
      setWrong(i);
    }
  };

  const finishList = () => {
    setRunning(false);
    setSeconds(0);
    if (!hasFinishedRef.current) {
      hasFinishedRef.current = true;
      finishGame(content, count, total);
    }
  };

  // Background music: soft loop, starts after the first tap, own on/off button, silent when the app is muted.
  const [musicOn, setMusicOn] = useState(musicPreferred);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const touchedRef = useRef(false);
  const syncMusic = (on: boolean) => {
    if (!touchedRef.current) return;
    if (!on || appMuted()) {
      musicRef.current?.pause();
      return;
    }
    musicRef.current ??= createMusic();
    try {
      void Promise.resolve(musicRef.current?.play()).catch(() => {
        /* autoplay blocked until a tap */
      });
    } catch {
      /* no media support */
    }
  };
  const firstTap = () => {
    if (touchedRef.current) return;
    touchedRef.current = true;
    syncMusic(musicOn);
  };
  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    setMusicPreferred(next);
    touchedRef.current = true;
    syncMusic(next);
  };
  useEffect(
    () => () => {
      musicRef.current?.pause();
      musicRef.current = null;
    },
    [],
  );

  const allDone = running && count >= total;
  const celebratedRef = useRef(false);
  useEffect(() => {
    if (finished && count > 0 && !celebratedRef.current) {
      celebratedRef.current = true;
      playFinish();
    }
    if (!finished) celebratedRef.current = false;
  }, [finished, count]);
  const rows = Math.max(1, Math.ceil(total / 3));

  return (
    <main
      className="ppm"
      onPointerDownCapture={firstTap}
      onClickCapture={firstTap}
      aria-label="Palabras por minuto"
      data-game-id={content.id}
      data-letter={content.letter}
    >
      <div className="ppm-desk" aria-hidden />
      <div className="ppm-stage">
        <div className="ppm-board" aria-hidden />

        <div className="ppm-bar">
          <button
            type="button"
            className="ppm-speaker"
            aria-label="Escuchar la instrucción"
            data-audio-slot="palabras-minuto/instruccion"
            onClick={() => {
              /* audio slot intentionally empty - see docs/audio-gaps/palabras-minuto.md */
            }}
          >
            <img src={`${ART}/speaker.webp`} alt="" />
          </button>
          <span>Lee cada palabra. Antes de comenzar ajusta el cronómetro.</span>
        </div>

        <div className="ppm-gridframe">
          <img className="ppm-pin l" src={`${ART}/pin-l.webp`} alt="" />
          <img className="ppm-pin r" src={`${ART}/pin-r.webp`} alt="" />
          <div className="ppm-grid" style={{ ["--rows" as string]: rows }}>
            {content.words.map((item, i) => {
              const state = i < count ? "done" : running && i === count ? "current" : "idle";
              return (
                <button
                  key={`${item.word}-${i}`}
                  type="button"
                  className="ppm-cell"
                  data-state={state}
                  data-wrong={wrong === i ? "true" : undefined}
                  data-audio-slot={`palabras-minuto/${content.id}/palabra-${i + 1}`}
                  aria-disabled={!running || i !== count}
                  onClick={() => tapWord(i)}
                >
                  {item.word}
                </button>
              );
            })}
          </div>
        </div>

        <div className="ppm-abs ppm-card" aria-hidden>
          <img src={`${ART}/card.webp`} alt="" />
        </div>

        <div className="ppm-abs ppm-sign" role="img" aria-label="La Cartilla de Gretel">
          <img src={`${ART}/sign.webp`} alt="" />
        </div>
        <div className="ppm-abs ppm-banner">
          <img src={`${ART}/banner.webp`} alt="" />
          <h1 className="ppm-sr">¿Cuántas palabras puedo leer por minuto?</h1>
        </div>
        <div className="ppm-abs ppm-timer">
          <img src={`${ART}/timer.webp`} alt="" />
          <div
            className="ppm-plate"
            data-low={running && seconds <= 10 ? "true" : undefined}
            aria-hidden
          >
            {clock(seconds)}
          </div>
          <span className="ppm-sr">{seconds}s</span>
          <span className="ppm-sr" role="status">
            Leídas: {count}
          </span>
          <button
            type="button"
            className="ppm-hit ppm-stopwatch"
            aria-label="Reiniciar cronómetro"
            onClick={reset}
          />
          <button
            type="button"
            className="ppm-hit ppm-play"
            aria-label="Empezar 1 minuto"
            data-pulse={pulse ? "true" : undefined}
            disabled={running}
            onClick={start}
          />
        </div>

        <div className="ppm-abs ppm-left" aria-hidden>
          <div className="ppm-abs ppm-leaves">
            <img src={`${ART}/plant-leaves.webp`} alt="" />
          </div>
          <div className="ppm-abs ppm-pot">
            <img src={`${ART}/plant-pot.webp`} alt="" />
          </div>
          <div className="ppm-abs ppm-books">
            <img src={`${ART}/books.webp`} alt="" />
          </div>
        </div>
        <div className="ppm-abs ppm-right" aria-hidden>
          <img className="ppm-cup" src={`${ART}/cup.webp`} alt="" />
        </div>

        <button
          type="button"
          className="ppm-music"
          aria-label={musicOn ? "Apagar la música" : "Encender la música"}
          aria-pressed={musicOn}
          onClick={toggleMusic}
        >
          {musicOn && !appMuted() ? <Music aria-hidden /> : <VolumeX aria-hidden />}
        </button>

        {(allDone || finished) && (
          <div className="ppm-result" role="status">
            {finished && count > 0 && (
              <div className="ppm-confetti" aria-hidden>
                {Array.from({ length: 22 }, (_, k) => (
                  <i
                    key={k}
                    style={
                      {
                        "--i": k,
                        "--d": `${(1.5 + (k % 5) * 0.18).toFixed(2)}s`,
                        "--dl": `${((k % 6) * 0.05).toFixed(2)}s`,
                        "--dx": (k % 7) - 3,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            )}
            {finished ? (
              <>
                <div>{`Leíste ${count} palabras.`}</div>
                <button type="button" className="ppm-btn" onClick={start}>
                  Otra vez
                </button>
              </>
            ) : (
              <>
                <div>¡Leíste toda la lista!</div>
                <button type="button" className="ppm-btn" onClick={finishList}>
                  Terminé la lista
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
