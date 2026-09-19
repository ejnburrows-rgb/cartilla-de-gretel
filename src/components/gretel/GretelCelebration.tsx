import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GretelLiveAvatar, type GretelLiveAvatarRef } from "./GretelLiveAvatar";

export function GretelCelebration() {
  const [active, setActive] = useState(false);
  const [celebrationText, setCelebrationText] = useState<string | undefined>(undefined);
  const avatarRef = useRef<GretelLiveAvatarRef>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleCelebrate = (e: Event) => {
      const customEvent = e as CustomEvent<{ text?: string }>;
      const text = customEvent.detail?.text;
      setCelebrationText(text);
      setActive(true);
    };

    window.addEventListener("gretel:celebrate", handleCelebrate);
    return () => {
      window.removeEventListener("gretel:celebrate", handleCelebrate);
    };
  }, []);

  useEffect(() => {
    if (active) {
      // Trigger celebration on Gretel Live Avatar
      const timer = setTimeout(() => {
        avatarRef.current?.celebrate(celebrationText);
      }, 100);

      const dismissTimer = setTimeout(() => {
        setActive(false);
      }, 4000); // Allow enough time for speech and celebration

      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
  }, [active, celebrationText]);

  // Confetti particles generator
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    color: ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444"][i % 6],
    x: Math.random() * 100, // random percentage across width
    y: Math.random() * 20 - 30, // start above viewport
    size: Math.random() * 12 + 6,
    delay: Math.random() * 0.5,
    duration: Math.random() * 1.5 + 2,
    rotate: Math.random() * 360,
  }));

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none no-print">
          {/* Confetti canvas */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  top: "-5%",
                  left: `${p.x}%`,
                  rotate: p.rotate,
                  opacity: 1,
                }}
                animate={{
                  top: "105%",
                  left: `${p.x + (Math.random() * 20 - 10)}%`,
                  rotate: p.rotate + 360,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeOut",
                }}
                style={{
                  position: "absolute",
                  width: `${p.size}px`,
                  height: `${p.size * 0.6}px`,
                  backgroundColor: p.color,
                  borderRadius: "2px",
                }}
              />
            ))}
          </div>

          {/* Gretel overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border-4 border-amber-300 pointer-events-auto select-none"
            style={{ minWidth: "260px" }}
          >
            <GretelLiveAvatar ref={avatarRef} bubblePosition="top" className="scale-110 mb-4" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default GretelCelebration;
