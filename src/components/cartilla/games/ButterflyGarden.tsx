// Butterfly Garden (Jardín de Mariposas) — original-art game for "mariposas-p".
// Rules: src/lib/games/butterflyGarden.ts. Audio hooks: src/lib/games/butterflyGardenAudio.ts (empty by owner decision).
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { recordEvent } from "@/lib/student-session";
import garden from "@/assets/games/butterfly-garden/garden.jpg";
import grass from "@/assets/games/butterfly-garden/grass.png";
import signImg from "@/assets/games/butterfly-garden/ui_sign.jpg";
import sunImg from "@/assets/games/butterfly-garden/ui_sun.png";
import canImg from "@/assets/games/butterfly-garden/ui_can.png";
import {
  BUTTERFLIES,
  SLOT_COUNT,
  WORDS,
  checkSlots,
  isWordComplete,
  nextWordIndex,
  targetSlot,
  type Verdict,
} from "@/lib/games/butterflyGarden";
import { playFeedback, playInstructions, playWord } from "@/lib/games/butterflyGardenAudio";

const withCard = import.meta.glob("../../../assets/games/butterfly-garden/bf_*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const noCard = import.meta.glob("../../../assets/games/butterfly-garden/bt_*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const flowerImgs = import.meta.glob("../../../assets/games/butterfly-garden/fl_*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const pick = (m: Record<string, string>, suffix: string) =>
  Object.entries(m).find(([k]) => k.endsWith(suffix))?.[1] ?? "";

const ART_RATIO = 1718 / 720;
const SPRITE_RATIO = 0.78;

// art positions (garden %) of the original sun and watering can
const SUN_ART = { x: 78.5, y: 0, w: 21 };
const CAN_ART = { x: 82.5, y: 77.5, w: 17.5 };

const FLOWERS = [
  { id: "pinkdaisy", x: 17.4, y: 18.47, w: 13.97, d: 0 },
  { id: "sunflower", x: 25.09, y: 39.17, w: 13.39, d: -1.3 },
  { id: "purple", x: 9.9, y: 52.08, w: 16.3, d: -2.1 },
  { id: "whitedaisy", x: 46.16, y: 50.14, w: 13.39, d: -0.7 },
  { id: "rose", x: 61.99, y: 46.67, w: 12.22, d: -3.0 },
  { id: "tulip", x: 27.94, y: 66.94, w: 5.59, d: -1.8 },
  { id: "pinktulip", x: 73.92, y: 75.28, w: 5.59, d: -2.6 },
  { id: "orange", x: 6.69, y: 75.69, w: 8.15, d: -0.4 },
];

// portrait homes (garden-box %), staggered 3-2-3-2 below the sign/sun band
const PORTRAIT_HOMES: [number, number][] = [
  [18, 37],
  [50, 33],
  [82, 37],
  [33, 53],
  [67, 53],
  [18, 69],
  [50, 71],
  [82, 69],
  [33, 87],
  [67, 87],
];

const INSTRUCTIONS: React.ReactNode[] = [
  <>
    <b>Escucha</b> la palabra.
  </>,
  <>
    Presiona la <b>primera sílaba</b> que necesitas para formar la palabra.
  </>,
  <>
    Presiona la otra sílaba o las <b>otras sílabas</b> que forman la palabra.
  </>,
  <>
    Presiona la <b>florecita</b> donde vas a colocar la próxima sílaba.
  </>,
  <>
    Presiona el <b>sol</b> para escuchar de nuevo la palabra.
  </>,
  <>
    Presiona la <b>mariposa</b> para <b>comprobar la palabra</b>.
  </>,
  <>
    Presiona la <b>red</b> para que las <b>mariposas regresen</b> al jardín.
  </>,
  <>
    Presiona la <b>regadera</b> para escuchar la <b>próxima palabra</b>.
  </>,
];

type Pt = { x: number; y: number };
type Slot = { text: string; from: number } | null;

const ArtButton = ({
  x,
  y,
  w,
  img,
  label,
  onClick,
  testid,
}: {
  x: number;
  y: number;
  w: number;
  img: string;
  label: string;
  onClick: () => void;
  testid: string;
}) => (
  <button
    type="button"
    aria-label={label}
    data-testid={testid}
    onClick={onClick}
    className="absolute z-[5] rounded-full focus-visible:outline-4 focus-visible:outline-ring"
    style={{ left: `${x}%`, top: `${y}%`, width: `${w}%` }}
  >
    <img src={img} alt="" draggable={false} className="block w-full" />
  </button>
);

export function ButterflyGarden({ backSlot }: { backSlot?: React.ReactNode } = {}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gardenRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const bfRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pos = useRef<Pt[]>(BUTTERFLIES.map(() => ({ x: 0, y: 0 })));
  const homes = useRef<Pt[]>([]);
  const busyRef = useRef(false);
  const completedWords = useRef(new Set<number>());
  const roundRecorded = useRef(false);
  const slotsRef = useRef<Slot[]>(Array(SLOT_COUNT).fill(null));
  const [layout, setLayout] = useState({
    portrait: false,
    compact: false,
    gw: 0,
    gh: 0,
    art: { w: 0, h: 0, l: 0, t: 0 },
    sw: 100,
  });
  const [wordIdx, setWordIdx] = useState(0);
  const [slots, setSlotsState] = useState<Slot[]>(Array(SLOT_COUNT).fill(null));
  const [verdicts, setVerdicts] = useState<Verdict[]>(Array(SLOT_COUNT).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const [cards, setCards] = useState<boolean[]>(BUTTERFLIES.map(() => true));
  const [flyingId, setFlyingId] = useState<string | null>(null);
  const [shakeSlot, setShakeSlot] = useState<number | null>(null);
  const [help, setHelp] = useState(false);
  const [ready, setReady] = useState(false);

  const word = WORDS[wordIdx]!;
  const done = isWordComplete(
    slots.map((s) => s?.text ?? null),
    word.syllables,
  );

  const setSlots = (s: Slot[]) => {
    slotsRef.current = s;
    setSlotsState(s);
  };
  const setCard = (i: number, v: boolean) => setCards((c) => c.map((x, k) => (k === i ? v : x)));

  const place = (i: number, p: Pt, rot = 0) => {
    pos.current[i] = p;
    const el = bfRefs.current[i];
    if (el)
      el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) rotate(${rot}deg)`;
  };

  // ---- layout -------------------------------------------------------------
  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const W = root.clientWidth;
    const H = root.clientHeight;
    const portrait = W / H < 1.15;
    const compact = W < 820 || H < 520;
    const barH = portrait
      ? Math.min(176, Math.max(150, H * 0.22))
      : compact
        ? 76
        : Math.min(120, Math.max(92, H * 0.15));
    let gw: number, gh: number;
    if (portrait) {
      gw = W;
      gh = H - barH;
    } else {
      gw = Math.min(W, (H - barH) * ART_RATIO);
      gh = gw / ART_RATIO;
    }
    const aw = Math.max(gw, gh * ART_RATIO);
    const ah = aw / ART_RATIO;
    const art = { w: aw, h: ah, l: (gw - aw) * (portrait ? 0.42 : 0.5), t: (gh - ah) / 2 };
    const sw = portrait ? Math.min(gw * 0.3, gh * 0.2) : (aw * 14) / 100;
    setLayout({ portrait, compact, gw, gh, art, sw });
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (rootRef.current) ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, [measure]);

  useLayoutEffect(() => {
    const g = gardenRef.current;
    const r = rootRef.current;
    if (!g || !r || !layout.gw) return;
    const gr = g.getBoundingClientRect();
    const rr = r.getBoundingClientRect();
    const ox = gr.left - rr.left;
    const oy = gr.top - rr.top;
    homes.current = BUTTERFLIES.map((b, i) => {
      if (layout.portrait) {
        const [px, py] = PORTRAIT_HOMES[i]!;
        return { x: ox + (px / 100) * layout.gw, y: oy + (py / 100) * layout.gh };
      }
      return {
        x: ox + layout.art.l + (b.ax / 100) * layout.art.w,
        y: oy + layout.art.t + (b.ay / 100) * layout.art.h,
      };
    });
    BUTTERFLIES.forEach((b, i) => {
      if (flyingId !== b.id) place(i, homes.current[i]!);
    });
    setReady(true);
  }, [layout, flyingId]);

  // ---- flight -------------------------------------------------------------
  const fly = (i: number, to: Pt, ms: number) =>
    new Promise<void>((resolve) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        place(i, to);
        resolve();
        return;
      }
      const from = { ...pos.current[i]! };
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.hypot(dx, dy);
      const side = Math.random() < 0.5 ? -1 : 1;
      const c1 = {
        x: from.x + dx * 0.25 + side * dist * 0.25,
        y: from.y + dy * 0.1 - Math.max(60, dist * 0.35),
      };
      const c2 = { x: from.x + dx * 0.8 - side * dist * 0.15, y: to.y - Math.max(40, dist * 0.2) };
      const start = performance.now();
      const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const step = (now: number) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          place(i, to);
          resolve();
          return;
        }
        const raw = Math.min(1, (now - start) / ms);
        const t = ease(raw);
        const u = 1 - t;
        const x =
          u * u * u * from.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * to.x;
        const y =
          u * u * u * from.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * to.y;
        const prev = pos.current[i]!;
        const rot = Math.max(-14, Math.min(14, (x - prev.x) * 1.2)) + Math.sin(now / 90) * 2;
        place(i, { x, y }, raw < 1 ? rot : 0);
        if (raw < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /** where the butterfly centre must be so its card sits on slot k */
  const slotTarget = (k: number): Pt | null => {
    const el = slotRefs.current[k];
    const root = rootRef.current;
    if (!el || !root) return null;
    const sr = el.getBoundingClientRect();
    const rr = root.getBoundingClientRect();
    const sw = layout.sw;
    return {
      x: sr.left - rr.left + sr.width / 2 - sw * 0.22,
      y: sr.top - rr.top + sr.height / 2 - sw * SPRITE_RATIO * 0.12,
    };
  };

  // ---- actions ------------------------------------------------------------
  const deliver = async (i: number) => {
    if (busyRef.current || done) return;
    const k = targetSlot(
      slotsRef.current.map((s) => s?.text ?? null),
      selected,
    );
    if (k < 0) {
      setShakeSlot(SLOT_COUNT - 1);
      setTimeout(() => setShakeSlot(null), 700);
      return;
    }
    const target = slotTarget(k);
    if (!target) return;
    busyRef.current = true;
    const b = BUTTERFLIES[i]!;
    setCard(i, true); // a butterfly whose card is already placed takes a fresh one (repeated syllables)
    setFlyingId(b.id);
    setVerdicts(Array(SLOT_COUNT).fill(null));
    await fly(i, target, 1150);
    // card detaches and stays in the slot
    setSlots(slotsRef.current.map((s, x) => (x === k ? { text: b.syllable, from: i } : s)));
    setCard(i, false);
    setSelected(null);
    await wait(260);
    await fly(i, homes.current[i]!, 1250);
    setFlyingId(null);
    busyRef.current = false;
  };

  /** the owning butterfly flies (cardless) to slot k, picks up its card and carries it home */
  const retrieve = async (k: number) => {
    const s = slotsRef.current[k];
    const target = slotTarget(k);
    if (!s || !target) return;
    const i = s.from;
    setFlyingId(BUTTERFLIES[i]!.id);
    setCard(i, false);
    await fly(i, target, 1050);
    setSlots(slotsRef.current.map((x, j) => (j === k ? null : x)));
    setVerdicts((v) => v.map((x, j) => (j === k ? null : x)));
    setCard(i, true);
    await wait(200);
    await fly(i, homes.current[i]!, 1200);
    setFlyingId(null);
  };

  const check = async () => {
    if (busyRef.current) return;
    const texts = slotsRef.current.map((s) => s?.text ?? null);
    if (texts.every((t) => t === null)) return;
    busyRef.current = true;
    const v = checkSlots(texts, word.syllables);
    setVerdicts(v);
    if (isWordComplete(texts, word.syllables)) {
      playFeedback("complete");
      completedWords.current.add(wordIdx);
      if (completedWords.current.size === WORDS.length && !roundRecorded.current) {
        roundRecorded.current = true;
        recordEvent({
          lessonId: "game:mariposas-p",
          kind: "exercise",
          score: WORDS.length,
          total: WORDS.length,
          meta: { exercise: "mariposas", completed: true, gameId: "mariposas-p" },
        });
      }
    } else {
      playFeedback("wrong");
      const wrong = v.map((x, k) => (x === "wrong" ? k : -1)).filter((k) => k >= 0);
      setShakeSlot(wrong[0] ?? null);
      await wait(800);
      setShakeSlot(null);
      await Promise.all(wrong.map((k) => retrieve(k)));
    }
    busyRef.current = false;
  };

  const net = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    const promises: Promise<void>[] = [];
    for (let k = 0; k < SLOT_COUNT; k++) {
      if (slotsRef.current[k]) promises.push(retrieve(k));
    }
    await Promise.all(promises);
    setVerdicts(Array(SLOT_COUNT).fill(null));
    busyRef.current = false;
  };

  const nextWord = () => {
    if (busyRef.current) return;
    const n = nextWordIndex(wordIdx);
    if (n === 0) {
      completedWords.current.clear();
      roundRecorded.current = false;
    }
    setWordIdx(n);
    setSlots(Array(SLOT_COUNT).fill(null));
    setVerdicts(Array(SLOT_COUNT).fill(null));
    setCards(BUTTERFLIES.map(() => true));
    setSelected(null);
    playWord(WORDS[n]!.word);
  };

  const { portrait, compact, gw, gh, art, sw } = layout;
  const slotW = portrait ? (gw < 420 ? 82 : 96) : compact ? 76 : 104;
  const slotH = portrait ? 56 : compact ? 50 : 68;
  const iconBtn = compact || (portrait && gw < 420) ? "h-12 w-12" : "h-14 w-14";
  const signW = Math.min(gw * 0.27, gh * 0.3 * 0.75);
  const sunW = Math.min(gw * 0.26, gh * 0.24);

  return (
    <div
      ref={rootRef}
      className="relative flex h-dvh w-full flex-col items-center overflow-hidden bg-bfg-leaf select-none"
    >
      {/* GARDEN */}
      <div
        ref={gardenRef}
        className="relative shrink-0 overflow-hidden"
        style={{ width: gw, height: gh }}
      >
        <div className="absolute" style={{ width: art.w, height: art.h, left: art.l, top: art.t }}>
          <img
            src={garden}
            alt="Jardín con flores, cartel de palabras, sol y regadera"
            className="absolute inset-0 h-full w-full"
            draggable={false}
          />
          {FLOWERS.map((f) => (
            <img
              key={f.id}
              src={pick(flowerImgs, `fl_${f.id}.png`)}
              alt=""
              aria-hidden
              draggable={false}
              className="bfg-anim-sway pointer-events-none absolute"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                width: `${f.w}%`,
                animationDelay: `${f.d}s`,
              }}
            />
          ))}
          <img
            src={grass}
            alt=""
            aria-hidden
            draggable={false}
            className="bfg-anim-grass pointer-events-none absolute bottom-0 left-0 w-full"
          />
          {!portrait && (
            <>
              <ArtButton
                testid="sun"
                x={SUN_ART.x}
                y={SUN_ART.y}
                w={SUN_ART.w}
                img={sunImg}
                label="Sol: escuchar de nuevo la palabra"
                onClick={() => playWord(word.word)}
              />
              <ArtButton
                testid="can"
                x={CAN_ART.x}
                y={CAN_ART.y}
                w={CAN_ART.w}
                img={canImg}
                label="Regadera: próxima palabra"
                onClick={nextWord}
              />
            </>
          )}
        </div>
        {portrait && (
          <>
            {/* original word-list sign and sun, repositioned for tall screens */}
            <img
              src={signImg}
              alt={`Palabras: ${WORDS.map((w) => w.word).join(", ")}`}
              className="absolute top-2 left-2 z-[5] rounded-lg shadow-lg"
              style={{ width: signW }}
              draggable={false}
            />
            <button
              type="button"
              data-testid="sun"
              aria-label="Sol: escuchar de nuevo la palabra"
              onClick={() => playWord(word.word)}
              className="absolute top-1 right-2 z-[5]"
              style={{ width: sunW }}
            >
              <img src={sunImg} alt="" className="block w-full" draggable={false} />
            </button>
          </>
        )}
      </div>

      {/* WOODEN BOARD */}
      <div className="bfg-wood-bar relative z-10 flex w-full flex-1 items-center justify-center px-2 py-2">
        <div className={`flex items-center ${portrait ? "flex-col gap-2" : "gap-4"}`}>
          <div className="flex items-center gap-2">
            {slots.map((s, k) => {
              const v = verdicts[k];
              return (
                <button
                  key={`${wordIdx}-${k}`}
                  type="button"
                  ref={(el) => {
                    slotRefs.current[k] = el;
                  }}
                  data-testid={`slot-${k}`}
                  aria-label={
                    s
                      ? `Casilla ${k + 1}: ${s.text}`
                      : `Florecita ${k + 1}: colocar aquí la próxima sílaba`
                  }
                  aria-pressed={selected === k}
                  onClick={() => !s && setSelected(selected === k ? null : k)}
                  className={`grid place-items-center rounded-xl transition ${s ? "bfg-tag-tile bfg-anim-pop" : "bfg-slot-empty"} ${selected === k ? "ring-4 ring-accent" : ""} ${v === "ok" ? "ring-4 ring-success" : ""} ${v === "wrong" ? "ring-4 ring-destructive" : ""} ${shakeSlot === k ? "bfg-anim-shake" : ""}`}
                  style={{ width: slotW, height: slotH }}
                >
                  {s ? (
                    <span
                      className={`font-extrabold ${compact ? "text-2xl" : "text-3xl"} ${v === "wrong" ? "text-destructive" : ""}`}
                    >
                      {v === "ok" ? word.syllables[k] : s.text}
                    </span>
                  ) : (
                    <span aria-hidden className="text-xl opacity-70">
                      ✿
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            {backSlot}
            <div
              className={`bfg-leaf-board rounded-2xl px-5 py-1 text-bfg-leaf-foreground ${done ? "ring-4 ring-success" : ""}`}
            >
              <span
                className={`font-extrabold tracking-wide ${compact ? "text-2xl" : "text-4xl"}`}
                data-testid="word"
              >
                {word.word}
              </span>
            </div>
            <button
              type="button"
              onClick={check}
              data-testid="check"
              aria-label="Mariposa: comprobar la palabra"
              className={`${iconBtn} grid place-items-center rounded-full bg-card p-1 shadow-md`}
            >
              <img
                src={pick(noCard, "bt_Pe.png")}
                alt=""
                className="h-full w-full object-contain"
                draggable={false}
              />
            </button>
            <button
              type="button"
              onClick={net}
              data-testid="net"
              aria-label="Red: las mariposas regresan al jardín"
              className={`${iconBtn} grid place-items-center rounded-full bg-card shadow-md`}
            >
              <svg viewBox="0 0 40 40" className="h-3/4 w-3/4" aria-hidden>
                <circle
                  cx="17"
                  cy="15"
                  r="11"
                  className="fill-destructive/15 stroke-destructive"
                  strokeWidth="3"
                />
                <path
                  d="M9 10 L25 20 M9 20 L25 10 M17 4 V26 M6 15 H28"
                  className="stroke-destructive"
                  strokeWidth="1.2"
                />
                <path
                  d="M25 23 L36 36"
                  className="stroke-bfg-wood-dark"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {portrait && (
              <button
                type="button"
                onClick={nextWord}
                data-testid="can"
                aria-label="Regadera: próxima palabra"
                className={`${iconBtn} grid place-items-center rounded-full bg-card p-1 shadow-md ${done ? "animate-bounce ring-4 ring-success" : ""}`}
              >
                <img
                  src={canImg}
                  alt=""
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </button>
            )}
            <Dialog open={help} onOpenChange={setHelp}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  onClick={playInstructions}
                  data-testid="help"
                  aria-label="Instrucciones"
                  className={`${iconBtn} grid place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-md`}
                >
                  ?
                </button>
              </DialogTrigger>
              <DialogContent
                aria-describedby={undefined}
                className="max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-2xl overflow-auto rounded-2xl border-4 border-bfg-wood bg-card p-4 text-card-foreground [&>button:last-child]:hidden"
              >
                <DialogTitle className="mb-3 inline-block rounded-full bg-accent px-4 text-2xl font-extrabold text-accent-foreground">
                  Instrucciones:
                </DialogTitle>
                <ol className="grid gap-x-6 gap-y-2 text-base sm:grid-cols-2 sm:text-lg">
                  {INSTRUCTIONS.map((t, k) => (
                    <li key={k} className="flex gap-2">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {k + 1}
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ol>
                <DialogClose asChild>
                  <button
                    type="button"
                    className="bfg-leaf-board mt-4 w-full rounded-xl py-2 text-xl font-bold text-bfg-leaf-foreground"
                  >
                    ¡A jugar!
                  </button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {done && (
          <div
            className="bfg-anim-pop absolute -top-12 left-1/2 -translate-x-1/2 rounded-full bg-card px-5 py-1 text-2xl font-extrabold text-primary shadow-lg"
            role="status"
          >
            ¡Muy bien!
          </div>
        )}
      </div>

      {/* BUTTERFLIES */}
      <div className="pointer-events-none absolute inset-0 z-20" style={{ opacity: ready ? 1 : 0 }}>
        {BUTTERFLIES.map((b, i) => (
          <button
            key={b.id}
            ref={(el) => {
              bfRefs.current[i] = el;
            }}
            type="button"
            data-testid={`bf-${b.id}`}
            data-card={cards[i] ? "yes" : "no"}
            aria-label={`Mariposa ${b.syllable}`}
            onClick={() => deliver(i)}
            className="pointer-events-auto absolute top-0 left-0 will-change-transform"
            style={{ width: portrait ? sw : (art.w * b.aw) / 100 }}
          >
            <span
              className="bfg-anim-bob block"
              style={{
                animationDelay: `${-i * 0.37}s`,
                animationPlayState: flyingId === b.id ? "paused" : "running",
              }}
            >
              <span
                className={`relative block ${flyingId === b.id ? "bfg-anim-flutter-fly" : "bfg-anim-flutter-idle"}`}
                style={{ animationDelay: `${-i * 0.23}s` }}
              >
                <img
                  src={pick(withCard, `bf_${b.id}.png`)}
                  alt=""
                  draggable={false}
                  className="block w-full drop-shadow-md transition-opacity duration-150"
                  style={{ opacity: cards[i] ? 1 : 0 }}
                />
                <img
                  src={pick(noCard, `bt_${b.id}.png`)}
                  alt=""
                  draggable={false}
                  className={`absolute top-0 h-full drop-shadow-md transition-opacity duration-150 ${b.centred ? "left-1/2 -translate-x-1/2" : "left-0"}`}
                  style={{ opacity: cards[i] ? 0 : 1 }}
                />
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
