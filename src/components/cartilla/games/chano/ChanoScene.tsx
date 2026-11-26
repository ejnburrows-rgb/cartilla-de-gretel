// ChanoScene.tsx — full-screen Payaso Chano game built on the owner-supplied scene art.
// The art is the real background; only the chalkboard writing, the slot states and the
// four ball hit areas are drawn on top. Audio plays only from recorded files.
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ArrowRight, Check, RotateCcw, Volume2 } from "lucide-react";
import type { GameContent } from "@/lib/games/gameContent";
import { recordEvent } from "@/lib/student-session";
import { audioEngine } from "@/lib/audio-engine";
import { ART, BALLS, BOARD, CHANO, PANEL, SCENE_H, SCENE_W, SLOTS, SPEAKER } from "./layout";
import { CHANO_WORDS, sameSyllable } from "./words";
import {
  JUGGLE_BALLS,
  PLACE_MS,
  TOSS_MS,
  frameAt,
  nextCatchTime,
  poseAt,
  slotBalls,
  type BallPose,
  type Placement,
  type Toss,
} from "./juggle";
import "./chano.css";

/** A placed ball is drawn a little smaller so it sits inside its chalkboard slot. */
const SLOT_BALL_SCALE = 0.8;

type Mark = "ok" | "bad" | null;
type Drag = {
  syllable: string;
  x: number;
  y: number;
  pointerId: number;
  moved: boolean;
  startX: number;
  startY: number;
};

const SFX = {
  ok: "/audio/feel/success.mp3",
  bad: "/audio/feel/error.mp3",
  tap: "/audio/feel/tap.mp3",
} as const;

function playFile(src?: string, volume = 1) {
  if (!src || typeof window === "undefined" || typeof Audio === "undefined") return;
  try {
    if (audioEngine.isMuted()) return;
    const a = new Audio(src);
    a.volume = Math.min(1, Math.max(0, audioEngine.getVolume() * volume));
    a.play().catch(() => {});
  } catch {
    /* no audio support: stay silent */
  }
}

const px = (box: { x: number; y: number; w: number; h: number }): CSSProperties => ({
  left: box.x,
  top: box.y,
  width: box.w,
  height: box.h,
});

