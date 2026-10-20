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
import { JUGGLE_BALLS, frameAt } from "./juggle";
import "./chano.css";

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
  const breatheRef = useRef<HTMLDivElement>(null);
  const armLeftRef = useRef<HTMLImageElement>(null);
  const armRightRef = useRef<HTMLImageElement>(null);
  const juggleRefs = useRef<(HTMLImageElement | null)[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let t0 = 0;
    const clear = () => {
      if (breatheRef.current) breatheRef.current.style.transform = "";
      if (armLeftRef.current) armLeftRef.current.style.transform = "";
      if (armRightRef.current) armRightRef.current.style.transform = "";
      juggleRefs.current.forEach((el) => el && (el.style.transform = ""));
    };
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const t = now - t0;
      const f = frameAt(t);
      // Ease in from the painted pose over the first beat so nothing jumps on load.
      const k = Math.min(1, t / 700);
      const blend = k * k * (3 - 2 * k);
      f.balls.forEach((b, i) => {
        const el = juggleRefs.current[i];
        const home = JUGGLE_BALLS[i];
        if (!el) return;
        const dx = (b.x - home.cx) * blend;
        const dy = (b.y - home.cy) * blend;
        el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      });
      if (armLeftRef.current)
        armLeftRef.current.style.transform = `rotate(${(f.leftArmDeg * blend).toFixed(3)}deg)`;
      if (armRightRef.current)
        armRightRef.current.style.transform = `rotate(${(f.rightArmDeg * blend).toFixed(3)}deg)`;
      if (breatheRef.current) {
        const s = f.breath * blend;
        breatheRef.current.style.transform = `scale(${(1 + 0.006 * s).toFixed(5)}, ${(1 + 0.012 * s).toFixed(5)})`;
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      t0 = 0;
      clear();
      if (!mq?.matches) raf = requestAnimationFrame(tick);
    };
    start();
    mq?.addEventListener?.("change", start);
    return () => {
      cancelAnimationFrame(raf);
      mq?.removeEventListener?.("change", start);
    };
  }, []);

  // Fit the whole scene (no cropping) into the screen, leaving room for the buttons below.
  const rootRef = useRef<HTMLElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [rowW, setRowW] = useState(0);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const fit = () => {
      const cs = getComputedStyle(root);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const gap = parseFloat(cs.rowGap) || 0;
      const availW = root.clientWidth - padX;
      const below =
        (controlsRef.current?.offsetHeight ?? 0) + (statusRef.current?.offsetHeight ?? 0) + gap * 2;
      const availH = root.clientHeight - padY - below;
      const s = Math.max(0.05, Math.min(availW / SCENE_W, availH / SCENE_H));
      setScale(s);
      setRowW(Math.min(availW, Math.max(SCENE_W * s, 460)));
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
    <main className="chano-root" ref={rootRef} aria-label="Juego Payaso Chano">
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
              {JUGGLE_BALLS.map((b, i) => (
                <img
                  key={b.syllable}
                  ref={(el) => {
                    juggleRefs.current[i] = el;
                  }}
                  className="chano-juggle-ball"
                  data-testid={`chano-juggle-ball-${b.syllable}`}
                  src={`${ART}/juggle-ball-${b.syllable}.svg`}
                  alt=""
                  draggable={false}
                  style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
                />
              ))}
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
                {slots[i] ?? <span className="chano-slot-num">{i + 1}</span>}
              </button>
            ))}

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
    </main>
  );
}
