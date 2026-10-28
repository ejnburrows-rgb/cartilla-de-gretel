// MariposasScene.tsx - full-screen Mariposas game built from the owner-approved mockup.
// All art is cut from that mockup (public/cartilla/art/mariposas-scene); nothing is generated.
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { GameContent } from "@/lib/games/gameContent";
import { playInstruction, playWord } from "@/lib/games/wordAudio";
import { recordEvent } from "@/lib/student-session";
import { SCENE_H, SCENE_W, SLOTS, type Slot, type Tone } from "./layout";
import "./mariposas.css";

const SFX = {
  pick: "/audio/feel/tap.mp3",
  ok: "/audio/feel/success.mp3",
  no: "/audio/feel/error.mp3",
  party: "/audio/feel/sparkle.mp3",
} as const;

function sfx(name: keyof typeof SFX, volume = 0.5) {
  if (typeof window === "undefined" || typeof Audio === "undefined") return;
  try {
    const a = new Audio(SFX[name]);
    a.volume = volume;
    a.play().catch(() => {});
  } catch {
    /* no audio support */
  }
}

// Horizontal centre of each butterfly's head in the mockup (px): wings sit left of it.
const HEAD_CX: Record<string, number> = {
  ma: 385,
  mo: 732,
  mi: 1052,
  Mu: 557,
  pa: 797,
  po: 1055,
  me: 277,
  Pe: 610,
  pi: 932,
  Pu: 1285,
};

const MUSIC = "/cartilla/audio/mariposas-once-upon-a-time.mp3"; // CC0, Chasersgaming, opengameart.org/content/once-upon-a-time-loop
const MUTE_KEY = "cartilla:mariposas:muted";

// Leaf regions cut from the scene (px of the mockup) that sway softly.
const LEAVES = [
  { x: 0, y: 0, w: 620, h: 70, origin: "20% 0%", dur: 7.5, d: 0 },
  { x: 462, y: 92, w: 146, h: 110, origin: "50% 0%", dur: 6.2, d: -2 },
  { x: 1100, y: 185, w: 255, h: 130, origin: "50% 100%", dur: 8.4, d: -4 },
  { x: 1420, y: 262, w: 64, h: 228, origin: "50% 0%", dur: 6.8, d: -1 },
];

type Flight = { id: string; dx: number; dy: number; phase: "out" | "back"; ok: boolean };
type Fx = { x: number; y: number; kind: "ok" | "no"; key: number };

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

