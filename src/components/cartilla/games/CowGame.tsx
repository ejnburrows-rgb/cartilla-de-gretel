import { useCallback, useEffect, useRef, useState } from "react";
import {
  COW_SLOTS,
  COW_SYLLABLES,
  TARGET_WORD,
  isCorrectWindow,
  isNextSyllable,
  wordDisplay,
  type Stage,
} from "@/lib/games/cow-game-logic";
import "@/styles/cow-game.css";

const ART = "/cartilla/art/games/cow/";
type Box = { x: number; y: number; w: number; h: number };
type Layout = {
  W: number;
  H: number;
  /** y where the bottom of a parked cow's hanging sign rests, just above the fence word */
  signY: number;
  fenceTop: number;
  scene: string;
  fence: string;
  cowW: number;
  homeW: number[];
  home: { x: number; y: number }[];
  slots: Box[];
  title: Box;
  homeBtn: Box;
  settingsBtn: Box;
  banner: Box;
};
const COW_ASPECT = 518 / 453;
// Sign geometry inside the cow box (head facing left): centre x and bottom y as fractions.
const SIGN_CX = 0.34;
const SIGN_W = 0.52;
const SIGN_BOTTOM = 0.47 + (SIGN_W * 130) / 136 / COW_ASPECT;

const LAND: Layout = {
  W: 1238,
  H: 928,
  signY: 676,
  fenceTop: 634,
  scene: "scene-low.webp",
  fence: "fence-low.webp",
  cowW: 220,
  // Waiting cows stand far off on the hill (small = distant), in the gaps between
  // the heads of cows parked at the fence, so they stay visible and tappable.
  homeW: [110, 110, 110, 110, 110],
  home: [
    { x: 550, y: 359 },
    { x: 685, y: 359 },
    { x: 820, y: 359 },
    { x: 280, y: 359 },
    { x: 415, y: 359 },
  ],
  slots: [
    { x: 85, y: 685, w: 144, h: 60 },
    { x: 313, y: 685, w: 148, h: 60 },
    { x: 543, y: 685, w: 149, h: 60 },
    { x: 776, y: 685, w: 149, h: 60 },
    { x: 1008, y: 685, w: 147, h: 60 },
  ],
  title: { x: 410, y: 14, w: 581, h: 127 },
  homeBtn: { x: 1029, y: 25, w: 88, h: 88 },
  settingsBtn: { x: 1123, y: 25, w: 88, h: 88 },
  banner: { x: 600, y: 150, w: 300, h: 150 },
};

const PORT: Layout = {
  W: 852,
  H: 1846,
  signY: 1305,
  fenceTop: 1271,
  scene: "portrait-scene-low.webp",
  fence: "portrait-fence-low.webp",
  cowW: 160,
  // One row across the meadow, as big as the width allows; feet stay above the
  // heads of cows parked at the fence (which start at y ≈ 1139), so nothing overlaps.
  homeW: [164, 164, 164, 164, 164],
  home: [
    { x: 4, y: 944 },
    { x: 172, y: 944 },
    { x: 340, y: 944 },
    { x: 508, y: 944 },
    { x: 676, y: 944 },
  ],
  slots: [
    { x: 50, y: 1316, w: 108, h: 60 },
    { x: 212, y: 1316, w: 106, h: 60 },
    { x: 372, y: 1316, w: 108, h: 60 },
    { x: 534, y: 1316, w: 106, h: 60 },
    { x: 695, y: 1316, w: 105, h: 60 },
  ],
  title: { x: 20, y: 24, w: 540, h: 118 },
  homeBtn: { x: 590, y: 36, w: 104, h: 104 },
  settingsBtn: { x: 712, y: 36, w: 104, h: 104 },
  banner: { x: 196, y: 200, w: 460, h: 260 },
};

type Phase = "walk" | "settle" | "lift" | "judge" | "lower" | "back";
type Trip = { cow: number; slot: number; phase: Phase; right: boolean };

// Only the mamá recording exists in the approved library; the repo's feedback mp3s
// are empty stubs. Feedback tones and the moo are synthesized placeholders (never
// a voice) until real recordings are supplied.
type Sound = "tap" | "right" | "wrong" | "done" | "word" | "mooHappy" | "mooSad" | "mooWalk";
const TONES: Record<"tap" | "right" | "wrong" | "done", [number, number][]> = {
  tap: [[660, 0.07]],
  right: [[523, 0.12], [659, 0.12], [784, 0.22]],
  wrong: [[392, 0.16], [330, 0.24]],
  done: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.3]],
};

