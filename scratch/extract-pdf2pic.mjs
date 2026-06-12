import { fromPath } from "pdf2pic";
import fs from "fs";

const pdfPath = "C:\\Users\\EJN\\Desktop\\La Cartilla\\Main Book\\61-Libro del alumno.pdf";
const outDir = "scratch/pdf_out";

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const options = {
  density: 300,
  saveFilename: "page",
  savePath: outDir,
  format: "jpg",
  width: 2450,
  height: 3128
};

const storeAsImage = fromPath(pdfPath, options);
storeAsImage(1).then((resolve) => {
  console.log("Page 1 is now converted as image");
  return resolve;
}).catch((error) => {
  console.error("Error converting page:", error);
});
