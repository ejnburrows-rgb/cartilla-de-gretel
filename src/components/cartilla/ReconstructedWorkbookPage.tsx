import { useEffect, useState } from "react";
import { getReconstructedMasterAsset } from "@/lib/reconstruction-master";
import { PdfPage } from "./PdfPage";

interface ReconstructedWorkbookPageProps {
  pageNumber: number;
  className?: string;
}

/**
 * Master-workbook surface.
 *
 * A reconstructed page is shown only when the committed production manifest
 * contains a visually verified PASS entry with full provenance. Otherwise this
 * falls back to the existing source-page resolver. It never uses
 * FaithfulPageRenderer, which remains available for interactive digital lessons.
 */
export function ReconstructedWorkbookPage({
  pageNumber,
  className = "",
}: ReconstructedWorkbookPageProps) {
  const master = getReconstructedMasterAsset(pageNumber);
  const [masterFailed, setMasterFailed] = useState(false);

  useEffect(() => {
    setMasterFailed(false);
  }, [pageNumber, master?.output_path]);

  if (!master || masterFailed) {
    return <PdfPage pageNumber={pageNumber} className={className} />;
  }

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-white ${className}`}
      data-reconstructed-master="true"
      data-printed-page={pageNumber}
      data-workbook-pdf-sheet={master.workbook_pdf_sheet}
    >
      <img
        src={master.output_path}
        alt={`Página ${pageNumber} reconstruida y verificada`}
        className="h-full w-full object-contain"
        draggable={false}
        onError={() => setMasterFailed(true)}
      />
    </div>
  );
}