function logPlayed(s: string) {
  const w = window as unknown as { __cowAudio?: string[] };
  (w.__cowAudio ??= []).push(s);
}

function moo(c: AudioContext, from: number, to: number, dur: number) {
  const t = c.currentTime + 0.02;
  const o = c.createOscillator();
  const vib = c.createOscillator();
  const vibG = c.createGain();
  const f = c.createBiquadFilter();
  const g = c.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(from, t);
  o.frequency.linearRampToValueAtTime(from * 1.08, t + dur * 0.25);
  o.frequency.linearRampToValueAtTime(to, t + dur);
  vib.frequency.value = 5;
  vibG.gain.value = 2.5;
  vib.connect(vibG).connect(o.frequency);
  f.type = "lowpass";
  f.frequency.setValueAtTime(350, t);
  f.frequency.linearRampToValueAtTime(900, t + dur * 0.3);
  f.frequency.linearRampToValueAtTime(400, t + dur);
  f.Q.value = 6;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35, t + 0.12);
  g.gain.setValueAtTime(0.3, t + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f).connect(g).connect(c.destination);
  o.start(t);
  vib.start(t);
  o.stop(t + dur + 0.05);
  vib.stop(t + dur + 0.05);
}

function useSound(muted: boolean) {
  const ctx = useRef<AudioContext | null>(null);
  const voice = useRef<HTMLAudioElement | null>(null);
  return useCallback(
    (s: Sound) => {
      if (muted || typeof window === "undefined") return;
      if (s === "word") {
        voice.current ??= new Audio("/audio/voz/vocabulario/mam%C3%A1.mp3");
        const a = voice.current;
        a.pause();
        a.currentTime = 0;
        a.play().then(() => logPlayed("word:mamá.mp3")).catch(() => {});
        return;
      }
      ctx.current ??= new AudioContext();
      const c = ctx.current;
      void c.resume();
      if (s === "mooHappy") moo(c, 125, 150, 1.1);
      else if (s === "mooSad") moo(c, 120, 85, 1.2);
      else if (s === "mooWalk") moo(c, 115, 105, 0.9);
      else {
        let t = c.currentTime + 0.01;
        for (const [fr, d] of TONES[s]) {
          const o = c.createOscillator();
          const g = c.createGain();
          o.frequency.value = fr;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + d);
          o.connect(g).connect(c.destination);
          o.start(t);
          o.stop(t + d + 0.02);
          t += d * 0.85;
        }
      }
      logPlayed(`${s}:${c.state}`);
    },
    [muted],
  );
}

const LEGS = ["leg-a", "leg-c", "leg-b", "leg-d"];

/** Rope collar over the neck, drawn in the cow drawing's own 453x518 space. */
function Collar() {
  return (
    <svg className="cg-p cg-collar" viewBox="0 0 453 518" aria-hidden>
      <path d="M118 236 Q150 300 196 226" className="cg-rope" />
    </svg>
  );
}

/** The hanging word sign: two ropes from the collar and the board, swinging from the neck. */
function Sign({ syllable, left, ok }: { syllable: string; left: string; ok: boolean }) {
  return (
    <span className={`cg-sign ${ok ? "cg-sign-ok" : ""}`} style={{ left }}>
      <svg viewBox="0 0 136 130" className="cg-sign-svg" aria-hidden>
        <path d="M44 0 L24 56 M92 0 L112 56" className="cg-rope" />
        <rect x="4" y="54" width="128" height="74" rx="8" className="cg-board" />
        <circle cx="16" cy="66" r="3.5" className="cg-nail" />
        <circle cx="120" cy="66" r="3.5" className="cg-nail" />
        <circle cx="16" cy="116" r="3.5" className="cg-nail" />
        <circle cx="120" cy="116" r="3.5" className="cg-nail" />
      </svg>
      <span className="cg-sign-text">{syllable}</span>
    </span>
  );
}

