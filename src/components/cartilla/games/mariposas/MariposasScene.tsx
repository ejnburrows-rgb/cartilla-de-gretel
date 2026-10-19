// MariposasScene.tsx - full-screen Mariposas game built from the owner-approved mockup.
// All art is cut from that mockup (public/cartilla/art/mariposas-scene); nothing is generated.
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { GameContent } from "@/lib/games/gameContent";
import { playInstruction, playWord } from "@/lib/games/wordAudio";
import { recordEvent } from "@/lib/student-session";
import { SCENE_H, SCENE_W, SLOTS, type Slot, type Tone } from "./layout";
import "./mariposas.css";

// Word set printed on the approved mockup. Preview only (?set=mockup): its words reach past the
// lesson order that the taught-order gate checks, so it is not registered as a live game.
const MOCKUP_SET: Pick<GameContent, "words" | "tiles"> = {
  words: [
    { word: "mapa", syllables: ["ma", "pa"] },
    { word: "pomo", syllables: ["po", "mo"] },
    { word: "Mupi", syllables: ["Mu", "pi"] },
    { word: "Pepe", syllables: ["Pe", "pe"] },
    { word: "puma", syllables: ["pu", "ma"] },
    { word: "Pupi", syllables: ["Pu", "pi"] },
  ],
  tiles: ["ma", "mo", "mi", "Mu", "pa", "po", "me", "Pe", "pi", "Pu"],
};

const ART = "/cartilla/art/mariposas-scene";
const BAR = { x: 449, y: 641, w: 116, h: 72, step: 128 };
const WORD_BTN = { x: 926, y: 630, w: 303, h: 81 };
const BAND_H = 614;
// Portrait: the garden is shown in two bands cut from the approved scene.
const BANDS = [
  { x0: 0, x1: 890, ids: ["ma", "mo", "Mu", "pa", "me", "Pe"] },
  { x0: 830, x1: 1484, ids: ["mi", "po", "pi", "Pu"] },
];
const BOARD = { x: 44, y: 70, w: 170, h: 236 };

type Mode = "wide" | "landscape" | "portrait";
type Feedback = "ok" | "no" | null;

function useMode(): { mode: Mode; vw: number; vh: number } {
  const read = () => ({ vw: window.innerWidth, vh: window.innerHeight });
  const [v, setV] = useState(read);
  useEffect(() => {
    const on = () => setV(read());
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("orientationchange", on);
    };
  }, []);
  const a = v.vw / v.vh;
  const mode: Mode = a < 1 ? "portrait" : a > 1.9 ? "landscape" : "wide";
  return { mode, ...v };
}

function finish(content: GameContent, score: number, total: number) {
  recordEvent({
    lessonId: `game:${content.id}`,
    kind: "exercise",
    score,
    total,
    meta: { exercise: content.type, completed: true, gameId: content.id },
  });
}

