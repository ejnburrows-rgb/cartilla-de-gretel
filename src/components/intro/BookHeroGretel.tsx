import { GretelPresence } from "@/components/gretel/GretelPresence";
import "@/styles/home-hero.css";
import "@/styles/gretel-presence.css";

export type BookHeroGretelProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  objectPosition?: string;
  autoIntro?: boolean;
};

export function BookHeroGretel({ size = "lg", className = "", autoIntro = true }: BookHeroGretelProps) {
  return (
    <figure className={`book-hero-gretel book-hero-gretel--${size}${className ? ` ${className}` : ""}`} data-testid="book-hero-gretel-frame" data-sticker="false" data-gretel-system="presence">
      <div className="book-hero-gretel__frame">
        <GretelPresence variant="home" autoIntro={autoIntro} hideChrome className="book-hero-gretel__presence" />
      </div>
    </figure>
  );
}