function CowArt({ blinkDelay }: { blinkDelay: number }) {
  return (
    <span className="cg-sprite">
      <img src={`${ART}open-tail.png`} alt="" className="cg-p cg-tail" draggable={false} />
      {LEGS.slice(0, 2).map((l) => (
        <img key={l} src={`${ART}open-${l}.png`} alt="" className={`cg-p cg-${l}`} draggable={false} />
      ))}
      <img src={`${ART}open-body.png`} alt="" className="cg-p cg-body" draggable={false} />
      {LEGS.slice(2).map((l) => (
        <img key={l} src={`${ART}open-${l}.png`} alt="" className={`cg-p cg-${l}`} draggable={false} />
      ))}
      <span className="cg-p cg-headgroup">
        <img src={`${ART}open-head.png`} alt="" className="cg-p" draggable={false} />
        <img src={`${ART}ear-l.webp`} alt="" className="cg-p cg-ear-l" draggable={false} />
        <img src={`${ART}ear-r.webp`} alt="" className="cg-p cg-ear-r" draggable={false} />
        <span className="cg-p cg-lids" style={{ animationDelay: `${blinkDelay}s` }}>
          <img src={`${ART}lid-l.webp`} alt="" className="cg-p" draggable={false} />
          <img src={`${ART}lid-r.webp`} alt="" className="cg-p" draggable={false} />
        </span>
        <Collar />
      </span>
    </span>
  );
}

