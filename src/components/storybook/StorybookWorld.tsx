/**
 * The living-storybook scenery behind the four proof pages.
 *
 * Background environment ONLY (repo.md / ASSET_FIDELITY_POLICY "Background-only
 * exception"): sky, hills, trees, flowers, pond, garden. It never redraws or
 * replaces the page's own illustrations, text or lesson content, and it keeps
 * the reserved areas clear so the original art and text sit on top.
 *
 * Style follows repo.md: pintura country / tole one-stroke folk painting —
 * separate flat painted silhouettes, warm sienna outlines (never black),
 * saturated cartilla palette, one-stroke leaves and petals, stylus-dot accents
 * and a uniform cut-out shadow under each layer. It is drawn in code (inline
 * SVG) as a proof of composition; no image file was added or edited.
 *
 * Motion: clouds drift very slowly; the Workbook camera pans between pages.
 * Reduced motion keeps the identical still composition.
 */
import { useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { StorybookScene } from "@/content/storybook-proof";
import "@/styles/storybook.css";

/** Deterministic pseudo-random so the scenery is identical on every visit. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* repo.md palette */
const INK = "#8a3d1a"; // warm sienna outline
const INK_DEEP = "#6b2d10";
const SHADOW = "rgba(107, 45, 16, 0.2)";
const C = {
  red: "#e1321f",
  orange: "#f57a1f",
  yellow: "#ffc417",
  magenta: "#d82a7c",
  emerald: "#13985a",
  emeraldDeep: "#0c7a45",
  yg: "#8dc63f",
  ygLight: "#c2e05a",
  turq: "#19b2c6",
  cobalt: "#2459c8",
  cream: "#fff4dc",
  sienna: "#a64e22",
};

const TONES = [
  { petal: C.red, light: "#ff8a5e", center: C.yellow },
  { petal: C.orange, light: "#ffc070", center: C.red },
  { petal: C.yellow, light: "#fff1a6", center: C.orange },
  { petal: C.magenta, light: "#ff9cc8", center: C.yellow },
  { petal: C.cobalt, light: "#86a9ff", center: C.yellow },
  { petal: C.cream, light: "#ffffff", center: C.red },
];

/** One-stroke petal / leaf: a loaded-brush teardrop pointing up from the origin. */
const teardrop = (len: number, w: number) =>
  `M0 0 C ${-w} ${-len * 0.28} ${-w * 0.82} ${-len * 0.82} 0 ${-len} C ${w * 0.82} ${-len * 0.82} ${w} ${-len * 0.28} 0 0 Z`;

function Dots({
  points,
  r,
  fill = "#fffaf0",
}: {
  points: Array<[number, number]>;
  r: number;
  fill?: string;
}) {
  return (
    <g fill={fill}>
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={r * (i % 3 === 2 ? 0.7 : 1)} />
      ))}
    </g>
  );
}

function ToleFlower({
  x,
  y,
  r,
  tone,
  stem = true,
}: {
  x: number;
  y: number;
  r: number;
  tone: number;
  stem?: boolean;
}) {
  const c = TONES[tone % TONES.length]!;
  return (
    <g transform={`translate(${x} ${y})`}>
      {stem && (
        <>
          <path
            d={`M0 ${r * 0.4} Q ${r * 0.35} ${r * 1.9} 0 ${r * 3.2}`}
            stroke={C.emeraldDeep}
            strokeWidth={r * 0.2}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={teardrop(r * 1.4, r * 0.42)}
            transform={`translate(${r * 0.12} ${r * 2.1}) rotate(62)`}
            fill={C.emerald}
            stroke={INK}
            strokeWidth={r * 0.08}
          />
        </>
      )}
      {[0, 72, 144, 216, 288].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path
            d={teardrop(r * 1.05, r * 0.5)}
            fill={c.petal}
            stroke={INK}
            strokeWidth={r * 0.09}
          />
          <path
            d={`M0 ${-r * 0.3} Q ${-r * 0.16} ${-r * 0.62} 0 ${-r * 0.86}`}
            stroke={c.light}
            strokeWidth={r * 0.13}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ))}
      <circle r={r * 0.32} fill={c.center} stroke={INK} strokeWidth={r * 0.08} />
      <Dots
        r={r * 0.07}
        points={[
          [0, -r * 0.13],
          [r * 0.12, r * 0.07],
          [-r * 0.12, r * 0.07],
        ]}
      />
    </g>
  );
}