export function ChanoScene({ content }: { content: GameContent }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [index, setIndex] = useState(0);
  const [slots, setSlots] = useState<(string | null)[]>([null, null]);
  const [mark, setMark] = useState<Mark>(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState<boolean[]>(() => CHANO_WORDS.map(() => false));
  const [finished, setFinished] = useState(false);
  const [showWord, setShowWord] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const suppressClick = useRef(false);
  const clearTimer = useRef<number | null>(null);
  const word = CHANO_WORDS[index];

  // Chano juggles his own five painted balls on one clock (see juggle.ts). Transforms are
  // written straight to the elements every frame; React state is never touched per frame.
  // Reduced motion: no clock at all, so everything stays in the original painted position.
  // A picked ball is caught from the juggle and placed on its slot (placements), and tossed
  // back into the juggle when the slot is cleared (tosses).
  const breatheRef = useRef<HTMLDivElement>(null);
  const armLeftRef = useRef<HTMLImageElement>(null);
  const armRightRef = useRef<HTMLImageElement>(null);
  const juggleRefs = useRef<(HTMLImageElement | null)[]>([]);
  const placementsRef = useRef<(Placement | null)[]>(JUGGLE_BALLS.map(() => null));
  const tossesRef = useRef<(Toss | null)[]>(JUGGLE_BALLS.map(() => null));
  const clockRef = useRef<{ t0: number; running: boolean }>({ t0: 0, running: false });
  const sceneTime = () =>
    clockRef.current.running && clockRef.current.t0 ? performance.now() - clockRef.current.t0 : 0;
  const setBall = (i: number, pose: BallPose) => {
    const el = juggleRefs.current[i];
    if (!el) return;
    const home = JUGGLE_BALLS[i];
    el.style.transform = `translate3d(${(pose.x - home.cx).toFixed(2)}px, ${(pose.y - home.cy).toFixed(2)}px, 0) scale(${pose.scale.toFixed(4)})`;
    if (el.dataset.state !== pose.state) el.dataset.state = pose.state;
  };
  // Reduced motion: placed balls sit on their slots, every other ball in its painted spot.
  const paintStill = useCallback(() => {
    JUGGLE_BALLS.forEach((b, i) => {
      const place = placementsRef.current[i];
      tossesRef.current[i] = null;
      setBall(
        i,
        place
          ? { ...place.slot, scale: place.scale, state: "on-board" }
          : { x: b.cx, y: b.cy, scale: 1, state: "juggling" },
      );
    });
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const clear = () => {
      if (breatheRef.current) breatheRef.current.style.transform = "";
      if (armLeftRef.current) armLeftRef.current.style.transform = "";
      if (armRightRef.current) armRightRef.current.style.transform = "";
    };
    const tick = (now: number) => {
      const clock = clockRef.current;
      if (!clock.t0) clock.t0 = now;
      const t = now - clock.t0;
      const f = frameAt(t);
      // Ease in from the painted pose over the first beat so nothing jumps on load.
      const k = Math.min(1, t / 700);
      const blend = k * k * (3 - 2 * k);
      const s = f.breath * blend;
      const sx = 1 + 0.006 * s;
      const sy = 1 + 0.012 * s;
      const o = CHANO.breatheOrigin;
      JUGGLE_BALLS.forEach((home, i) => {
        const place = placementsRef.current[i];
        let toss = tossesRef.current[i];
        if (toss && t >= toss.startT + TOSS_MS) toss = tossesRef.current[i] = null;
        // A ball picked while it is still flying back finishes that toss first.
        const pose =
          place && toss && t < place.catchT ? poseAt(t, i, null, toss) : poseAt(t, i, place, toss);
        if (pose.state === "juggling" || pose.state === "chosen") {
          // Juggled balls ride along with Chano's breathing, like his hands do.
          const x = home.cx + (o.x + (pose.x - o.x) * sx - home.cx) * blend;
          const y = home.cy + (o.y + (pose.y - o.y) * sy - home.cy) * blend;
          setBall(i, { ...pose, x, y });
        } else setBall(i, pose);
      });
      if (armLeftRef.current)
        armLeftRef.current.style.transform = `rotate(${(f.leftArmDeg * blend).toFixed(3)}deg)`;
      if (armRightRef.current)
        armRightRef.current.style.transform = `rotate(${(f.rightArmDeg * blend).toFixed(3)}deg)`;
      if (breatheRef.current)
        breatheRef.current.style.transform = `scale(${sx.toFixed(5)}, ${sy.toFixed(5)})`;
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      clockRef.current = { t0: 0, running: !mq?.matches };
      clear();
      // Restarting the clock: anything already chosen or placed lands on its slot at once.
      placementsRef.current = placementsRef.current.map(
        (p) => p && { ...p, pickT: 0, catchT: -PLACE_MS },
      );
      paintStill();
      if (!mq?.matches) raf = requestAnimationFrame(tick);
    };
    start();
    mq?.addEventListener?.("change", start);
    return () => {
      cancelAnimationFrame(raf);
      mq?.removeEventListener?.("change", start);
    };
  }, [paintStill]);

  // Fit the whole scene (no cropping) into the screen, leaving room for the buttons below.
  const rootRef = useRef<HTMLElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [rowW, setRowW] = useState(0);
  const [wide, setWide] = useState(false);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const fit = () => {
      const cs = getComputedStyle(root);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const W = root.clientWidth - padX;
      const H = root.clientHeight - padY;
      // Landscape (owner note on #1015): the scene takes the full height, the buttons stand
      // in a column beside it and the scene's own art fills the rest of the screen.
      const isWide = root.clientWidth / root.clientHeight >= 1.2;
      setWide(isWide);
      if (isWide) {
        const aside = Math.min(260, Math.max(150, W * 0.22));
        const s = Math.max(0.05, Math.min((W - aside - 16) / SCENE_W, H / SCENE_H));
        setScale(s);
        setRowW(0);
        return;
      }
      const gap = parseFloat(cs.rowGap) || 0;
      const below =
        (controlsRef.current?.offsetHeight ?? 0) + (statusRef.current?.offsetHeight ?? 0) + gap * 2;
      const s = Math.max(0.05, Math.min(W / SCENE_W, (H - below) / SCENE_H));
      setScale(s);
      setRowW(Math.min(W, Math.max(SCENE_W * s, 460)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(root);
    if (statusRef.current) ro.observe(statusRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (clearTimer.current) window.clearTimeout(clearTimer.current);
    },
    [],
  );

  // Board → physical balls. A newly filled slot asks Chano to catch that exact ball; a
  // cleared slot tosses it back into the juggle.
  const ballInSlot = slotBalls(slots);
  const ballKey = ballInSlot.join(",");
  useEffect(() => {
    const t = sceneTime();
    const running = clockRef.current.running;
    const want = JUGGLE_BALLS.map(() => -1);
    ballInSlot.forEach((j, k) => {
      if (j >= 0) want[j] = k;
    });
    JUGGLE_BALLS.forEach((_, j) => {
      const cur = placementsRef.current[j];
      const k = want[j];
      if (k >= 0) {
        const slot = { x: SLOTS[k].x + SLOTS[k].w / 2, y: SLOTS[k].y + SLOTS[k].h / 2 };
        if (!cur) {
          const toss = tossesRef.current[j];
          const ready = toss ? Math.max(t, toss.startT + TOSS_MS) : t;
          placementsRef.current[j] = {
            slot,
            scale: SLOT_BALL_SCALE,
            pickT: t,
            catchT: running ? nextCatchTime(ready, j) : -PLACE_MS,
          };
        } else if (cur.slot.x !== slot.x || cur.slot.y !== slot.y) {
          const pose = poseAt(t, j, cur);
          placementsRef.current[j] = {
            slot,
            scale: SLOT_BALL_SCALE,
            pickT: t,
            catchT: running ? t : -PLACE_MS,
            from: pose,
            fromScale: pose.scale,
          };
        }
      } else if (cur) {
        placementsRef.current[j] = null;
        const pose = poseAt(t, j, cur);
        if (running && pose.state !== "chosen")
          tossesRef.current[j] = { from: pose, fromScale: pose.scale, startT: t };
      }
    });
    if (!running) paintStill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ballKey, paintStill]);

  const resetBoard = useCallback(() => {
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
    clearTimer.current = null;
    setSlots([null, null]);
    setMark(null);
  }, []);

  const place = useCallback(
    (syllable: string, slotIdx?: number) => {
      if (finished || mark === "ok") return;
      if (mark === "bad") resetBoard();
      setMark(null);
      setSlots((prev) => {
        const next = mark === "bad" ? [null, null] : [...prev];
        const target = slotIdx ?? next.findIndex((s) => s === null);
        if (target < 0) return next;
        next[target] = syllable;
        return next;
      });
      playFile(SFX.tap, 0.35);
    },
    [finished, mark, resetBoard],
  );

  const check = () => {
    if (finished || mark === "ok" || slots.some((s) => s === null)) return;
    const ok = slots.every((s, i) => sameSyllable(s, word.syllables[i]));
    if (ok) {
      setMark("ok");
      playFile(SFX.ok, 0.6);
      if (!solved[index]) {
        setScore((n) => n + 1);
        setSolved((prev) => prev.map((v, i) => (i === index ? true : v)));
      }
    } else {
      setMark("bad");
      playFile(SFX.bad, 0.5);
      clearTimer.current = window.setTimeout(() => {
        setSlots([null, null]);
        setMark(null);
        clearTimer.current = null;
      }, 1100);
    }
  };

  const next = () => {
    resetBoard();
    setShowWord(false);
    if (finished) {
      setFinished(false);
      setIndex(0);
      setScore(0);
      setSolved(CHANO_WORDS.map(() => false));
      return;
    }
    if (index >= CHANO_WORDS.length - 1) {
      setFinished(true);
      recordEvent({
        lessonId: `game:${content.id}`,
        kind: "exercise",
        score,
        total: CHANO_WORDS.length,
        meta: { exercise: content.type, completed: true, gameId: content.id },
      });
      return;
    }
    setIndex((i) => i + 1);
  };

  // Pointer → scene-art coordinates.
  const toScene = (clientX: number, clientY: number) => {
    const r = sceneRef.current?.getBoundingClientRect();
    if (!r || !scale) return { x: 0, y: 0 };
    return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale };
  };

  const onBallPointerDown = (syllable: string) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toScene(e.clientX, e.clientY);
    setDrag({
      syllable,
      pointerId: e.pointerId,
      moved: false,
      x: p.x,
      y: p.y,
      startX: p.x,
      startY: p.y,
    });
  };
  const onBallPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    const p = toScene(e.clientX, e.clientY);
    const moved = drag.moved || Math.hypot(p.x - drag.startX, p.y - drag.startY) > 18;
    setDrag({ ...drag, x: p.x, y: p.y, moved });
  };
  const onBallPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (drag.moved) {
      suppressClick.current = true;
      const p = toScene(e.clientX, e.clientY);
      const hit = SLOTS.findIndex(
        (s) => p.x >= s.x - 30 && p.x <= s.x + s.w + 30 && p.y >= s.y - 30 && p.y <= s.y + s.h + 30,
      );
      if (hit >= 0) place(drag.syllable, hit);
    }
    setDrag(null);
  };
  const onBallClick = (syllable: string) => () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    place(syllable);
  };

  const hint = finished
    ? `${score} de ${CHANO_WORDS.length} ${score === 1 ? "acierto" : "aciertos"}. Presiona Siguiente para jugar otra vez.`
    : mark === "ok"
      ? "¡Muy bien!"
      : mark === "bad"
        ? "Intenta otra vez."
        : "Toca o arrastra dos pelotas.";

  const cardW = SCENE_W * scale;
  const cardH = SCENE_H * scale;

  return (
    <main
      className={`chano-root${wide ? " chano-wide" : ""}`}
      ref={rootRef}
      aria-label="Juego Payaso Chano"
    >
      {/* Landscape: the same scene, softened, fills the screen around the full-height scene. */}
      <img className="chano-backdrop" src={`${ART}/scene.svg`} alt="" draggable={false} />
      <div className="chano-stage">
        <div
          className="chano-card"
          style={{ width: cardW, height: cardH, visibility: scale ? "visible" : "hidden" }}
        >
          <div
            className="chano-scene"
            ref={sceneRef}
            style={{ width: SCENE_W, height: SCENE_H, transform: `scale(${scale})` }}
          >
            <img
              className="chano-bg"
              src={`${ART}/scene-juggle-bg.svg`}
              alt=""
              draggable={false}
              width={SCENE_W}
              height={SCENE_H}
            />

            <div
              className="chano-breathe"
              ref={breatheRef}
              aria-hidden
              style={{ transformOrigin: `${CHANO.breatheOrigin.x}px ${CHANO.breatheOrigin.y}px` }}
            >
              <img
                className="chano-arm chano-arm-left"
                ref={armLeftRef}
                src={`${ART}/chano-arm-left.svg`}
                alt=""
                draggable={false}
                style={{
                  ...px(CHANO.armLeft),
                  transformOrigin: `${CHANO.armLeft.pivotX}px ${CHANO.armLeft.pivotY}px`,
                }}
              />
              <img
                className="chano-arm chano-arm-right"
                ref={armRightRef}
                src={`${ART}/chano-arm-right.svg`}
                alt=""
                draggable={false}
                style={{
                  ...px(CHANO.armRight),
                  transformOrigin: `${CHANO.armRight.pivotX}px ${CHANO.armRight.pivotY}px`,
                }}
              />
              <img
                className="chano-body"
                src={`${ART}/chano-body.svg`}
                alt=""
                draggable={false}
                style={px(CHANO.body)}
              />
            </div>

            <section className="chano-panel" aria-label="Instrucciones del juego" style={px(PANEL)}>
              <ol className="chano-sr">
                <li>Escucha la palabra.</li>
                <li>Arrastra las sílabas.</li>
                <li>Forma la palabra en la pizarra.</li>
                <li>Presiona para comprobar.</li>
              </ol>
              <button
                type="button"
                className="chano-speaker"
                aria-label="Escuchar instrucciones"
                style={{
                  left: SPEAKER.cx - PANEL.x - SPEAKER.r,
                  top: SPEAKER.cy - PANEL.y - SPEAKER.r,
                  width: SPEAKER.r * 2,
                  height: SPEAKER.r * 2,
                }}
                onClick={() => playFile(undefined)}
              />
            </section>

            <div className="chano-board" style={px(BOARD)}>
              <p className="chano-board-count">
                {finished ? "¡Terminaste!" : `Palabra ${index + 1} de ${CHANO_WORDS.length}`}
              </p>
              <p className="chano-board-title">Escucha y forma la palabra</p>
              <p className="chano-board-hint" role="status">
                {hint}
              </p>
            </div>

            {SLOTS.map((s, i) => (
              <button
                key={i}
                type="button"
                className="chano-slot"
                data-state={slots[i] ? (mark ?? "filled") : "empty"}
                style={px(s)}
                aria-label={
                  slots[i]
                    ? `Casilla ${i + 1}: ${slots[i]}. Toca para quitar.`
                    : `Casilla ${i + 1} vacía`
                }
                onClick={() => {
                  if (mark === "ok" || finished || !slots[i]) return;
                  setMark(null);
                  setSlots((prev) => prev.map((v, j) => (j === i ? null : v)));
                }}
              >
                {slots[i] && ballInSlot[i] < 0 ? (
                  slots[i]
                ) : slots[i] ? null : (
                  <span className="chano-slot-num">{i + 1}</span>
                )}
              </button>
            ))}
            {/* Chano's five juggling balls. Above the board, so a caught ball sits on its slot. */}
            <div className="chano-juggle-layer" aria-hidden>
              {JUGGLE_BALLS.map((b, i) => (
                <img
                  key={b.syllable}
                  ref={(el) => {
                    juggleRefs.current[i] = el;
                  }}
                  className="chano-juggle-ball"
                  data-testid={`chano-juggle-ball-${b.syllable}`}
                  data-state="juggling"
                  src={`${ART}/juggle-ball-${b.syllable}.svg`}
                  alt=""
                  draggable={false}
                  style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
                />
              ))}
            </div>

            {BALLS.map((b) => (
              <button
                key={b.syllable}
                type="button"
                className="chano-ball"
                data-dragging={drag?.syllable === b.syllable && drag.moved ? "true" : undefined}
                aria-label={b.syllable}
                style={{ left: b.cx - b.r, top: b.cy - b.r, width: b.r * 2, height: b.r * 2 }}
                onPointerDown={onBallPointerDown(b.syllable)}
                onPointerMove={onBallPointerMove}
                onPointerUp={onBallPointerUp}
                onPointerCancel={() => setDrag(null)}
                onClick={onBallClick(b.syllable)}
              >
                <img src={`${ART}/ball-${b.syllable}.svg`} alt="" draggable={false} />
              </button>
            ))}

            {drag?.moved && (
              <img
                className="chano-ghost"
                src={`${ART}/ball-${drag.syllable}.svg`}
                alt=""
                aria-hidden
                style={{ left: drag.x - 92, top: drag.y - 92 }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="chano-aside">
        <div className="chano-controls" ref={controlsRef} style={{ width: rowW || undefined }}>
          <button
            type="button"
            className="chano-btn chano-btn-listen"
            onClick={() => playFile(word.audio)}
          >
            <Volume2 aria-hidden /> Escuchar
          </button>
          <button type="button" className="chano-btn chano-btn-check" onClick={check}>
            <Check aria-hidden /> Comprobar
          </button>
          <button type="button" className="chano-btn chano-btn-clear" onClick={resetBoard}>
            <RotateCcw aria-hidden /> Borrar
          </button>
          <button type="button" className="chano-btn chano-btn-next" onClick={next}>
            <ArrowRight aria-hidden /> Siguiente
          </button>
        </div>

        <p className="chano-status" ref={statusRef} style={{ width: rowW || undefined }}>
          Toca una pelota, o arrástrala a la pizarra.{" "}
          <button type="button" className="chano-link" onClick={() => setShowWord((v) => !v)}>
            {showWord ? `Palabra: ${word.word}` : "Mostrar palabra"}
          </button>{" "}
          · {score} {score === 1 ? "acierto" : "aciertos"}
        </p>
      </div>
    </main>
  );
}
