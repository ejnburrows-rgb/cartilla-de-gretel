import React, { useState, useRef, useEffect } from "react";
import { Copy, X } from "lucide-react";

type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export function CoordinateMapper({ pageNumber }: { pageNumber: number }) {
  const [isActive, setIsActive] = useState(false);
  const [box, setBox] = useState<Box | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hidden keyboard shortcut to toggle: Ctrl+Shift+M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "m") {
        setIsActive((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isActive) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setStartPos({ x, y });
    setBox({ x, y, w: 0, h: 0 });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !startPos || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currX = ((e.clientX - rect.left) / rect.width) * 100;
    const currY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.min(startPos.x, currX);
    const y = Math.min(startPos.y, currY);
    const w = Math.abs(currX - startPos.x);
    const h = Math.abs(currY - startPos.y);

    setBox({ x, y, w, h });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDrawing(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const generatedJson = box
    ? `{
  "id": "target-...",
  "label": "...",
  "coordinatesVerified": true,
  "xPercent": ${Math.round(box.x * 10) / 10},
  "yPercent": ${Math.round(box.y * 10) / 10},
  "widthPercent": ${Math.round(box.w * 10) / 10},
  "heightPercent": ${Math.round(box.h * 10) / 10}
}`
    : "Dibuja un recuadro en la página para generar las coordenadas.";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJson);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 bg-black/10 cursor-crosshair touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Drawn Box */}
      {box && (
        <div
          className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-none"
          style={{
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: `${box.w}%`,
            height: `${box.h}%`,
          }}
        >
          <div className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] px-1 whitespace-nowrap rounded font-mono font-bold">
            {Math.round(box.w)}% x {Math.round(box.h)}%
          </div>
        </div>
      )}

      {/* Floating Output Panel */}
      <div
        className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-md text-slate-100 p-4 rounded-xl shadow-2xl border border-slate-700/50 w-80 pointer-events-auto flex flex-col gap-3"
        onPointerDown={(e) => e.stopPropagation()} // Prevent drawing when interacting with UI
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-red-400">Mapper Mode: Página {pageNumber}</h3>
          <button
            onClick={() => setIsActive(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <pre className="text-xs font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto border border-slate-800 text-emerald-400 select-all">
          {generatedJson}
        </pre>

        {box && (
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg transition-colors w-full"
          >
            <Copy className="w-3 h-3" /> Copiar JSON
          </button>
        )}

        <div className="text-[10px] text-slate-500 text-center font-medium mt-1">
          Dibuja directamente sobre la imagen. Ctrl+Shift+M para ocultar.
        </div>
      </div>
    </div>
  );
}
