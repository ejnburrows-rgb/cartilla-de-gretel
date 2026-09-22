import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, Sparkles, Star } from "lucide-react";
import { onGretelEvent } from "@/lib/gretel-bus";
import { speakAsGretel } from "@/lib/gretel-voice";
import { useGretelAnimation } from "./useGretelAnimation";
import { getGretelPoseFrames, type GretelPoseKey } from "./gretelPoses";

export interface GretelLiveAvatarRef {
  celebrate: (customText?: string) => Promise<void>;
  speakMessage: (text: string) => Promise<void>;
  encourage: () => Promise<void>;
}

interface GretelLiveAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  bubblePosition?: "left" | "right" | "top";
}

const CONGRATULATIONS = ["¡Muy bien!", "¡Excelente!", "¡Lo lograste!", "¡Qué bien!"];
const ENCOURAGEMENTS = ["Inténtalo otra vez.", "Casi. Prueba otra vez.", "Tú puedes."];
const SIZES = {
  sm: "h-24 w-24 sm:h-28 sm:w-28",
  md: "h-32 w-32 sm:h-40 sm:w-40",
  lg: "h-40 w-40 sm:h-52 sm:w-52",
};

type Particle = { id: number; x: number; y: number; kind: "star" | "heart" };

function bodyAnimation(state: string) {
  if (state === "cheering") return { y: [0, -18, 0], scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] };
  if (state === "waving") return { rotate: [0, -3, 3, 0], scale: [1, 1.015, 1] };
  if (state === "talking") return { rotate: [0, -1.2, 1.2, 0], scale: [1, 1.01, 1] };
  if (state === "pointing") return { rotate: [0, 2, 1], scale: [1, 1.02, 1] };
  return { y: 0, rotate: [-0.25, 0.25, -0.25], scale: [1, 1.008, 1] };
}

function bodyTransition(state: string) {
  if (state === "cheering") return { duration: 0.65, repeat: 2, ease: "easeInOut" as const };
  if (state === "waving") return { duration: 1.2, repeat: 1, ease: "easeInOut" as const };
  if (state === "talking") return { duration: 0.7, repeat: Infinity, ease: "easeInOut" as const };
  if (state === "pointing") return { duration: 0.45, ease: "easeOut" as const };
  return { duration: 5.5, repeat: Infinity, ease: "easeInOut" as const };
}

