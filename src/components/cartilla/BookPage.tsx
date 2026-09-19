import { PdfPage } from "./PdfPage";
import { FaithfulPageRenderer } from "./FaithfulPageRenderer";
import { hasPageLayout } from "@/lib/book-faithful";

interface BookPageProps {
  pageNumber: number;
  active?: boolean;
}

export function BookPage({ pageNumber, active = false }: BookPageProps) {
  const activeClass = active ? "" : "opacity-80 pointer-events-none";

  return (
    <div className={`book-page ${activeClass} w-full h-full`}>
      {hasPageLayout(pageNumber) ? (
        <FaithfulPageRenderer pageNumber={pageNumber} interactive={false} />
      ) : (
        <PdfPage pageNumber={pageNumber} className="w-full h-full" />
      )}
    </div>
  );
}
