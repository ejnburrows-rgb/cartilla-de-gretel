import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { GameContent } from "@/lib/games/gameContent";
import { playWord, playInstruction } from "@/lib/games/wordAudio";
import { recordEvent } from "@/lib/student-session";
import { COW_SLOTS, COW_SYLLABLES } from "@/content/games/cow-game";
import { COW_SYLLABLE_AUDIO } from "@/content/games/cow-game-audio-gaps";

/**
 * Five cows, five matching slots. Each cow carries one physical syllable
 * card in her mouth. A right attempt leans and drops that same card into
 * the slot, then walks home empty-mouthed. A wrong attempt returns with
 * the card. Cows remain full size behind the fence throughout.
 */

const ART = "/cartilla/art/games/cow/";
// The owner-supplied drawing is cut into transparent overlapping animation layers.
type Box = { x: number; y: number; w: number; h: number };

type Layout = {
  W: number;
  H: number;
  home: Box[];
  slots: Box[];
  // Ground line right behind the fence, in the field: where a cow stands
  // while its syllable fills the slot. The fence overlay covers from
  // fenceTop down, so the fence stays in front of the cow's lower body.
  fieldFloor: number;
  fenceTop: number;
  scene: string;
  sceneTop: string;
  sceneFence: string;
  title: Box;
  homeBtn: Box;
  settingsBtn: Box;
};

// Landscape / tablet: the owner's wide empty farm scene (mockup coordinates).
const LAND: Layout = {
  W: 1238,
  H: 928,
  fieldFloor: 575,
  fenceTop: 502,
  scene: "scene.webp",
  sceneTop: "scene-top.webp",
  sceneFence: "scene-fence.webp",
  home: [
    { x: 60, y: 170, w: 210, h: 205 },
    { x: 365, y: 155, w: 210, h: 205 },
    { x: 900, y: 170, w: 210, h: 205 },
    { x: 250, y: 330, w: 210, h: 205 },
    { x: 670, y: 330, w: 210, h: 205 },
  ],
  slots: [
    { x: 79, y: 622, w: 162, h: 126 },
    { x: 304, y: 622, w: 169, h: 126 },
    { x: 535, y: 622, w: 168, h: 126 },
    { x: 766, y: 622, w: 169, h: 126 },
    { x: 998, y: 622, w: 164, h: 126 },
  ],
  title: { x: 410, y: 14, w: 581, h: 127 },
  homeBtn: { x: 1029, y: 25, w: 88, h: 88 },
  settingsBtn: { x: 1123, y: 25, w: 88, h: 88 },
};

// Phone portrait: the owner's tall empty farm scene (852x1846).
const PORT: Layout = {
  W: 852,
  H: 1846,
  fieldFloor: 1150,
  fenceTop: 1107,
  scene: "scene-portrait.webp",
  sceneTop: "scene-portrait-top.webp",
  sceneFence: "scene-portrait-fence.webp",
  home: [
    { x: 40, y: 650, w: 200, h: 190 },
    { x: 325, y: 620, w: 200, h: 190 },
    { x: 610, y: 650, w: 200, h: 190 },
    { x: 170, y: 880, w: 200, h: 190 },
    { x: 490, y: 880, w: 200, h: 190 },
  ],
  slots: [
    { x: 47, y: 1223, w: 119, h: 156 },
    { x: 208, y: 1223, w: 120, h: 156 },
    { x: 366, y: 1223, w: 121, h: 156 },
    { x: 528, y: 1223, w: 119, h: 156 },
    { x: 688, y: 1223, w: 120, h: 156 },
  ],
  title: { x: 20, y: 24, w: 540, h: 118 },
  homeBtn: { x: 580, y: 30, w: 110, h: 110 },
  settingsBtn: { x: 710, y: 30, w: 110, h: 110 },
};

let L: Layout = LAND;
const px = (x: number) => `${(x / L.W) * 100}%`;
const py = (y: number) => `${(y / L.H) * 100}%`;
const pct = (b: Box) => ({
  left: px(b.x),
  top: py(b.y),
  width: px(b.w),
  height: py(b.h),
});

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

