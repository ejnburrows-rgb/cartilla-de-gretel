import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const P = "/cartilla/images/gretel/poses";
const IDLE = `${P}/gretel-idle.webp`;
const CLOSED = `${P}/gretel-closed-idle.webp`;
const TALK = [`${P}/gretel-talk-0.webp`, `${P}/gretel-talk.webp`];
const POINT_RIGHT = `${P}/gretel-point.webp`;
const POINT_LEFT = `${P}/gretel-point-left.webp`;
const WAVE = `${P}/gretel-wave-1.webp`;
const CHEER = `${P}/gretel-cheer.webp`;

function useBlink(enabled: boolean) {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!enabled) {
      setClosed(false);
      return;
    }
    let cancelled = false;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        setClosed(true);
        window.setTimeout(() => {
          if (cancelled) return;
          setClosed(false);
          schedule();
        }, 120);
      }, 2200 + Math.random() * 2600);
    };
    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled]);
  return closed;
}

function useTalkFrame(enabled: boolean) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setIndex(0);
      return;
    }
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % TALK.length), 125);
    return () => window.clearInterval(timer);
  }, [enabled]);
  return TALK[index]!;
}

export function GretelLayerRig({
  state,
  pointingLeft = false,
  speaking = false,
  paused = false,
  onError,
}: {
  state: string;
  pointingLeft?: boolean;
  speaking?: boolean;
  paused?: boolean;
  onError?: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const activeMotion = !paused && !reducedMotion;
  const blinking = useBlink(activeMotion && state !== "cheering");
  const talkFrame = useTalkFrame(activeMotion && speaking);
  const gesture = useMemo(() => {
    if (state === "pointing") return pointingLeft ? POINT_LEFT : POINT_RIGHT;
    if (state === "waving") return WAVE;
    return null;
  }, [pointingLeft, state]);

  if (state === "cheering") {
    return (
      <motion.img
        src={CHEER}
        alt="Gretel"
        draggable={false}
        onError={onError}
        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_8px_rgba(45,32,20,0.22)]"
        animate={activeMotion ? { y: [0, -16, 0], rotate: [0, -3, 3, 0], scale: [1, 1.06, 1] } : { y: 0, rotate: 0, scale: 1 }}
        transition={activeMotion ? { duration: 0.7, repeat: 2, ease: "easeInOut" } : { duration: 0 }}
        data-gretel-rig="layered"
        data-gretel-rig-state={state}
      />
    );
  }

  return (
    <div
      className="absolute inset-0 h-full w-full"
      data-gretel-rig="layered"
      data-gretel-rig-state={state}
      data-gretel-rig-speaking={speaking ? "true" : "false"}
      data-gretel-rig-blink={blinking ? "closed" : "open"}
    >
      <motion.img
        src={IDLE}
        alt="Gretel"
        draggable={false}
        onError={onError}
        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_8px_rgba(45,32,20,0.22)]"
        style={{ clipPath: "inset(33% 0 0 0)" }}
        animate={activeMotion ? { y: [0, 1.2, 0], scaleY: [1, 1.006, 1] } : { y: 0, scaleY: 1 }}
        transition={activeMotion ? { duration: 4.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
      />

      <motion.div
        className="absolute inset-0 h-full w-full origin-[50%_37%]"
        animate={
          activeMotion
            ? {
                rotate: state === "listening" ? [-1.5, 1.5, -1.5] : [-0.55, 0.55, -0.55],
                y: state === "talking" ? [0, -0.7, 0] : [0, -0.35, 0],
              }
            : { rotate: 0, y: 0 }
        }
        transition={activeMotion ? { duration: state === "listening" ? 2.3 : 5.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
      >
        <img
          src={IDLE}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
          style={{ clipPath: "inset(0 0 61% 0)" }}
        />

        {blinking && (
          <img
            src={CLOSED}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain"
            style={{ clipPath: "inset(15% 28% 69% 28%)" }}
          />
        )}

        {speaking && (
          <img
            src={talkFrame}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain"
            style={{ clipPath: "inset(25% 31% 63% 31%)" }}
          />
        )}

        {activeMotion && !blinking && (
          <motion.img
            src={IDLE}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain"
            style={{ clipPath: "inset(17% 31% 71% 31%)" }}
            animate={{ x: [-0.8, 0.8, -0.8] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>

      {gesture && (
        <motion.img
          key={gesture}
          src={gesture}
          alt=""
          aria-hidden
          draggable={false}
          onError={onError}
          className="absolute inset-0 h-full w-full object-contain"
          style={{
            clipPath:
              state === "waving"
                ? "inset(4% 0 23% 42%)"
                : pointingLeft
                  ? "inset(24% 42% 16% 0)"
                  : "inset(24% 0 16% 42%)",
          }}
          initial={activeMotion ? { opacity: 0, scale: 0.98 } : false}
          animate={activeMotion ? { opacity: 1, rotate: state === "waving" ? [0, -2.4, 2.4, 0] : [0, 1.5, 0] } : { opacity: 1, rotate: 0 }}
          transition={activeMotion ? { duration: state === "waving" ? 0.9 : 0.5, repeat: state === "waving" ? 1 : 0, ease: "easeInOut" } : { duration: 0 }}
        />
      )}
    </div>
  );
}
