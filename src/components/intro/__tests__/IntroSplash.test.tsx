/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { IntroSplash } from "../IntroSplash";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
  }
}));

vi.mock("../BookHeroGretel", () => ({
  BookHeroGretel: () => <div data-testid="book-hero-gretel" />
}));

afterEach(() => {
  cleanup();
});

describe("IntroSplash", () => {
  it("renders without crashing with default props", () => {
    render(<IntroSplash />);
    expect(screen.getByText(/Bienvenidos a la Cartilla de Gretel/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
  });

  it("renders a custom ctaLabel", () => {
    render(<IntroSplash ctaLabel="Empezar" />);
    expect(screen.getByRole("button", { name: "Empezar" })).toBeInTheDocument();
  });

  it("calls onContinue when the CTA button is clicked", () => {
    const onContinueMock = vi.fn();
    render(<IntroSplash onContinue={onContinueMock} />);

    const button = screen.getByRole("button", { name: "Continuar" });
    fireEvent.click(button);

    expect(onContinueMock).toHaveBeenCalledTimes(1);
  });

  it("renders children when provided", () => {
    render(
      <IntroSplash>
        <div data-testid="custom-child">Child Content</div>
      </IntroSplash>
    );

    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });
});