/** Canopy built from circles: painted outline underneath, flat fill on top (one silhouette). */
function Canopy({
  circles,
  fill,
  outline,
}: {
  circles: Array<[number, number, number]>;
  fill: string;
  outline: number;
}) {
  return (
    <>
      <g fill={INK} stroke={INK} strokeWidth={outline * 2}>
        {circles.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g fill={fill}>
        {circles.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    </>
  );
}

const CANOPY: Array<[number, number, number]> = [
  [0, -104, 44],
  [-32, -84, 30],
  [32, -86, 31],
  [4, -132, 27],
  [-22, -122, 22],
  [26, -118, 22],
];

function ToleTree({
  x,
  y,
  s,
  fruit = C.red,
  deep = false,
}: {
  x: number;
  y: number;
  s: number;
  fruit?: string;
  deep?: boolean;
}) {
  const leaves: Array<[number, number, number]> = [
    [-18, -110, -30],
    [16, -96, 34],
    [-34, -86, -64],
    [36, -88, 70],
    [2, -136, 6],
    [-2, -76, 180],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="4" rx="50" ry="9" fill={SHADOW} />
      <path
        d="M-8 3 C-6 -26 -10 -50 -4 -72 L4 -72 C10 -50 6 -26 8 3 Z"
        fill={C.sienna}
        stroke={INK_DEEP}
        strokeWidth="2.4"
      />
      <path
        d="M-2 -48 Q -20 -60 -28 -72 M2 -56 Q 18 -68 24 -80"
        stroke={INK_DEEP}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <g transform="translate(3 6)" opacity="0.9">
        <Canopy circles={CANOPY} fill={SHADOW} outline={0} />
      </g>
      <Canopy circles={CANOPY} fill={deep ? C.emeraldDeep : C.emerald} outline={2.6} />
      {leaves.map(([lx, ly, rot], i) => (
        <g key={i} transform={`translate(${lx} ${ly}) rotate(${rot})`}>
          <path d={teardrop(22, 7)} fill={C.yg} stroke={INK} strokeWidth="1.2" />
          <path d="M0 -3 L0 -17" stroke={C.emeraldDeep} strokeWidth="1.3" strokeLinecap="round" />
        </g>
      ))}
      {[
        [-26, -120],
        [20, -76],
        [30, -122],
        [-10, -88],
      ].map(([fx, fy], i) => (
        <g key={i}>
          <circle
            cx={fx}
            cy={fy}
            r="5.4"
            fill={i % 2 ? C.orange : fruit}
            stroke={INK}
            strokeWidth="1.2"
          />
          <circle cx={fx! - 1.6} cy={fy! - 1.8} r="1.5" fill="#fffaf0" />
        </g>
      ))}
      <Dots
        r={2.2}
        points={[
          [-6, -150],
          [4, -153],
          [13, -149],
          [-40, -100],
          [-44, -90],
          [44, -104],
          [47, -94],
        ]}
      />
    </g>
  );
}

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  const circles: Array<[number, number, number]> = [
    [-66, 6, 32],
    [-20, -16, 46],
    [36, -6, 38],
    [78, 10, 26],
    [-96, 18, 18],
    [0, 16, 34],
    [52, 18, 28],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Canopy circles={circles} fill="#fffaf0" outline={2.6} />
      <path
        d="M-70 24 Q -40 34 -6 26 Q 30 36 70 26"
        stroke="#bfe6f0"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <Dots
        r={3}
        fill="#ffffff"
        points={[
          [118, 10],
          [132, 2],
          [144, -4],
        ]}
      />
    </g>
  );
}

function Sun({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={i}
          d={teardrop(r * 0.6, r * 0.16)}
          transform={`rotate(${i * 30}) translate(0 ${-r * 1.06})`}
          fill={i % 2 ? C.orange : C.yellow}
          stroke={INK}
          strokeWidth="1.6"
        />
      ))}
      <circle r={r} fill={C.yellow} stroke={INK} strokeWidth="3" />
      <circle
        r={r * 0.62}
        fill="none"
        stroke={C.orange}
        strokeWidth="2.4"
        strokeDasharray="0 9"
        strokeLinecap="round"
      />
    </g>
  );
}

