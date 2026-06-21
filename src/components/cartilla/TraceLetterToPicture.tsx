import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gretelEvent } from "@/lib/gretel-bus";

export interface TracePictureItem {
  id: string;
  label: string;
  imageUrl?: string;
  isCorrect: boolean;
}

export interface TraceLetterToPictureProps {
  sourceLetter: string;
  items: TracePictureItem[];
  onComplete: () => void;
}

interface Point {
  x: number;
  y: number;
}

export function TraceLetterToPicture({ sourceLetter, items, onComplete }: TraceLetterToPictureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [finishedLine, setFinishedLine] = useState<{ start: Point; end: Point } | null>(null);
  const [wrongShake, setWrongShake] = useState(false);

  // Line color (cartilla blue-ish / primary)
  const lineColor = "#3498db";

  useEffect(() => {
    if (finishedLine) {
      const timer = setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("gretel:celebrate", {
            detail: { text: "¡Muy bien! Uniste la letra correctamente." },
          })
        );
        gretelEvent("activity:complete");
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [finishedLine, onComplete]);

  const getElementCenter = (el: HTMLElement, containerRect: DOMRect): Point => {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top + rect.height / 2 - containerRect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only start from the letter node
    if (finishedLine) return;

    if (containerRef.current && letterRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const center = getElementCenter(letterRef.current, containerRect);
      
      setIsDragging(true);
      setStartPoint(center);
      setCurrentPoint({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || !startPoint) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    setCurrentPoint({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || !startPoint) return;
    setIsDragging(false);

    const clientX = e.clientX;
    const clientY = e.clientY;
    const containerRect = containerRef.current.getBoundingClientRect();

    let hitItem: TracePictureItem | null = null;
    let hitNode: HTMLDivElement | null = null;

    // Check collision with any picture card
    for (const item of items) {
      const node = itemsRef.current[item.id];
      if (node) {
        const rect = node.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          hitItem = item;
          hitNode = node;
          break;
        }
      }
    }

    if (hitItem && hitNode) {
      if (hitItem.isCorrect) {
        // Success
        const endCenter = getElementCenter(hitNode, containerRect);
        setFinishedLine({ start: startPoint, end: endCenter });
        setCurrentPoint(null);
      } else {
        // Wrong
        setWrongShake(true);
        window.dispatchEvent(
          new CustomEvent("gretel:celebrate", {
            detail: { text: "Inténtalo de nuevo." },
          })
        );
        setTimeout(() => setWrongShake(false), 500);
        setCurrentPoint(null);
      }
    } else {
      // Dropped on empty space
      setCurrentPoint(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black text-stone-800">
          Une la letra "{sourceLetter}" con su dibujo
        </h3>
        <p className="text-sm font-bold text-stone-500 mt-2">
          Arrastra una línea desde la letra hasta la imagen correcta.
        </p>
      </div>

      <motion.div
        animate={wrongShake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
        transition={{ duration: 0.5 }}
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full aspect-square max-w-[600px] mx-auto bg-white/30 backdrop-blur-sm border border-stone-200/50 rounded-[3rem] shadow-inner touch-none overflow-hidden"
      >
        {/* SVG Overlay for drawing the line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Line being dragged */}
          {isDragging && startPoint && currentPoint && (
            <line
              x1={startPoint.x}
              y1={startPoint.y}
              x2={currentPoint.x}
              y2={currentPoint.y}
              stroke={lineColor}
              strokeWidth="10"
              strokeLinecap="round"
              className="opacity-70"
            />
          )}

          {/* Finished correct line */}
          {finishedLine && (
            <motion.line
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              x1={finishedLine.start.x}
              y1={finishedLine.start.y}
              x2={finishedLine.end.x}
              y2={finishedLine.end.y}
              stroke="#27ae60" // cartilla green success
              strokeWidth="12"
              strokeLinecap="round"
              filter="url(#glow)"
            />
          )}
        </svg>

        {/* Picture Cards Layout (Circular) */}
        {items.map((item, index) => {
          const angle = (index / items.length) * 2 * Math.PI - Math.PI / 2;
          // Radius is roughly 38% of container
          const left = 50 + 38 * Math.cos(angle);
          const top = 50 + 38 * Math.sin(angle);

          return (
            <div
              key={item.id}
              ref={(el) => {
                itemsRef.current[item.id] = el;
              }}
              className="absolute w-[22%] aspect-square rounded-2xl border-2 border-stone-200 bg-[#FFF8ED] shadow-sm flex flex-col items-center justify-center p-2 transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105 z-20"
              style={{
                left: `${left}%`,
                top: `${top}%`,
              }}
            >
              <div className="flex-1 flex items-center justify-center w-full mb-1">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.label}
                    className="max-h-full max-w-full object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                ) : (
                  <div className="text-3xl sm:text-4xl pointer-events-none select-none">🖼️</div>
                )}
              </div>
              <div className="text-xs sm:text-sm font-black text-stone-800 tracking-tight leading-none text-center pointer-events-none select-none">
                {item.label}
              </div>
            </div>
          );
        })}

        {/* Center Letter Card */}
        <div
          ref={letterRef}
          onPointerDown={handlePointerDown}
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[28%] aspect-square rounded-full border-4 border-amber-300 bg-amber-100 shadow-md flex items-center justify-center z-30 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
        >
          <span className="text-5xl sm:text-7xl font-black text-amber-600 select-none pointer-events-none drop-shadow-sm">
            {sourceLetter}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
