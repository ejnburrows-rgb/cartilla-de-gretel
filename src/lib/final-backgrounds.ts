import delivered from "@/data/final-backgrounds.json";
export type FinalBackground = { printedPage: number; pdfSheet?: number; src: string; width: number; height: number; sha256: string };
export function workbookBackground(printedPage: number): FinalBackground | undefined {
  return (delivered.workbook as Record<string, FinalBackground>)[String(printedPage)];
}
/** The presenter numbers PDF sheets, with cover and credits at sheets 1–2. */
export function flipchartBackground(pdfSheet: number): FinalBackground | undefined {
  const asset = (delivered.flipchart as Record<string, FinalBackground>)[String(pdfSheet)];
  return asset?.pdfSheet === pdfSheet && asset.printedPage === pdfSheet - 2 ? asset : undefined;
}
