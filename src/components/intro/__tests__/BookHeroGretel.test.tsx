/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { BookHeroGretel, GRETEL_HERO_SCENE } from "../BookHeroGretel";

afterEach(() => cleanup());

describe("BookHeroGretel — full pose library + book plate", () => {
  it("uses garden scene plate AND a living pose from the library (not scarce sticker)", () => {
    render(<BookHeroGretel size="md" />);
    const hero = screen.getByTestId("book-hero-gretel");
    expect(hero.getAttribute("data-sticker")).toBe("false");
    expect(hero.getAttribute("data-pose-library")).toBe("full");

    const scene = hero.querySelector(".book-hero-gretel__scene");
    expect(scene?.getAttribute("src")).toBe(GRETEL_HERO_SCENE);

    const pose = screen.getByTestId("book-hero-gretel-pose");
    expect(pose.getAttribute("src")).toMatch(/poses\/gretel-wave/);
  });

  it("grounds the figure with frame matte + contact shadow", () => {
    const { container } = render(<BookHeroGretel size="lg" caption="Hola" />);
    expect(container.querySelector(".book-hero-gretel__frame")).toBeTruthy();
    expect(container.querySelector(".book-hero-gretel__ground")).toBeTruthy();
    expect(container.querySelector(".book-hero-gretel__vignette")).toBeTruthy();
    expect(container.querySelector(".book-hero-gretel__figure-shadow")).toBeTruthy();
    expect(screen.getByText("Hola")).toBeTruthy();
  });
});
