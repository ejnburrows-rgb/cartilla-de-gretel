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
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ballStateAt } from "./juggle";
import type { GameContent } from "@/lib/games/gameContent";
import { recordEvent } from "@/lib/student-session";
import { audioEngine } from "@/lib/audio-engine";
import { ART, BALLS, BOARD, CHANO, PANEL, SCENE_H, SCENE_W, SLOTS, SPEAKER, JUGGLE_GEO } from "./layout";
import { CHANO_WORDS, sameSyllable } from "./words";
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
  // Juggle State
  const clownRef = useRef<HTMLDivElement>(null);
  const ballRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const cascadeSlots = useRef<Record<string, number | null>>({ ma: 0, mi: 1, mu: 2, me: -1 });
  const pendingCascadeRestarts = useRef<string[]>([]);

  const handleDragStartJuggle = useCallback((syllable: string) => {
     cascadeSlots.current[syllable] = null;
  }, []);

  const handleDragEndJuggle = useCallback((syllable: string, placed: boolean) => {
     if (!placed) {
        pendingCascadeRestarts.current.push(syllable);
     }
  }, []);

  useGSAP(
    () => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!clownRef.current) return;

      let isVisible = true;
      const observer = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
      });
      observer.observe(clownRef.current);

      const onVisibilityChange = () => {
        isVisible = document.visibilityState === 'visible';
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      const ticker = (time: number) => {
        if (!isVisible) return;

        const tMs = time * 1000;

        if (!isReduced) {
          const swayDeg = Math.sin((tMs / 720) * Math.PI * 2) * 1.2;
          const laughDip = Math.sin((tMs / 1440) * Math.PI * 2) * 4;
          gsap.set(clownRef.current, {
            rotation: swayDeg,
            y: Math.max(0, laughDip),
            transformOrigin: `${CHANO.breatheOrigin.x}px ${CHANO.breatheOrigin.y}px`
          });
        } else {
          gsap.set(clownRef.current, { rotation: 0, y: 0 });
        }

        if (pendingCascadeRestarts.current.length > 0) {
           const period = 2160;
           for (let i = pendingCascadeRestarts.current.length - 1; i >= 0; i--) {
             const syllable = pendingCascadeRestarts.current[i];
             const usedSlots = Object.values(cascadeSlots.current).filter(v => v !== null && v !== -1) as number[];
             const availableSlots = [0, 1, 2].filter(s => !usedSlots.includes(s));

             if (availableSlots.length > 0) {
                const targetSlot = availableSlots[0];
                const localT = (tMs + [0, 720, 1440][targetSlot]) % period;
                if (localT < 50 || Math.abs(localT - 1080) < 50) {
                   cascadeSlots.current[syllable] = targetSlot;
                   pendingCascadeRestarts.current.splice(i, 1);
                }
             } else {
                const hasResting = Object.values(cascadeSlots.current).includes(-1);
                if (!hasResting) {
                   cascadeSlots.current[syllable] = -1;
                   pendingCascadeRestarts.current.splice(i, 1);
                }
             }
           }
        }

        const usedSlotsSet = new Set(Object.values(cascadeSlots.current));
        const emptySlots = [0, 1, 2].filter(s => !usedSlotsSet.has(s));

        let restingSyllable: string | null = null;
        for (const [syllable, slot] of Object.entries(cascadeSlots.current)) {
          if (slot === -1) {
            restingSyllable = syllable;
            break;
          }
        }

        if (emptySlots.length > 0 && restingSyllable) {
          const targetSlot = emptySlots[0];
          const localT = (tMs + [0, 720, 1440][targetSlot]) % 2160;
          if (localT < 50 || Math.abs(localT - 1080) < 50) {
             cascadeSlots.current[restingSyllable] = targetSlot;
          }
        }

        for (const ball of BALLS) {
          const slot = cascadeSlots.current[ball.syllable];
          const el = ballRefs.current[ball.syllable];
          if (!el) continue;

          if (slot === null) {
             gsap.set(el, { clearProps: "transform,zIndex" });
             continue;
          }

          if (slot === -1 || isReduced) {
             gsap.set(el, {
               x: JUGGLE_GEO.catchLeft.x - ball.cx,
               y: JUGGLE_GEO.catchLeft.y - ball.cy,
               scaleX: 1, scaleY: 1,
               zIndex: 3
             });
          } else {
             const state = ballStateAt(tMs, slot, JUGGLE_GEO as any);
             gsap.set(el, {
               x: state.x - ball.cx,
               y: state.y - ball.cy,
               scaleX: state.scaleX,
               scaleY: state.scaleY,
               zIndex: 3
             });
          }
        }
      };

      gsap.ticker.add(ticker);

      return () => {
        gsap.ticker.remove(ticker);
        observer.disconnect();
        document.removeEventListener('visibilitychange', onVisibilityChange);
      };
    },
    { scope: sceneRef }
  );

  const word = CHANO_WORDS[index];

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
    slots.forEach(s => { if (s) pendingCascadeRestarts.current.push(s); });
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
        if (target >= 0) { cascadeSlots.current[syllable] = null; }
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
        slots.forEach(s => { if (s) pendingCascadeRestarts.current.push(s); });
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
    handleDragStartJuggle(syllable);
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
    let placed = false;
    if (drag.moved) {
      suppressClick.current = true;
      const p = toScene(e.clientX, e.clientY);
      const hit = SLOTS.findIndex(
        (s) => p.x >= s.x - 30 && p.x <= s.x + s.w + 30 && p.y >= s.y - 30 && p.y <= s.y + s.h + 30,
      );
      if (hit >= 0) {
        place(drag.syllable, hit);
        placed = true;
      }
    }
    handleDragEndJuggle(drag.syllable, placed);
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
              src={`${ART}/scene.svg`}
              alt=""
              draggable={false}
              width={SCENE_W}
              height={SCENE_H}
            />

            <div
              className="chano-breathe"
              ref={clownRef}
              data-testid="chano-clown-whole"
              aria-hidden
              style={{ transformOrigin: `${CHANO.breatheOrigin.x}px ${CHANO.breatheOrigin.y}px` }}
            >
              <img
                className="chano-arm chano-arm-left"
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
                  setSlots((prev) => prev.map((v, j) => { if (j === i && v) pendingCascadeRestarts.current.push(v); return j === i ? null : v; }));
                }}
              >
                {slots[i] ?? <span className="chano-slot-num">{i + 1}</span>}
              </button>
            ))}

            {BALLS.map((b, i) => (
              <button
                key={b.syllable}
                ref={(el) => { ballRefs.current[b.syllable] = el; }}
                type="button"
                className="chano-ball"
                data-testid={`chano-ball-${b.syllable}`}
                data-dragging={drag?.syllable === b.syllable && drag.moved ? "true" : undefined}
                aria-label={b.syllable}
                style={{ left: b.cx - b.r, top: b.cy - b.r, width: b.r * 2, height: b.r * 2 }}
                onPointerDown={onBallPointerDown(b.syllable)}
                onPointerMove={onBallPointerMove}
                onPointerUp={onBallPointerUp}
                onPointerCancel={() => {
                  if (drag) handleDragEndJuggle(drag.syllable, false);
                  setDrag(null);
                }}
                onClick={onBallClick(b.syllable)}
              >
                <div data-testid={i < 3 ? `chano-juggle-ball-${i}` : undefined} style={{width: '100%', height: '100%', position: 'absolute'}} />
                <img src={`${ART}/ball-${b.syllable}.svg`} alt="" draggable={false} />
              </button>
            ))}

            {/* Hand caps (z4 overlays) */}
            <img
              src={`${ART}/hand-cap-left.svg`}
              data-testid="chano-hand-cap-left"
              alt=""
              aria-hidden
              style={{ ...px(CHANO.armLeft), zIndex: 4, position: 'absolute', pointerEvents: 'none' }}
            />
            <img
              src={`${ART}/hand-cap-right.svg`}
              data-testid="chano-hand-cap-right"
              alt=""
              aria-hidden
              style={{ ...px(CHANO.armRight), zIndex: 4, position: 'absolute', pointerEvents: 'none' }}
            />

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