function GrassBlades({
  from,
  to,
  y,
  seed,
  tones = [C.yg, C.emeraldDeep],
}: {
  from: number;
  to: number;
  y: number;
  seed: number;
  tones?: string[];
}) {
  const rnd = seeded(seed);
  const out: ReactNode[] = [];
  for (let x = from; x < to; x += 30 + rnd() * 46) {
    const h = 14 + rnd() * 20;
    const yy = y + rnd() * 26;
    const tone = tones[Math.floor(rnd() * tones.length)]!;
    out.push(
      <g key={x} transform={`translate(${x} ${yy})`} fill={tone}>
        <path d={`M0 0 Q -4 ${-h * 0.5} -7 ${-h} Q 1 ${-h * 0.55} 4 0 Z`} />
        <path d={`M5 0 Q 6 ${-h * 0.6} 12 ${-h * 1.15} Q 9 ${-h * 0.5} 10 0 Z`} />
        <path d={`M10 0 Q 16 ${-h * 0.4} 22 ${-h * 0.7} Q 14 ${-h * 0.25} 14 0 Z`} />
      </g>,
    );
  }
  return <g>{out}</g>;
}

/** A hill silhouette with the uniform cut-out shadow and sienna outline. */
function Hill({ d, fill, stroke = 2.6 }: { d: string; fill: string; stroke?: number }) {
  return (
    <>
      <path d={d} fill={SHADOW} transform="translate(0 7)" />
      <path d={d} fill={fill} stroke={INK} strokeWidth={stroke} strokeLinejoin="round" />
    </>
  );
}