type Pos = { slot: number };
type Phase = "walk" | "lean" | "drop" | "wrong" | "back";

// Full-size cow standing in the field right behind the fence, in front of
// the slot it picked. Never scaled; the fence overlay hides its shins.
function fieldSpot(slot: number, cow: number): Box {
  const b = L.slots[slot];
  const h = L.home[cow];
  const mouthX = b.x + b.w / 2 < h.x + h.w / 2 ? 0.34 : 0.66;
  const rawX = b.x + b.w / 2 - h.w * mouthX;
  const x = Math.min(Math.max(rawX, 2), L.W - h.w - 2);
  return { x, y: L.fieldFloor - h.h, w: h.w, h: h.h };
}

// Walk time through the field (out to the fence and back home).
const WALK_MS = 1600;
const LEAN_MS = 600;
// Time the physical card takes to fall from the mouth into the slot.
const FLY_MS = 900;

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
  cheer,
  leaning,
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
  cheer: boolean;
  leaning: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={`Vaca ${syllable}`}
      aria-pressed={selected}
      onClick={onTap}
      className={`cg-cow ${walking ? "cg-walking" : "cg-idle"} ${selected ? "cg-selected" : ""} ${hop ? "cg-hop" : ""} ${cheer ? "cg-cheer" : ""} ${leaning ? "cg-lean" : ""}`}
      style={{
        left: px(box.x),
        top: py(box.y),
        width: px(box.w),
        height: py(box.h),
        zIndex: z,
        animationDelay: `${delay}s`,
        ["--cg-delay" as string]: `${delay}s`,
        transitionDuration: slow ? `${WALK_MS}ms` : "0s",
      }}
    >
      <span className="cg-bob">
        <span className="cg-sprite" style={{ transform: `scaleX(${flip})` }}>
          {['leg-a', 'leg-c', 'body', 'leg-b', 'leg-d', 'tail'].map((p) => (
            <img key={p} src={`${ART}open-${p}.png`} alt="" draggable={false} className={`cg-p cg-new cg-${p}`} />
          ))}
          <div className="cg-p cg-new cg-head">
            <span className="cg-revealed-text" style={{ transform: `translate(-50%, -50%) scaleX(${flip})` }}>{syllable}</span>
            <img src={`${ART}open-head.png`} alt="" draggable={false} className="cg-p cg-head-bottom" />
            <img src={`${ART}open-head.png`} alt="" draggable={false} className="cg-p cg-head-top" />
          </div>
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
  const [cheer, setCheer] = useState<number | null>(null);
  const [portrait, setPortrait] = useState(
    () => typeof window !== "undefined" && window.innerHeight > window.innerWidth,
  );
  useEffect(() => {
    const on = () => setPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  L = portrait ? PORT : LAND;
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

      setSelCow(null);
      setSelSlot(null);
      setTries((t) => t + 1);
      setMessage("");

      setFlips((f) => f.map((v, i) => i === cow ? (fieldSpot(slot, cow).x < L.home[cow].x ? 1 : -1) : v));
      setActive({ cow, slot, phase: "walk", to: { slot } });
      later(WALK_MS, () => {
        if (right) {
          // Lean over the fence before releasing the physical mouth card.
          setActive({ cow, slot, phase: "lean", to: { slot } });
          later(LEAN_MS, () => {
            setActive({ cow, slot, phase: "drop", to: { slot } });
            later(FLY_MS, () => {
              // "ma ma": silent until the owner's recording exists (gap manifest).
              if (!muted) playWord(COW_SYLLABLE_AUDIO[norm(syl)] ?? undefined);
              setPlaced((p) => ({ ...p, [cow]: { slot } }));
              setScore((sc) => sc + 1);

              setMessage("¡Muy bien!");
              later(1500, () => setCheer(null));
              later(1200, () => setMessage(""));
              // The cow walks back to its place; the letters stay in the slot.

              setFlips((f) => f.map((v, i) => i === cow ? (fieldSpot(slot, cow).x < L.home[cow].x ? -1 : 1) : v));
              setActive({ cow, slot, phase: "back", to: { slot } });
              later(WALK_MS, () => {
                setFlips((f) => f.map((v, i) => (i === cow ? 1 : v)));
                setActive(null);
              });
            });
          });
        } else {
          if (!muted) playWord(undefined); // moo: silent until recorded
          setActive({ cow, slot, phase: "wrong", to: { slot } });
          setMessage("Inténtalo otra vez");
          later(900, () => {
            setFlips((f) => f.map((v, i) => i === cow ? (fieldSpot(slot, cow).x < L.home[cow].x ? -1 : 1) : v));
              setActive({ cow, slot, phase: "back", to: { slot } });
            later(WALK_MS, () => {
              setFlips((f) => f.map((v, i) => (i === cow ? 1 : v)));
              setActive(null);
              setMessage("");
            });
          });
        }
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

  const spots = L.home;
  const stageWidth = `min(100vw, calc(100vh * ${L.W} / ${L.H}))`;

  return (
    <main className="cg-root" aria-label="Juego de la vaca">
      <div
        className="cg-stage"
        style={{
          width: stageWidth,
          aspectRatio: `${L.W}/${L.H}`,
          ["--cg-lean-offset" as string]: `calc(${stageWidth} * ${L.home[0].w * 0.16 / L.W})`,
        }}
      >
        <img
          className="cg-scene"
          src={`${ART}${L.scene}`}
          alt=""
          draggable={false}
          style={{ left: "-100%" }}
        />
        <img className="cg-scene" src={`${ART}${L.scene}`} alt="" draggable={false} />
        <img
          className="cg-scene"
          src={`${ART}${L.scene}`}
          alt=""
          draggable={false}
          style={{ left: "100%" }}
        />

        {/* title bar, baked from the approved mockup; speaker is a real button */}
        <h1 className="sr-only">Coloca cada vaca en su sílaba</h1>
        <div className="cg-title" style={pct(L.title)}>
          <img src={`${ART}ui-title.webp`} alt="" draggable={false} />
          <button
            type="button"
            className="cg-hit"
            style={{ left: "1%", top: "6%", width: "17%", height: "88%", borderRadius: "50%" }}
            aria-label="Escuchar la instrucción"
            onClick={() => !muted && playInstruction(undefined)}
          />
        </div>
        <Link to="/cartilla/practica" aria-label="Inicio" className="cg-btn" style={pct(L.homeBtn)}>
          <img src={`${ART}ui-home.webp`} alt="" draggable={false} />
        </Link>
        <button
          type="button"
          aria-label="Ajustes"
          aria-expanded={menu}
          className="cg-btn"
          style={pct(L.settingsBtn)}
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
        {L.slots.map((b, s) => {
          return (
            <div key={COW_SLOTS[s]}>
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
                <span className="cg-door" /><span className="cg-slot-text">{COW_SLOTS[s]}</span>
              </button>
            </div>
          );
        })}

        {/* cows */}
        {COW_SYLLABLES.map((syl, i) => {
          const isActive = active?.cow === i;
          let box = spots[i];
          let slow = false;
          if (isActive && active.phase !== "back") {
            box = fieldSpot(active.slot, i);
            slow = true;
          }
          if (isActive && active.phase === "back") slow = true;
          const walking = isActive && (active.phase === "walk" || active.phase === "back");
          // Moving cows stay behind all resting cows, never painted over them.
          const z = isActive ? 8 : 10 + Math.round(spots[i].y / 40);
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
              slow={slow}
              cheer={false}
              leaning={isActive && (active.phase === "lean" || active.phase === "drop")}
            />
          );
        })}

        {/* One physical card per cow, kept mounted from mouth to slot. */}
        {COW_SYLLABLES.map((syllable, i) => {
          const moving = active?.cow === i;
          const isDropped = !!placed[i] || (moving && active.phase === "drop");
          const slot = placed[i]?.slot ?? (moving ? active.slot : 0);
          const box = moving && active.phase !== "back" ? fieldSpot(active.slot, i) : spots[i];
          const slotBox = L.slots[slot];
          const x = isDropped ? slotBox.x + slotBox.w / 2 : box.x + box.w * (flips[i] === 1 ? 0.34 : 0.66);
          const y = isDropped ? slotBox.y + slotBox.h * 0.52 : box.y + box.h * 0.48;
          return (
            <span
              key={i}
              className={`cg-card ${moving && (active.phase === "walk" || active.phase === "back") ? "cg-card-walking" : ""} ${moving && active.phase === "lean" ? "cg-card-lean" : ""}`}
              style={{
                zIndex: isDropped ? 65 : moving ? 9 : 50,
                left: px(x),
                top: py(y),
                width: px(76),
                height: py(49),
                transitionDuration:
                  moving && active.phase === "lean"
                    ? `${LEAN_MS}ms`
                    : moving && active.phase === "drop" ? `${FLY_MS}ms` : `${WALK_MS}ms`,
                transitionTimingFunction:
                  moving && active.phase === "drop" ? "cubic-bezier(.45,0,.9,.6)" : "ease-in-out",
              }}
            >
              {syllable}
            </span>
          );
        })}

        {/* fence layer: in front of the cows, behind the slot UI */}
        <img
          className="cg-scene-fence"
          src={`${ART}${L.sceneFence}`}
          alt=""
          draggable={false}
          style={{ top: py(L.fenceTop), height: py(L.H - L.fenceTop) }}
        />

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
.cg-stage{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);container-type:inline-size;overflow:visible;border-radius:0}
.cg-scene{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
.cg-scene-top{position:absolute;left:0;top:0;width:100%;display:block;pointer-events:none;z-index:1}
.cg-scene-fence{position:absolute;left:0;width:100%;display:block;pointer-events:none;z-index:30}
.cg-fly{position:absolute;z-index:65;pointer-events:none;font:900 6.4cqw/1 "Fredoka",ui-rounded,system-ui,sans-serif;color:#3a1a0e;text-shadow:0 0 1.4cqw #fff4d6,0 .3cqw .6cqw rgba(60,30,10,.35);white-space:nowrap;transform:translate(-50%,-50%);animation:cg-fly ${FLY_MS}ms ease-in both}
@keyframes cg-fly{0%{transform:translate(calc(-50% + var(--cg-fly-dx)),calc(-50% + var(--cg-fly-dy))) scale(.75);opacity:.85}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
.cg-title,.cg-btn{position:absolute}
.cg-title img,.cg-btn img{width:100%;height:100%;display:block;pointer-events:none}
.cg-btn{padding:0;border:0;background:none;cursor:pointer;display:block}
.cg-hit{position:absolute;background:transparent;border:0;cursor:pointer}
.cg-menu{position:absolute;right:2%;top:14%;z-index:120;display:flex;flex-direction:column;gap:1.2cqw;background:#fdf3dc;border:.5cqw solid #8a4a1c;border-radius:2cqw;padding:1.6cqw}
.cg-menu button{font:900 2.4cqw/1.1 "Fredoka",ui-rounded,system-ui,sans-serif;color:#4a2610;background:#fff;border:.3cqw solid #c58b4e;border-radius:1.4cqw;padding:1.2cqw 2cqw;min-height:44px}
.cg-open{position:absolute;border-radius:1.6cqw;background:linear-gradient(#d3ecb0,#a5d374);opacity:0;transition:opacity .4s;z-index:2;box-shadow:inset 0 0 1.5cqw rgba(40,90,20,.45)}
.cg-open-on{opacity:1}
.cg-slot{position:absolute;padding:0;border:0;background:transparent;z-index:60;cursor:pointer;border-radius:2cqw}
.cg-slot-sel{outline:.5cqw solid #ffe27a;box-shadow:0 0 2.5cqw 1cqw rgba(255,226,122,.85);animation:cg-pulse 1.1s ease-in-out infinite}
.cg-door{position:absolute;left:4px;top:6px;right:4px;bottom:6px;background:#fdf3dc;border:.35cqw dashed #e0b27a;border-radius:1.6cqw;transform-origin:left center;transition:transform .55s ease-in-out,opacity .35s ease .6s;box-shadow:0 0 0 .2cqw #fff;z-index:3;pointer-events:none}
.cg-door-open{transform:perspective(900px) rotateY(-78deg);opacity:0}
.cg-cow{position:absolute;padding:0;border:0;background:none;cursor:pointer;container-type:inline-size;transition-property:left,top,width,height;transition-timing-function:ease-in-out}
.cg-cow:focus-visible{outline:.5cqw solid #1f8fa6;outline-offset:2px}
.cg-bob,.cg-sprite{position:absolute;inset:0;display:block}
.cg-bob{translate:0 0;transition:translate ${LEAN_MS}ms ease-in-out}
.cg-sprite{transform-origin:50% 90%}
.cg-p{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none}
.cg-card{position:absolute;z-index:65;display:flex;align-items:center;justify-content:center;box-sizing:border-box;border:.3cqw solid #74401d;border-radius:.8cqw;background:#fff4d6;color:#3a1a0e;font:900 3.1cqw/1 ui-rounded,system-ui,sans-serif;transform:translate(-50%,-10%);pointer-events:none;translate:0 0;transition-property:left,top,transform,translate}
.cg-card-lean{translate:0 var(--cg-lean-offset)}
.cg-lean .cg-bob{translate:0 var(--cg-lean-offset)}
.cg-lean .cg-head{animation:none;transform:rotate(-5deg);transition:transform ${LEAN_MS}ms ease-in-out}
.cg-label{position:absolute;left:52%;top:58%;font:900 19cqw/1 "Fredoka",ui-rounded,system-ui,sans-serif;color:#3a1a0e;padding:4cqw 7cqw;background:radial-gradient(ellipse,rgba(255,244,214,.95) 55%,rgba(255,244,214,0) 72%);pointer-events:none;z-index:5}
.cg-selected{filter:drop-shadow(0 0 1.6cqw #fff3a0) drop-shadow(0 0 .8cqw #ffd54a)}
.cg-selected{outline:2px solid #ffe27a}
.cg-hop .cg-bob{animation:cg-shake .22s linear 3}
.cg-p{will-change:transform}
.cg-leg-a{transform-origin:30.09% 75.71%}.cg-leg-b{transform-origin:47.69% 75.71%}
.cg-leg-c{transform-origin:55.56% 76.11%}.cg-leg-d{transform-origin:84.26% 76.11%}
.cg-head{transform-origin:27.78% 52.63%}.cg-tail{transform-origin:72.22% 22.67%}
.cg-tongue{transform-origin:31.02% 40.08%}.cg-body{transform-origin:50% 80%}
.cg-ear-l{transform-origin:15.28% 20.24%}.cg-ear-r{transform-origin:34.26% 19.43%}
/* idle: everything moves a little, blink swaps in the original closed-eye crops */
.cg-idle .cg-body{animation:cg-breathe 3.4s ease-in-out infinite;animation-delay:var(--cg-delay)}
.cg-idle .cg-head{animation:cg-look-head 3.2s ease-in-out infinite;animation-delay:var(--cg-delay)}
.cg-idle .cg-tail{animation:cg-tail 2.4s ease-in-out infinite;animation-delay:var(--cg-delay)}
.cg-idle .cg-tongue{animation:cg-tongue 3.4s ease-in-out infinite;animation-delay:var(--cg-delay)}
.cg-idle .cg-leg-b{animation:cg-shift 3.4s ease-in-out infinite;animation-delay:var(--cg-delay)}
.cg-lid{opacity:0;animation:cg-blink 3.6s linear infinite;animation-delay:var(--cg-delay)}
.cg-ear-l,.cg-ear-r{animation:cg-ear 4.2s ease-in-out infinite;animation-delay:var(--cg-delay)}
.cg-ear-r{animation-delay:calc(var(--cg-delay) + 1.7s)}
/* Grounded walk cycle; no fence crossing or size change. */
.cg-walking .cg-bob{animation:cg-bob .68s ease-in-out infinite}
.cg-walking .cg-leg-a,.cg-walking .cg-leg-d{animation:cg-step .68s ease-in-out infinite}
.cg-walking .cg-leg-b,.cg-walking .cg-leg-c{animation:cg-step .68s ease-in-out infinite;animation-delay:-.34s}
.cg-walking .cg-body{animation:cg-roll .68s ease-in-out infinite}
.cg-walking .cg-head{animation:cg-nod .68s ease-in-out infinite}
.cg-walking .cg-tail{animation:cg-tail .5s ease-in-out infinite}
.cg-walking .cg-tongue{animation:cg-tongue 1.8s ease-in-out infinite}

.cg-slot-text{position:absolute;inset:0;display:flex;align-items:flex-start;padding-top:.5cqw;justify-content:center;font:700 4cqw/1 "Fredoka",ui-rounded,system-ui,sans-serif;color:#3a1a0e;letter-spacing:.3cqw;white-space:nowrap;z-index:4;pointer-events:none}
.cg-cheer .cg-bob{animation:cg-cheer-hop .42s ease-in-out 3}
.cg-cheer .cg-head{animation:cg-cheer-head .3s ease-in-out 5!important}
.cg-cheer .cg-tongue{animation:cg-tongue-out 1.5s ease-in-out 1!important}
.cg-cheer .cg-ear-l,.cg-cheer .cg-ear-r{animation:cg-ear-flap .25s ease-in-out 6!important}
.cg-cheer .cg-tail{animation:cg-tail .3s ease-in-out 5!important}
@keyframes cg-blink{0%,90%,100%{opacity:0}92%,96%{opacity:1}}
@keyframes cg-bob{0%,50%,100%{transform:translateY(0)}25%,75%{transform:translateY(-1.8%)}}
.cg-card-walking{animation:cg-card-stride .68s ease-in-out infinite}
/* Reserve translate for the shared lean; walking must not override it. */
@keyframes cg-card-stride{0%,50%,100%{transform:translate(-50%,-10%);rotate:0deg}25%{transform:translate(-50%,calc(-10% - .28cqw));rotate:-1deg}75%{transform:translate(-50%,calc(-10% - .28cqw));rotate:1deg}}
.cg-walking .cg-whole{animation:cg-roll .68s ease-in-out infinite}
.cg-idle .cg-whole{animation:cg-breathe 3.4s ease-in-out infinite}
@keyframes cg-ear{0%,80%,100%{transform:rotate(0)}86%{transform:rotate(-14deg)}92%{transform:rotate(5deg)}}
@keyframes cg-look-head{0%,100%{transform:rotate(-3.5deg) translate(0,0)}35%{transform:rotate(3deg) translate(1%,-.6%)}70%{transform:rotate(-1deg) translate(-.6%,.8%)}}
@keyframes cg-cheer-hop{0%,100%{transform:translateY(0)}50%{transform:translateY(-8%)}}
@keyframes cg-cheer-head{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
@keyframes cg-tongue-out{0%,100%{transform:scale(1,1)}15%,85%{transform:scale(1.1,1.8) translateY(4%)}}
@keyframes cg-ear-flap{0%,100%{transform:rotate(0)}50%{transform:rotate(-20deg)}}
@keyframes cg-step{0%{transform:rotate(-11deg)}20%{transform:rotate(-3deg) translateY(-3%)}40%{transform:rotate(12deg) translateY(-1%)}55%{transform:rotate(11deg)}100%{transform:rotate(-11deg)}}
@keyframes cg-roll{0%,100%{transform:rotate(-1.1deg)}50%{transform:rotate(1.1deg)}}
@keyframes cg-nod{0%,100%{transform:rotate(-2.6deg)}50%{transform:rotate(2.6deg)}}
@keyframes cg-tail{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
@keyframes cg-breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.006,1.014)}}
@keyframes cg-shift{0%,100%{transform:rotate(0)}50%{transform:rotate(2deg)}}
@keyframes cg-tongue{0%,64%,100%{transform:scale(1,1) translateY(0)}72%,88%{transform:scale(1.04,1.5) translateY(2%)}}
@keyframes cg-hop{0%,100%{transform:translateY(0)}50%{transform:translateY(-6%)}}
@keyframes cg-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3%)}75%{transform:translateX(3%)}}
@keyframes cg-pulse{0%,100%{box-shadow:0 0 2.5cqw 1cqw rgba(255,226,122,.85)}50%{box-shadow:0 0 3.5cqw 1.6cqw rgba(255,226,122,.5)}}

/* Source-aligned pivots. All pixels are from the supplied open-eyed drawing. */
.cg-new.cg-head{transform-origin:34% 49%}
.cg-new.cg-tail{transform-origin:86% 41%}
.cg-new.cg-leg-a{transform-origin:28% 72%}
.cg-new.cg-leg-b{transform-origin:44% 72%}
.cg-new.cg-leg-c{transform-origin:60% 74%}
.cg-new.cg-leg-d{transform-origin:72% 70%}
.cg-idle .cg-new.cg-head{animation:cg-new-look 4s ease-in-out infinite;animation-delay:var(--cg-delay)}
.cg-idle .cg-new.cg-tail{animation:cg-new-tail 2.8s ease-in-out infinite;animation-delay:var(--cg-delay)}
.cg-walking .cg-new.cg-tail{animation:cg-new-tail .68s ease-in-out infinite}
.cg-walking .cg-new.cg-head{animation:cg-new-nod .68s ease-in-out infinite}
.cg-walking .cg-new.cg-leg-a,.cg-walking .cg-new.cg-leg-d{animation:cg-new-step .68s ease-in-out infinite}
.cg-walking .cg-new.cg-leg-b,.cg-walking .cg-new.cg-leg-c{animation:cg-new-step .68s ease-in-out infinite;animation-delay:-.34s}
.cg-lean .cg-new.cg-head{animation:none;transform:rotate(-4deg)}
@keyframes cg-new-step{0%,100%{transform:rotate(-3deg)}25%{transform:rotate(0) translateY(-.7%)}50%{transform:rotate(3deg)}75%{transform:rotate(0)}}
@keyframes cg-new-look{0%,100%{transform:rotate(-.65deg)}50%{transform:rotate(.65deg)}}
@keyframes cg-new-nod{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1deg)}}
@keyframes cg-new-tail{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
.cg-msg{position:absolute;left:50%;top:90%;transform:translateX(-50%);z-index:110;font:900 3.4cqw/1.1 "Fredoka",ui-rounded,system-ui,sans-serif;color:#fff;text-shadow:0 .3cqw .6cqw rgba(60,30,10,.7),0 0 1cqw rgba(60,30,10,.5);pointer-events:none;white-space:nowrap}
.cg-done{position:absolute;inset:0;z-index:130;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2cqw;background:rgba(255,255,255,.35);backdrop-filter:blur(2px)}
.cg-done p{font:900 8cqw/1 "Fredoka",ui-rounded,system-ui,sans-serif;color:#2c7a1e;text-shadow:0 .4cqw 0 #fff}
.cg-done button{font:900 3cqw/1 "Fredoka",ui-rounded,system-ui,sans-serif;color:#fff;background:#2e9bb0;border:.5cqw solid #fff;border-radius:3cqw;padding:1.6cqw 4cqw;min-height:44px;cursor:pointer}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
@media (prefers-reduced-motion:reduce){.cg-idle *,.cg-selected .cg-bob{animation-duration:12s!important}}

.cg-head-bottom { clip-path: polygon(0% 40%, 100% 40%, 100% 100%, 0% 100%); }
.cg-head-top { clip-path: polygon(0% 0%, 100% 0%, 100% 40%, 0% 40%); transition: transform 0.5s ease-in-out; }
.cg-revealed-text { position: absolute; left: 50%; top: 30%; transform: translate(-50%, -50%); font: 900 12cqw/1 "Fredoka", ui-rounded, system-ui, sans-serif; color: #4a2610; opacity: 0; transition: opacity 0.5s; z-index: -1; }
.cg-drop .cg-head-top, .cg-lean .cg-head-top { transform: translateY(-30%); }
.cg-drop .cg-revealed-text, .cg-lean .cg-revealed-text { opacity: 1; }
`;
