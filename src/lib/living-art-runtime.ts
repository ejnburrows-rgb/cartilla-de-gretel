import { resolveTrueBlinkFrame } from "./living-blink-map";

const FAITHFUL_ART_RE = /\/cartilla\/art\/faithful\//;
const blinkTimers = new WeakMap<HTMLImageElement, number>();
const reactTimers = new WeakMap<HTMLImageElement, number>();

function pathOnly(src: string): string {
  if (!src) return "";
  try {
    return new URL(src, window.location.href).pathname;
  } catch {
    return src;
  }
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const APPROVED_PROFILES: Readonly<Record<string, "breathe" | "float" | "sway">> = {
  "/cartilla/art/faithful/vocal-o/oso.webp": "breathe",
  "/cartilla/art/faithful/vocal-o/oruga.webp": "sway",
};

function profileFor(src: string): "breathe" | "float" | "sway" | undefined {
  return APPROVED_PROFILES[src];
}

function nextBlinkDelay(src: string): number {
  return 2600 + (hash(src) % 2200);
}

function canAnimate(): boolean {
  return !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function isLivingArtSource(src: string): boolean {
  return FAITHFUL_ART_RE.test(pathOnly(src));
}

function scheduleTrueBlink(img: HTMLImageElement, openSrc: string, blinkSrc: string): void {
  const existing = blinkTimers.get(img);
  if (existing) window.clearTimeout(existing);
  if (!canAnimate()) return;

  const timer = window.setTimeout(() => {
    if (!img.isConnected) return;
    img.classList.add("living-runtime-art--blinking");
    img.src = blinkSrc;

    const reopen = window.setTimeout(() => {
      if (!img.isConnected) return;
      img.src = openSrc;
      img.classList.remove("living-runtime-art--blinking");
      scheduleTrueBlink(img, openSrc, blinkSrc);
    }, 145);

    blinkTimers.set(img, reopen);
  }, nextBlinkDelay(openSrc));

  blinkTimers.set(img, timer);
}

function addTouchReaction(img: HTMLImageElement): void {
  img.addEventListener("pointerdown", () => {
    if (!canAnimate() || !profileFor(pathOnly(img.src))) return;
    const oldTimer = reactTimers.get(img);
    if (oldTimer) window.clearTimeout(oldTimer);
    img.classList.remove("living-runtime-art--reacting");
    // Force a new animation even on rapid repeated taps.
    void img.offsetWidth;
    img.classList.add("living-runtime-art--reacting");
    const timer = window.setTimeout(
      () => img.classList.remove("living-runtime-art--reacting"),
      420,
    );
    reactTimers.set(img, timer);
  });
}

export function enhanceLivingArtImage(img: HTMLImageElement): void {
  if (img.closest(".living-illustration")) return;
  if (img.dataset.livingStatic === "true") return;

  const openSrc = pathOnly(img.currentSrc || img.src);
  if (!isLivingArtSource(openSrc)) return;
  if (img.dataset.livingSource === openSrc) return;

  const oldBlinkTimer = blinkTimers.get(img);
  if (oldBlinkTimer) window.clearTimeout(oldBlinkTimer);
  const oldReactTimer = reactTimers.get(img);
  if (oldReactTimer) window.clearTimeout(oldReactTimer);

  img.classList.remove(
    "living-runtime-art--breathe",
    "living-runtime-art--float",
    "living-runtime-art--sway",
    "living-runtime-art--blinking",
    "living-runtime-art--reacting",
  );

  const profile = profileFor(openSrc);
  img.dataset.livingRuntime = "true";
  img.dataset.livingSource = openSrc;
  delete img.dataset.trueBlinkFrame;
  if (profile) {
    img.dataset.livingProfile = profile;
    img.classList.add("living-runtime-art", `living-runtime-art--${profile}`);
    img.style.setProperty("--living-runtime-delay", `-${(hash(openSrc) % 2800) / 1000}s`);
    img.style.setProperty("--living-runtime-duration", `${4.8 + (hash(openSrc) % 1800) / 1000}s`);
    if (img.dataset.livingTouchBound !== "true") {
      addTouchReaction(img);
      img.dataset.livingTouchBound = "true";
    }
  } else {
    delete img.dataset.livingProfile;
    img.classList.remove("living-runtime-art");
  }

  const blinkSrc = resolveTrueBlinkFrame(openSrc);
  if (blinkSrc) {
    img.dataset.trueBlinkFrame = blinkSrc;
    if (typeof Image !== "undefined") {
      const preload = new Image();
      preload.decoding = "async";
      preload.src = blinkSrc;
    }
    scheduleTrueBlink(img, openSrc, blinkSrc);
  }
}

function sweep(root: ParentNode = document): void {
  root.querySelectorAll("img").forEach((node) => {
    if (node instanceof HTMLImageElement) enhanceLivingArtImage(node);
  });
}

let started = false;
let observer: MutationObserver | null = null;

export function initLivingArtRuntime(): void {
  if (started || typeof document === "undefined") return;
  started = true;

  sweep();

  observer = new MutationObserver((records) => {
    for (const record of records) {
      if (
        record.type === "attributes" &&
        record.target instanceof HTMLImageElement
      ) {
        enhanceLivingArtImage(record.target);
        continue;
      }

      record.addedNodes.forEach((node) => {
        if (node instanceof HTMLImageElement) {
          enhanceLivingArtImage(node);
        } else if (node instanceof HTMLElement) {
          sweep(node);
        }
      });
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src"],
  });

  document.addEventListener(
    "load",
    (event) => {
      if (event.target instanceof HTMLImageElement) {
        enhanceLivingArtImage(event.target);
      }
    },
    true,
  );
}

export function resetLivingArtRuntimeForTests(): void {
  observer?.disconnect();
  observer = null;
  started = false;
}
