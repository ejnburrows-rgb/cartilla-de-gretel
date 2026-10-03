import type { FinalBackground } from "@/lib/final-backgrounds";
import "@/styles/final-backgrounds.css";
export function FinalPageBackground({ asset }: { asset?: FinalBackground }) {
  if (!asset) return null;
  return <img className="final-page-background" src={asset.src} alt="" aria-hidden="true"
    draggable={false} decoding="async" width={asset.width} height={asset.height}
    data-background-printed-page={asset.printedPage} data-background-pdf-sheet={asset.pdfSheet} />;
}
