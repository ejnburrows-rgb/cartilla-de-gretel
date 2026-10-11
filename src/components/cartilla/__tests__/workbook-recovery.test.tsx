import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { InteractivePictureGrid } from "../InteractivePageExercises";
import { SyllableTapGame } from "../SyllableTapGame";
import { DragMatchPairs } from "../DragMatchPairs";
import { recordEvent } from "@/lib/student-session";
import { gretelEvent } from "@/lib/gretel-bus";

vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));
vi.mock("@/lib/gretel-bus", () => ({ gretelEvent: vi.fn() }));
vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
  playNote: vi.fn(),
}));
vi.mock("@/hooks/useAudio", () => ({ useAudio: () => ({ play: vi.fn() }) }));

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});
afterEach(() => vi.useRealTimers());

describe("workbook recovery and earned completion", () => {
  it("uses the physical pencil and eraser for wrong then correct choices, without unapproved lasso/check UI", () => {
    vi.useFakeTimers();
    const view = render(
      <InteractivePictureGrid
        accent="#123"
        lessonId="1"
        region={{
          id: "grid", regionType: "picture-grid", order: 1, fontRole: "body", columns: 3,
          cells: [
            { caption: "oso", illustrationSrc: "/oso.webp", correct: true },
            { caption: "olla", illustrationSrc: "/olla.webp", correct: true },
            { caption: "avión", illustrationSrc: "/avion.webp", correct: false },
          ],
        }}
      />,
    );
    const select = (name: string) => {
      fireEvent.click(view.getByRole("button", { name }));
      act(() => vi.advanceTimersByTime(3600));
      // The eraser's timer starts after React commits the wrong-answer transition.
      act(() => vi.advanceTimersByTime(4400));
    };

    expect(view.container.querySelector(".fp-ix-cell__lasso")).toBeNull();
    expect(view.queryByRole("button", { name: "Comprobar" })).toBeNull();
    select("avión");
    expect(recordEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        score: 0, total: 3,
        meta: expect.objectContaining({ completed: false }),
      }),
    );
    expect(view.getByRole("button", { name: "avión" })).not.toBeDisabled();
    select("oso");
    expect(view.getByRole("button", { name: "oso" })).toBeDisabled();
    select("olla");
    expect(recordEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        score: 2, total: 3,
        meta: expect.objectContaining({ completed: true, corrected: true, attempt: 2 }),
      }),
    );
    expect(view.getByRole("button", { name: "olla" })).toBeDisabled();
    expect(view.container.querySelector(".fp-ix-cell__lasso")).toBeNull();
  });

  it("requires listening and a correct answer for each sound, with no double-click credit", () => {
    const complete = vi.fn();
    const view = render(
      <SyllableTapGame
        syllables={["a", "e"]}
        color="#123"
        lessonId="2"
        onComplete={complete}
      />,
    );
    expect(view.getByRole("button", { name: "a" })).toBeDisabled();
    fireEvent.click(view.getByRole("button", { name: "Escuchar" }));
    fireEvent.click(view.getByRole("button", { name: "e" }));
    expect(complete).not.toHaveBeenCalled();
    fireEvent.click(view.getByRole("button", { name: "a" }));
    fireEvent.click(view.getByRole("button", { name: "a" }));
    expect(recordEvent).toHaveBeenCalledTimes(2);
    fireEvent.click(view.getByRole("button", { name: "Siguiente sonido" }));
    fireEvent.click(view.getByRole("button", { name: "Escuchar" }));
    fireEvent.click(view.getByRole("button", { name: "e" }));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledTimes(3);
    expect(
      view.queryByRole("button", { name: "Marcar como completado" }),
    ).toBeNull();
  });

  it("supports matching with buttons and reports one accurate result even after a parent rerender", () => {
    const pairs = [
      { word: "oso", emoji: "oso", illustrationSrc: "/oso.webp" },
      { word: "olla", emoji: "olla", illustrationSrc: "/olla.webp" },
    ];
    const complete = vi.fn();
    const view = render(
      <DragMatchPairs pairs={pairs} lessonId="1" onComplete={complete} />,
    );
    fireEvent.click(view.getByRole("button", { name: "oso" }));
    fireEvent.click(view.getByRole("button", { name: "Dibujo: olla" }));
    fireEvent.click(view.getByRole("button", { name: "Dibujo: oso" }));
    fireEvent.click(view.getByRole("button", { name: "olla" }));
    fireEvent.click(view.getByRole("button", { name: "Dibujo: olla" }));
    expect(recordEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({ score: 2, total: 3 }),
    );
    view.rerender(
      <DragMatchPairs
        pairs={pairs}
        lessonId="1"
        onComplete={() => complete()}
      />,
    );
    expect(complete).toHaveBeenCalledTimes(1);
  });
});