function wingSplit(s: Slot): number {
  const f = (HEAD_CX[s.id] - s.x) / s.w - 0.12;
  return Math.min(0.7, Math.max(0.3, f));
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

export function MariposasScene({ content }: { content: GameContent }) {
  const { mode, vw, vh } = useMode();
  const [wordIndex, setWordIndex] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [score, setScore] = useState(0);
  const [hop, setHop] = useState<string | null>(null);
  const [pour, setPour] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [chipGone, setChipGone] = useState(false);
  const [returned, setReturned] = useState<string | null>(null);
  const [rejected, setRejected] = useState<{ i: number; tile: string } | null>(null);
  const [fx, setFx] = useState<Fx | null>(null);
  const [muted, setMuted] = useState(() => {
    try {
      return window.localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(
    () => () => {
      clearTimers();
      musicRef.current?.pause();
      musicRef.current = null;
    },
    [],
  );
  const startMusic = () => {
    if (musicRef.current || typeof Audio === "undefined") return;
    try {
      const a = new Audio(MUSIC);
      a.loop = true;
      a.volume = 0.22;
      a.muted = muted;
      musicRef.current = a;
      a.play().catch(() => {});
    } catch {
      /* no audio support */
    }
  };
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (musicRef.current) musicRef.current.muted = next;
    else if (!next) startMusic();
    try {
      window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

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
    clearTimers();
    setWordIndex(0);
    setPicked([]);
    setFeedback(null);
    setScore(0);
  };

  const choose = (tile: string, id: string, btn: HTMLElement) => {
    if (feedback || flight || done) return;
    const slotIdx = picked.length;
    const ok = lower(tile) === lower(word.syllables[slotIdx] ?? "");
    const complete = ok && slotIdx + 1 === word.syllables.length;
    const slotEl = rootRef.current?.querySelector(`[data-slot="${slotIdx}"]`);
    const chipEl = btn.querySelector(".mps-chip");
    let dx = 0;
    let dy = 0;
    let fxPos = { x: 0, y: 0 };
    if (slotEl && chipEl) {
      const sr = slotEl.getBoundingClientRect();
      const cr = chipEl.getBoundingClientRect();
      const sx = sr.left + sr.width / 2;
      const sy = sr.top + sr.height / 2;
      dx = (sx - (cr.left + cr.width / 2)) / k;
      dy = (sy - (cr.top + cr.height / 2)) / k;
      fxPos = { x: sx, y: sy };
    }
    sfx("pick", 0.4);
    setChipGone(false);
    setFlight({ id, dx, dy, phase: "out", ok });
    later(() => {
      setFx({ ...fxPos, kind: ok ? "ok" : "no", key: Date.now() });
      if (ok) {
        sfx("ok", 0.5);
        setPicked((p) => [...p, tile]);
        setChipGone(true);
        if (complete) setFeedback("ok");
      } else {
        sfx("no", 0.45);
        setRejected({ i: slotIdx, tile });
        setFeedback("no");
      }
    }, 760);
    later(() => {
      setRejected(null);
      if (!ok) setFeedback(null);
      setFlight((f) => (f ? { ...f, phase: "back" } : f));
    }, 1250);
    later(() => {
      setFlight(null);
      setChipGone(false);
      setReturned(id);
      later(() => setReturned(null), 700);
      if (complete) {
        const total = words.length;
        const nextScore = score + 1;
        setScore(nextScore);
        if (wordIndex + 1 === total) {
          finish(content, nextScore, total);
          sfx("party", 0.5);
        }
        later(goNext, 500);
      }
    }, 2100);
  };

  const unpick = (i: number) => {
    if (feedback || flight || done) return;
    setPicked((p) => p.slice(0, i));
  };

  const skip = () => {
    if (feedback || flight || done) return;
    setPour(true);
    later(() => setPour(false), 700);
    later(goNext, 450);
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
  ) => {
    const flying = flight?.id === s.id;
    const vars = {
      "--dx": `${flight?.dx ?? 0}px`,
      "--dy": `${flight?.dy ?? 0}px`,
      "--fx": `${6 + (i % 3) * 3}px`,
      "--fy": `${7 + (i % 4) * 2}px`,
    } as CSSProperties;
    return (
      <div
        key={s.id}
        className={`mps-fl${flying ? ` mps-flying mps-fl-${flight?.phase}` : ""}`}
        style={{ left: pos.sx, top: pos.sy, width: s.w * pos.z, height: s.h * pos.z, ...vars }}
      >
        <button
          type="button"
          aria-label={tile}
          className="mps-bf"
          style={{
            animationDelay: `${-(i * 0.73) % 5}s`,
            animationDuration: `${4.6 + (i % 4) * 0.7}s`,
          }}
          onClick={(e) => choose(tile, s.id, e.currentTarget)}
        >
          <img
            src={`${ART}/${s.sprite}`}
            alt=""
            draggable={false}
            style={{ width: "100%", height: "100%" }}
          />
          <img
            className="mps-wing"
            src={`${ART}/${s.sprite}`}
            alt=""
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              clipPath: `inset(0 ${100 - wingSplit(s) * 100}% 0 0)`,
              transformOrigin: `${wingSplit(s) * 100}% 62%`,
              animationDelay: `${-(i * 0.37) % 1.4}s`,
            }}
          />
          <span
            className={`mps-chip mps-${s.tone}${flying && chipGone ? " mps-chip-gone" : ""}${returned === s.id ? " mps-chip-in" : ""}`}
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
      </div>
    );
  };

  const slotsEl = (sc: number, style: CSSProperties) => (
    <div className="mps-slots" style={style}>
      {Array.from({ length: slotCount }).map((_, i) => {
        const rej = rejected?.i === i ? rejected.tile : undefined;
        const filled = rej ?? picked[i];
        return (
          <button
            key={i}
            type="button"
            aria-label={filled ? `Sílaba ${i + 1}: ${filled}` : `Espacio ${i + 1}`}
            data-slot={i}
            className={`mps-slot${filled ? ` mps-filled mps-${rej ? "no" : slotState}` : ""}${!rej && picked[i] && fx?.kind === "ok" && picked.length === i + 1 ? " mps-pop" : ""}`}
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
      {SLOTS.map((b, i) => (
        <img
          key={b.id}
          className="mps-fly"
          src={`${ART}/${b.sprite}`}
          alt=""
          draggable={false}
          style={{
            left: `${6 + i * 9.5}%`,
            width: 80 + (i % 3) * 18,
            animationDelay: `${i * 0.28}s`,
            animationDuration: `${4.2 + (i % 4) * 0.5}s`,
          }}
        />
      ))}
    </div>
  );

  const leafEls = (sc: number, x0: number, x1: number, keyPrefix: string) =>
    LEAVES.filter((l) => l.x >= x0 && l.x + l.w <= x1).map((l, n) => (
      <div
        key={`${keyPrefix}${n}`}
        className="mps-leaf"
        aria-hidden
        style={{
          left: (l.x - x0) * sc,
          top: l.y * sc,
          width: l.w * sc,
          height: l.h * sc,
          backgroundImage: `url(${ART}/scene.webp)`,
          backgroundSize: `${SCENE_W * sc}px ${SCENE_H * sc}px`,
          backgroundPosition: `${-l.x * sc}px ${-l.y * sc}px`,
          transformOrigin: l.origin,
          animationDuration: `${l.dur}s`,
          animationDelay: `${l.d}s`,
        }}
      />
    ));

  return (
    <div
      ref={rootRef}
      className="mps-root"
      aria-label="Mariposas"
      onPointerDown={startMusic}
      data-mode={mode}
      data-testid="mariposas-scene"
    >
      <button
        type="button"
        className={`mps-mute mps-mute-${mode}${muted ? " mps-muted" : ""}`}
        aria-label={muted ? "Activar música" : "Silenciar música"}
        aria-pressed={muted}
        onClick={toggleMute}
      >
        ♪
      </button>
      {fx && (
        <div
          key={fx.key}
          className={`mps-fx mps-fx-${fx.kind}`}
          style={{ left: fx.x, top: fx.y }}
          aria-hidden
        >
          <b />
          {Array.from({ length: 12 }).map((_, n) => (
            <i
              key={n}
              style={{ "--a": `${n * 30}deg`, "--r": `${46 + (n % 3) * 14}px` } as CSSProperties}
            />
          ))}
        </div>
      )}
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
          {leafEls(1, 0, SCENE_W, "w")}
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
                {leafEls(sc, band.x0, band.x1, `p${bi}`)}
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