export const GretelLiveAvatar = forwardRef<GretelLiveAvatarRef, GretelLiveAvatarProps>(
  ({ className = "", size = "md", bubblePosition = "top" }, ref) => {
    const { machineState, send, isSpeaking } = useGretelAnimation();
    const reducedMotion = useReducedMotion();
    const [bubbleText, setBubbleText] = useState<string | null>(null);
    const [listening, setListening] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [frameIndex, setFrameIndex] = useState(0);
    const particleId = useRef(0);

    const poseKey: GretelPoseKey =
      machineState === "pointing" && bubblePosition === "right" ? "pointingLeft" : machineState;
    const frames = getGretelPoseFrames(poseKey);
    const activeSrc = Array.isArray(frames) ? frames[frameIndex % frames.length] : frames;

    useEffect(() => {
      if (reducedMotion || !Array.isArray(frames)) {
        setFrameIndex(0);
        return;
      }
      const speed = machineState === "talking" ? 120 : machineState === "waving" ? 210 : machineState === "cheering" ? 160 : 1200;
      const timer = window.setInterval(() => setFrameIndex((index) => (index + 1) % frames.length), speed);
      return () => window.clearInterval(timer);
    }, [frames, machineState, reducedMotion]);

    const burst = useCallback((kind: Particle["kind"], count: number) => {
      if (reducedMotion) return;
      const created = Array.from({ length: count }, () => ({
        id: particleId.current++,
        x: (Math.random() - 0.5) * 160,
        y: -30 - Math.random() * 110,
        kind,
      }));
      setParticles((current) => [...current, ...created]);
      window.setTimeout(() => {
        const ids = new Set(created.map((item) => item.id));
        setParticles((current) => current.filter((item) => !ids.has(item.id)));
      }, 1500);
    }, [reducedMotion]);

    const speakMessage = useCallback(async (text: string) => {
      if (!text.trim()) return;
      setBubbleText(text);
      await speakAsGretel(text);
      setBubbleText(null);
    }, []);

    const celebrate = useCallback(async (customText?: string) => {
      const text = customText ?? CONGRATULATIONS[Math.floor(Math.random() * CONGRATULATIONS.length)]!;
      send({ type: "CHEER" });
      burst("star", 10);
      await speakMessage(text);
    }, [burst, send, speakMessage]);

    const encourage = useCallback(async () => {
      const text = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]!;
      send({ type: "POINT" });
      burst("heart", 4);
      await speakMessage(text);
    }, [burst, send, speakMessage]);

    useImperativeHandle(ref, () => ({ celebrate, speakMessage, encourage }), [celebrate, encourage, speakMessage]);

    const interact = useCallback(() => {
      if (isSpeaking) return;
      send({ type: "WAVE" });
      burst("star", 3);
    }, [burst, isSpeaking, send]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      interact();
    };

    useEffect(() => {
      if (typeof Image === "undefined") return;
      const immediatePoses: GretelPoseKey[] = ["idle", "settling", "waving", "pointingLeft", "talking", "cheering"];
      const urls = new Set<string>();
      immediatePoses.forEach((pose) => {
        const poseFrames = getGretelPoseFrames(pose);
        (Array.isArray(poseFrames) ? poseFrames : [poseFrames]).forEach((url) => urls.add(url));
      });
      urls.forEach((url) => {
        const img = new Image();
        img.decoding = "async";
        img.src = url;
      });
    }, []);

    useEffect(() => {
      const entrance = window.setTimeout(() => burst("star", 7), 180);
      return () => window.clearTimeout(entrance);
    }, [burst]);

    useEffect(() => {
      const off = onGretelEvent((type) => {
        if (type === "lesson:start") {
          window.setTimeout(() => send({ type: "WAVE" }), 760);
          return;
        }
        if (type === "answer:correct") {
          send({ type: "CHEER" });
          burst("star", 5);
          return;
        }
        if (type === "answer:wrong") {
          send({ type: "POINT" });
          burst("heart", 2);
          return;
        }
        if (type === "hint:show") {
          send({ type: "POINT" });
          return;
        }
        if (type === "hint:hide") {
          send({ type: "IDLE" });
          return;
        }
        if (type === "page-turn:start") {
          send({ type: "SETTLE" });
          return;
        }
        if (type === "page:revealed" || type === "page-flip") {
          send({ type: "SETTLE" });
          return;
        }
        if (type === "task:point") {
          send({ type: "POINT" });
          return;
        }
        if (type === "activity:complete") {
          send({ type: "CHEER" });
          burst("star", 9);
          return;
        }
        if (type === "lesson:complete") {
          send({ type: "CHEER" });
          burst("star", 16);
          return;
        }
        if (type === "listen:start") {
          setListening(true);
          return;
        }
        if (type === "listen:stop") {
          setListening(false);
        }
      });

      const handleLegacyCelebrate = (event: Event) => {
        const detail = (event as CustomEvent<{ text?: string }>).detail;
        void celebrate(detail?.text);
      };
      const handleExit = () => send({ type: "EXIT" });
      window.addEventListener("gretel:celebrate", handleLegacyCelebrate);
      window.addEventListener("gretel:exit", handleExit);
      return () => {
        off();
        window.removeEventListener("gretel:celebrate", handleLegacyCelebrate);
        window.removeEventListener("gretel:exit", handleExit);
      };
    }, [burst, celebrate, send]);

    return (
      <div
        className={`gretel-avatar-interactive relative inline-flex items-end justify-center ${SIZES[size]} ${className}`}
        data-testid="gretel-live-avatar"
        data-state={machineState}
        data-speaking={isSpeaking ? "true" : "false"}
        data-listening={listening ? "true" : "false"}
        data-interactive="true"
        role="button"
        tabIndex={0}
        aria-label="Interactuar con Gretel"
        onClick={interact}
        onKeyDown={handleKeyDown}
      >
        {listening && (
          <motion.span
            className="absolute inset-[8%] rounded-full border-2 border-sky-400/70"
            aria-hidden
            animate={reducedMotion ? { scale: 1, opacity: 0.65 } : { scale: [0.94, 1.08, 0.94], opacity: [0.35, 0.9, 0.35] }}
            transition={reducedMotion ? { duration: 0 } : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <AnimatePresence>
          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              className="pointer-events-none absolute left-1/2 top-1/2 z-20 text-amber-400"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
              animate={{ x: particle.x, y: particle.y, opacity: [0, 1, 1, 0], scale: [0.4, 1, 0.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.25, ease: "easeOut" }}
              aria-hidden
            >
              {particle.kind === "heart" ? <Heart className="h-4 w-4 fill-rose-300 text-rose-400" /> : particle.id % 2 ? <Star className="h-4 w-4 fill-amber-300" /> : <Sparkles className="h-4 w-4" />}
            </motion.span>
          ))}
        </AnimatePresence>

        <motion.div
          className="relative z-10 h-full w-full origin-bottom"
          initial={reducedMotion ? false : { opacity: 0, y: 28, scale: 0.72 }}
          animate={reducedMotion ? { opacity: 1, y: 0, rotate: 0, scale: 1 } : { opacity: 1, ...bodyAnimation(machineState) }}
          transition={reducedMotion ? { duration: 0 } : { opacity: { duration: 0.35 }, ...bodyTransition(machineState) }}
        >
          <img
            key={activeSrc}
            src={activeSrc}
            alt="Gretel"
            draggable={false}
            className="h-full w-full object-contain drop-shadow-[0_10px_8px_rgba(45,32,20,0.22)]"
            onError={() => send({ type: "ASSET_ERROR" })}
          />
        </motion.div>

        {bubbleText && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute -top-10 left-1/2 z-30 max-w-44 -translate-x-1/2 rounded-2xl border border-amber-200 bg-white/95 px-3 py-2 text-center text-xs font-extrabold text-stone-700 shadow-lg"
            role="status"
          >
            {bubbleText}
          </motion.div>
        )}
      </div>
    );
  },
);

GretelLiveAvatar.displayName = "GretelLiveAvatar";

export function useGretelLive() {
  const avatarRef = useRef<GretelLiveAvatarRef>(null);
  return {
    avatarRef,
    triggerCelebration: (text?: string) => avatarRef.current?.celebrate(text),
    triggerEncouragement: () => avatarRef.current?.encourage(),
  };
}
