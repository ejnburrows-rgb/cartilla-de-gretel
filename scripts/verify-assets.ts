import fs from "fs";
import path from "path";

// Resolve paths using import.meta.dirname for ESM
const inventoryPath = path.resolve(import.meta.dirname, "../src/data/page-inventory.json");
const workbookBasePath = path.resolve(import.meta.dirname, "../public/cartilla/images/source");
const flipchartBasePath = path.resolve(
  import.meta.dirname,
  "../public/cartilla/images/teacher-flipchart",
);

// Read JSON
const rawData = fs.readFileSync(inventoryPath, "utf-8");
const inventory = JSON.parse(rawData);

const missingFiles: string[] = [];
const allWorkbookPages: string[] = [];
const allFlipchartPages: string[] = [];

// Check workbook pages
if (inventory.workbook && inventory.workbook.lessons) {
  inventory.workbook.lessons.forEach((lesson: { lessonId?: number | string; pages?: string[] }) => {
    if (lesson.pages) {
      lesson.pages.forEach((page: string) => {
        allWorkbookPages.push(page);
        const fullPath = path.join(workbookBasePath, page);
        if (!fs.existsSync(fullPath)) {
          missingFiles.push(`Missing Workbook File (Lesson ${lesson.lessonId}): ${page}`);
        }
      });
    }
  });
}

// Check flipchart pages
if (inventory.flipchart && inventory.flipchart.lessons) {
  inventory.flipchart.lessons.forEach(
    (lesson: { lessonId?: number | string; pages?: string[] }) => {
      if (lesson.pages) {
        lesson.pages.forEach((page: string) => {
          allFlipchartPages.push(page);
          const fullPath = path.join(flipchartBasePath, page);
          if (!fs.existsSync(fullPath)) {
            missingFiles.push(`Missing Flipchart File (Lesson ${lesson.lessonId}): ${page}`);
          }
        });
      }
    },
  );
}

// Check for duplicates
const findDuplicates = (arr: string[]) => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item);
    }
    seen.add(item);
  }
  return Array.from(duplicates);
};

const duplicateWorkbookPages = findDuplicates(allWorkbookPages);
const duplicateFlipchartPages = findDuplicates(allFlipchartPages);

console.log("--- Missing Files ---");
if (missingFiles.length === 0) {
  console.log("None.");
} else {
  missingFiles.forEach((msg) => console.log(msg));
}

console.log("\n--- Duplicate Workbook Pages ---");
if (duplicateWorkbookPages.length === 0) {
  console.log("None.");
} else {
  duplicateWorkbookPages.forEach((p) => console.log(p));
}

console.log("\n--- Duplicate Flipchart Pages ---");
if (duplicateFlipchartPages.length === 0) {
  console.log("None.");
} else {
  duplicateFlipchartPages.forEach((p) => console.log(p));
}