// `content` is accepted so existing callers keep compiling; the game's words live in cow-game-logic.
export function CowGame(_props: { content?: unknown } = {}) {
  const [portrait, setPortrait] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const on = () => setPortrait(window.innerWidth / window.innerHeight < 0.9);
    on();
    window.addEventListener("resize", on);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("resize", on);
      mq.removeEventListener("change", onMq);
    };
  }, []);
  const L = portrait ? PORT : LAND;
  const WALK = reduced ? 450 : 2600;

  const [stage, setStage] = useState<Stage>("match");
  // cow index -> slot it stays at after a right answer
  const [parked, setParked] = useState<Record<number, number>>({});
  const [built, setBuilt] = useState<string[]>([]);
  const [selCow, setSelCow] = useState<number | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [nodCow, setNodCow] = useState<number | null>(null);
  const [face, setFace] = useState<number[]>(() => COW_SYLLABLES.map(() => 1));
  const [banner, setBanner] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(false);
  const [menu, setMenu] = useState(false);
  const play = useSound(muted);

  const timers = useRef<number[]>([]);
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const cowH = L.cowW * COW_ASPECT;
  const homeBox = (i: number): Box => ({ ...L.home[i]!, w: L.homeW[i]!, h: L.homeW[i]! * COW_ASPECT });
  // Standing on the grass behind the fence; sign centre over the fence word, sign bottom at signY.
  const fenceBox = (slot: number): Box => {
    const s = L.slots[slot]!;
    return { x: s.x + s.w / 2 - L.cowW * SIGN_CX, y: L.signY - cowH * SIGN_BOTTOM, w: L.cowW, h: cowH };
  };

  const slotTaken = (slot: number) => Object.values(parked).includes(slot);

  const send = (cow: number, slot: number) => {
    if (trip || stage !== "match" || parked[cow] !== undefined || slotTaken(slot)) return;
    const right = isCorrectWindow(cow, slot);
    setSelCow(null);
    setMessage("");
    setBanner(null);
    const goingRight = fenceBox(slot).x > L.home[cow]!.x;
    setFace((f) => f.map((v, i) => (i === cow ? (goingRight ? -1 : 1) : v)));
    setTrip({ cow, slot, phase: "walk", right });
    play("mooWalk");
    const step = (phase: Phase) => setTrip({ cow, slot, phase, right });
    later(WALK, () => {
      setFace((f) => f.map((v, i) => (i === cow ? 1 : v)));
      step("settle");
      later(450, () => {
        step("lift");
        later(900, () => {
          step("judge");
          if (right) {
            play("mooHappy");
            later(900, () => play("right"));
            setBanner(COW_SYLLABLES[cow]!);
            setParked((p) => ({ ...p, [cow]: slot }));
            later(1500, () => setTrip(null));
          } else {
            play("mooSad");
            later(300, () => play("wrong"));
            setMessage("Casi… inténtalo otra vez");
            later(1500, () => {
              step("lower");
              later(700, () => {
                setFace((f) => f.map((v, i) => (i === cow ? (goingRight ? 1 : -1) : v)));
                step("back");
                later(WALK, () => {
                  setFace((f) => f.map((v, i) => (i === cow ? 1 : v)));
                  setTrip(null);
                  setMessage("");
                });
              });
            });
          }
        });
      });
    });
  };

  // Word building: the same parked cow is reused for repeated syllables (ma + ma).
  const buildWith = (cow: number) => {
    if (trip || nodCow !== null || stage !== "build") return;
    setNodCow(cow);
    later(700, () => setNodCow(null));
    const slot = parked[cow]!;
    if (isNextSyllable(built, cow, slot)) {
      const nb = [...built, COW_SYLLABLES[cow]!];
      setBuilt(nb);
      setBanner(COW_SYLLABLES[cow]!);
      play("mooHappy");
      if (nb.length === TARGET_WORD.syllables.length) later(1000, () => play("word"));
    } else {
      play("mooSad");
      setMessage(`Busca la vaca ${TARGET_WORD.syllables[built.length]}`);
    }
  };

  useEffect(() => {
    if (trip) return;
    if (stage === "match" && Object.keys(parked).length === COW_SLOTS.length) {
      setStage("build");
      setBuilt([]);
      setBanner(null);
      setMessage(`Ahora forma la palabra: toca ${TARGET_WORD.syllables.join(" + ")}`);
    } else if (stage === "build" && built.length === TARGET_WORD.syllables.length) {
      const id = window.setTimeout(() => {
        setStage("done");
        setMessage("");
        play("done");
      }, 2200);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [trip, stage, parked, built, play]);

  const reset = () => {
    clearTimers();
    setStage("match");
    setParked({});
    setBuilt([]);
    setTrip(null);
    setNodCow(null);
    setSelCow(null);
    setBanner(null);
    setMessage("");
    setFace(COW_SYLLABLES.map(() => 1));
    setMenu(false);
  };

  const tapCow = (i: number) => {
    if (trip || stage === "done") return;
    if (parked[i] !== undefined) return buildWith(i);
    if (stage !== "match") return;
    if (selCow !== i) play("tap");
    setSelCow((c) => (c === i ? null : i));
  };
  const tapSlot = (s: number) => {
    if (trip) return;
    const owner = Object.entries(parked).find(([, sl]) => sl === s);
    if (owner) return buildWith(Number(owner[0]));
    if (selCow === null) {
      setMessage("Primero toca una vaca");
      return;
    }
    send(selCow, s);
  };

  const px = (x: number) => `${(x / L.W) * 100}%`;
  const py = (y: number) => `${(y / L.H) * 100}%`;
  const pct = (b: Box) => ({ left: px(b.x), top: py(b.y), width: px(b.w), height: py(b.h) });
  const zoomed = !reduced && !!trip && (trip.phase === "lift" || trip.phase === "judge");
  const zs = trip ? L.slots[trip.slot]! : L.slots[2]!;
  const zoomOrigin = `${px(zs.x + zs.w / 2)} ${py(zs.y - 40)}`;
  const wordLine = stage === "match" ? "" : wordDisplay(built);

  return (
    <main className={`cg-root ${reduced ? "cg-reduced" : ""}`} aria-label="Juego de las vacas">
      <img className="cg-backdrop" src={`${ART}${L.scene}`} alt="" />
      <div
        className="cg-stage"
        style={{ width: `min(100vw, calc(100dvh * ${L.W} / ${L.H}))`, aspectRatio: `${L.W}/${L.H}` }}
      >
        <div className={`cg-zoom ${zoomed ? "cg-zoomed" : ""}`} style={{ transformOrigin: zoomOrigin }}>
        <img className="cg-scene" src={`${ART}${L.scene}`} alt="" draggable={false} />
        </div>

        <h1 className="sr-only">Coloca cada vaca en su sílaba</h1>
        <div className="cg-abs" style={pct(L.title)}>
          <img className="cg-fill" src={`${ART}ui-title.webp`} alt="" draggable={false} />
          <button
            type="button"
            className="cg-hit"
            style={{ left: "1%", top: "6%", width: "17%", height: "88%" }}
            aria-label={muted ? "Activar sonido" : "Silenciar"}
            aria-pressed={!muted}
            onClick={() => setMuted((m) => !m)}
          >
            {muted && <span className="cg-muted-x" aria-hidden>✕</span>}
          </button>
        </div>
        <a href="/" aria-label="Inicio" className="cg-abs cg-btn" style={pct(L.homeBtn)}>
          <img className="cg-fill" src={`${ART}ui-home.webp`} alt="" draggable={false} />
        </a>
        <button
          type="button"
          aria-label="Ajustes"
          aria-expanded={menu}
          className="cg-abs cg-btn"
          style={pct(L.settingsBtn)}
          onClick={() => setMenu((m) => !m)}
        >
          <img className="cg-fill" src={`${ART}ui-settings.webp`} alt="" draggable={false} />
        </button>
        {menu && (
          <div className="cg-menu" role="group" aria-label="Ajustes">
            <button type="button" onClick={() => setMuted((m) => !m)} aria-pressed={muted}>
              Sonido: {muted ? "apagado" : "encendido"}
            </button>
            <button type="button" onClick={reset}>Empezar de nuevo</button>
          </div>
        )}

        <div className="cg-abs cg-banner" style={pct(L.banner)} aria-live="polite">
          {banner && <span key={`${banner}-${built.length}-${Object.keys(parked).length}`} className="cg-syl">{banner}</span>}
          {wordLine && <span className={`cg-word ${stage === "done" ? "cg-word-done" : ""}`}>{wordLine}</span>}
        </div>

        <div className={`cg-zoom ${zoomed ? "cg-zoomed" : ""}`} style={{ transformOrigin: zoomOrigin }}>
        {COW_SYLLABLES.map((syl, i) => {
          const t = trip?.cow === i ? trip : null;
          const isParked = parked[i] !== undefined && !t;
          const slot = t ? t.slot : parked[i];
          const atFence = isParked || (t && t.phase !== "back");
          const box = atFence && slot !== undefined ? fenceBox(slot) : homeBox(i);
          const walking = t && (t.phase === "walk" || t.phase === "back");
          const headUp = isParked || (t && (t.phase === "lift" || t.phase === "judge"));
          // Waiting cows always draw above the cows at the fence so a child can always see them.
          const z = atFence ? 12 : 20 + Math.round(L.home[i]!.y / 100);
          const signLeft = `${((face[i] === 1 ? SIGN_CX : 1 - SIGN_CX) - SIGN_W / 2) * 100}%`;
          const ok = isParked || (t?.phase === "judge" && t.right);
          return (
            <button
              key={syl}
              type="button"
              aria-label={`Vaca ${syl}`}
              aria-pressed={selCow === i}
              data-phase={t?.phase ?? (isParked ? "parked" : "home")}
              onClick={() => tapCow(i)}
              className={`cg-cow ${walking ? "cg-walking" : ""} ${t?.phase === "settle" ? "cg-settling" : ""} ${headUp ? "cg-head-up" : ""} ${nodCow === i ? "cg-nodding" : ""} ${selCow === i ? "cg-selected" : ""} ${isParked && stage === "match" ? "cg-inert" : ""}`}
              style={{ ...pct(box), zIndex: z, transitionDuration: walking ? `${WALK}ms` : "0ms" }}
            >
              <span className="cg-flip" style={{ transform: `scaleX(${face[i]})` }}>
                <CowArt blinkDelay={i * 1.3} />
              </span>
              <Sign syllable={syl} left={signLeft} ok={!!ok} />
              <span className="cg-hit" aria-hidden="true" />
            </button>
          );
        })}

        <img
          className="cg-fence"
          src={`${ART}${L.fence}`}
          alt=""
          draggable={false}
          style={{ top: py(L.fenceTop), height: py(L.H - L.fenceTop) }}
        />

        {L.slots.map((b, s) => (
          <button
            key={COW_SLOTS[s]}
            type="button"
            aria-label={`Ventana ${COW_SLOTS[s]}`}
            className={`cg-abs cg-slot ${selCow !== null && !slotTaken(s) ? "cg-slot-ready" : ""}`}
            onClick={() => tapSlot(s)}
            style={pct({ x: b.x - 6, y: b.y - 6, w: b.w + 12, h: b.h + 12 })}
          />
        ))}
        </div>

        <div className="cg-msg" role="status">{message}</div>

        {stage === "done" && (
          <div className="cg-done" role="dialog" aria-label="Juego completado">
            <p>¡Muy bien! {TARGET_WORD.written}</p>
            <button type="button" onClick={() => play("word")}>Escuchar</button>
            <button type="button" onClick={reset}>Jugar otra vez</button>
          </div>
        )}
      </div>
    </main>
  );
}
