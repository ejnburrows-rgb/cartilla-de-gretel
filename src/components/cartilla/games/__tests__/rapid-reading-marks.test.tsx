import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { WordsPerMinuteGame } from "../CoreGames";
import type { GameContent } from "@/lib/games/gameContent";
vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));
it("keeps independent pencil-to-green marks while fluent readers move quickly", () => {
  const content: GameContent = { id: "reading-marks", type: "palabras-por-minuto", letter: "O", instructions: [], words: [{ word: "oso", syllables: ["oso"] }, { word: "ola", syllables: ["ola"] }] };
  render(<WordsPerMinuteGame content={content} />);
  fireEvent.click(screen.getByRole("button", { name: "Empezar 1 minuto" }));
  fireEvent.click(screen.getByRole("button", { name: "oso" }));
  fireEvent.click(screen.getByRole("button", { name: "ola" }));
  expect(screen.getByRole("button", { name: "oso" }).getAttribute("data-pick-mark")).toBe("right");
  expect(screen.getByRole("button", { name: "ola" }).getAttribute("data-pick-mark")).toBe("right");
  expect(screen.getByText("Leídas: 2")).toBeDefined();
});
