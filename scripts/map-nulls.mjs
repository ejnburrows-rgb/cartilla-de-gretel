import fs from "fs";
import path from "path";

const PROJECT_ROOT = process.cwd();
const MANIFEST_PATH = path.join(PROJECT_ROOT, "src/data/content-manifest.json");
const FLIPCHART_DIR = path.join(PROJECT_ROOT, "public/cartilla/art/hd/flipchart");

// Map letters to their corresponding flipchart page (based on page-inventory.json)
const LETTER_TO_FLIPCHART = {
  "A a": "page-003.jpg",
  "E e": "page-004.jpg",
  "I i": "page-005.jpg",
  "O o": "page-002.jpg",
  "U u": "page-006.jpg",
  a: "page-003.jpg",
  e: "page-004.jpg",
  i: "page-005.jpg",
  o: "page-002.jpg",
  u: "page-006.jpg",
  Mm: "page-007.jpg",
  Pp: "page-010.jpg",
  Ss: "page-013.jpg",
  Tt: "page-016.jpg",
  Dd: "page-019.jpg",
  Ll: "page-022.jpg",
  Nn: "page-025.jpg",
  Ññ: "page-028.jpg",
  Bb: "page-031.jpg",
  Vv: "page-034.jpg",
  Rr: "page-037.jpg", // soft r / single r
  "Rr (double)": "page-040.jpg",
  Gg: "page-043.jpg",
  Ff: "page-046.jpg",
  Jj: "page-049.jpg", // missing from inventory explicitly but 21
  Cc: "page-052.jpg",
  Yy: "page-055.jpg",
  Zz: "page-058.jpg",
};

// Also map page numbers to letter focus for pages that don't have letter_focus set but have assets
const PAGE_NUM_TO_FLIPCHART = {
  1: "page-001.jpg", // Cover
  2: "page-001.jpg", // Credits
  3: "page-001.jpg", // Syllable Circle (uses vowels)
  4: "page-003.jpg", // Vowel Intro
  5: "page-001.jpg", // Vowel match
};

function main() {
  const content = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  let updated = 0;

  for (const page of content.pages) {
    let defaultFlipchartPage = "page-001.jpg";

    if (page.letter_focus) {
      if (Array.isArray(page.letter_focus)) {
        defaultFlipchartPage = LETTER_TO_FLIPCHART[page.letter_focus[0]] || "page-001.jpg";
      } else {
        defaultFlipchartPage = LETTER_TO_FLIPCHART[page.letter_focus] || "page-001.jpg";
      }
    } else if (PAGE_NUM_TO_FLIPCHART[page.page_number]) {
      defaultFlipchartPage = PAGE_NUM_TO_FLIPCHART[page.page_number];
    }

    // For letter lessons, the vocab is usually on the second page of the sequence
    // But pointing to the main letter intro page (the first of the 3) is best because it has the decorative letter

    const assetContainers = [];
    if (page.assets) assetContainers.push(page.assets);
    if (page.auxiliary_assets) assetContainers.push(page.auxiliary_assets);
    if (page.vocabulary_cards) assetContainers.push(page.vocabulary_cards);
    if (page.grid_items) assetContainers.push(page.grid_items);
    if (page.target_options) assetContainers.push(page.target_options);
    if (page.matching_pairs) assetContainers.push(page.matching_pairs);
    if (page.exercise_rows) {
      for (const row of page.exercise_rows) {
        if (row.items) assetContainers.push(row.items);
      }
    }

    for (const container of assetContainers) {
      for (const asset of container) {
        const pathKey =
          asset.path !== undefined ? "path" : asset.image_path !== undefined ? "image_path" : null;
        if (!pathKey) continue;

        if (asset[pathKey] === null) {
          asset[pathKey] = defaultFlipchartPage;
          updated++;
        }
      }
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(content, null, 2));
  console.log(`Updated ${updated} null paths to point to flipchart HD pages.`);
}

main();
