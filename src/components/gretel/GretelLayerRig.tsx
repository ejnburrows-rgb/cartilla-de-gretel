import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

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
        }, 115);
      }, 2600 + Math.random() * 3200);
    };
    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled]);
  return closed;
}

function armPose(state: string, side: "left" | "right", pointingLeft: boolean) {
  if (state === "cheering") return side === "left" ? -138 : 138;
  if (state === "waving" && side === "right") return 132;
  if (state === "pointing") {
    const active = pointingLeft ? side === "left" : side === "right";
    if (active) return side === "left" ? -92 : 92;
  }
  if (state === "teaching" || state === "help") return side === "left" ? -48 : 48;
  return side === "left" ? -18 : 18;
}

export function GretelLayerRig({
  state,
  pointingLeft = false,
  speaking = false,
  paused = false,
  onError: _onError,
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
  const listening = state === "listening";
  const error = state === "gentle-error" || state === "error";
  const helping = state === "help" || state === "teaching";
  const leftRotation = armPose(state, "left", pointingLeft);
  const rightRotation = armPose(state, "right", pointingLeft);
  const mouthOpen = speaking || state === "talking";

  const headMotion = useMemo(
    () =>
      !activeMotion
        ? { rotate: 0, y: 0 }
        : listening
          ? { rotate: [-4, -1, -4], y: [0, 1, 0] }
          : error
            ? { rotate: [2, -2, 2], y: [0, 1, 0] }
            : { rotate: [-0.8, 0.8, -0.8], y: [0, -0.8, 0] },
    [activeMotion, error, listening],
  );

  return (
    <motion.svg
      viewBox="0 0 360 520"
      role="img"
      aria-label="Gretel"
      className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_10px_8px_rgba(45,32,20,0.20)]"
      data-gretel-rig="svg"
      data-gretel-rig-state={state}
      data-gretel-rig-speaking={mouthOpen ? "true" : "false"}
      data-gretel-rig-blink={blinking ? "closed" : "open"}
      animate={
        activeMotion
          ? state === "cheering"
            ? { y: [0, -13, 0], scale: [1, 1.035, 1] }
            : { y: [0, 1.4, 0], scale: [1, 1.006, 1] }
          : { y: 0, scale: 1 }
      }
      transition={
        activeMotion
          ? state === "cheering"
            ? { duration: 0.62, repeat: 2, ease: "easeInOut" }
            : { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0 }
      }
    >
      <defs>
        <linearGradient id="gretelDress" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3e72bd" />
          <stop offset="1" stopColor="#244f98" />
        </linearGradient>
        <linearGradient id="gretelHair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8db6c" />
          <stop offset=".58" stopColor="#e8bd45" />
          <stop offset="1" stopColor="#c9952e" />
        </linearGradient>
      </defs>

      {/* legs + shoes */}
      <g data-rig-part="legs">
        <path d="M142 430 L151 492" stroke="#f1c7a3" strokeWidth="25" strokeLinecap="round" />
        <path d="M218 430 L209 492" stroke="#f1c7a3" strokeWidth="25" strokeLinecap="round" />
        <ellipse cx="145" cy="496" rx="35" ry="13" fill="#6b362c" />
        <ellipse cx="215" cy="496" rx="35" ry="13" fill="#6b362c" />
      </g>

      {/* skirt/body */}
      <motion.g
        data-rig-part="torso"
        animate={activeMotion ? { scaleY: [1, 1.008, 1] } : { scaleY: 1 }}
        transition={activeMotion ? { duration: 4.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        style={{ transformOrigin: "180px 360px" }}
      >
        <path d="M115 285 Q180 258 245 285 L277 444 Q180 474 83 444 Z" fill="url(#gretelDress)" stroke="#8b5a31" strokeWidth="5" />
        <path d="M128 289 Q180 270 232 289 L225 349 Q180 365 135 349 Z" fill="#f7f0de" stroke="#8b5a31" strokeWidth="4" />
        {[305, 323, 341].map((y) => (
          <path key={y} d={"M136 "+y+" Q180 "+(y-8)+" 224 "+y} fill="none" stroke="#c94d4a" strokeWidth="7" strokeLinecap="round" />
        ))}
        <path d="M138 337 L128 433" stroke="#f3d667" strokeWidth="7" strokeLinecap="round" />
        <path d="M222 337 L232 433" stroke="#f3d667" strokeWidth="7" strokeLinecap="round" />
        <g data-rig-part="floral-details">
          <circle cx="151" cy="405" r="9" fill="#f59b81" />
          <circle cx="151" cy="405" r="3.5" fill="#e7b947" />
          <circle cx="209" cy="388" r="9" fill="#f59b81" />
          <circle cx="209" cy="388" r="3.5" fill="#e7b947" />
          <path d="M151 414 q-8 12 -18 17" stroke="#4d8d55" strokeWidth="4" fill="none" />
          <path d="M209 397 q8 12 18 17" stroke="#4d8d55" strokeWidth="4" fill="none" />
        </g>
      </motion.g>

      {/* independently rigged arms */}
      <motion.g
        data-rig-part="left-arm"
        style={{ transformOrigin: "124px 301px" }}
        animate={{ rotate: leftRotation }}
        transition={{ duration: activeMotion ? 0.42 : 0, ease: "easeOut" }}
      >
        <path d="M125 304 C103 330 89 357 80 392" stroke="#f7f0de" strokeWidth="29" strokeLinecap="round" />
        <path d="M80 392 C72 409 66 418 58 425" stroke="#f1c7a3" strokeWidth="24" strokeLinecap="round" />
        <circle cx="56" cy="427" r="15" fill="#f1c7a3" stroke="#8b5a31" strokeWidth="3" />
      </motion.g>
      <motion.g
        data-rig-part="right-arm"
        style={{ transformOrigin: "236px 301px" }}
        animate={
          state === "waving" && activeMotion
            ? { rotate: [rightRotation, rightRotation + 12, rightRotation - 8, rightRotation + 10, rightRotation] }
            : { rotate: rightRotation }
        }
        transition={state === "waving" && activeMotion ? { duration: 1.1, ease: "easeInOut" } : { duration: activeMotion ? 0.42 : 0 }}
      >
        <path d="M235 304 C257 330 271 357 280 392" stroke="#f7f0de" strokeWidth="29" strokeLinecap="round" />
        <path d="M280 392 C288 409 294 418 302 425" stroke="#f1c7a3" strokeWidth="24" strokeLinecap="round" />
        <circle cx="304" cy="427" r="15" fill="#f1c7a3" stroke="#8b5a31" strokeWidth="3" />
      </motion.g>

      {/* hair behind head */}
      <path d="M100 104 Q180 36 260 104 Q286 155 260 249 Q235 277 212 250 Q180 278 148 250 Q121 276 100 245 Q75 164 100 104 Z" fill="url(#gretelHair)" stroke="#8b5a31" strokeWidth="5" />

      {/* independently rigged head */}
      <motion.g
        data-rig-part="head"
        animate={headMotion}
        transition={activeMotion ? { duration: listening ? 2.1 : 4.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        style={{ transformOrigin: "180px 190px" }}
      >
        <ellipse cx="180" cy="176" rx="77" ry="86" fill="#f5caa7" stroke="#8b5a31" strokeWidth="5" />
        <path d="M111 143 Q122 84 180 79 Q238 84 249 143 Q221 118 197 121 Q174 102 151 121 Q130 117 111 143 Z" fill="url(#gretelHair)" stroke="#8b5a31" strokeWidth="4" />

        {/* bow */}
        <g data-rig-part="bow">
          <path d="M154 88 Q120 57 126 110 Q139 120 161 104 Z" fill="#c63d45" stroke="#8b4035" strokeWidth="4" />
          <path d="M206 88 Q240 57 234 110 Q221 120 199 104 Z" fill="#c63d45" stroke="#8b4035" strokeWidth="4" />
          <ellipse cx="180" cy="98" rx="20" ry="16" fill="#d64a4d" stroke="#8b4035" strokeWidth="4" />
        </g>

        {/* eyes + independent gaze */}
        <g data-rig-part="eyes">
          <ellipse cx="150" cy="171" rx="25" ry="19" fill="#fffdf7" stroke="#71482f" strokeWidth="3" />
          <ellipse cx="210" cy="171" rx="25" ry="19" fill="#fffdf7" stroke="#71482f" strokeWidth="3" />
          <motion.g
            data-rig-part="pupils"
            animate={activeMotion ? { x: [-1.5, 1.4, -1.5] } : { x: 0 }}
            transition={activeMotion ? { duration: 3.7, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
          >
            <circle cx="150" cy="172" r="12" fill="#58a8df" />
            <circle cx="210" cy="172" r="12" fill="#58a8df" />
            <circle cx="150" cy="173" r="6" fill="#243a55" />
            <circle cx="210" cy="173" r="6" fill="#243a55" />
            <circle cx="146" cy="168" r="2.5" fill="#fff" />
            <circle cx="206" cy="168" r="2.5" fill="#fff" />
          </motion.g>
          <motion.g
            data-rig-part="eyelids"
            animate={{ scaleY: blinking ? 1 : 0 }}
            transition={{ duration: 0.06 }}
            style={{ transformOrigin: "180px 171px" }}
          >
            <path d="M125 170 Q150 153 175 170 Q150 181 125 170 Z" fill="#f5caa7" />
            <path d="M185 170 Q210 153 235 170 Q210 181 185 170 Z" fill="#f5caa7" />
          </motion.g>
        </g>

        {/* brows */}
        <path d={error ? "M130 142 Q150 151 168 145" : "M130 145 Q150 137 168 143"} fill="none" stroke="#9e6b37" strokeWidth="5" strokeLinecap="round" />
        <path d={error ? "M192 145 Q210 151 230 142" : "M192 143 Q210 137 230 145"} fill="none" stroke="#9e6b37" strokeWidth="5" strokeLinecap="round" />

        {/* nose */}
        <path d="M178 184 Q172 203 181 205" fill="none" stroke="#c9866b" strokeWidth="3" strokeLinecap="round" />

        {/* independently animated mouth */}
        <motion.g data-rig-part="mouth">
          {mouthOpen ? (
            <>
              <ellipse
                cx="180"
                cy="222"
                rx="18"
                ry="9"
                fill="#8b3942"
                className={activeMotion ? "gretel-mouth--talking" : undefined}
              />
              <path d="M166 220 Q180 229 194 220" fill="none" stroke="#ef9b9f" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : helping ? (
            <path d="M163 218 Q180 229 197 218" fill="none" stroke="#9b4a50" strokeWidth="5" strokeLinecap="round" />
          ) : error ? (
            <path d="M164 226 Q180 216 196 226" fill="none" stroke="#9b4a50" strokeWidth="5" strokeLinecap="round" />
          ) : (
            <path d="M163 218 Q180 231 197 218" fill="none" stroke="#9b4a50" strokeWidth="5" strokeLinecap="round" />
          )}
        </motion.g>

        <circle cx="127" cy="207" r="10" fill="#ef9e91" opacity=".5" />
        <circle cx="233" cy="207" r="10" fill="#ef9e91" opacity=".5" />
      </motion.g>
    </motion.svg>
  );
}
