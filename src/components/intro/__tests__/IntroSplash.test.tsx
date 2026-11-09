/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { IntroSplash } from "../IntroSplash";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Since Framer Motion uses ResizeObserver, we need to mock it in JSDOM
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

describe("IntroSplash", () => {
  it("renders the hero content and the default CTA", () => {
    render(<IntroSplash />);
    expect(screen.getByText(/Bienvenidos a la Cartilla de Gretel/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
    expect(screen.getByLabelText("Paleta de la Cartilla")).toBeInTheDocument();
  });

  it("calls onContinue when the CTA button is clicked", () => {
    const mockOnContinue = vi.fn();
    render(<IntroSplash onContinue={mockOnContinue} />);

    const button = screen.getByRole("button", { name: "Continuar" });
    fireEvent.click(button);

    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });

  it("renders a custom CTA label when provided", () => {
    render(<IntroSplash ctaLabel="Empezar Ahora" />);
    expect(screen.getByRole("button", { name: "Empezar Ahora" })).toBeInTheDocument();
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

  it("renders color swatches matching the palette", () => {
    render(<IntroSplash />);
    // The palette has 5 stops, but IntroSplash swatches render all 5 of them.
    const paletteContainer = screen.getByLabelText("Paleta de la Cartilla");
    const swatches = paletteContainer.querySelectorAll("span");
    expect(swatches).toHaveLength(5);

    // Check titles for each swatch (names from CARTILLA_PASTEL_PALETTE)
    const expectedNames = ["Crema", "Mantequilla", "Durazno", "Rosa suave", "Menta"];
    const swatchTitles = Array.from(swatches).map(span => span.getAttribute("title"));
    expect(swatchTitles).toEqual(expectedNames);
  });
});
