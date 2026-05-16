import logo from "@/assets/nbo-logo.png";

export function BrandWatermark() {
  return (
    <a
      href="https://novobusinessorder.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Novo Business Order"
      title="Novo Business Order"
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 opacity-50 hover:opacity-100 transition-opacity duration-300 print:hidden pointer-events-auto"
    >
      <img
        src={logo}
        alt="Novo Business Order"
        className="h-10 sm:h-14 md:h-20 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] mix-blend-luminosity"
      />
    </a>
  );
}
