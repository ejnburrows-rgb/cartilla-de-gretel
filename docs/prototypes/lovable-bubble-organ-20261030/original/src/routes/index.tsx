import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { RotateCcw, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import bookSpread from "@/assets/book-spread-noblue.png";
import gretelImg from "@/assets/gretel-bubble.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Órgano de burbujas · Mm" },
      { name: "description", content: "Toca los tubos ma, me, mi, mo, mu y forma la palabra mamá con burbujas." },
      { property: "og:title", content: "Órgano de burbujas · Mm" },
      { property: "og:description", content: "Actividad interactiva de lectura: forma mamá con burbujas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PIPE_X: readonly number[] & { 0: number } = [30.6, 37.4, 44.3, 51.3, 58.5];
const SYL = ["ma", "me", "mi", "mo", "mu"] as const;
const PIPE_Y = 56;
const CX = 44.5;
const CY = 30;

type Bubble = {
  id: number;
  text: string;
  x: number;
  y: number;
  size: number;
  grown: boolean;
  wob: boolean;
  pop: boolean;
  fade: boolean;
  big?: boolean;
};
type Spark = { id: number; x: number; y: number; dots: { x: number; y: number }[] };

// ---------- bubble pop sound (synthesised with Web Audio, no audio files) ----------
let audioCtx: AudioContext | null = null;
let out: GainNode | null = null;

function ensureAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const AC = w.AudioContext ?? w.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
      out = audioCtx.createGain();
      out.gain.value = 0.5;
      out.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function popSound(size: number) {
  const ctx = ensureAudio();
  if (!ctx || !out) return;
  const t = ctx.currentTime;
  const big = size >= 11;
  const f0 = (big ? 420 : 620) + Math.random() * 180;

  // the "bloop": a sine that drops fast and decays
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(f0 * 0.25, t + (big ? 0.16 : 0.09));
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(big ? 0.5 : 0.35, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (big ? 0.3 : 0.18));
  osc.connect(g);
  g.connect(out);
  osc.start(t);
  osc.stop(t + (big ? 0.35 : 0.22));

  // the wet "tick" on top
  const dur = 0.05;
  const len = Math.max(1, Math.ceil(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = big ? 900 : 1900;
  bp.Q.value = 0.9;
  const ng = ctx.createGain();
  ng.gain.value = big ? 0.18 : 0.28;
  src.connect(bp);
  bp.connect(ng);
  ng.connect(out);
  src.start(t);
}

// pipe tap: a short soft "toot", clearly different from a pop
function blowSound() {
  const ctx = ensureAudio();
  if (!ctx || !out) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  osc.type = "triangle";
  const f0 = 300 + Math.random() * 60;
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(f0 * 1.6, t + 0.07);
  lp.type = "lowpass";
  lp.frequency.value = 1400;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(lp);
  lp.connect(g);
  g.connect(out);
  osc.start(t);
  osc.stop(t + 0.2);
}

// merge: a rising chime with a high shimmer; more notes = richer
function mergeSound(notes = 3) {
  const ctx = ensureAudio();
  if (!ctx || !out) return;
  const t = ctx.currentTime;
  const base = 392;
  const scale = [1, 1.25, 1.5, 2, 2.5];
  for (let i = 0; i < notes; i++) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.setValueAtTime(base * (scale[i] ?? 2), t + i * 0.09);
    g.gain.setValueAtTime(0.0001, t + i * 0.09);
    g.gain.exponentialRampToValueAtTime(0.28 / (i + 1) + 0.1, t + i * 0.09 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.7);
    osc.connect(g);
    g.connect(out);
    osc.start(t + i * 0.09);
    osc.stop(t + i * 0.09 + 0.8);
  }
  const dur = 0.5;
  const len = Math.max(1, Math.ceil(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 3000;
  const ng = ctx.createGain();
  ng.gain.value = 0.12;
  src.connect(hp);
  hp.connect(ng);
  ng.connect(out);
  src.start(t);
}

function say(t: string) {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "es-ES";
    u.rate = 0.75;
    window.speechSynthesis.speak(u);
  } catch {
    /* speech not available */
  }
}

export function Index() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [blowing, setBlowing] = useState<number | null>(null);
  const [canRepeat, setCanRepeat] = useState(false);
  const [wordFormed, setWordFormed] = useState(false);
  const [gretelPerked, setGretelPerked] = useState(false);
  const perkTimer = useRef<number | null>(null);
  const liveIds = useRef(new Set<number>());
  const nextId = useRef(1);
  const busy = useRef(false);
  const maWait = useRef<{ id: number; x: number; y: number } | null>(null);
  const timers = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const patch = useCallback((id: number, p: Partial<Bubble>) => {
    setBubbles((bs) => bs.map((b) => (b.id === id ? { ...b, ...p } : b)));
  }, []);
  const remove = useCallback((ids: number[]) => {
    ids.forEach((id) => liveIds.current.delete(id));
    setBubbles((bs) => bs.filter((b) => !ids.includes(b.id)));
  }, []);

  const spawn = useCallback(
    (text: string, x: number, y: number, size: number, big = false) => {
      const id = nextId.current++;
      liveIds.current.add(id);
      setBubbles((bs) => [...bs, { id, text, x, y, size, grown: false, wob: false, pop: false, fade: false, big }]);
      requestAnimationFrame(() => requestAnimationFrame(() => patch(id, { grown: true })));
      return id;
    },
    [patch],
  );

  const pop = useCallback(
    (id: number, delay = 0, big = false) => {
      later(() => {
        if (!liveIds.current.has(id)) return;
        liveIds.current.delete(id);
        if (maWait.current?.id === id) maWait.current = null;
        popSound(big ? 13 : 7);
        patch(id, { wob: false, pop: true });
        later(() => remove([id]), 450);
      }, delay);
    },
    [later, patch, remove],
  );

  const sparkle = useCallback(
    (x: number, y: number) => {
      const id = nextId.current++;
      const dots = Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const r = 6 + Math.random() * 7;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
      });
      setSparks((s) => [...s, { id, x, y, dots }]);
      later(() => setSparks((s) => s.filter((k) => k.id !== id)), 1000);
    },
    [later],
  );

  const merge = useCallback(
    (a: number, b: number) => {
      if (!liveIds.current.has(a) || !liveIds.current.has(b)) {
        busy.current = false;
        return;
      }
      patch(a, { wob: false, x: CX - 5, y: CY });
      patch(b, { x: CX + 5, y: CY });
      later(() => {
        if (!liveIds.current.has(a) || !liveIds.current.has(b)) {
          busy.current = false;
          return;
        }
        patch(a, { x: CX, y: CY, fade: true });
        patch(b, { x: CX, y: CY, fade: true });
        const m = spawn("mamá", CX, CY, 13, true);
        patch(m, { wob: true });
        sparkle(CX, CY);
        mergeSound(4);
        say("mamá");
        later(() => remove([a, b]), 500);
        busy.current = false;
        setCanRepeat(true);
        setWordFormed(true);
      }, 1150);
    },
    [later, patch, remove, sparkle, spawn],
  );

  const blow = (i: number) => {
    if (busy.current) return;
    ensureAudio();
    blowSound();
    const t = SYL[i] ?? "ma";
    if (perkTimer.current !== null) window.clearTimeout(perkTimer.current);
    setGretelPerked(true);
    perkTimer.current = window.setTimeout(() => setGretelPerked(false), 380);
    timers.current.push(perkTimer.current);
    setBlowing(i);
    later(() => setBlowing(null), 150);

    if (t === "ma" && maWait.current) {
      const w = maWait.current;
      maWait.current = null;
      const b = spawn("má", PIPE_X[0], PIPE_Y, 7);
      say("má");
      later(() => patch(b, { x: w.x + 9, y: w.y }), 30);
      busy.current = true;
      later(() => merge(w.id, b), 1500);
      return;
    }
    const r = { x: 30 + Math.random() * 28, y: 16 + Math.random() * 24 };
    const b = spawn(t, PIPE_X[i] ?? 0, PIPE_Y, 7);
    say(t);
    later(() => {
      patch(b, { x: r.x, y: r.y });
      later(() => patch(b, { wob: true }), 1100);
    }, 30);
    if (t === "ma") {
      maWait.current = { id: b, ...r };
      later(() => {
        if (maWait.current?.id === b) {
          maWait.current = null;
          pop(b);
        }
      }, 9000);
    } else pop(b, 4200);
  };

  const repeat = () => {
    clear();
  };

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    liveIds.current.clear();
    setBubbles([]);
    window.speechSynthesis?.cancel();
    setSparks([]);
    maWait.current = null;
    busy.current = false;
    setCanRepeat(false);
    setWordFormed(false);
    setBlowing(null);
    setGretelPerked(false);
    perkTimer.current = null;
  };

  return (
    <main className="organ-wrap">
      <div className="organ-ctrl">
        <Button type="button" onClick={repeat} title="Otra vez"><RotateCcw />Otra vez</Button>
        <Button type="button" variant="outline" className="ghost" onClick={clear} title="Limpiar"><Eraser />Limpiar</Button>
      </div>
      <div className="organ-viewport">
      <div className="organ-page">
        <img className="organ-book" src={bookSpread} alt="Libro abierto con Mm, órgano de cinco tubos y lectura" />
        <div className={`organ-gretel${wordFormed ? " organ-gretel-cheer" : ""}`}>
          <div className={`organ-gretel-reaction${gretelPerked ? " organ-gretel-react" : ""}`}>
            <div className="organ-gretel-idle">
              <img className="organ-gretel-art" src={gretelImg} alt="Gretel con una burbuja iridiscente" />
              <span className="organ-gretel-shimmer" aria-hidden="true" />
              <span className="organ-gretel-eyelid organ-gretel-eye-left" aria-hidden="true" />
              <span className="organ-gretel-eyelid organ-gretel-eye-right" aria-hidden="true" />
            </div>
          </div>
        </div>
        <h1 className="sr-only">Mm · Órgano de burbujas</h1>
        <div className={`organ-word${wordFormed ? " formed" : ""}`} aria-hidden="true">mamá</div>
        <span className="sr-only" role="status">{canRepeat ? "mamá" : ""}</span>

        {SYL.map((t, i) => (
          <Button
            key={t}
            type="button"
            aria-label={`tubo ${t}`}
            variant="ghost"
            className={`organ-pipe${blowing === i ? " blow" : ""}`}
            style={{ left: `${PIPE_X[i]}%` }}
            onClick={() => blow(i)}
          />
        ))}

        {bubbles.map((b) => (
          <Button
            key={b.id}
            type="button"
            variant="ghost"
            aria-label={`Explotar burbuja ${b.text}`}
            onClick={() => {
              ensureAudio();
              pop(b.id, 0, b.big);
            }}
            disabled={b.pop || b.fade}
            className={`organ-bubble${b.wob ? " wob" : ""}${b.pop ? " pop" : ""}${b.big ? " big" : ""}`}
            style={
              {
                "--s": `${b.size}cqw`,
                left: `${b.x}%`,
                top: `${b.y}%`,
                opacity: b.fade ? 0 : undefined,
                ...(b.grown ? {} : { width: "1cqw", height: "1cqw" }),
              } as CSSProperties
            }
          >
            {b.text}
          </Button>
        ))}

        {sparks.map((s) => (
          <div key={s.id} className="organ-spark" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
            {s.dots.map((d, i) => (
              <i key={i} style={{ "--x": `${d.x}cqw`, "--y": `${d.y}cqw` } as CSSProperties} />
            ))}
          </div>
        ))}
      </div>
      </div>
      <div className="organ-touch-pipes">
        {SYL.map((t, i) => <Button key={t} variant="outline" aria-label={`tubo ${t}`} onClick={() => blow(i)} className={blowing === i ? "blow" : ""}>{t}</Button>)}
      </div>
      <section className="organ-mobile-reading" aria-label="Lectura">
        <div className="organ-word-grid">
          {["mamá", "mami", "Mimo", "mío", "me", "mímame", "Meme", "ama", "mía", "Mumi", "Memo", "mima", "amo", "Mimí", "ámame"].map((word) => <span key={word} className={word === "mamá" && wordFormed ? "formed" : ""}>{word}</span>)}
        </div>
        <p className="organ-conjunction">y</p>
        <div className="organ-sentences">
          {["Mi mamá me ama.", "Amo a mami. Mamá mía.", "Mamá ama a Meme y a Mimí.", "Memo ama a Mumi.", "Mamá mía ámame. Mímame a mí.", "Mi mamá me mima."].map((sentence) => <p key={sentence}>{sentence}</p>)}
        </div>
      </section>
    </main>
  );
}