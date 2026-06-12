import { useMemo } from "react";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { MonochromeDrawing } from "./MonochromeDrawings";

// Layout constants for strict compliance with the JSX double-brace styling ban
const bookFrameStyle = {
  boxSizing: "border-box" as const,
};

const guideStroke = {
  stroke: "#bae6fd", // sky-200
  strokeWidth: "1",
  fill: "none",
};

const baseStroke = {
  stroke: "#93c5fd", // blue-300
  strokeWidth: "1.5",
  fill: "none",
};

const dottedTextClass = "fill-none stroke-stone-400 stroke-[1.5] stroke-dasharray-[2,2] font-fredoka";
const solidTextClass = "fill-stone-800 font-black font-fredoka";

interface SVGWorkbookLineProps {
  text: string;
  dotted?: boolean;
}

export function SVGWorkbookLine({ text, dotted = false }: SVGWorkbookLineProps) {
  return (
    <svg viewBox="0 0 400 45" className="w-full h-12 overflow-visible select-none" style={bookFrameStyle}>
      {/* Top guideline */}
      <line x1="0" y1="10" x2="400" y2="10" {...guideStroke} />
      {/* Dashed middle guideline */}
      <line
        x1="0"
        y1="22"
        x2="400"
        y2="22"
        stroke="#bae6fd"
        strokeWidth="1"
        strokeDasharray="4 4"
        fill="none"
      />
      {/* Bottom baseline */}
      <line x1="0" y1="34" x2="400" y2="34" {...baseStroke} />

      {/* Renders text within the guidelines */}
      <text
        x="15"
        y="32"
        fontSize="22"
        className={dotted ? dottedTextClass : solidTextClass}
        letterSpacing="4"
      >
        {text}
      </text>
    </svg>
  );
}

// Letter Tracing with Directional Arrows
interface SVGTracingLetterProps {
  letter: string;
}

