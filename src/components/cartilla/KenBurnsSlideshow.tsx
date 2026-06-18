/**
 * KenBurnsSlideshow — turns a sequence of workbook page images into an
 * autoplaying pan-and-zoom "video" entirely in the browser (no ffmpeg,
 * no exported file). Useful for lesson recaps / intros built from the
 * same scanned art already used elsewhere in the app.
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface KenBurnsSlideshowProps {
  /** Image URLs, in playback order. */
  images: string[];
  /** Seconds each slide stays on screen. Default 4. */
  slideDuration?: number;
  className?: string;
  alt?: (index: number) => string;
}

const PAN_VARIANTS = [
  { from: { scale: 1, x: "0%", y: "0%" }, to: { scale: 1.12, x: "-2%", y: "-1%" } },
  { from: { scale: 1.1, x: "1%", y: "1%" }, to: { scale: 1, x: "0%", y: "0%" } },
  { from: { scale: 1, x: "0%", y: "1%" }, to: { scale: 1.12, x: "2%", y: "-1%" } },
];

export function KenBurnsSlideshow({
  images,
  slideDuration = 4,
  className = "",
  alt,
}: KenBurnsSlideshowProps) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % images.length), slideDuration * 1000);
    return () => clearTimeout(t);
  }, [index, images.length, slideDuration]);

  if (images.length === 0) return null;

  const variant = PAN_VARIANTS[index % PAN_VARIANTS.length];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-stone-100 ${className}`}>
      <AnimatePresence mode="sync">
        <motion.img
          key={index}
          src={images[index]}
          alt={alt ? alt(index) : ""}
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain"
          initial={reducedMotion ? false : { opacity: 0, ...variant.from }}
          animate={
            reducedMotion
              ? { opacity: 1 }
              : { opacity: 1, ...variant.to }
          }
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{
            opacity: { duration: 0.6 },
            scale: { duration: slideDuration, ease: "linear" },
            x: { duration: slideDuration, ease: "linear" },
            y: { duration: slideDuration, ease: "linear" },
          }}
        />
      </AnimatePresence>

      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
