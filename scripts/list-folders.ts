import fs from "fs";
import path from "path";

const workbookBasePath = path.resolve(import.meta.dirname, "../public/cartilla/images/source");

const folders = ["e", "i", "u", "p", "ss", "d", "l", "n", "ñ", "b", "v", "r", "rr", "g", "f"];

const results: Record<string, string[]> = {};

folders.forEach((folder) => {
  const folderPath = path.join(workbookBasePath, folder);
  if (fs.existsSync(folderPath)) {
    const files = fs
      .readdirSync(folderPath)
      .filter((f) => f.endsWith(".jpg") || f.endsWith(".png"));
    results[folder] = files;
  } else {
    results[folder] = [];
  }
});

console.log(JSON.stringify(results, null, 2));
