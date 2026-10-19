import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { GameContent } from "@/lib/games/gameContent";
import { playWord, playInstruction } from "@/lib/games/wordAudio";
import { recordEvent } from "@/lib/student-session";
import { COW_SLOTS, COW_SYLLABLES } from "@/content/games/cow-game";

/**
 * Cow game (juego de la vaca), Mm set. Built from the owner-approved mockup
 * (2026-10-19) and the owner's original cow art, cut into pieces
 * (body, head, tail, four legs, tongue) so the walk is real: diagonal leg
 * pairs swing from the hip, the body bobs, the tail and head follow.
 *
 * Play: tap a cow, tap a slot. The cow walks to the fence, the slot opens,
 * the cow stands in it. Right slot: "ma ma" (silent until the owner's audio
 * exists) and it stays. Wrong slot: moo (silent) and it walks back.
 * No Gretel on this screen. Stage coordinates are the mockup's 1238x928.
 */

const ART = "/cartilla/art/games/cow/";
const SW = 1238;
const SH = 928;
const px = (x: number) => `${(x / SW) * 100}%`;
const py = (y: number) => `${(y / SH) * 100}%`;

type Box = { x: number; y: number; w: number; h: number };

// Home spots, same order as COW_SYLLABLES (top row then bottom row of the mockup).
const HOME: Box[] = [
  { x: 70, y: 155, w: 215, h: 203 },
  { x: 330, y: 128, w: 215, h: 207 },
  { x: 635, y: 158, w: 215, h: 187 },
  { x: 910, y: 148, w: 208, h: 210 },
  { x: 265, y: 325, w: 217, h: 193 },
  { x: 520, y: 305, w: 195, h: 210 },
  { x: 745, y: 345, w: 205, h: 185 },
  { x: 1015, y: 358, w: 197, h: 170 },
];

const SLOT_BOX: Box[] = [
  { x: 79, y: 622, w: 162, h: 126 },
  { x: 304, y: 622, w: 169, h: 126 },
  { x: 535, y: 622, w: 168, h: 126 },
  { x: 766, y: 622, w: 169, h: 126 },
  { x: 998, y: 622, w: 164, h: 126 },
];

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

function slotSpot(slot: number, index: number, count: number): Box {
  const b = SLOT_BOX[slot];
  const n = Math.max(count, 1);
  const w = Math.min(112, (b.w - 10) / n);
  const h = w / 1.06;
  const gap = n > 1 ? (b.w - 10 - w * n) / (n - 1) : 0;
  const x = n > 1 ? b.x + 5 + index * (w + gap) : b.x + (b.w - w) / 2;
  return { x, y: b.y + b.h - h - 3, w, h };
}

type Pos = { slot: number; index: number; count: number };
type Phase = "idle" | "walk" | "gate" | "wrong" | "back";

function Cow({
  syllable,
  box,
  flip,
  walking,
  selected,
  hop,
  delay,
  onTap,
  z,
  slow,
}: {
  syllable: string;
  box: Box;
  flip: number;
  walking: boolean;
  selected: boolean;
  hop: boolean;
  delay: number;
  onTap: () => void;
  z: number;
  slow: boolean;
}) {
  const parts = ["leg-a", "leg-c", "body", "leg-b", "leg-d", "tail", "head", "tongue"];
  return (
    <button
      type="button"
      aria-label={`Vaca ${syllable}`}
      aria-pressed={selected}
      onClick={onTap}
      className={`cg-cow ${walking ? "cg-walking" : "cg-idle"} ${selected ? "cg-selected" : ""} ${hop ? "cg-hop" : ""}`}
      style={{
        left: px(box.x),
        top: py(box.y),
        width: px(box.w),
        height: py(box.h),
        zIndex: z,
        animationDelay: `${delay}s`,
        ["--cg-delay" as string]: `${delay}s`,
        transitionDuration: slow ? "2.3s" : "0s",
      }}
    >
      <span className="cg-bob">
        <span className="cg-sprite" style={{ transform: `scaleX(${flip})` }}>
          {parts.map((p) => (
            <img
              key={p}
              src={`${ART}${p}.webp`}
              alt=""
              draggable={false}
              className={`cg-p cg-${p}`}
            />
          ))}
          <span className="cg-label" style={{ transform: `translate(-50%, -50%) scaleX(${flip})` }}>
            {syllable}
          </span>
        </span>
      </span>
    </button>
  );
}

