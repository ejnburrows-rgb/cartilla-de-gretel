import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const PDF_FILE = "/book/book.pdf";

interface PdfPageProps {
  pageNumber: number;
  width?: number;
  className?: string;
}

export function PdfPage({ pageNumber, width = 820, className }: PdfPageProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const safePage = numPages
    ? Math.min(Math.max(1, pageNumber), numPages)
    : Math.max(1, pageNumber);

  return (
    <div className={className}>
      <Document
        file={PDF_FILE}
        onLoadSuccess={(doc) => setNumPages(doc.numPages)}
        loading={
          <div className="py-24 text-center font-bold opacity-50">
            Cargando libro…
          </div>
        }
        error={
          <div className="py-16 text-center font-bold text-red-700/80">
            No se pudo cargar el libro. Vuelve a intentarlo.
          </div>
        }
      >
        <Page
          pageNumber={safePage}
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={
            <div className="py-24 text-center font-bold opacity-50">
              Cargando página…
            </div>
          }
        />
      </Document>
    </div>
  );
}
