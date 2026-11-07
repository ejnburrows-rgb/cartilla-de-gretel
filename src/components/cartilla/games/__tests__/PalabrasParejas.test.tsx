/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup, screen, act } from "@testing-library/react";
import { PalabrasParejas } from "../PalabrasParejas";
import { PALABRAS_PAREJAS_O } from "@/content/palabras-parejas";

vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));
vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => true, // 60ms retry erase instead of 4s
}));

import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";

const WORDS = PALABRAS_PAREJAS_O.words.map((word) => word.word);

async function flush(ms = 120) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

function wordButton(word: string) {
  return screen.getByRole("button", { name: `Palabra ${word}` });
}

function pictureButton(word: string) {
  return screen.getByRole("button", { name: `Dibujo de ${word}` });
}

function connect(word: string, pictureWord: string) {
  fireEvent.click(wordButton(word));
  fireEvent.click(pictureButton(pictureWord));
}

describe("PalabrasParejas — drag the pencil from a word to its picture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders exactly five word rows and five picture targets from the Workbook page", () => {
    const { container } = render(<PalabrasParejas content={PALABRAS_PAREJAS_O} />);

    expect(WORDS).toEqual(["oveja", "ojos", "oreja", "olla", "oso"]);
    for (const word of WORDS) {
      expect(wordButton(word)).toBeTruthy();
      expect(pictureButton(word)).toBeTruthy();
    }
    expect(container.querySelectorAll(".am-direct-pencil__left-card")).toHaveLength(5);
    expect(
      container.querySelectorAll(".am-direct-pencil__column--right .am-direct-pencil__target"),
    ).toHaveLength(5);
    expect(container.querySelectorAll(".am-direct-pencil__card img")).toHaveLength(5);
    expect(screen.getByText("Parejas encontradas: 0 de 5")).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("keeps a correct match connected and plays the existing soft correct chord", async () => {
    const { container } = render(<PalabrasParejas content={PALABRAS_PAREJAS_O} />);

    connect("oveja", "oveja");
    await flush();

    expect(playCorrectChord).toHaveBeenCalledTimes(1);
    expect(wordButton("oveja").classList.contains("is-connected")).toBe(true);
    expect(pictureButton("oveja").classList.contains("is-connected")).toBe(true);
    expect(container.querySelectorAll(".am-direct-pencil__line-group")).toHaveLength(1);
    expect(screen.getByText("Parejas encontradas: 1 de 5")).toBeTruthy();
  });

  it("springs a wrong match back: no line stays, the pencil erases it, no chord", async () => {
    const { container } = render(<PalabrasParejas content={PALABRAS_PAREJAS_O} />);

    connect("oveja", "oso");

    expect(playCorrectChord).not.toHaveBeenCalled();
    expect(playWrongBuzz).not.toHaveBeenCalled();
    expect(wordButton("oveja").classList.contains("is-connected")).toBe(false);
    expect(pictureButton("oso").classList.contains("is-connected")).toBe(false);
    expect(pictureButton("oso").classList.contains("is-retry")).toBe(true);
    expect(container.querySelector(".am-direct-pencil__retry-line")).toBeTruthy();
    expect(container.querySelectorAll(".am-direct-pencil__line-group")).toHaveLength(0);
    expect(screen.getByText("Parejas encontradas: 0 de 5")).toBeTruthy();

    await flush(150);
    expect(pictureButton("oso").classList.contains("is-retry")).toBe(false);
    expect(container.querySelector(".am-direct-pencil__retry-line")).toBeNull();
  });

  it("shows the simple finish state only after all five pairs are matched", async () => {
    const { container } = render(<PalabrasParejas content={PALABRAS_PAREJAS_O} />);

    for (const word of WORDS.slice(0, 4)) {
      connect(word, word);
      await flush(10);
    }
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByText("Parejas encontradas: 4 de 5")).toBeTruthy();

    connect(WORDS[4], WORDS[4]);
    await flush(10);

    expect(screen.getByRole("status").textContent).toContain(
      "¡Muy bien! Completaste las 5 parejas.",
    );
    expect(screen.getByText("Parejas encontradas: 5 de 5")).toBeTruthy();
    expect(container.querySelectorAll(".am-direct-pencil__line-group")).toHaveLength(5);
    expect(playCorrectChord).toHaveBeenCalledTimes(5);
  });

  it("does not crash or double-count on rapid repeated drags and taps", async () => {
    const { container } = render(<PalabrasParejas content={PALABRAS_PAREJAS_O} />);
    const stage = container.querySelector(".am-direct-pencil__stage") as HTMLElement;
    const left = wordButton("oveja");

    for (let i = 0; i < 25; i++) {
      fireEvent.pointerDown(left, { clientX: 9999, clientY: 9999, pointerId: i + 1 });
      for (let move = 0; move < 3; move++) {
        fireEvent.pointerMove(stage, { clientX: 9999, clientY: 9999, pointerId: i + 1 });
      }
      fireEvent.pointerUp(stage, { clientX: 9999, clientY: 9999, pointerId: i + 1 });
    }
    await flush(10);

    expect(screen.getByText("Parejas encontradas: 0 de 5")).toBeTruthy();
    expect(container.querySelectorAll(".am-direct-pencil__active-line")).toHaveLength(0);
    expect(screen.queryByRole("status")).toBeNull();

    // Releasing the same correct pair many times must count once.
    for (let i = 0; i < 10; i++) {
      connect("oveja", "oveja");
    }
    await flush(10);

    expect(playCorrectChord).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Parejas encontradas: 1 de 5")).toBeTruthy();
    expect(container.querySelectorAll(".am-direct-pencil__line-group")).toHaveLength(1);
    expect(screen.getByTestId("palabras-parejas")).toBeTruthy();
  });
});