export function CowGame({ content }: { content: GameContent }) {
  const [placed, setPlaced] = useState<Record<number, Pos>>({});
  const [selCow, setSelCow] = useState<number | null>(null);
  const [selSlot, setSelSlot] = useState<number | null>(null);
  const [active, setActive] = useState<{ cow: number; slot: number; phase: Phase; to: Pos } | null>(
    null,
  );
  const [flips, setFlips] = useState<number[]>(() => COW_SYLLABLES.map(() => 1));
  const [openGate, setOpenGate] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [muted, setMuted] = useState(false);
  const [menu, setMenu] = useState(false);
  const [message, setMessage] = useState("");
  const timers = useRef<number[]>([]);
  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const ids = timers.current;
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, []);

  const doneCount = Object.keys(placed).length;
  const finished = doneCount === COW_SYLLABLES.length;
  const busy = active !== null;

  const go = useCallback(
    (cow: number, slot: number) => {
      if (busy || placed[cow]) return;
      const syl = COW_SYLLABLES[cow];
      const right = norm(syl) === COW_SLOTS[slot];
      const already = Object.values(placed).filter((p) => p.slot === slot).length;
      const count = right ? already + 1 : 1;
      const to: Pos = { slot, index: right ? already : 0, count };
      const home = HOME[cow];
      const target = slotSpot(slot, to.index, count);
      const dx = target.x + target.w / 2 - (home.x + home.w / 2);
      setSelCow(null);
      setSelSlot(null);
      setTries((t) => t + 1);
      setMessage("");
      setFlips((f) => f.map((v, i) => (i === cow ? (dx > 0 ? -1 : 1) : v)));
      setActive({ cow, slot, phase: "walk", to });
      later(2400, () => {
        setActive({ cow, slot, phase: "gate", to });
        setOpenGate((g) => ({ ...g, [slot]: true }));
        later(700, () => {
          if (right) {
            setFlips((f) => f.map((v, i) => (i === cow ? 1 : v)));
            // "ma ma": silent until the owner's recording exists (gap manifest).
            if (!muted) playWord(undefined);
            setPlaced((p) => {
              const next = { ...p, [cow]: to };
              // shrink earlier cows in this slot to make room
              Object.entries(next).forEach(([k, v]) => {
                if (v.slot === slot) next[Number(k)] = { ...v, count };
              });
              return next;
            });
            setScore((s) => s + 1);
            setActive(null);
            setMessage("¡Muy bien!");
            later(1200, () => setMessage(""));
          } else {
            if (!muted) playWord(undefined); // moo: silent until recorded
            setActive({ cow, slot, phase: "wrong", to });
            setMessage("Inténtalo otra vez");
            later(800, () => {
              setFlips((f) => f.map((v, i) => (i === cow ? (dx > 0 ? 1 : -1) : v)));
              setActive({ cow, slot, phase: "back", to });
              setOpenGate((g) => ({ ...g, [slot]: false }));
              later(2400, () => {
                setFlips((f) => f.map((v, i) => (i === cow ? 1 : v)));
                setActive(null);
                setMessage("");
              });
            });
          }
        });
      });
    },
    [busy, placed, muted],
  );

  useEffect(() => {
    if (finished) {
      recordEvent({
        lessonId: `game:${content.id}`,
        kind: "exercise",
        score: score,
        total: COW_SYLLABLES.length,
        meta: { exercise: content.type, completed: true, gameId: content.id, tries },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const reset = () => {
    setPlaced({});
    setActive(null);
    setOpenGate({});
    setScore(0);
    setTries(0);
    setSelCow(null);
    setSelSlot(null);
    setFlips(COW_SYLLABLES.map(() => 1));
  };

  const tapCow = (i: number) => {
    if (busy || placed[i]) return;
    if (selSlot !== null) return go(i, selSlot);
    setSelCow((c) => (c === i ? null : i));
  };
  const tapSlot = (s: number) => {
    if (busy) return;
    if (selCow !== null) return go(selCow, s);
    setSelSlot((c) => (c === s ? null : s));
  };

  const spots = useMemo(() => HOME, []);

  return (
    <main className="cg-root" aria-label="Juego de la vaca">
      <div
        className="cg-backdrop"
        style={{ backgroundImage: `url(${ART}scene.webp)` }}
        aria-hidden
      />
      <div className="cg-stage">
        <img className="cg-scene" src={`${ART}scene.webp`} alt="" draggable={false} />

        {/* title bar, baked from the approved mockup; speaker is a real button */}
        <h1 className="sr-only">Coloca cada vaca en su sílaba</h1>
        <div
          className="cg-title"
          style={{ left: "33.15%", top: "1.47%", width: "46.96%", height: "13.63%" }}
        >
          <img src={`${ART}ui-title.webp`} alt="" draggable={false} />
          <button
            type="button"
            className="cg-hit"
            style={{ left: "1%", top: "6%", width: "17%", height: "88%", borderRadius: "50%" }}
            aria-label="Escuchar la instrucción"
            onClick={() => !muted && playInstruction(undefined)}
          />
        </div>
        <Link
          to="/cartilla/practica"
          aria-label="Inicio"
          className="cg-btn"
          style={{ left: "83.08%", top: "2.76%", width: "7.11%", height: "9.48%" }}
        >
          <img src={`${ART}ui-home.webp`} alt="" draggable={false} />
        </Link>
        <button
          type="button"
          aria-label="Ajustes"
          aria-expanded={menu}
          className="cg-btn"
          style={{ left: "90.75%", top: "2.76%", width: "7.11%", height: "9.48%" }}
          onClick={() => setMenu((m) => !m)}
        >
          <img src={`${ART}ui-settings.webp`} alt="" draggable={false} />
        </button>
        {menu && (
          <div className="cg-menu" role="group" aria-label="Ajustes">
            <button type="button" onClick={() => setMuted((m) => !m)} aria-pressed={muted}>
              Sonido: {muted ? "apagado" : "encendido"}
            </button>
            <button type="button" onClick={reset}>
              Empezar de nuevo
            </button>
          </div>
        )}

        {/* fence slots */}
        {SLOT_BOX.map((b, s) => {
          const cx = b.x + b.w / 2;
          return (
            <div key={COW_SLOTS[s]}>
              <span className="cg-plaque" style={{ left: px(cx), top: py(583) }}>
                {COW_SLOTS[s]}
              </span>
              <div
                className={`cg-open ${openGate[s] ? "cg-open-on" : ""}`}
                style={{ left: px(b.x), top: py(b.y), width: px(b.w), height: py(b.h) }}
              />
              <button
                type="button"
                aria-label={`Casilla ${COW_SLOTS[s]}`}
                className={`cg-slot ${selSlot === s ? "cg-slot-sel" : ""}`}
                onClick={() => tapSlot(s)}
                style={{
                  left: px(b.x - 4),
                  top: py(b.y - 6),
                  width: px(b.w + 8),
                  height: py(b.h + 12),
                }}
              >
                <span className={`cg-door ${openGate[s] ? "cg-door-open" : ""}`} />
              </button>
            </div>
          );
        })}

        {/* cows */}
        {COW_SYLLABLES.map((syl, i) => {
          const p = placed[i];
          const isActive = active?.cow === i;
          let box = spots[i];
          let slow = false;
          if (p) box = slotSpot(p.slot, p.index, p.count);
          if (
            isActive &&
            (active.phase === "walk" || active.phase === "gate" || active.phase === "wrong")
          ) {
            box = slotSpot(active.slot, active.to.index, active.to.count);
            slow = true;
          }
          if (isActive && active.phase === "back") slow = true;
          const walking = isActive && (active.phase === "walk" || active.phase === "back");
          const z = isActive ? 90 : p ? 40 + p.index : 10 + Math.round(spots[i].y / 40);
          return (
            <Cow
              key={i}
              syllable={syl}
              box={box}
              flip={flips[i]}
              walking={walking}
              selected={selCow === i}
              hop={isActive && active.phase === "wrong"}
              delay={(i % 4) * 0.35}
              onTap={() => tapCow(i)}
              z={z}
              slow={slow || !!p}
            />
          );
        })}

        <div className="cg-msg" role="status" aria-live="polite">
          {message}
        </div>

        {finished && (
          <div className="cg-done" role="dialog" aria-label="Juego completado">
            <p>¡Muy bien!</p>
            <button type="button" onClick={reset}>
              Jugar otra vez
            </button>
          </div>
        )}
      </div>
      <style>{CSS}</style>
    </main>
  );
}

const CSS = `
.cg-root{position:fixed;inset:0;overflow:hidden;background:#7ec850;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.cg-backdrop{position:absolute;inset:-6%;background-size:cover;background-position:center;filter:blur(18px) saturate(1.05)}
.cg-stage{position:absolute;left:50%;top:50%;width:min(100vw,calc(100vh * 1448 / 1086));aspect-ratio:1448/1086;transform:translate(-50%,-50%);container-type:inline-size;overflow:hidden;border-radius:0}
.cg-scene{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
.cg-title,.cg-btn{position:absolute}
.cg-title img,.cg-btn img{width:100%;height:100%;display:block;pointer-events:none}
.cg-btn{padding:0;border:0;background:none;cursor:pointer;display:block}
.cg-hit{position:absolute;background:transparent;border:0;cursor:pointer}
.cg-menu{position:absolute;right:2%;top:14%;z-index:120;display:flex;flex-direction:column;gap:1.2cqw;background:#fdf3dc;border:.5cqw solid #8a4a1c;border-radius:2cqw;padding:1.6cqw}
.cg-menu button{font:900 2.4cqw/1.1 "Fredoka",ui-rounded,system-ui,sans-serif;color:#4a2610;background:#fff;border:.3cqw solid #c58b4e;border-radius:1.4cqw;padding:1.2cqw 2cqw;min-height:44px}
.cg-plaque{position:absolute;transform:translate(-50%,-50%);font:700 3.8cqw/1 "Fredoka",ui-rounded,system-ui,sans-serif;color:#3a1a0e;pointer-events:none;z-index:3}
.cg-open{position:absolute;border-radius:1.6cqw;background:linear-gradient(#b8e27a,#7cc04a);opacity:0;transition:opacity .4s;z-index:2;box-shadow:inset 0 0 1.5cqw rgba(40,90,20,.45)}
.cg-open-on{opacity:1}
.cg-slot{position:absolute;padding:0;border:0;background:transparent;z-index:60;cursor:pointer;border-radius:2cqw}
.cg-slot-sel{outline:.5cqw solid #ffe27a;box-shadow:0 0 2.5cqw 1cqw rgba(255,226,122,.85);animation:cg-pulse 1.1s ease-in-out infinite}
.cg-door{position:absolute;left:4px;top:6px;right:4px;bottom:6px;background:#fdf3dc;border:.35cqw dashed #e0b27a;border-radius:1.6cqw;transform-origin:left center;transition:transform .55s ease-in-out;box-shadow:0 0 0 .2cqw #fff}
.cg-door-open{transform:perspective(900px) rotateY(-78deg)}
.cg-cow{position:absolute;padding:0;border:0;background:none;cursor:pointer;container-type:inline-size;transition-property:left,top,width,height;transition-timing-function:ease-in-out}
.cg-cow:focus-visible{outline:.5cqw solid #1f8fa6;outline-offset:2px}
.cg-bob,.cg-sprite{position:absolute;inset:0;display:block}
.cg-sprite{transform-origin:50% 90%}
.cg-p{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none}
.cg-label{position:absolute;left:52%;top:58%;font:900 19cqw/1 "Fredoka",ui-rounded,system-ui,sans-serif;color:#3a1a0e;padding:4cqw 7cqw;background:radial-gradient(ellipse,rgba(255,244,214,.95) 55%,rgba(255,244,214,0) 72%);pointer-events:none;z-index:5}
.cg-selected{filter:drop-shadow(0 0 1.6cqw #fff3a0) drop-shadow(0 0 .8cqw #ffd54a)}
.cg-selected .cg-bob{animation:cg-hop .7s ease-in-out infinite}
.cg-hop .cg-bob{animation:cg-shake .22s linear 3}
.cg-p{will-change:transform}
.cg-leg-a{transform-origin:30.09% 75.71%}.cg-leg-b{transform-origin:47.69% 75.71%}
.cg-leg-c{transform-origin:55.56% 76.11%}.cg-leg-d{transform-origin:84.26% 76.11%}
.cg-head{transform-origin:27.78% 52.63%}.cg-tail{transform-origin:72.22% 22.67%}
.cg-tongue{transform-origin:31.02% 40.08%}.cg-body{transform-origin:50% 80%}
/* idle: everything moves a little */
.cg-idle .cg-body{animation:cg-breathe 3.4s ease-in-out infinite;animation-delay:var(--cg-delay)}
.cg-idle .cg-head{animation:cg-sway 3.4s ease-in-out infinite;animation-delay:var(--cg-delay)}
.cg-idle .cg-tail{animation:cg-tail 2.4s ease-in-out infinite;animation-delay:var(--cg-delay)}
.cg-idle .cg-tongue{animation:cg-tongue 4.6s ease-in-out infinite;animation-delay:var(--cg-delay)}
.cg-idle .cg-leg-b{animation:cg-shift 3.4s ease-in-out infinite;animation-delay:var(--cg-delay)}
/* walk: diagonal pairs swing from the hip, body bobs on each step */
.cg-walking .cg-bob{animation:cg-bob .62s ease-in-out infinite}
.cg-walking .cg-leg-a,.cg-walking .cg-leg-d{animation:cg-step .62s ease-in-out infinite}
.cg-walking .cg-leg-b,.cg-walking .cg-leg-c{animation:cg-step .62s ease-in-out infinite;animation-delay:-.31s}
.cg-walking .cg-body{animation:cg-roll .62s ease-in-out infinite}
.cg-walking .cg-head{animation:cg-nod .62s ease-in-out infinite}
.cg-walking .cg-tail{animation:cg-tail .62s ease-in-out infinite}
.cg-walking .cg-tongue{animation:cg-tongue 1.8s ease-in-out infinite}
@keyframes cg-step{0%{transform:rotate(-15deg) translateY(0)}25%{transform:rotate(0deg) translateY(-3.5%)}50%{transform:rotate(15deg) translateY(0)}75%{transform:rotate(0deg) translateY(0)}100%{transform:rotate(-15deg) translateY(0)}}
@keyframes cg-bob{0%,50%,100%{transform:translateY(0)}25%,75%{transform:translateY(-2.4%)}}
@keyframes cg-roll{0%,100%{transform:rotate(-1.1deg)}50%{transform:rotate(1.1deg)}}
@keyframes cg-nod{0%,100%{transform:rotate(-2.6deg)}50%{transform:rotate(2.6deg)}}
@keyframes cg-tail{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
@keyframes cg-breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.006,1.014)}}
@keyframes cg-sway{0%,100%{transform:rotate(-1.8deg)}50%{transform:rotate(1.8deg)}}
@keyframes cg-shift{0%,100%{transform:rotate(0)}50%{transform:rotate(2deg)}}
@keyframes cg-tongue{0%,64%,100%{transform:scale(1,1) translateY(0)}72%,88%{transform:scale(1.04,1.5) translateY(2%)}}
@keyframes cg-hop{0%,100%{transform:translateY(0)}50%{transform:translateY(-6%)}}
@keyframes cg-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3%)}75%{transform:translateX(3%)}}
@keyframes cg-pulse{0%,100%{box-shadow:0 0 2.5cqw 1cqw rgba(255,226,122,.85)}50%{box-shadow:0 0 3.5cqw 1.6cqw rgba(255,226,122,.5)}}
.cg-msg{position:absolute;left:50%;top:90%;transform:translateX(-50%);z-index:110;font:900 3.4cqw/1.1 "Fredoka",ui-rounded,system-ui,sans-serif;color:#fff;text-shadow:0 .3cqw .6cqw rgba(60,30,10,.7),0 0 1cqw rgba(60,30,10,.5);pointer-events:none;white-space:nowrap}
.cg-done{position:absolute;inset:0;z-index:130;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2cqw;background:rgba(255,255,255,.35);backdrop-filter:blur(2px)}
.cg-done p{font:900 8cqw/1 "Fredoka",ui-rounded,system-ui,sans-serif;color:#2c7a1e;text-shadow:0 .4cqw 0 #fff}
.cg-done button{font:900 3cqw/1 "Fredoka",ui-rounded,system-ui,sans-serif;color:#fff;background:#2e9bb0;border:.5cqw solid #fff;border-radius:3cqw;padding:1.6cqw 4cqw;min-height:44px;cursor:pointer}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
@media (prefers-reduced-motion:reduce){.cg-idle *,.cg-selected .cg-bob{animation-duration:12s!important}}
`;
