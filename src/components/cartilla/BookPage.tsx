import { PolishedPage } from "./PolishedPage";

interface BookPageProps {
  pageNumber: number;
  active?: boolean;
}

export function BookPage({ pageNumber, active = false }: BookPageProps) {
  // We remove the scale and shadow because react-pageflip handles the 3D page aesthetics
  const activeClass = active ? "" : "opacity-80 pointer-events-none";

  return (
    <div className={`book-page transition-all duration-350 ${activeClass} w-full h-full flex justify-center`}>
      <PolishedPage pageNumber={pageNumber} />
    </div>
  );
}
