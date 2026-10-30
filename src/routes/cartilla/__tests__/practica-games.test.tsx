import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  lazyRouteComponent: () => () => null,
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  useNavigate: () => vi.fn(),
}));
vi.mock("@/context/LanguageContext", () => ({ useLanguage: () => ({ lang: "es" }) }));
vi.mock("@/lib/lesson-progress", () => ({ useLessonProgress: () => ({ isUnlocked: () => true }) }));
vi.mock("@/components/cartilla/GardenBackdrop", () => ({ GardenBackdrop: () => null }));
vi.mock("@/components/ui/KidButton", () => ({ KidButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button> }));
vi.mock("@/components/cartilla/ActivityCarousel", () => ({
  ActivityCarousel: ({ lessonNumber, activities }: { lessonNumber: number; activities?: string[] }) => (
    <div data-testid="activity-carousel" data-lesson={lessonNumber} data-activities={activities?.join(",") ?? "default"} />
  ),
}));

import { Practica } from "../practica";

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/cartilla/practica");
});

describe("practice route integration", () => {
  it("mounts the canonical mini-game activity carousel on the practice landing page", () => {
    window.history.replaceState({}, "", "/cartilla/practica");
    render(<Practica />);
    expect(screen.getByRole("region", { name: "Minijuegos de la cartilla" })).toBeInTheDocument();
    expect(screen.getByLabelText("Lección para los minijuegos")).toBeInTheDocument();
    expect(screen.getByTestId("activity-carousel")).toHaveAttribute("data-lesson");
    expect(screen.getByText(/Dibujos del/)).toBeInTheDocument();
  });

  it("keeps the piano query mode wired to its lesson-specific source-backed activity", () => {
    window.history.replaceState({}, "", "/cartilla/practica?modo=piano&lesson=7");
    render(<Practica />);
    expect(screen.getByRole("heading", { name: "La consonante Mm" })).toBeInTheDocument();
    expect(screen.getByTestId("activity-carousel")).toHaveAttribute("data-lesson", "7");
    expect(screen.getByTestId("activity-carousel")).toHaveAttribute("data-activities", "piano");
  });
});
