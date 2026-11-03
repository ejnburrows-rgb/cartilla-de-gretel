import "@testing-library/jest-dom";
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { CoverInspiredPanel } from "../CoverInspiredPanel";

afterEach(() => {
  cleanup();
});

describe("CoverInspiredPanel component", () => {
  it("renders the CoverInspiredPanel component by default (not compact)", () => {
    render(<CoverInspiredPanel />);

    // Check if the image renders
    const image = screen.getByRole("img", { name: /Portada original de La Cartilla de Gretel/i });
    expect(image).toBeInTheDocument();

    // Check default non-compact subtitle element
    const subtitle = screen.getByText("Cuaderno oficial del estudiante");
    expect(subtitle).toBeInTheDocument();
  });

  it("renders the CoverInspiredPanel component in compact mode", () => {
    render(<CoverInspiredPanel compact={true} />);

    // Check if the image renders
    const image = screen.getByRole("img", { name: /Portada original de La Cartilla de Gretel/i });
    expect(image).toBeInTheDocument();

    // The subtitle should NOT be there in compact mode
    const subtitle = screen.queryByText("Cuaderno oficial del estudiante");
    expect(subtitle).not.toBeInTheDocument();
  });
});