function Pond({ x, y, rx, ry }: { x: number; y: number; rx: number; ry: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx={rx} ry={ry} fill={SHADOW} transform="translate(0 6)" />
      <ellipse rx={rx} ry={ry} fill={C.cobalt} stroke={INK} strokeWidth="3" />
      <ellipse rx={rx * 0.86} ry={ry * 0.7} cy={-ry * 0.12} fill={C.turq} />
      {[
        [-0.5, -0.25, 0.22],
        [0.1, -0.4, 0.3],
        [0.35, 0.05, 0.2],
        [-0.2, 0.2, 0.26],
      ].map(([fx, fy, w], i) => (
        <path
          key={i}
          d={`M${rx * fx! - rx * w!} ${ry * fy!} q ${rx * w!} ${-ry * 0.12} ${rx * w! * 2} 0`}
          stroke="#e6fbff"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {[
        [-0.62, 0.12, 1],
        [0.58, -0.18, 0.8],
        [0.18, 0.42, 0.9],
      ].map(([fx, fy, s], i) => (
        <g key={i} transform={`translate(${rx * fx!} ${ry * fy!}) scale(${s})`}>
          <path
            d="M0 0 m-26 0 a26 13 0 1 0 52 0 a26 13 0 1 0 -52 0 Z M0 0 L22 -7 L26 1 Z"
            fill={C.emerald}
            stroke={INK}
            strokeWidth="2"
            fillRule="evenodd"
          />
          <path
            d="M-14 0 Q 0 -6 14 0"
            stroke={C.yg}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          {i === 0 && <ToleFlower x={-4} y={-6} r={9} tone={3} stem={false} />}
        </g>
      ))}
    </g>
  );
}

function Cattails({ x, y, s, flip = false }: { x: number; y: number; s: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {[
        [-14, 120, -8],
        [0, 150, 2],
        [14, 110, 10],
      ].map(([dx, h, lean], i) => (
        <g key={i}>
          <path
            d={`M${dx} 0 Q ${dx! + lean! * 0.5} ${-h! * 0.5} ${dx! + lean!} ${-h!}`}
            stroke={C.emeraldDeep}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <rect
            x={dx! + lean! - 6}
            y={-h! - 4}
            width="12"
            height="34"
            rx="6"
            fill={C.sienna}
            stroke={INK_DEEP}
            strokeWidth="1.6"
          />
        </g>
      ))}
      <path
        d={teardrop(130, 12)}
        transform="translate(-6 0) rotate(-16)"
        fill={C.yg}
        stroke={INK}
        strokeWidth="1.4"
      />
      <path
        d={teardrop(110, 11)}
        transform="translate(8 0) rotate(20)"
        fill={C.emerald}
        stroke={INK}
        strokeWidth="1.4"
      />
      <path
        d={teardrop(80, 9)}
        transform="translate(20 0) rotate(40)"
        fill={C.yg}
        stroke={INK}
        strokeWidth="1.2"
      />
    </g>
  );
}

function Fence({ from, to, y }: { from: number; to: number; y: number }) {
  const posts: ReactNode[] = [];
  for (let x = from; x < to; x += 42) {
    posts.push(
      <path
        key={x}
        d={`M${x} ${y} l0 -64 l11 -14 l11 14 l0 64 Z`}
        fill="#fff6e4"
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />,
    );
  }
  return (
    <g>
      <rect
        x={from - 10}
        y={y - 52}
        width={to - from + 20}
        height="10"
        rx="4"
        fill="#fff6e4"
        stroke={INK}
        strokeWidth="2.2"
      />
      <rect
        x={from - 10}
        y={y - 24}
        width={to - from + 20}
        height="10"
        rx="4"
        fill="#fff6e4"
        stroke={INK}
        strokeWidth="2.2"
      />
      {posts}
    </g>
  );
}

function Hedge({ x, y, w, seed }: { x: number; y: number; w: number; seed: number }) {
  const rnd = seeded(seed);
  const circles: Array<[number, number, number]> = [];
  for (let cx = 0; cx <= w; cx += 34) circles.push([cx, -26 - rnd() * 16, 30 + rnd() * 10]);
  const blooms = circles.map(([cx, cy], i) => ({
    x: cx + (rnd() - 0.5) * 18,
    y: cy - 6 + rnd() * 14,
    tone: i % TONES.length,
  }));
  return (
    <g transform={`translate(${x} ${y})`}>
      <Canopy circles={circles} fill={C.emerald} outline={2.4} />
      {blooms.map((b, i) => (
        <ToleFlower key={i} x={b.x} y={b.y} r={9} tone={b.tone} stem={false} />
      ))}
    </g>
  );
}

function SceneLayers({ camera, scene }: { camera: number; scene: StorybookScene }) {
  const flowers = useMemo(() => {
    const rnd = seeded(scene === "pond" ? 17 : scene === "garden" ? 16 : 4);
    const out: Array<{ x: number; y: number; r: number; tone: number }> = [];
    for (let i = 0; i < 40; i++)
      out.push({
        x: -200 + rnd() * 2600,
        y: 870 + rnd() * 120,
        r: 10 + rnd() * 8,
        tone: Math.floor(rnd() * TONES.length),
      });
    for (let i = 0; i < 22; i++)
      out.push({
        x: -200 + rnd() * 2600,
        y: 700 + rnd() * 100,
        r: 6 + rnd() * 3,
        tone: Math.floor(rnd() * TONES.length),
      });
    return out.sort((a, b) => a.y - b.y);
  }, [scene]);
  const pan = (factor: number): CSSProperties => ({
    transform: `translateX(${-camera * 800 * factor}px)`,
  });
  const hasSun = scene !== "pond"; // plate 17's own art already has its sunflower sun
  return (
    <>
      {hasSun && (
        <g className="sb-layer" style={pan(0.08)}>
          <Sun
            x={scene === "garden" ? 1480 : 1250}
            y={scene === "garden" ? 120 : 160}
            r={scene === "garden" ? 46 : 58}
          />
        </g>
      )}
      <g className="sb-layer" style={pan(0.16)}>
        <g className="sb-clouds">
          <Cloud x={190} y={150} s={0.86} />
          <Cloud x={760} y={96} s={0.6} />
          <Cloud x={1520} y={230} s={0.74} />
          <Cloud x={2080} y={120} s={0.66} />
          <Cloud x={-250} y={260} s={0.52} />
        </g>
      </g>
      <g className="sb-layer" style={pan(0.32)}>
        <Hill
          d="M-400 470 C -200 380 40 400 260 440 C 480 480 640 360 900 380 C 1160 400 1300 470 1560 430 C 1800 392 2000 360 2300 420 L 2600 450 L 2600 1000 L -400 1000 Z"
          fill="#3aae8c"
        />
        {[
          [-120, 434],
          [40, 422],
          [430, 454],
          [980, 394],
          [1046, 400],
          [1660, 420],
          [1960, 386],
          [2026, 394],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(0.3)`}>
            <path
              d="M-7 0 L-5 -60 L5 -60 L7 0 Z"
              fill={C.sienna}
              stroke={INK_DEEP}
              strokeWidth="4"
            />
            <circle
              cx="0"
              cy="-88"
              r="42"
              fill={i % 2 ? C.emeraldDeep : C.emerald}
              stroke={INK}
              strokeWidth="6"
            />
            <circle cx="-12" cy="-98" r="7" fill={C.ygLight} />
          </g>
        ))}
      </g>
      <g className="sb-layer" style={pan(0.58)}>
        <Hill
          d="M-400 560 C -160 500 120 520 380 548 C 640 576 820 486 1120 500 C 1420 514 1560 574 1860 540 C 2100 512 2300 500 2700 540 L 2700 1000 L -400 1000 Z"
          fill={C.yg}
        />
        <path
          d="M-400 604 C -100 564 260 594 520 604 C 820 616 1000 564 1320 576 C 1600 588 1900 604 2700 584"
          stroke="#fff6dc"
          strokeWidth="6"
          fill="none"
          strokeDasharray="0 18"
          strokeLinecap="round"
        />
        {scene === "garden" ? (
          <>
            <Fence from={-200} to={700} y={640} />
            <Fence from={1000} to={2600} y={640} />
            <ToleTree x={820} y={560} s={0.56} fruit={C.orange} />
          </>
        ) : (
          <>
            <ToleTree x={-40} y={566} s={0.6} />
            <ToleTree x={250} y={552} s={0.48} deep fruit={C.orange} />
            <ToleTree x={1500} y={560} s={0.54} fruit={C.magenta} />
            <ToleTree x={1580} y={566} s={0.4} deep />
            <ToleTree x={2160} y={548} s={0.58} fruit={C.orange} />
          </>
        )}
      </g>
      <g className="sb-layer" style={pan(1)}>
        <Hill
          d="M-400 680 C -100 640 300 652 640 668 C 980 684 1240 640 1600 650 C 1960 660 2200 690 2800 660 L 2800 1000 L -400 1000 Z"
          fill={C.emerald}
          stroke={3}
        />
        <GrassBlades from={-300} to={2700} y={672} seed={9} />
        {scene === "pond" && (
          <>
            <Pond x={190} y={900} rx={300} ry={78} />
            <Pond x={1420} y={930} rx={260} ry={70} />
            <Cattails x={-70} y={890} s={1} />
            <Cattails x={1700} y={910} s={0.9} flip />
          </>
        )}
        {scene === "garden" && (
          <>
            <Hedge x={-180} y={760} w={520} seed={5} />
            <Hedge x={1300} y={770} w={620} seed={8} />
          </>
        )}
        <ToleTree x={-120} y={770} s={1.22} deep />
        <ToleTree x={2120} y={780} s={1.1} fruit={C.orange} />
        <ToleTree x={2420} y={750} s={0.88} deep fruit={C.magenta} />
        <GrassBlades
          from={-300}
          to={2700}
          y={892}
          seed={3}
          tones={[C.yg, C.ygLight, C.emeraldDeep]}
        />
        {flowers.map((f, i) =>
          scene === "pond" &&
          ((f.x > -110 && f.x < 490 && f.y > 820) ||
            (f.x > 1160 && f.x < 1680 && f.y > 860)) ? null : (
            <ToleFlower key={i} x={f.x} y={f.y} r={f.r} tone={f.tone} />
          ),
        )}
      </g>
    </>
  );
}

function SceneDefs() {
  return (
    <defs>
      <linearGradient id="sb-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2fb4d6" />
        <stop offset="0.38" stopColor="#7fd2e4" />
        <stop offset="0.6" stopColor="#fff1d4" />
        <stop offset="1" stopColor="#fff1d4" />
      </linearGradient>
    </defs>
  );
}

export function StorybookSceneArt({
  scene,
  camera = 0,
}: {
  scene: StorybookScene;
  camera?: number;
}) {
  return (
    <svg
      className="sb-world__svg"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <SceneDefs />
      <rect x="-800" y="-200" width="3600" height="1400" fill="url(#sb-sky)" />
      <SceneLayers camera={camera} scene={scene} />
    </svg>
  );
}

/**
 * Full-viewport world for the student proof pages. Rendered into <body>
 * behind the reader so no lesson layout or reader code has to change.
 */
export function StorybookWorld({ scene, camera = 0 }: { scene: StorybookScene; camera?: number }) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.storybook = scene;
    return () => {
      delete root.dataset.storybook;
    };
  }, [scene]);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="sb-world"
      data-testid="storybook-world"
      data-scene={scene}
      data-camera={camera.toFixed(2)}
      aria-hidden="true"
    >
      <StorybookSceneArt scene={scene} camera={camera} />
    </div>,
    document.body,
  );
}