export function MariposasScene({ content: base }: { content: GameContent }) {
  const preview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("set") === "mockup";
  const content: GameContent = preview ? { ...base, ...MOCKUP_SET } : base;
  const { mode, vw, vh } = useMode();
  const [wordIndex, setWordIndex] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [score, setScore] = useState(0);
  const [hop, setHop] = useState<string | null>(null);
  const [pour, setPour] = useState(false);
  const [sheet, setSheet] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const words = content.words;
  const done = wordIndex >= words.length;
  const word = words[Math.min(wordIndex, words.length - 1)];
  const tiles = (content.tiles ?? []).slice(0, SLOTS.length);
  const slotCount = Math.max(3, word.syllables.length);
  const lower = (s: string) => s.toLocaleLowerCase("es");

  const goNext = useCallback(() => {
    setPicked([]);
    setFeedback(null);
    setWordIndex((i) => i + 1);
  }, []);

  const reset = () => {
    window.clearTimeout(timer.current);
    setWordIndex(0);
    setPicked([]);
    setFeedback(null);
    setScore(0);
  };

  const choose = (tile: string, id: string) => {
    if (feedback || done) return;
    setHop(id);
    window.setTimeout(() => setHop(null), 420);
    const next = [...picked, tile];
    const ok = next.every((v, i) => lower(v) === lower(word.syllables[i] ?? ""));
    if (!ok) {
      setPicked(next);
      setFeedback("no");
      timer.current = window.setTimeout(() => {
        setPicked([]);
        setFeedback(null);
      }, 900);
      return;
    }
    setPicked(next);
    if (next.length === word.syllables.length) {
      setFeedback("ok");
      const total = words.length;
      const nextScore = score + 1;
      setScore(nextScore);
      timer.current = window.setTimeout(() => {
        if (wordIndex + 1 === total) finish(content, nextScore, total);
        goNext();
      }, 1100);
    }
  };

  const unpick = (i: number) => {
    if (feedback || done) return;
    setPicked((p) => p.slice(0, i));
  };

  const skip = () => {
    if (feedback || done) return;
    setPour(true);
    window.setTimeout(() => setPour(false), 700);
    timer.current = window.setTimeout(goNext, 450);
  };

  const sunPress = () => playWord(word?.audioUrl);
  const slotState = feedback === "ok" ? "ok" : feedback === "no" ? "no" : "ash";

  // ---- scene geometry ----
  let stage: CSSProperties;
  let k = 1;
  if (mode === "portrait") {
    stage = { position: "absolute", inset: 0 };
  } else {
    const h0 = mode === "landscape" ? 730 : SCENE_H;
    k = Math.min(vw / SCENE_W, vh / h0);
    stage = {
      position: "absolute",
      width: SCENE_W,
      height: h0,
      left: (vw - SCENE_W * k) / 2,
      top: (vh - h0 * k) / 2,
      transform: `scale(${k})`,
      transformOrigin: "0 0",
      overflow: "hidden",
    };
  }

  const butterflies = SLOTS.slice(0, tiles.length).map((s, i) => ({ s, tile: tiles[i], i }));

  const renderButterfly = (
    s: Slot,
    tile: string,
    i: number,
    pos: { sx: number; sy: number; cx: number; cy: number; z: number },
  ) => (
    <button
      key={s.id}
      type="button"
      aria-label={tile}
      className={`mps-bf${hop === s.id ? " mps-hop" : ""}`}
      style={{
        left: pos.sx,
        top: pos.sy,
        width: s.w * pos.z,
        height: s.h * pos.z,
        animationDelay: `${-(i * 0.73) % 3.6}s`,
        animationDuration: `${3 + (i % 4) * 0.45}s`,
      }}
      onClick={() => choose(tile, s.id)}
    >
      <img
        src={`${ART}/${s.sprite}`}
        alt=""
        draggable={false}
        style={{ width: "100%", height: "100%" }}
      />
      <span
        className={`mps-chip mps-${s.tone}`}
        style={{
          left: pos.cx - pos.sx,
          top: pos.cy - pos.sy,
          width: s.chip.w * pos.z,
          height: s.chip.h * pos.z,
          fontSize: s.chip.h * pos.z * 0.56,
        }}
        aria-hidden
      >
        {tile}
      </span>
    </button>
  );

  const slotsEl = (sc: number, style: CSSProperties) => (
    <div className="mps-slots" style={style}>
      {Array.from({ length: slotCount }).map((_, i) => {
        const filled = picked[i];
        return (
          <button
            key={i}
            type="button"
            aria-label={filled ? `Sílaba ${i + 1}: ${filled}` : `Espacio ${i + 1}`}
            className={`mps-slot${filled ? ` mps-filled mps-${slotState}` : ""}`}
            style={{
              width: BAR.w * sc,
              height: BAR.h * sc,
              fontSize: BAR.h * sc * 0.6,
              borderRadius: 14 * sc,
            }}
            onClick={() => unpick(i)}
          >
            {filled ?? ""}
          </button>
        );
      })}
    </div>
  );

  const wordBtn = (sc: number, style: CSSProperties) => (
    <button
      type="button"
      className="mps-word"
      style={{ ...style, fontSize: 52 * sc, borderRadius: 22 * sc }}
      onClick={sunPress}
      aria-label={`Palabra: ${word?.word}`}
    >
      {word?.word.toLocaleLowerCase("es")}
    </button>
  );

  const status = (
    <div role="status" className={`mps-toast${feedback ? ` mps-toast-${feedback}` : ""}`}>
      {feedback === "ok" ? "¡Palabra completa!" : feedback === "no" ? "Inténtalo de nuevo" : ""}
    </div>
  );

  const board = (style: CSSProperties, sc: number) => (
    <div
      className="mps-board"
      style={{ ...style, fontSize: 33 * sc, lineHeight: `${38 * sc}px`, paddingLeft: 40 * sc }}
      aria-label="Palabras del juego"
    >
      {words.map((w) => (
        <div key={w.word}>{w.word}</div>
      ))}
    </div>
  );

  const doneEl = done && (
    <div className="mps-done" role="dialog" aria-label="Fin del juego">
      <h2>¡Las mariposas volvieron al jardín!</h2>
      <p>
        {score} de {words.length} palabras completas
      </p>
      <button type="button" onClick={reset}>
        Jugar otra vez
      </button>
    </div>
  );

  return (
    <div className="mps-root" aria-label="Mariposas" data-mode={mode} data-testid="mariposas-scene">
      <div className="mps-fill" style={{ backgroundImage: `url(${ART}/scene.webp)` }} />
      <p className="mps-sr">
        {content.instructions.map((t, i) => (
          <span key={i}>{`${i + 1}. ${t} `}</span>
        ))}
      </p>

      {mode !== "portrait" && (
        <div style={stage}>
          <img
            className="mps-bg"
            src={`${ART}/scene.webp`}
            alt=""
            draggable={false}
            width={SCENE_W}
            height={SCENE_H}
          />
          {board({ left: BOARD.x, top: BOARD.y, width: BOARD.w, height: BOARD.h }, 1)}
          {butterflies.map(({ s, tile, i }) =>
            renderButterfly(s, tile, i, { sx: s.x, sy: s.y, cx: s.chip.x, cy: s.chip.y, z: 1 }),
          )}
          <button
            type="button"
            className="mps-hot"
            aria-label="Escuchar la palabra"
            style={{ left: 1170, top: 0, width: 270, height: 200, borderRadius: "50%" }}
            onClick={sunPress}
          />
          <button
            type="button"
            className={`mps-hot mps-can${pour ? " mps-pour" : ""}`}
            aria-label="Próxima palabra"
            style={{ left: 1229, top: 495, width: 255, height: 205 }}
            onClick={skip}
          />
          {slotsEl(1, { left: BAR.x, top: BAR.y, gap: BAR.step - BAR.w })}
          {wordBtn(1, { left: WORD_BTN.x, top: WORD_BTN.y, width: WORD_BTN.w, height: WORD_BTN.h })}
          <button
            type="button"
            className="mps-hot"
            aria-label="Escuchar las instrucciones"
            style={{ left: 38, top: 745, width: 84, height: 86, borderRadius: "50%" }}
            onClick={() => (mode === "landscape" ? setSheet(true) : playInstruction())}
          />
          <div
            style={{ position: "absolute", left: 449, top: 585, width: 372, textAlign: "center" }}
          >
            {status}
          </div>
        </div>
      )}

      {mode === "landscape" && (
        <button
          type="button"
          className="mps-help"
          onClick={() => setSheet(true)}
          aria-label="Ver instrucciones"
        >
          ?
        </button>
      )}

      {mode === "portrait" && (
        <div style={stage} className="mps-portrait">
          {BANDS.map((band, bi) => {
            const sc = vw / (band.x1 - band.x0);
            const bandH = BAND_H * sc;
            return (
              <div
                key={bi}
                className="mps-band"
                style={{
                  position: "relative",
                  width: vw,
                  height: bandH,
                  backgroundImage: `url(${ART}/scene.webp)`,
                  backgroundSize: `${SCENE_W * sc}px ${SCENE_H * sc}px`,
                  backgroundPosition: `${-band.x0 * sc}px 0`,
                }}
              >
                {bi === 0 &&
                  board(
                    {
                      left: (BOARD.x - band.x0) * sc,
                      top: BOARD.y * sc,
                      width: BOARD.w * sc,
                      height: BOARD.h * sc,
                    },
                    sc,
                  )}
                {butterflies
                  .filter(({ s }) => band.ids.includes(s.id))
                  .map(({ s, tile, i }) =>
                    renderButterfly(s, tile, i, {
                      sx: (s.x - band.x0) * sc,
                      sy: s.y * sc,
                      cx: (s.chip.x - band.x0) * sc,
                      cy: s.chip.y * sc,
                      z: sc,
                    }),
                  )}
                {bi === 1 && (
                  <>
                    <button
                      type="button"
                      className="mps-hot"
                      aria-label="Escuchar la palabra"
                      style={{
                        left: (1170 - band.x0) * sc,
                        top: 0,
                        width: 270 * sc,
                        height: 200 * sc,
                        borderRadius: "50%",
                      }}
                      onClick={sunPress}
                    />
                    <button
                      type="button"
                      className={`mps-hot mps-can${pour ? " mps-pour" : ""}`}
                      aria-label="Próxima palabra"
                      style={{
                        left: (1229 - band.x0) * sc,
                        top: 495 * sc,
                        width: 255 * sc,
                        height: 119 * sc,
                      }}
                      onClick={skip}
                    />
                  </>
                )}
              </div>
            );
          })}
          <div className="mps-pbar">
            <div className="mps-ptoast">{status}</div>
            {slotsEl(0.55, { position: "relative", gap: 8 })}
            {wordBtn(0.42, { position: "relative", width: 128, height: 48 })}
          </div>
          <button type="button" className="mps-helpbar" onClick={() => setSheet(true)}>
            Instrucciones
          </button>
        </div>
      )}

      {sheet && (
        <div
          className="mps-sheet"
          role="dialog"
          aria-label="Instrucciones"
          onClick={() => setSheet(false)}
        >
          <img src={`${ART}/panel-left.webp`} alt="Instrucciones 1 a 3" draggable={false} />
          <img src={`${ART}/panel-right.webp`} alt="Instrucciones 4 a 8" draggable={false} />
          <button
            type="button"
            className="mps-close"
            aria-label="Cerrar"
            onClick={() => setSheet(false)}
          >
            ×
          </button>
        </div>
      )}
      {doneEl}
    </div>
  );
}
