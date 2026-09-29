import "@/styles/exact-workbook.css";

interface ExactWorkbookPageProps {
  pageNumber: number;
  className?: string;
}

/**
 * Exact physical-book page surface.
 *
 * The canonical workbook page image is already fixed/cropped. This component
 * never swaps in reconstructed/remastered artwork and never edits the image.
 * The whole page scales uniformly so its internal composition cannot reflow.
 */
export function ExactWorkbookPage({
  pageNumber,
  className = "",
}: ExactWorkbookPageProps) {
  const sourcePath = `/cartilla/art/source/workbook/page-${String(pageNumber).padStart(3, "0")}.jpg`;

  return (
    <div
      className={`exact-workbook-page ${className}`.trim()}
      data-exact-workbook-page="true"
      data-printed-page={pageNumber}
    >
      <img
        src={sourcePath}
        alt={`Página ${pageNumber} del cuaderno`}
        className="exact-workbook-page__image"
        draggable={false}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
