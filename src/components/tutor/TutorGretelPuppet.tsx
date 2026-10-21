/**
 * TutorGretelPuppet — Gretel on the tutor screens (spec §2, blocker B5).
 *
 * Today (no approved layer pack yet): renders the APPROVED MASTER INTACT
 * (`gretel-approved-master.png`, the only Gretel image) with framer-motion
 * whole-figure motion ONLY — breathing, settle, listening tilt — inside the
 * GRETEL-MOTION-CONTRACT bounds and the existing `gretelMachine` states.
 * No mouth shapes, no new visuals (owner has not approved layer art).
 *
 * When the owner later approves layers (`layers/manifest.json`, validated
 * by `tutor-puppet-layers.ts`), this same component turns on blink / mouth
 * visemes / expression / wave / point with NO code change: it renders the
 * manifest's layers instead of the master and drives each layer's
 * visibility from its role and the machine state. A layer load failure
 * falls back to the master — never a broken or off-model Gretel.
 *
 * Reduced motion (spec §9): static pose, instant state swaps, no tweening.
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { loadPuppetLayers, type PuppetLayer } from "@/lib/tutor-puppet-layers";
import type { GretelState } from "@/components/gretel/gretelMachine";

/** Approved master canvas ( GretelLayerRig viewBox — unchanged). */
const MASTER_VIEWBOX = { width: 1086, height: 1448 };

/** GRETEL-MOTION-CONTRACT + spec §17 motion bounds (whole figure only today). */
const MOTION = {
  /** Breathing: 3.5 s loop, about 1% scale. */
  breathe: { duration: 3.5, scale: 1.01 },
  /** Head-tilt (listening): 6°, 600 ms ease. */
  tilt: { degrees: 6, ms: 600 },
  /** Cheer: gentle hop of 8 px. */
  hop: { px: 8 },
  /** Settle on mount: soft landing from a few px up. */
  settle: { px: 10, ms: 520 },
} as const;

export interface TutorGretelPuppetProps {
  /** Current `gretelMachine` state — the puppet only reacts to it. */
  state: GretelState;
  /**
   * Current Rhubarb viseme (A–H or X). Only used once approved mouth
   * layers exist; today's whole-figure motion ignores it.
   */
  viseme?: string;
  onError?: () => void;
}

type PuppetMode = "loading" | "master" | "layered";

/**
 * Layer visibility from role + machine state (future layered mode):
 * blink pieces show during the machine's blink; mouth pieces show when
 * they cover the current viseme (X = rest); the happy expression shows
 * while cheering; wave/point arms show in their states; static always.
 */
function layerVisible(layer: PuppetLayer, state: GretelState, viseme: string): boolean {
  switch (layer.role) {
    case "static":
      return true;
    case "blink":
      return state === "blinking";
    case "mouth":
      return layer.shapes?.includes(viseme as never) ?? false;
    case "expression":
      return state === "cheering";
    case "arm-wave":
      return state === "waving";
    case "arm-point":
      return state === "pointing";
    default:
      return false;
  }
}

export function TutorGretelPuppet({ state, viseme = "X", onError }: TutorGretelPuppetProps) {
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<PuppetMode>("loading");
  const [composition, setComposition] = useState<"overlay" | "complete">("overlay");
  const [layers, setLayers] = useState<readonly PuppetLayer[]>([]);
  const [layerFailed, setLayerFailed] = useState(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Resolve master vs layered once per mount. Failures → master, never broken.
  useEffect(() => {
    let alive = true;
    loadPuppetLayers().then(async (resolution) => {
      if (!alive) return;
      if (resolution.mode === "layered") {
        try {
          await Promise.all(
            resolution.layers.map(
              (layer) =>
                new Promise<void>((resolve, reject) => {
                  const image = new Image();
                  image.onload = () =>
                    image.naturalWidth === MASTER_VIEWBOX.width &&
                    image.naturalHeight === MASTER_VIEWBOX.height
                      ? resolve()
                      : reject(new Error("Layer canvas does not match Gretel"));
                  image.onerror = () => reject(new Error("Layer image unavailable"));
                  image.src = layer.src;
                }),
            ),
          );
        } catch {
          if (alive) {
            setMode("master");
            onErrorRef.current?.();
          }
          return;
        }
        if (!alive) return;
        setLayers(resolution.layers);
        setComposition(resolution.composition);
        setMode("layered");
      } else {
        setMode("master");
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const showMaster =
    composition === "overlay" ||
    mode === "master" ||
    mode === "loading" ||
    (mode === "layered" && layerFailed);

  // Whole-figure motion (contract bounds). Reduced motion: nothing tweens.
  const tiltDegrees = state === "listening" ? MOTION.tilt.degrees : 0;
  const hop = state === "cheering" ? [-MOTION.hop.px, 0, -MOTION.hop.px, 0] : 0;
  const settleY = state === "settling" ? [MOTION.settle.px, 0] : 0;

  return (
    <motion.div
      data-tutor-puppet=""
      data-puppet-mode={mode === "layered" && !layerFailed ? composition : "master"}
      data-puppet-state={state}
      className="relative h-full w-full"
      style={{ originY: 0.65 }}
      animate={
        reducedMotion
          ? undefined
          : {
              rotate: tiltDegrees,
              y: hop || settleY,
            }
      }
      transition={{ duration: MOTION.tilt.ms / 1000, ease: "easeInOut" }}
    >
      {/* Breathing: an independent 3.5 s whole-figure loop (contract). */}
      <motion.div
        className="h-full w-full"
        animate={reducedMotion ? undefined : { scale: [1, MOTION.breathe.scale, 1] }}
        transition={{ duration: MOTION.breathe.duration, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          viewBox={`0 0 ${MASTER_VIEWBOX.width} ${MASTER_VIEWBOX.height}`}
          role="img"
          aria-label="Gretel"
          className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_10px_8px_rgba(45,32,20,0.20)]"
        >
          {showMaster ? (
            <image
              data-puppet-part="approved-master"
              href={GRETEL_APPROVED_MASTER_SRC}
              x="0"
              y="0"
              width={MASTER_VIEWBOX.width}
              height={MASTER_VIEWBOX.height}
              preserveAspectRatio="xMidYMid meet"
              onError={() => onErrorRef.current?.()}
            />
          ) : null}
          {mode === "layered" &&
            !layerFailed &&
            layers.map((layer) => (
              <image
                key={layer.id}
                data-puppet-layer={layer.id}
                href={layer.src}
                x="0"
                y="0"
                width={MASTER_VIEWBOX.width}
                height={MASTER_VIEWBOX.height}
                preserveAspectRatio="xMidYMid meet"
                style={{
                  visibility: layerVisible(layer, state, reducedMotion ? "X" : viseme)
                    ? "visible"
                    : "hidden",
                }}
                onError={() => {
                  // Any layer that fails to load: back to the intact master.
                  setLayerFailed(true);
                  onErrorRef.current?.();
                }}
              />
            ))}
        </svg>
      </motion.div>
    </motion.div>
  );
}

export default TutorGretelPuppet;
