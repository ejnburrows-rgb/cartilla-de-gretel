import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
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

describe("workbook recovery and earned completion", () => {
  it("lets a child correct an incomplete selection without recording mastery", () => {
    const view = render(
      <InteractivePictureGrid
        accent="#123"
        lessonId="1"
        region={{
          id: "grid",
          regionType: "picture-grid",
          order: 1,
          fontRole: "body",
          columns: 3,
          cells: [
            { caption: "oso", illustrationSrc: "/oso.webp", correct: true },
            { caption: "olla", illustrationSrc: "/olla.webp", correct: true },
            {
              caption: "avión",
              illustrationSrc: "/avion.webp",
              correct: false,
            },
          ],
        }}
      />,
    );
    fireEvent.click(view.getByRole("button", { name: "oso" }));
    fireEvent.click(view.getByRole("button", { name: "Comprobar" }));
    expect(gretelEvent).not.toHaveBeenCalledWith("activity:complete");
    expect(recordEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        score: 0,
        total: 1,
        meta: expect.objectContaining({ completed: false }),
      }),
    );
    fireEvent.click(view.getByRole("button", { name: "Corregir respuestas" }));
    fireEvent.click(view.getByRole("button", { name: "olla" }));
    fireEvent.click(view.getByRole("button", { name: "Comprobar" }));
    expect(view.getByRole("button", { name: "Completado" })).toBeDisabled();
    expect(recordEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        score: 1,
        total: 1,
        meta: expect.objectContaining({
          completed: true,
          corrected: true,
          attempt: 2,
        }),
      }),
    );
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