export function SVGTracingLetter({ letter }: SVGTracingLetterProps) {
  const isVowel = ["a", "e", "i", "o", "u"].includes(letter.toLowerCase());

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 overflow-visible" style={bookFrameStyle}>
      {/* Background guide circle */}
      <circle cx="50" cy="50" r="44" stroke="#f1f5f9" strokeWidth="4" fill="none" />
      {/* Grid lines inside */}
      <line x1="50" y1="6" x2="50" y2="94" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="6" y1="50" x2="94" y2="50" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />

      {/* Solid target letter background */}
      <text
        x="50"
        y="72"
        fontSize="64"
        fontFamily="Fredoka, sans-serif"
        fontWeight="bold"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="6"
        textAnchor="middle"
      >
        {letter}
      </text>

      {/* Dotted target letter */}
      <text
        x="50"
        y="72"
        fontSize="64"
        fontFamily="Fredoka, sans-serif"
        fontWeight="bold"
        fill="none"
        stroke="#78716c"
        strokeWidth="2"
        strokeDasharray="4 3"
        textAnchor="middle"
      >
        {letter}
      </text>

      {/* Stroke directional guides based on letter type */}
      {isVowel ? (
        <path d="M 50,15 L 50,25 M 50,15 L 45,20 M 50,15 L 55,20" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M 30,20 L 30,80 M 30,20 L 25,30 M 30,20 L 35,30" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
}

interface WorkbookPageRendererProps {
  pageNumber: number;
}

export function WorkbookPageRenderer({ pageNumber }: WorkbookPageRendererProps) {
  // Helper to map page number to exact catalog entry
  const entry = useMemo(() => {
    return CATALOG.find((e) => {
      const parts = e.pages.split("-").map(Number);
      const start = parts[0] || 1;
      const end = parts[1] || start;
      return pageNumber >= start && pageNumber <= end;
    });
  }, [pageNumber]);

  // Page index within the catalog entry
  const subpage = useMemo(() => {
    if (!entry) return 0;
    const start = parseInt(entry.pages.split("-")[0] || "1", 10);
    return pageNumber - start;
  }, [entry, pageNumber]);

  // 1. Render Cover & Intro pages (pages 1 to 3)
  if (pageNumber <= 3) {
    if (pageNumber === 1) {
      return (
        <div className="w-full h-full flex flex-col justify-between items-center text-center p-8 select-none bg-stone-50 border border-stone-200/50 rounded-2xl relative overflow-hidden">
          {/* Ornamental frame */}
          <div className="absolute inset-4 border border-stone-300 rounded-xl pointer-events-none opacity-40" />
          <div className="absolute inset-6 border-4 border-double border-stone-300 rounded-lg pointer-events-none opacity-40" />

          <div className="mt-8 relative z-10">
            <span className="text-[11px] font-black text-stone-400 uppercase tracking-[0.25em] block mb-2">
              Libro de Trabajo
            </span>
            <h1 className="text-4xl font-black font-fredoka text-stone-800 leading-tight">
              La Cartilla de Gretel
            </h1>
            <p className="text-sm font-semibold text-stone-500 mt-2">
              Método Silábico y Fonético de Lectoescritura
            </p>
          </div>

          {/* Large monochrome outline banner drawing */}
          <div className="w-40 h-40 flex items-center justify-center border border-stone-300 rounded-3xl bg-white shadow-sm p-4 relative">
            <MonochromeDrawing word="mimo" size={120} />
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full border border-stone-300 bg-white flex items-center justify-center font-black font-fredoka text-sm text-stone-700">
              G
            </div>
          </div>

          <div className="mb-8 w-full max-w-[280px] z-10">
            {/* Student Name Placeholder */}
            <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-left mb-2 pl-2">
              Nombre del Estudiante
            </div>
            <div className="border-b-2 border-stone-400/60 pb-1 text-stone-800 text-lg font-black font-fredoka text-center tracking-wide">
              &nbsp;
            </div>
            <div className="text-[9px] text-stone-400 text-center mt-1">
              Grado K - 2 • Educación Primaria
            </div>
          </div>
        </div>
      );
    }

    if (pageNumber === 2) {
      return (
        <div className="w-full h-full flex flex-col justify-between p-8 bg-stone-50 border border-stone-200/50 rounded-2xl">
          <div>
            <h2 className="text-xl font-black font-fredoka text-stone-800 border-b border-stone-200 pb-2 mb-4">
              Las Cinco Vocales
            </h2>
            <p className="text-xs text-stone-500 font-semibold mb-6">
              Identifica y pronuncia cada vocal. Traza las letras con tu lápiz.
            </p>

            <div className="grid grid-cols-5 gap-3 mt-4">
              {["a", "e", "i", "o", "u"].map((v) => (
                <div key={v} className="flex flex-col items-center p-2 bg-white border border-stone-200 rounded-xl">
                  <span className="text-3xl font-black font-fredoka text-stone-800 uppercase">
                    {v}
                  </span>
                  <span className="text-lg font-bold font-fredoka text-stone-400 mt-1">
                    {v}
                  </span>
                  <div className="w-12 h-12 mt-2 opacity-80">
                    <MonochromeDrawing word={v === "a" ? "árbol" : v === "e" ? "escoba" : v === "i" ? "iglú" : v === "o" ? "oso" : "uvas"} size={44} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <SVGWorkbookLine text="a   e   i   o   u" dotted />
            <SVGWorkbookLine text="A   E   I   O   U" dotted />
          </div>
        </div>
      );
    }

    // Page 3: Vowel Match Match
    return (
      <div className="w-full h-full flex flex-col justify-between p-8 bg-stone-50 border border-stone-200/50 rounded-2xl">
        <div>
          <h2 className="text-xl font-black font-fredoka text-stone-800 border-b border-stone-200 pb-2 mb-4">
            Práctica de Conexión
          </h2>
          <p className="text-xs text-stone-500 font-semibold mb-8">
            Une con una línea cada vocal con el dibujo que corresponde a su sonido inicial.
          </p>

          <div className="flex justify-between items-center px-4">
            {/* Vowels list */}
            <div className="flex flex-col space-y-6">
              {["a", "e", "i", "o", "u"].map((v) => (
                <div key={v} className="w-10 h-10 rounded-full border-2 border-stone-800 flex items-center justify-center font-black font-fredoka text-lg text-stone-800 bg-white">
                  {v.toUpperCase()}
                </div>
              ))}
            </div>

            {/* Illustration anchors */}
            <div className="flex flex-col space-y-6">
              {["oso", "árbol", "uvas", "iglú", "escoba"].map((w) => (
                <div key={w} className="w-12 h-10 border border-stone-200 rounded-lg flex items-center justify-center bg-white p-1">
                  <MonochromeDrawing word={w} size={36} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[10px] text-stone-400 font-bold text-center border-t border-stone-100 pt-2">
          La Cartilla de Gretel • Introducción a las Vocales
        </div>
      </div>
    );
  }

  // 2. Render Vowel pages (pages 4 to 18, 3 pages each)
  if (entry && entry.kind === "vowel") {
    const vowel = entry.vowel;
    const isFirstPage = subpage === 0;
    const isSecondPage = subpage === 1;

    // Vowel Page 1 (A): Large Letter & Word Grid
    if (isFirstPage) {
      const vocabList = entry.lesson?.vocab || [];
      return (
        <div className="w-full h-full flex flex-col justify-between p-8 bg-stone-50 border border-stone-200/50 rounded-2xl">
          <div>
            <div className="flex justify-between items-start border-b border-stone-200 pb-3 mb-6">
              <div>
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                  Vocal {vowel.toUpperCase()}
                </span>
                <h2 className="text-xl font-black font-fredoka text-stone-800">
                  {entry.title}
                </h2>
              </div>
              <SVGTracingLetter letter={vowel.toUpperCase()} />
            </div>

            <p className="text-xs text-stone-500 font-semibold mb-6">
              Pronuncia en voz alta y practica trazar la vocal. Descubre las palabras clave.
            </p>

            {/* Grid of monochrome vocabulary drawings */}
            <div className="grid grid-cols-2 gap-4">
              {vocabList.slice(0, 4).map((v) => (
                <div key={v.word} className="bg-white border border-stone-200/80 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm">
                  <div className="w-16 h-16 flex items-center justify-center opacity-90 mb-2">
                    <MonochromeDrawing word={v.word} size={64} />
                  </div>
                  <div className="text-xs font-black font-fredoka text-stone-800 capitalize">
                    {v.word}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <SVGWorkbookLine text={`${vowel}   ${vowel}   ${vowel}   ${vowel}   ${vowel}`} dotted />
          </div>
        </div>
      );
    }

    // Vowel Page 2 (B): Tracing Worksheets
    if (isSecondPage) {
      return (
        <div className="w-full h-full flex flex-col justify-between p-8 bg-stone-50 border border-stone-200/50 rounded-2xl">
          <div>
            <h2 className="text-lg font-black font-fredoka text-stone-800 border-b border-stone-200 pb-2 mb-4">
              Taller de Escritura
            </h2>
            <p className="text-xs text-stone-500 font-semibold mb-6">
              Sigue las líneas punteadas para escribir la letra con precisión.
            </p>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">
                  Minúscula
                </span>
                <div className="space-y-2">
                  <SVGWorkbookLine text={`${vowel}  ${vowel}  ${vowel}  ${vowel}  ${vowel}  ${vowel}  ${vowel}`} dotted />
                  <SVGWorkbookLine text={`${vowel}  ${vowel}  ${vowel}  ${vowel}  ${vowel}  ${vowel}  ${vowel}`} dotted />
                  <SVGWorkbookLine text="" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">
                  Mayúscula
                </span>
                <div className="space-y-2">
                  <SVGWorkbookLine text={`${vowel.toUpperCase()}  ${vowel.toUpperCase()}  ${vowel.toUpperCase()}  ${vowel.toUpperCase()}  ${vowel.toUpperCase()}`} dotted />
                  <SVGWorkbookLine text={`${vowel.toUpperCase()}  ${vowel.toUpperCase()}  ${vowel.toUpperCase()}  ${vowel.toUpperCase()}  ${vowel.toUpperCase()}`} dotted />
                  <SVGWorkbookLine text="" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[9px] font-black text-stone-400 text-right uppercase">
            Página de Trazado
          </div>
        </div>
      );
    }

    // Vowel Page 3 (C): Reading Board / Exercises
    return (
      <div className="w-full h-full flex flex-col justify-between p-8 bg-stone-50 border border-stone-200/50 rounded-2xl">
        <div>
          <h2 className="text-lg font-black font-fredoka text-stone-800 border-b border-stone-200 pb-2 mb-4">
            Taller de Lectura
          </h2>
          <p className="text-xs text-stone-500 font-semibold mb-6">
            Identifica el sonido inicial y lee las palabras correspondientes.
          </p>

          <div className="space-y-4">
            {(entry.lesson?.vocab || []).slice(0, 3).map((item) => (
              <div key={item.word} className="flex items-center gap-4 bg-white border border-stone-200/80 rounded-2xl p-3">
                <div className="w-12 h-12 border border-stone-200 rounded-xl flex items-center justify-center p-1 bg-stone-50">
                  <MonochromeDrawing word={item.word} size={36} />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-black font-fredoka text-stone-800 capitalize">
                    {item.word}
                  </span>
                  <div className="text-[10px] font-semibold text-stone-400 uppercase mt-0.5">
                    Empieza con {vowel.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <SVGWorkbookLine text={`la  vocal  ${vowel}  es  fácil`} dotted />
        </div>
      </div>
    );
  }

  // 3. Render Consonant pages (pages 19 to 90, 4 pages each)
  if (entry && entry.kind === "consonant") {
    const data = entry.data;
    const letter = data.letter;
    const syllables = data.syllables || [];
    const sentences = data.sentences || [];

    // Check if the lesson is scaffolded / pending
    const isPending = !data || !data.examples || syllables.length === 0 || 
                      Object.values(data.examples).every(arr => !arr || arr.length === 0 || (typeof arr[0] === 'string' && arr[0].includes("PENDIENTE")));

    if (isPending) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-stone-50 border border-stone-200/50 rounded-2xl">
          <div className="text-center p-8 border-2 border-dashed border-stone-200 rounded-xl bg-white max-w-sm shadow-sm">
            <div className="text-4xl mb-4">🚧</div>
            <h2 className="text-xl font-black font-fredoka text-stone-800 mb-2">Lección en Construcción</h2>
            <p className="text-sm text-stone-500 font-semibold mb-4">
              El material didáctico para la letra <strong>{letter.toUpperCase()}</strong> está pendiente de digitalización.
            </p>
            <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
              Próximamente
            </div>
          </div>
        </div>
      );
    }

    // Consonant Page 1 (A): Syllable Matrix & Vocabulary
    if (subpage === 0) {
      // Find vocabulary words matching starting syllables
      const vocabItems = data.examples ? Object.values(data.examples).flatMap((arr) => arr || []).slice(0, 4) : [];

      return (
        <div className="w-full h-full flex flex-col justify-between p-8 bg-stone-50 border border-stone-200/50 rounded-2xl">
          <div>
            <div className="flex justify-between items-start border-b border-stone-200 pb-3 mb-6">
              <div>
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                  Lección {entry.n} • Consonante
                </span>
                <h2 className="text-2xl font-black font-fredoka text-stone-800">
                  Letra {letter.toUpperCase()} {letter}
                </h2>
              </div>
              <SVGTracingLetter letter={letter.toUpperCase()} />
            </div>

            {/* Bubble Syllables */}
            <div className="flex justify-center gap-2 mb-6">
              {syllables.map((s) => (
                <div
                  key={s}
                  className="w-11 h-11 rounded-full border border-stone-300 bg-white flex items-center justify-center font-black font-fredoka text-stone-800 text-sm shadow-sm"
                >
                  {s}
                </div>
              ))}
            </div>

            <p className="text-xs text-stone-500 font-semibold mb-6">
              Une la consonante con las vocales para crear sílabas. Observa las palabras representadas.
            </p>

            {/* Vector Vocabulary outlines */}
            <div className="grid grid-cols-2 gap-3">
              {vocabItems.map((word) => (
                <div key={word} className="bg-white border border-stone-200/80 rounded-xl p-3 flex flex-col items-center text-center shadow-sm">
                  <div className="w-14 h-14 flex items-center justify-center opacity-90 mb-1">
                    <MonochromeDrawing word={word} size={50} />
                  </div>
                  <span className="text-xs font-black font-fredoka text-stone-800 capitalize">
                    {word}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <SVGWorkbookLine text={syllables.join("   ")} dotted />
          </div>
        </div>
      );
    }

    // Consonant Page 2 (B): Syllable Tracing worksheets
    if (subpage === 1) {
      return (
        <div className="w-full h-full flex flex-col justify-between p-8 bg-stone-50 border border-stone-200/50 rounded-2xl">
          <div>
            <h2 className="text-lg font-black font-fredoka text-stone-800 border-b border-stone-200 pb-2 mb-4">
              Caligrafía de Sílabas
            </h2>
            <p className="text-xs text-stone-500 font-semibold mb-6">
              Traza la consonante {letter.toUpperCase()} y las sílabas correspondientes con lápiz grafito.
            </p>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">
                  Letras {letter.toUpperCase()} y {letter}
                </span>
                <div className="space-y-2">
                  <SVGWorkbookLine text={`${letter.toUpperCase()} ${letter}   ${letter.toUpperCase()} ${letter}   ${letter.toUpperCase()} ${letter}   ${letter.toUpperCase()} ${letter}`} dotted />
                  <SVGWorkbookLine text="" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">
                  Sílabas
                </span>
                <div className="space-y-2">
                  <SVGWorkbookLine text={syllables.slice(0, 3).join("    ")} dotted />
                  <SVGWorkbookLine text={syllables.slice(3).join("    ")} dotted />
                  <SVGWorkbookLine text="" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[9px] font-black text-stone-400 text-right uppercase">
            Ficha de Trazado
          </div>
        </div>
      );
    }

    // Consonant Page 3 (C): Vocabulary Matrices / Columns
    if (subpage === 2) {
      // Collect words grouped by syllable (max 3 per column for clean look)
      const examplesMap = data.examples || {};
      const columns = Object.keys(examplesMap).slice(0, 4);

      return (
        <div className="w-full h-full flex flex-col justify-between p-8 bg-stone-50 border border-stone-200/50 rounded-2xl">
          <div>
            <h2 className="text-lg font-black font-fredoka text-stone-800 border-b border-stone-200 pb-2 mb-4">
              Matriz de Lectura
            </h2>
            <p className="text-xs text-stone-500 font-semibold mb-6">
              Practica tu lectura fluida leyendo cada columna de palabras.
            </p>

            <div className="grid grid-cols-4 gap-2 mt-4">
              {columns.map((syl) => {
                const words = Array.isArray(examplesMap[syl]) ? examplesMap[syl] : [];
                return (
                  <div key={syl} className="bg-white border border-stone-200/80 rounded-xl p-2 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border border-stone-300 bg-stone-50 flex items-center justify-center font-black font-fredoka text-[10px] text-stone-800 mb-2">
                      {syl}
                    </div>
                    <div className="space-y-2 text-center w-full">
                      {words.slice(0, 3).map((w) => (
                        <div key={w} className="text-[10px] font-bold font-fredoka text-stone-700 truncate border-b border-stone-100 pb-1 capitalize">
                          {w}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <SVGWorkbookLine text="lee  las  palabras  despacio" dotted />
          </div>
        </div>
      );
    }

    // Consonant Page 4 (D): Sentences board & big illustration
    if (subpage === 3) {
      const mainSentence = sentences[0] || "";
      const secondarySentence = sentences[1] || "";
      // Find a vocabulary key that we have illustrations for
      const illustrationWord = (data.examples ? Object.values(data.examples).flatMap((arr) => arr || [])[0] : null) || "oso";

      return (
        <div className="w-full h-full flex flex-col justify-between p-8 bg-stone-50 border border-stone-200/50 rounded-2xl">
          <div>
            <h2 className="text-lg font-black font-fredoka text-stone-800 border-b border-stone-200 pb-2 mb-4">
              Lectura y Comprensión
            </h2>
            <p className="text-xs text-stone-500 font-semibold mb-4">
              Lee con atención las oraciones sobre los renglones punteados.
            </p>

            <div className="space-y-4">
              {mainSentence && (
                <div className="bg-white p-3 border border-stone-200 rounded-xl">
                  <SVGWorkbookLine text={mainSentence} />
                </div>
              )}
              {secondarySentence && (
                <div className="bg-white p-3 border border-stone-200 rounded-xl">
                  <SVGWorkbookLine text={secondarySentence} />
                </div>
              )}
            </div>
          </div>

          {/* Large illustration of the sentence topic */}
          <div className="flex-1 flex items-center justify-center my-4">
            <div className="w-32 h-32 border border-stone-200 bg-white shadow-sm rounded-3xl p-3 flex flex-col items-center justify-center">
              <div className="w-20 h-20 opacity-90 flex items-center justify-center">
                <MonochromeDrawing word={illustrationWord} size={80} />
              </div>
              <span className="text-[10px] font-black font-fredoka text-stone-500 uppercase mt-1 tracking-wider">
                {illustrationWord}
              </span>
            </div>
          </div>

          <div className="text-[9px] font-bold text-stone-400 text-center">
            La Cartilla de Gretel • Lectura Integral
          </div>
        </div>
      );
    }
  }

  // Final Fallback for missing lessons
  return (
    <div className="w-full h-full flex flex-col justify-between items-center p-8 bg-stone-50 border border-stone-200/50 rounded-2xl">
      <div className="text-center my-auto">
        <h2 className="text-xl font-bold font-fredoka text-stone-600">Página {pageNumber}</h2>
        <p className="text-xs text-stone-400 font-semibold mt-1">
          Material del Cuaderno de Gretel
        </p>
      </div>
      <div className="text-[10px] text-stone-400 font-bold">Leonor Lopetegui</div>
    </div>
  );
}
