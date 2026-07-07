import fs from "fs";
import path from "path";

// Paths
const CONSONANTS_PATH = path.resolve(process.cwd(), "src/content/consonants.json");
const PAGE_LAYOUTS_PATH = path.resolve(process.cwd(), "src/data/page-layouts.json");

// Types
interface ConsonantData {
  letter: string;
  lesson: number;
  pages: string;
  color: string;
  syllables: string[];
  vocab: { word: string; emoji?: string; illustrationSrc?: string }[];
  examples: Record<string, string[]>;
  sentences: string[];
}

function parsePageRange(pagesStr: string): number[] {
  const parts = pagesStr.split("-").map(Number);
  const start = parts[0];
  const end = parts[1] || start;
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

function getRandom<T>(arr: T[], count: number, exclude?: T): T[] {
  const filtered = exclude ? arr.filter((x) => x !== exclude) : arr;
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateWritingPage(pageId: number, letter: string) {
  const upper = letter.toUpperCase();
  const lower = letter.toLowerCase();
  return {
    regions: [
      {
        id: `p${pageId}-instr1`,
        regionType: "instruction",
        order: 0,
        fontRole: "body",
        text: "Escribe con tu mejor letra.",
      },
      {
        id: `p${pageId}-write-U`,
        regionType: "writing-line",
        order: 1,
        fontRole: "tracing",
        modelText: upper,
      },
      {
        id: `p${pageId}-write-U2`,
        regionType: "writing-line",
        order: 2,
        fontRole: "tracing",
      },
      {
        id: `p${pageId}-write-l`,
        regionType: "writing-line",
        order: 3,
        fontRole: "tracing",
        modelText: lower,
      },
      {
        id: `p${pageId}-write-l2`,
        regionType: "writing-line",
        order: 4,
        fontRole: "tracing",
      },
      {
        id: `p${pageId}-instr2`,
        regionType: "instruction",
        order: 5,
        fontRole: "body",
        text: `Haz un dibujo que represente una palabra que comienza con ${lower}.`,
      },
      {
        id: `p${pageId}-draw`,
        regionType: "draw-box",
        order: 6,
        fontRole: "body",
      },
    ],
  };
}

function generateSyllableMatchPage(pageId: number, data: ConsonantData) {
  const regions: any[] = [
    {
      id: `p${pageId}-instr`,
      regionType: "instruction",
      order: 0,
      fontRole: "body",
      text: "Encierra en un círculo la sílaba correspondiente.",
    },
  ];

  let order = 1;
  for (const syl of data.syllables) {
    const correctWords = data.examples[syl] || [];
    // Get 3 correct words
    const top3 = correctWords.slice(0, 3);
    if (top3.length === 0) continue;

    // Get 3 incorrect words from OTHER syllables
    const otherSyllables = data.syllables.filter((s) => s !== syl);
    let incorrectWords: string[] = [];
    for (const os of otherSyllables) {
      if (data.examples[os]) {
        incorrectWords.push(...data.examples[os]);
      }
    }
    const bad3 = getRandom(incorrectWords, 3);

    // Create 2 rows of 3 words
    const row1 = [
      { word: top3[0], correct: true },
      { word: bad3[0] || "pato", correct: false },
      { word: top3[1] || top3[0], correct: true },
    ].sort(() => 0.5 - Math.random());

    const row2 = [
      { word: bad3[1] || "sol", correct: false },
      { word: top3[2] || top3[0], correct: true },
      { word: bad3[2] || "luna", correct: false },
    ].sort(() => 0.5 - Math.random());

    regions.push({
      id: `p${pageId}-${syl}`,
      regionType: "syllable-match",
      order: order++,
      fontRole: "body",
      syllable: syl,
      matchRows: [row1, row2],
    });
  }
  return { regions };
}

function generateFillInBlankPage(pageId: number, data: ConsonantData) {
  const fillItems = [];

  for (const vocab of data.vocab.slice(0, 5)) {
    // Attempt to extract the target syllable
    let blankSyl = "";
    for (const syl of data.syllables) {
      if (vocab.word.toLowerCase().includes(syl)) {
        blankSyl = syl;
        break;
      }
    }
    if (!blankSyl) blankSyl = data.syllables[0];

    const choices = [
      { text: blankSyl, correct: true },
      ...getRandom(data.syllables, 2, blankSyl).map((s) => ({ text: s })),
    ].sort(() => 0.5 - Math.random());

    fillItems.push({
      wordBox: vocab.word,
      blank: blankSyl,
      choices,
    });
  }

  return {
    regions: [
      {
        id: `p${pageId}-instr`,
        regionType: "instruction",
        order: 0,
        fontRole: "body",
        text: "Completa las palabras con la sílaba correcta.",
      },
      {
        id: `p${pageId}-fill`,
        regionType: "fill-in-blank",
        order: 1,
        fontRole: "body",
        fillItems,
      },
    ],
  };
}

function generateReadingPage(pageId: number, data: ConsonantData) {
  const upper = data.letter.toUpperCase();
  const lower = data.letter.toLowerCase();

  const regions: any[] = [
    {
      id: `p${pageId}-title`,
      regionType: "title",
      order: 0,
      fontRole: "heading",
      text: `${upper}${lower}`,
    },
    {
      id: `p${pageId}-syl1`,
      regionType: "syllable-bubble",
      order: 1,
      fontRole: "body",
      text: data.syllables.join("  "),
    },
    {
      id: `p${pageId}-syl2`,
      regionType: "syllable-bubble",
      order: 2,
      fontRole: "body",
      text: [...data.syllables].reverse().join("  "),
    },
  ];

  let order = 3;
  if (data.vocab.length > 0) {
    regions.push({
      id: `p${pageId}-words`,
      regionType: "vocab-grid",
      order: order++,
      fontRole: "body",
      text: data.vocab.map((v) => v.word).join(" · "),
    });
  }

  for (let i = 0; i < data.sentences.length; i++) {
    regions.push({
      id: `p${pageId}-sentence${i + 1}`,
      regionType: "reading-sentences",
      order: order++,
      fontRole: "body",
      sentences: [data.sentences[i]],
    });
  }

  return { regions };
}

async function main() {
  const consonants: ConsonantData[] = JSON.parse(fs.readFileSync(CONSONANTS_PATH, "utf-8"));
  const layouts = JSON.parse(fs.readFileSync(PAGE_LAYOUTS_PATH, "utf-8"));

  for (const item of consonants) {
    // Only process lessons 7 to 24
    if (item.lesson < 7 || item.lesson > 24) continue;

    const pageNumbers = parsePageRange(item.pages);
    if (pageNumbers.length !== 4) {
      console.warn(`Lesson ${item.lesson} (${item.letter}) does not have exactly 4 pages! Found ${pageNumbers.length}. Using first 4 or padding.`);
    }

    const p1 = pageNumbers[0] || (item.lesson * 4);
    const p2 = pageNumbers[1] || p1 + 1;
    const p3 = pageNumbers[2] || p1 + 2;
    const p4 = pageNumbers[3] || p1 + 3;

    // 1. Writing
    layouts.pages[p1.toString()] = generateWritingPage(p1, item.letter);
    
    // 2. Syllable Match
    layouts.pages[p2.toString()] = generateSyllableMatchPage(p2, item);

    // 3. Fill in the Blank
    layouts.pages[p3.toString()] = generateFillInBlankPage(p3, item);

    // 4. Reading Page
    layouts.pages[p4.toString()] = generateReadingPage(p4, item);

    console.log(`Successfully mapped Lesson ${item.lesson} (${item.letter}) to pages ${p1}-${p4}.`);
  }

  fs.writeFileSync(PAGE_LAYOUTS_PATH, JSON.stringify(layouts, null, 2), "utf-8");
  console.log("Done! page-layouts.json updated successfully.");
}

main().catch(console.error);
