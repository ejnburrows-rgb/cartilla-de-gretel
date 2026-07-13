/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { BookHeroGretel, GRETEL_HERO_SCENE } from "../BookHeroGretel";

afterEach(() => cleanup());

describe("BookHeroGretel — no sticker cutout", () => {
  it("uses full painted scene asset, not transparent pose cutout", () => {
    render(<BookHeroGretel size="md" />);
    const hero = screen.getByTestId("book-hero-gretel");
    expect(hero.getAttribute("data-sticker")).toBe("false");
    const img = hero.querySelector("img");
    expect(img?.getAttribute("src")).toBe(GRETEL_HERO_SCENE);
    expect(img?.getAttribute("src")).not.toMatch(/poses\/gretel-wave/);
    expect(img?.getAttribute("src")).not.toMatch(/poses\/gretel-idle/);
    expect(img?.className).toContain("book-hero-gretel__scene");
  });

  it("grounds the figure with frame matte (not floating PNG on white)", () => {
    const { container } = render(<BookHeroGretel size="lg" caption="Hola" />);
    expect(container.querySelector(".book-hero-gretel__frame")).toBeTruthy();
    expect(container.querySelector(".book-hero-gretel__ground")).toBeTruthy();
    expect(container.querySelector(".book-hero-gretel__vignette")).toBeTruthy();
    expect(screen.getByText("Hola")).toBeTruthy();
  });
});
