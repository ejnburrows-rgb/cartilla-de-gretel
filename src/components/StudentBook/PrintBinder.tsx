import { useEffect, useState } from "react";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { PdfPage } from "@/components/cartilla/PdfPage";
import "@/styles/print.css";

interface ManifestPage {
  pageNumber: number;
  lessonId: string;
  imagePath: string;
}

interface Manifest {
  pages: ManifestPage[];
}

interface PrintBinderProps {
  lessonId?: string;
}

const pageWrapperClass = "polished-page flex flex-col justify-between";
const headerClass = "w-full flex justify-between items-start px-8 pt-8";
const titleClass = "text-xl font-bold uppercase tracking-widest text-foreground/50";
const imageContainerClass = "flex-1 flex items-center justify-center p-4";
const imageClass = "max-w-full max-h-full object-contain";
const footerClass = "w-full flex justify-center pb-6 text-sm font-bold text-foreground/40";

export function PrintBinder({ lessonId }: PrintBinderProps) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/cartilla/art/manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error("Manifest not found");
        return res.json();
      })
      .then((data: Manifest) => {
        setManifest(data);
        setLoading(false);
      })
      .catch(() => {
        setManifest(null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-foreground/50">Cargando páginas para imprimir...</div>;
  }

  // Fallback to Live-PDF
  if (!manifest) {
    return <LivePdfFallback lessonId={lessonId} />;
  }

  // Filter pages by lessonId if provided
  const pagesToRender = lessonId 
    ? manifest.pages.filter(p => p.lessonId === lessonId)
    : manifest.pages;

  if (pagesToRender.length === 0) {
    return <LivePdfFallback lessonId={lessonId} />;
  }

  let currentLessonId = "";

  return (
    <div className="print-binder-container bg-white">
      {pagesToRender.map((page, index) => {
        const isFirstOfLesson = page.lessonId !== currentLessonId;
        currentLessonId = page.lessonId;
        
        const entry = CATALOG.find(c => String(c.n) === page.lessonId);
        
        return (
          <div key={`${page.lessonId}-${page.pageNumber}`} className={pageWrapperClass}>
            <div className={headerClass}>
              {isFirstOfLesson && entry ? (
                <div className={titleClass}>
                  Lección {entry.n}: {entry.title}
                </div>
              ) : (
                <div />
              )}
            </div>
            <div className={imageContainerClass}>
              <img src={page.imagePath} alt={`Página ${page.pageNumber}`} className={imageClass} />
            </div>
            <div className={footerClass}>
              Página {page.pageNumber}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LivePdfFallback({ lessonId }: { lessonId?: string }) {
  const pagesToRender = [];
  
  if (lessonId) {
    const entry = CATALOG.find(c => String(c.n) === lessonId);
    if (entry) {
      const parts = entry.pages.split("-");
      const start = parseInt(parts[0] || "1", 10);
      const end = parseInt(parts[1] || String(start), 10);
      for (let i = start; i <= end; i++) {
        pagesToRender.push({ pageNumber: i, entry });
      }
    }
  } else {
    for (const entry of CATALOG) {
      const parts = entry.pages.split("-");
      const start = parseInt(parts[0] || "1", 10);
      const end = parseInt(parts[1] || String(start), 10);
      for (let i = start; i <= end; i++) {
        pagesToRender.push({ pageNumber: i, entry });
      }
    }
  }

  let currentLessonId = "";

  return (
    <div className="print-binder-container bg-white">
      {pagesToRender.map((page, index) => {
        const isFirstOfLesson = String(page.entry.n) !== currentLessonId;
        currentLessonId = String(page.entry.n);

        return (
          <div key={`pdf-${page.pageNumber}`} className={pageWrapperClass}>
            <div className={headerClass}>
              {isFirstOfLesson ? (
                <div className={titleClass}>
                  Lección {page.entry.n}: {page.entry.title}
                </div>
              ) : (
                <div />
              )}
            </div>
            <div className={imageContainerClass}>
               <PdfPage pageNumber={page.pageNumber} className="w-full h-full" />
            </div>
            <div className={footerClass}>
              Página {page.pageNumber}
            </div>
          </div>
        );
      })}
    </div>
  );
}
