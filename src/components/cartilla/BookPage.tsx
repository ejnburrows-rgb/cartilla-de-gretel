import { ReconstructedWorkbookPage } from "./ReconstructedWorkbookPage";

interface BookPageProps {
  pageNumber: number;
  active?: boolean;
}

export function BookPage({ pageNumber, active = false }: BookPageProps) {
  const activeClass = active ? "" : "opacity-80 pointer-events-none";

  return (
    <div className={`book-page ${activeClass} w-full h-full`}>
      <ReconstructedWorkbookPage pageNumber={pageNumber} className="w-full h-full" />
    </div>
  );
}
