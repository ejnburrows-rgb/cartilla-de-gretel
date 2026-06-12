const fs = require("fs");
const path = require("path");

const lessonsDir = path.join(__dirname, "..", "src", "data", "lessons");
const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith(".ts"));

for (const file of files) {
  const filePath = path.join(lessonsDir, file);
  let content = fs.readFileSync(filePath, "utf-8");

  // Only add import if not already there
  if (!content.includes("getBookPageImage")) {
    content = `import { getBookPageImage } from "@/lib/bookImages";\n\n` + content;
  }

  // Find blocks and replace sourcePage
  let updatedContent = "";
  let lastPageNumber = null;
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const pageMatch = line.match(/pageNumber:\s*(\d+)/);
    if (pageMatch) {
      lastPageNumber = pageMatch[1];
    }
    
    if (line.match(/sourcePage:\s*""/) || line.match(/sourcePage:\s*"\/art\/hd\/page-\d+\.png"/)) {
      if (lastPageNumber !== null) {
        updatedContent += line.replace(/sourcePage:\s*".*"/, `sourcePage: getBookPageImage(${lastPageNumber})`) + '\n';
      } else {
        updatedContent += line + '\n';
      }
    } else {
      updatedContent += line + '\n';
    }
  }

  // trim trailing newline
  updatedContent = updatedContent.slice(0, -1);
  fs.writeFileSync(filePath, updatedContent);
  console.log(`Updated ${file}`);
}
