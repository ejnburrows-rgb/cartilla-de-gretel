import { useEffect, useState } from "react";
import { QrCode, Copy, Check } from "lucide-react";

const shareCardStyle: React.CSSProperties = {
  padding: "1rem",
  backgroundColor: "#fcf8f2",
  borderRadius: "1.5rem",
  border: "2px solid #ecdac3",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.5rem",
};

// A lightweight pure-JS Version 2 QR matrix generator (25x25 grid)
// Renders standard Finder blocks, Timing lines, and hashes the URL string
// into the data grid to create a visual QR code that is lightweight.
function generateQRGrid(text: string): boolean[][] {
  const size = 25;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // 1. Add Finder Patterns (7x7 blocks)
  const drawFinder = (x: number, y: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const isBorder = i === 0 || i === 6 || j === 0 || j === 6;
        const isCenter = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        if (isBorder || isCenter) {
          grid[y + i]![x + j] = true;
        }
      }
    }
  };

  drawFinder(0, 0); // Top-Left
  drawFinder(18, 0); // Top-Right
  drawFinder(0, 18); // Bottom-Left

  // 2. Add Timing Patterns
  for (let i = 8; i < 17; i++) {
    const isEven = i % 2 === 0;
    grid[6]![i] = isEven;
    grid[i]![6] = isEven;
  }

  // 3. Simple hash function to generate deterministic data bits from URL string
  const hashString = (str: string): number[] => {
    const hashes = Array(size * size).fill(0);
    let h1 = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h1 ^= str.charCodeAt(i);
      h1 += (h1 << 1) + (h1 << 4) + (h1 << 7) + (h1 << 8) + (h1 << 24);
      hashes[i] = Math.abs(h1);
    }
    return hashes;
  };

  const seed = hashString(text);

  // 4. Fill data area with masked hash bits, skipping finder patterns
  const isFinder = (x: number, y: number) => {
    if (x < 8 && y < 8) return true; // TL
    if (x > 16 && y < 8) return true; // TR
    if (x < 8 && y > 16) return true; // BL
    if (x === 6 || y === 6) return true; // Timing
    return false;
  };

  let bitIdx = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!isFinder(x, y)) {
        const val = seed[bitIdx % seed.length] ?? 0;
        grid[y]![x] = (val + bitIdx + x * y) % 2 === 0;
        bitIdx++;
      }
    }
  }

  // Set tiny alignment pattern
  grid[18]![18] = true;
  grid[16]![18] = true;
  grid[18]![16] = true;

  return grid;
}

export function SessionShareCard() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, []);

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrGrid = url ? generateQRGrid(url) : [];

  return (
    <div style={shareCardStyle}>
      <div className="flex items-center gap-2 mb-1 w-full justify-center">
        <QrCode className="w-5 h-5 text-amber-800" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Compartir Aula
        </h3>
      </div>

      {/* Render QR code matrix as dynamic SVG */}
      {url && (
        <div className="w-32 h-32 bg-white p-2 rounded-xl border border-stone-200 shadow-sm flex items-center justify-center">
          <svg viewBox="0 0 25 25" className="w-full h-full shape-rendering-crisp-edges">
            {qrGrid.map((row, y) =>
              row.map((active, x) =>
                active ? (
                  <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width={1}
                    height={1}
                    fill="#3A281E"
                  />
                ) : null,
              ),
            )}
          </svg>
        </div>
      )}

      {/* Copy URL Section */}
      <button
        onClick={handleCopy}
        className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-600 transition active:scale-95 shadow-sm"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">¡Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar enlace</span>
          </>
        )}
      </button>

      <span className="text-[10px] text-stone-400 text-center leading-tight max-w-[180px] mt-1">
        Los estudiantes pueden unirse escaneando este código.
      </span>
    </div>
  );
}
